import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/integrations/supabase';
import { insertNotionRow } from '@/lib/integrations/notion';
import { sendPaymentReceiptEmail } from '@/lib/integrations/mail';
import { buildErrorResponsePayload } from '@/lib/contracts/error-response';
import { buildPaymentVerifySignature } from '@/lib/payment/payment-verify';
import { isMockMode } from '@/lib/app/use-mock';

const VERIFY_IDEMPOTENCY_LIMIT = 30;
const WALLET_MISMATCH_WARNING_THRESHOLD = 3;
const VERIFY_FAILURE_ALERT_THRESHOLD = 3;

// ─── Ops metric counters (DB-backed) ─────────────────────────────────
// 아래 카운터들은 "관측 지표"이지 안전장치가 아니다 — 이중 지급 방지는
// orders 의 조건부 상태 전이(pending → completed claim)가 담당한다.
// 과거에는 인스턴스 로컬 Map 이었는데, 서버리스에서 인스턴스가 바뀔 때마다
// 리셋되어 지표를 신뢰할 수 없었다. 지금은 ops_counters 테이블(마이그레이션
// 010)에 increment_ops_counter RPC 로 원자 증가시킨다.
//
// 카운터 의미:
// - payment_verify_attempts:{orderId}  — 주문별 verify 호출 횟수.
//   VERIFY_IDEMPOTENCY_LIMIT(30) 초과 시 429 + Notion 경보 (재시도 폭주 감지).
// - payment_verify_failures:{orderId}  — 주문별 검증 실패 횟수.
//   VERIFY_FAILURE_ALERT_THRESHOLD(3) 이상이면 Notion 경보.
// - payment_wallet_mismatch:{userId}   — 적립 후 지갑 잔액 불일치 감지 횟수.
//   WALLET_MISMATCH_WARNING_THRESHOLD(3) 이상이면 Notion ERROR 경보.
//
// best-effort: 카운터 DB 실패가 결제 검증 흐름을 절대 막아서는 안 되므로,
// 실패하면 null 을 반환하고 임계값 판정은 건너뛴다. mock 모드에서는 no-op.
async function incrementOpsCounter(
  supabase: { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }> },
  name: string,
): Promise<number | null> {
  if (isMockMode()) return null;
  try {
    const { data, error } = await supabase.rpc('increment_ops_counter', { p_name: name, p_delta: 1 });
    if (error) return null;
    const next = Number(data);
    return Number.isFinite(next) ? next : null;
  } catch {
    return null;
  }
}

function parseMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== 'object') return {} as Record<string, unknown>;
  return metadata as Record<string, unknown>;
}

