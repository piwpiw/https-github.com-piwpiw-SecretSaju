import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { insertNotionRow } from '@/lib/notion';
import { sendPaymentReceiptEmail } from '@/lib/mail';
import { buildErrorResponsePayload } from '@/lib/error-response';
import { buildPaymentVerifySignature } from '@/lib/payment-verify';

const VERIFY_IDEMPOTENCY_COUNTER = new Map<string, number>();
const WALLET_MISMATCH_COUNTER = new Map<string, number>();
const VERIFY_FAILURE_COUNTER = new Map<string, number>();
const VERIFY_IDEMPOTENCY_LIMIT = 30;
const WALLET_MISMATCH_WARNING_THRESHOLD = 3;
const VERIFY_FAILURE_ALERT_THRESHOLD = 3;

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

async function recordVerifyFailure(orderId: string, reason: string, metadata: Record<string, unknown>) {
  const key = orderId || 'missing';
  const nextCount = (VERIFY_FAILURE_COUNTER.get(key) || 0) + 1;
  VERIFY_FAILURE_COUNTER.set(key, nextCount);
  if (nextCount >= VERIFY_FAILURE_ALERT_THRESHOLD) {
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
    const payload = await req.json();
    const paymentKey = String(payload.paymentKey || '').trim();
    const orderId = String(payload.orderId || '').trim();
    const amount = Number(payload.amount);
    const verifyToken = String(payload.verifyToken || '').trim();
    const verifySignature = String(payload.verifySignature || '').trim();

    const idempotencyFingerprint = `verify:${orderId || 'missing'}`;
    const idempotentAttemptCount = (VERIFY_IDEMPOTENCY_COUNTER.get(idempotencyFingerprint) || 0) + 1;
    VERIFY_IDEMPOTENCY_COUNTER.set(idempotencyFingerprint, idempotentAttemptCount);

    if (idempotentAttemptCount > VERIFY_IDEMPOTENCY_LIMIT) {
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
      await recordVerifyFailure(orderId, 'missing_required_data', {
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
      await recordVerifyFailure(orderId, 'invalid_order_id', { paymentKey, amount });
      return createErrorResponse('PAYMENT_INVALID_ORDER_ID', 'Invalid order ID format', 400);
    }

    const supabase = getSupabaseAdmin();
    const { data: order, error: orderFetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (orderFetchError || !order || !order.user_id) {
      await recordVerifyFailure(orderId, 'order_not_found', {
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
      await recordVerifyFailure(orderId, 'amount_mismatch', {
        paymentKey,
        requestedAmount: amount,
        orderAmount,
      });
      return createErrorResponse('PAYMENT_AMOUNT_MISMATCH', 'Amount mismatch', 400);
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
      await recordVerifyFailure(orderId, 'invalid_verification_signature', {
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
      await recordVerifyFailure(orderId, 'toss_verification_failed', {
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
      await recordVerifyFailure(orderId, 'toss_order_id_mismatch', {
        paymentKey,
        expectedOrderId: orderId,
        tossOrderId,
      });
      return createErrorResponse('PAYMENT_TOSS_ORDER_MISMATCH', 'Payment order mismatch', 400);
    }

    if (status !== 'DONE') {
      await recordVerifyFailure(orderId, 'toss_status_not_done', {
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
      await recordVerifyFailure(orderId, 'toss_amount_mismatch', {
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
      await recordVerifyFailure(orderId, 'toss_missing_payment_key', { paymentKey, verifyData });
      return createErrorResponse('PAYMENT_TOSS_PAYLOAD_INVALID', 'Toss payment key missing', 400, verifyData);
    }

    const { data: claimedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        payment_key: paymentKey,
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
          payment_key: freshOrder.payment_key || paymentKey,
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
        const mismatchCount = (WALLET_MISMATCH_COUNTER.get(userId) || 0) + 1;
        WALLET_MISMATCH_COUNTER.set(userId, mismatchCount);
        const walletMismatchPayload = {
          orderId,
          userId,
          expectedBalance,
          actualBalance: refreshedWallet.balance,
          wallet_mismatch_count: mismatchCount,
          idempotentAttemptCount,
        };
        await insertNotionRow({
          category: 'PAYMENT_EVENT',
          title: `Payment verify wallet mismatch detected (${orderId})`,
          description: 'Wallet balance mismatch detected after credit',
          metadata: walletMismatchPayload,
        });

        if (mismatchCount >= WALLET_MISMATCH_WARNING_THRESHOLD) {
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
      payment_key: paymentKey,
      order_id: orderId,
      idempotent_attempt_count: idempotentAttemptCount,
      monitoring_event: 'payment_verify_success',
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return createErrorResponse('PAYMENT_INTERNAL_ERROR', 'Internal server error', 500, { error: String(error) });
  }
}