function verifyPaymentSignature(orderId: string, amount: number, token: string, signature: string) {
  const secret = process.env.PAYMENT_VERIFY_SECRET || process.env.NEXT_PUBLIC_PAYMENT_VERIFY_SECRET || '';
  if (!secret || !token || !signature) {
    return false;
  }

  try {
    const expected = buildPaymentVerifySignature(orderId, amount, token);
    const expectedBuffer = Buffer.from(expected, 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');
    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }
    return timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch {
    return false;
  }
}

async function recordVerifyFailure(
  supabase: Parameters<typeof incrementOpsCounter>[0],
  orderId: string,
  reason: string,
  metadata: Record<string, unknown>,
) {
  const key = orderId || 'missing';
  const nextCount = await incrementOpsCounter(supabase, `payment_verify_failures:${key}`);
  // 카운터를 읽지 못하면(null) 임계값 판정 없이 조용히 넘어간다 — 지표용이므로
  // 검증 흐름/응답에는 영향을 주지 않는다.
  if (nextCount !== null && nextCount >= VERIFY_FAILURE_ALERT_THRESHOLD) {
    await insertNotionRow({
      category: 'PAYMENT_EVENT',
      title: `Payment verify failure threshold exceeded (${key})`,
      description: `Repeated verification failures: ${reason}`,
      metadata: { orderId: key, reason, failure_count: nextCount, ...metadata },
    });
  }
  return nextCount;
}

function parseTossPayload(payload: Record<string, unknown>) {
  const status = String((payload as Record<string, string>).status || '').toUpperCase();
  const orderId = String((payload as Record<string, unknown>).orderId || '');
  const paymentKey = String((payload as Record<string, unknown>).paymentKey || '');
  const amount = Number((payload as Record<string, unknown>).totalAmount ?? (payload as Record<string, unknown>).amount);

  return {
    status,
    orderId,
    paymentKey,
    amount,
  };
}

function mapVerifyBlockedState(
  status: string,
  orderId: string,
  idempotentAttemptCount: number,
  settledAmount: number,
  settledPaymentKey?: string | null
) {
  if (status === 'completed') {
    return NextResponse.json(
      {
        success: true,
        jellies_credited: settledAmount,
        payment_key: settledPaymentKey || '',
        order_id: orderId,
        idempotent_attempt_count: idempotentAttemptCount,
        message: 'Already completed',
        monitoring_event: 'payment_verify_idempotent_success',
      },
      { status: 200 },
    );
  }

  return NextResponse.json(
    {
      error: 'PAYMENT_ORDER_NOT_PENDING',
      error_code: 'PAYMENT_ORDER_NOT_PENDING',
      message: `Order status is ${status}`,
      code: 409,
      details: {
        order_id: orderId,
        status,
        idempotent_attempt_count: idempotentAttemptCount,
      },
    },
    { status: 409 },
  );
}

/**
 * POST /api/payment/verify
 * Verify Toss Payments result and credit jellies
 */
export async function POST(req: NextRequest) {
  const createErrorResponse = (code: string, message: string, status: number, details?: unknown) =>
    NextResponse.json(buildErrorResponsePayload(code, message, details), { status });

  try {
    // A malformed/empty body is a client error, not a server fault — parsing it
    // inside the outer try would surface as a 500.
    let payload: any;
    try {
      payload = await req.json();
    } catch {
      return createErrorResponse('PAYMENT_INVALID_BODY', 'Request body must be valid JSON', 400);
    }
    payload = payload ?? {};

    const paymentKey = String(payload.paymentKey || '').trim();
    const orderId = String(payload.orderId || '').trim();
    const amount = Number(payload.amount);
    const verifyToken = String(payload.verifyToken || '').trim();
    const verifySignature = String(payload.verifySignature || '').trim();

    const supabase = getSupabaseAdmin();

    // 주문별 verify 시도 횟수 (DB 카운터, best-effort). 카운터를 읽지 못하면
    // 1로 간주해 흐름을 막지 않는다 — 응답의 idempotent_attempt_count 도
    // 그 폴백 값을 따른다.
    const attemptCount = await incrementOpsCounter(
      supabase,
      `payment_verify_attempts:${orderId || 'missing'}`,
    );
    const idempotentAttemptCount = attemptCount ?? 1;

    if (attemptCount !== null && attemptCount > VERIFY_IDEMPOTENCY_LIMIT) {
      await insertNotionRow({
        category: 'PAYMENT_EVENT',
        title: `Payment verify idempotency limit exceeded (${orderId || 'missing'})`,
        description: 'Verification request count exceeded allowed retries',
        metadata: {
          orderId,
          paymentKey,
          idempotent_attempt_count: idempotentAttemptCount,
        },
      });
      return createErrorResponse(
        'PAYMENT_IDEMPOTENCY_LIMIT_EXCEEDED',
        'Too many verification retries for same order',
        429,
        { idempotent_attempt_count: idempotentAttemptCount },
      );
    }

    if (!paymentKey || !orderId || !verifyToken || !verifySignature || !Number.isFinite(amount)) {
      await recordVerifyFailure(supabase, orderId, 'missing_required_data', {
        paymentKey,
        amount,
        verifyToken,
      });
      return createErrorResponse('PAYMENT_VALIDATION_MISSING_DATA', 'Missing required payment data', 400);
    }

    if (amount <= 0) {
      return createErrorResponse('PAYMENT_INVALID_AMOUNT', 'Invalid amount format', 400);
    }

    const orderIdPattern = /^order_[a-zA-Z0-9]+_[a-z0-9]+$/;
    if (!orderIdPattern.test(orderId)) {
      await recordVerifyFailure(supabase, orderId, 'invalid_order_id', { paymentKey, amount });
      return createErrorResponse('PAYMENT_INVALID_ORDER_ID', 'Invalid order ID format', 400);
    }

    const { data: order, error: orderFetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (orderFetchError || !order || !order.user_id) {
      await recordVerifyFailure(supabase, orderId, 'order_not_found', {
        paymentKey,
        amount,
        error: orderFetchError,
      });
      return createErrorResponse('PAYMENT_ORDER_NOT_FOUND', 'Order not found or invalid', 404);
    }

    const orderAmount = Number(order.amount);
    if (!orderAmount || Number.isNaN(orderAmount)) {
      return createErrorResponse('PAYMENT_INVALID_ORDER_AMOUNT', 'Invalid order amount', 500);
    }

    if (orderAmount !== amount) {
      await recordVerifyFailure(supabase, orderId, 'amount_mismatch', {
        paymentKey,
        requestedAmount: amount,
        orderAmount,
      });
      return createErrorResponse('PAYMENT_AMOUNT_MISMATCH', 'Order amount does not match requested amount', 400, {
        orderAmount,
        requestedAmount: amount,
      });
    }

    if (order.status && order.status !== 'pending') {
      return mapVerifyBlockedState(
        order.status,
        orderId,
        idempotentAttemptCount,
        Number(order.jellies || 0),
        order.payment_key
      );
    }

    const meta = parseMetadata(order.metadata);
    const storedVerifyToken = String(meta.verifyToken || '');
    const storedVerifySignature = String(meta.verifySignature || '');

    const isValidSignature =
      verifyToken === storedVerifyToken &&
      verifySignature === storedVerifySignature &&
      verifyPaymentSignature(orderId, amount, verifyToken, verifySignature);

    if (!isValidSignature) {
      await recordVerifyFailure(supabase, orderId, 'invalid_verification_signature', {
        paymentKey,
        verifyToken,
      });
      return createErrorResponse('PAYMENT_VERIFICATION_SIGNATURE_INVALID', 'Invalid verification signature', 400);
    }

    const tossSecretKey = process.env.TOSS_SECRET_KEY;
    if (!tossSecretKey) {
      console.error('Toss Secret Key not configured');
      return createErrorResponse('PAYMENT_CONFIG_MISSING', 'Payment system not configured', 500);
    }

    const verifyUrl = 'https://api.tosspayments.com/v1/payments/confirm';
    const authHeader = 'Basic ' + Buffer.from(`${tossSecretKey}:`).toString('base64');

    const verifyResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const verifyData = (await verifyResponse.json().catch(() => null)) as Record<string, unknown> | null;
    if (!verifyResponse.ok || !verifyData) {
      await recordVerifyFailure(supabase, orderId, 'toss_verification_failed', {
        paymentKey,
        amount,
        errorData: verifyData,
      });
      if (order.status === 'pending') {
        await supabase
          .from('orders')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('order_id', orderId)
          .eq('status', 'pending');
      }
      return createErrorResponse('PAYMENT_TOSS_VERIFICATION_FAILED', 'Payment verification failed', 400, verifyData);
    }

    const { status, orderId: tossOrderId, paymentKey: tossPaymentKey, amount: tossAmount } = parseTossPayload(verifyData);
    const normalizedTossAmount = Number(tossAmount);

    if (tossOrderId !== orderId) {
      await recordVerifyFailure(supabase, orderId, 'toss_order_id_mismatch', {
        paymentKey,
        expectedOrderId: orderId,
        tossOrderId,
      });
      return createErrorResponse('PAYMENT_TOSS_ORDER_MISMATCH', 'Payment order mismatch', 400);
    }

    if (status !== 'DONE') {
      await recordVerifyFailure(supabase, orderId, 'toss_status_not_done', {
        paymentKey,
        status,
      });
      if (order.status === 'pending') {
        await supabase
          .from('orders')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('order_id', orderId)
          .eq('status', 'pending');
      }
      return createErrorResponse('PAYMENT_TOSS_NOT_COMPLETED', `Payment status is ${status}`, 400, {
        status,
      });
    }

    if (!Number.isFinite(normalizedTossAmount) || normalizedTossAmount !== amount) {
      await recordVerifyFailure(supabase, orderId, 'toss_amount_mismatch', {
        paymentKey,
        amount,
        tossAmount: normalizedTossAmount,
      });
      return createErrorResponse('PAYMENT_TOSS_AMOUNT_MISMATCH', 'Toss amount mismatch', 400, {
        expectedAmount: amount,
        tossAmount: normalizedTossAmount,
      });
    }

    if (!tossPaymentKey || !tossPaymentKey.length) {
      await recordVerifyFailure(supabase, orderId, 'toss_missing_payment_key', { paymentKey, verifyData });
      return createErrorResponse('PAYMENT_TOSS_PAYLOAD_INVALID', 'Toss payment key missing', 400, verifyData);
    }

    if (tossPaymentKey !== paymentKey) {
      await recordVerifyFailure(supabase, orderId, 'toss_payment_key_mismatch', {
        paymentKey,
        tossPaymentKey,
      });
      return createErrorResponse('PAYMENT_TOSS_PAYMENT_KEY_MISMATCH', 'Toss payment key mismatch', 400, {
        paymentKey,
        tossPaymentKey,
      });
    }

    const { data: claimedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        payment_key: tossPaymentKey,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId)
      .eq('status', 'pending')
      .select('*')
      .single();

    if (updateError && updateError.code !== 'PGRST116') {
      return createErrorResponse('PAYMENT_ORDER_UPDATE_FAILED', 'Failed to update order status', 500);
    }

    if (!claimedOrder) {
      const { data: freshOrder, error: statusCheckError } = await supabase
        .from('orders')
        .select('status, payment_key, jellies, amount')
        .eq('order_id', orderId)
        .single();

      if (statusCheckError) {
        return createErrorResponse('PAYMENT_STATE_REFRESH_FAILED', 'Payment state conflict', 409);
      }

      if (freshOrder?.status === 'completed') {
        return NextResponse.json({
          success: true,
          jellies_credited: Number(order.jellies),
          payment_key: freshOrder.payment_key || tossPaymentKey,
          order_id: orderId,
          idempotent_attempt_count: idempotentAttemptCount,
          message: 'Already processed',
          monitoring_event: 'payment_verify_idempotent_success',
        });
      }

      return createErrorResponse('PAYMENT_ORDER_NOT_PENDING', 'Order is not in pending state', 409);
    }

    const userId = order.user_id;
    const { error: txError } = await supabase
      .from('jelly_transactions')
      .insert({
        user_id: userId,
        type: 'purchase',
        jellies: claimedOrder.jellies,
        amount: claimedOrder.amount,
        purpose: `Purchase: ${claimedOrder.package_type}`,
        metadata: {
          payment_key: paymentKey,
          toss_payment_key: tossPaymentKey,
          order_id: orderId,
        },
      });

    if (txError) {
      return createErrorResponse('PAYMENT_CREDIT_FAILED', 'Failed to credit jellies', 500);
    }

    const { data: previousPurchases } = await supabase
      .from('jelly_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'purchase')
      .limit(2);

    let totalJellies = claimedOrder.jellies;
    if (previousPurchases && previousPurchases.length === 1) {
      const rewardResult = await supabase.from('rewards').insert({
        user_id: userId,
        reward_type: 'first_purchase',
        jellies: 1,
        metadata: { order_id: orderId },
      });
      if (rewardResult.error) {
        await insertNotionRow({
          category: 'PAYMENT_EVENT',
          title: `Payment verify reward log failed (${orderId})`,
          description: 'First purchase reward insert failed',
          metadata: { orderId, userId, error: rewardResult.error },
        });
      }

      const bonusResult = await supabase.from('jelly_transactions').insert({
        user_id: userId,
        type: 'bonus',
        jellies: 1,
        purpose: 'First purchase bonus',
      });
      if (bonusResult.error) {
        await insertNotionRow({
          category: 'PAYMENT_EVENT',
          title: `Payment verify bonus transaction failed (${orderId})`,
          description: 'First purchase bonus transaction failed',
          metadata: { orderId, userId, error: bonusResult.error },
        });
      }

      totalJellies += 1;
    }

    const { data: wallet, error: walletLookupError } = await supabase
      .from('jelly_wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (walletLookupError && walletLookupError.code !== 'PGRST116') {
      return createErrorResponse('PAYMENT_WALLET_LOOKUP_FAILED', 'Failed to load wallet', 500);
    }

    if (wallet) {
      const expectedBalance = wallet.balance + totalJellies;
      const walletUpdate = await supabase
        .from('jelly_wallets')
        .update({ balance: expectedBalance })
        .eq('user_id', userId);

      if (walletUpdate.error) {
        return createErrorResponse('PAYMENT_WALLET_UPDATE_FAILED', 'Failed to update wallet', 500);
      }

      const { data: refreshedWallet, error: refreshedWalletError } = await supabase
        .from('jelly_wallets')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (refreshedWalletError) {
        return createErrorResponse('PAYMENT_WALLET_VERIFY_FAILED', 'Failed to verify updated wallet', 500);
      }

      if (refreshedWallet && refreshedWallet.balance !== expectedBalance) {
        // 사용자별 불일치 지표 (DB 카운터, best-effort). 읽기 실패 시 1로 간주해
        // 최초 감지 Notion 기록은 항상 남기되, 임계값 경보만 건너뛴다.
        const mismatchCount = await incrementOpsCounter(supabase, `payment_wallet_mismatch:${userId}`);
        const walletMismatchPayload = {
          orderId,
          userId,
          expectedBalance,
          actualBalance: refreshedWallet.balance,
          wallet_mismatch_count: mismatchCount ?? 1,
          idempotentAttemptCount,
        };
        await insertNotionRow({
          category: 'PAYMENT_EVENT',
          title: `Payment verify wallet mismatch detected (${orderId})`,
          description: 'Wallet balance mismatch detected after credit',
          metadata: walletMismatchPayload,
        });

        if (mismatchCount !== null && mismatchCount >= WALLET_MISMATCH_WARNING_THRESHOLD) {
          await insertNotionRow({
            category: 'ERROR',
            title: `Wallet mismatch threshold exceeded (${orderId})`,
            description: 'Wallet balance divergence occurred repeatedly',
            metadata: { ...walletMismatchPayload },
          });
        }
      }
    } else {
      const walletInsert = await supabase
        .from('jelly_wallets')
        .insert({
          user_id: userId,
          balance: totalJellies,
        });

      if (walletInsert.error) {
        return createErrorResponse('PAYMENT_WALLET_CREATE_FAILED', 'Failed to initialize wallet', 500);
      }
    }

    const { data: buyer } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (buyer?.email) {
      const receiptResult = await sendPaymentReceiptEmail(buyer.email, orderId, claimedOrder.amount, totalJellies);
      if (!receiptResult.success) {
        await insertNotionRow({
          category: 'PAYMENT_EVENT',
          title: `Payment verify receipt email failed (${orderId})`,
          description: 'Payment completed but receipt email failed',
          metadata: {
            orderId,
            userId,
            recipient: buyer.email,
            error: receiptResult.error,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      jellies_credited: totalJellies,
      payment_key: tossPaymentKey,
      order_id: orderId,
      idempotent_attempt_count: idempotentAttemptCount,
      monitoring_event: 'payment_verify_success',
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return createErrorResponse('PAYMENT_INTERNAL_ERROR', 'Internal server error', 500, { error: String(error) });
  }
}
