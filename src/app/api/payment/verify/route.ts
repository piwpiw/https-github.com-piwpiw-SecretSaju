import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { insertNotionRow } from '@/lib/notion';
import { sendPaymentReceiptEmail } from '@/lib/mail';
import { buildErrorResponsePayload } from '@/lib/error-response';

const VERIFY_IDEMPOTENCY_COUNTER = new Map<string, number>();
const WALLET_MISMATCH_COUNTER = new Map<string, number>();
const VERIFY_FAILURE_COUNTER = new Map<string, number>();
const VERIFY_IDEMPOTENCY_LIMIT = 30;
const WALLET_MISMATCH_WARNING_THRESHOLD = 3;
const VERIFY_FAILURE_ALERT_THRESHOLD = 3;

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

/**
 * POST /api/payment/verify
 * Verify Toss Payments result and credit jellies
 */
export async function POST(req: NextRequest) {
  const createErrorResponse = (code: string, message: string, status: number, details?: unknown) =>
    NextResponse.json(buildErrorResponsePayload(code, message, details), { status });

  try {
    const { paymentKey: rawPaymentKey, orderId: rawOrderId, amount: rawAmount } = await req.json();

    const paymentKey = String(rawPaymentKey || '');
    const orderId = String(rawOrderId || '').trim();
    const amount = Number(rawAmount);

    const idempotencyFingerprint = `verify:${orderId || 'missing'}`;
    const idempotentAttemptCount = (VERIFY_IDEMPOTENCY_COUNTER.get(idempotencyFingerprint) || 0) + 1;
    VERIFY_IDEMPOTENCY_COUNTER.set(idempotencyFingerprint, idempotentAttemptCount);

    if (idempotentAttemptCount > VERIFY_IDEMPOTENCY_LIMIT) {
      const notionResult = await insertNotionRow({
        category: 'PAYMENT_EVENT',
        title: `Payment verify idempotency limit exceeded (${orderId || 'missing'})`,
        description: 'Verification request count exceeded allowed retries',
        metadata: { orderId, paymentKey, idempotent_attempt_count: idempotentAttemptCount },
      });
      if (!notionResult.success) {
        console.warn('[Payment Verify] Notion log failed:', notionResult.error);
      }
      return createErrorResponse('PAYMENT_IDEMPOTENCY_LIMIT_EXCEEDED', 'Too many verification retries for same order', 429, { idempotent_attempt_count: idempotentAttemptCount });
    }

    if (!paymentKey || !orderId || !amount) {
      await recordVerifyFailure(orderId, 'missing_required_data', { paymentKey, amount });
      return createErrorResponse('PAYMENT_VALIDATION_MISSING_DATA', 'Missing required payment data', 400);
    }

    const normalizedOrderId = orderId;
    const orderIdPattern = /^order_[a-zA-Z0-9]+_[a-z0-9]+$/;

    if (!orderIdPattern.test(normalizedOrderId)) {
      await recordVerifyFailure(normalizedOrderId, 'invalid_order_id', { paymentKey, amount });
      const notionResult = await insertNotionRow({
        category: 'PAYMENT_EVENT',
        title: `Payment verify failed: invalid order id format (${normalizedOrderId})`,
        description: 'Order ID format check failed during verification',
        metadata: { orderId, paymentKey, amount },
      });
      if (!notionResult.success) {
        console.warn('[Payment Verify] Notion log failed:', notionResult.error);
      }
      return createErrorResponse('PAYMENT_INVALID_ORDER_ID', 'Invalid order ID format', 400);
    }

    const requestedAmount = Number(amount);
    if (Number.isNaN(requestedAmount) || requestedAmount <= 0) {
      return createErrorResponse('PAYMENT_INVALID_AMOUNT', 'Invalid amount format', 400);
    }

    const supabase = getSupabaseAdmin();
    const { data: order, error: orderFetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', normalizedOrderId)
      .single();

    if (orderFetchError || !order || !order.user_id) {
      await recordVerifyFailure(normalizedOrderId, 'order_not_found', { paymentKey, amount, error: orderFetchError });
      const notionResult = await insertNotionRow({
        category: 'PAYMENT_EVENT',
        title: `Payment verify failed: order not found (${normalizedOrderId})`,
        description: 'Order lookup failure during payment verification',
        metadata: { orderId: normalizedOrderId, paymentKey, amount },
      });
      if (!notionResult.success) {
        console.warn('[Payment Verify] Notion log failed:', notionResult.error);
      }
      return createErrorResponse('PAYMENT_ORDER_NOT_FOUND', 'Order not found or invalid', 404);
    }

    const orderAmount = Number(order.amount);
    if (!orderAmount || Number.isNaN(orderAmount)) {
      const notionResult = await insertNotionRow({
        category: 'PAYMENT_EVENT',
        title: `Payment verify failed: invalid order amount (${normalizedOrderId})`,
        description: 'Stored order amount is invalid',
        metadata: { orderId: normalizedOrderId, paymentKey, amount: order.amount },
      });
      if (!notionResult.success) {
        console.warn('[Payment Verify] Notion log failed:', notionResult.error);
      }
      return createErrorResponse('PAYMENT_INVALID_ORDER_AMOUNT', 'Invalid order amount', 500);
    }

    if (requestedAmount !== orderAmount) {
      await recordVerifyFailure(normalizedOrderId, 'amount_mismatch', { paymentKey, requestedAmount, orderAmount });
      const notionResult = await insertNotionRow({
        category: 'ERROR',
        title: `Payment verify blocked: amount mismatch (${normalizedOrderId})`,
        description: 'Payment amount does not match order amount',
        metadata: { orderId: normalizedOrderId, paymentKey, requestedAmount, orderAmount },
      });
      if (!notionResult.success) {
        console.warn('[Payment Verify] Notion log failed:', notionResult.error);
      }
      return createErrorResponse('PAYMENT_AMOUNT_MISMATCH', 'Amount mismatch', 400);
    }

    const userId = order.user_id;
    const tossSecretKey = process.env.TOSS_SECRET_KEY;

    if (!tossSecretKey) {
      console.error('Toss Secret Key not configured');
      return createErrorResponse('PAYMENT_CONFIG_MISSING', 'Payment system not configured', 500);
    }

    const verifyUrl = 'https://api.tosspayments.com/v1/payments/confirm';
    const authHeader = 'Basic ' + Buffer.from(tossSecretKey + ':').toString('base64');

    const verifyResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId: normalizedOrderId, amount }),
    });

    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json();
      await recordVerifyFailure(normalizedOrderId, 'toss_verification_failed', { paymentKey, amount, errorData });
      const notionResult = await insertNotionRow({
        category: 'PAYMENT_EVENT',
        title: `Payment verify failed: Toss API (${normalizedOrderId})`,
        description: 'Toss payment verify returned non-200',
        metadata: { orderId: normalizedOrderId, paymentKey, amount, errorData },
      });
      if (!notionResult.success) {
        console.warn('[Payment Verify] Notion log failed:', notionResult.error);
      }

      if (order.status === 'pending') {
        await supabase
          .from('orders')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('order_id', normalizedOrderId)
          .eq('status', 'pending');
      }

      return createErrorResponse(
        'PAYMENT_TOSS_VERIFICATION_FAILED',
        'Payment verification failed',
        400,
        errorData
      );
    }

    await verifyResponse.json();

    if (order.status === 'completed') {
      const notionResult = await insertNotionRow({
        category: 'PAYMENT_EVENT',
        title: `Payment verify duplicated request (${normalizedOrderId})`,
        description: 'Order already completed, returning idempotent success',
        metadata: {
          orderId: normalizedOrderId,
          paymentKey,
          userId,
          idempotent_attempt_count: idempotentAttemptCount,
        },
      });
      if (!notionResult.success) {
        console.warn('[Payment Verify] Notion log failed:', notionResult.error);
      }

      return NextResponse.json({
          success: true,
          jellies_credited: order.jellies,
          payment_key: paymentKey,
          order_id: normalizedOrderId,
          idempotent_attempt_count: idempotentAttemptCount,
          message: 'Already processed',
          monitoring_event: 'payment_verify_idempotent_success',
        });
    }

    const { data: claimedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        payment_key: paymentKey,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', normalizedOrderId)
      .eq('status', 'pending')
      .select('*')
      .single();

      if (updateError && updateError.code !== 'PGRST116') {
      const notionResult = await insertNotionRow({
        category: 'PAYMENT_EVENT',
        title: `Payment verify failed: cannot complete order (${normalizedOrderId})`,
        description: 'Failed to update order status',
        metadata: { orderId: normalizedOrderId, userId, error: updateError },
      });
      if (!notionResult.success) {
        console.warn('[Payment Verify] Notion log failed:', notionResult.error);
      }
      return createErrorResponse('PAYMENT_ORDER_UPDATE_FAILED', 'Failed to update order status', 500);
    }

    if (!claimedOrder) {
      const { data: freshOrder, error: statusCheckError } = await supabase
        .from('orders')
        .select('status')
        .eq('order_id', normalizedOrderId)
        .single();

      if (statusCheckError) {
        const notionResult = await insertNotionRow({
          category: 'PAYMENT_EVENT',
          title: `Payment verify failed: order state refresh failed (${normalizedOrderId})`,
          description: 'Could not verify order status after claim attempt',
          metadata: { orderId: normalizedOrderId, paymentKey, userId, error: statusCheckError },
        });
        if (!notionResult.success) {
          console.warn('[Payment Verify] Notion log failed:', notionResult.error);
        }
        return createErrorResponse('PAYMENT_STATE_REFRESH_FAILED', 'Payment state conflict', 409);
      }

    if (freshOrder?.status === 'completed') {
        const notionResult = await insertNotionRow({
          category: 'PAYMENT_EVENT',
          title: `Payment verify duplicated request (${normalizedOrderId})`,
          description: 'Order already completed, returning idempotent success',
          metadata: {
            orderId: normalizedOrderId,
            paymentKey,
            userId,
            idempotent_attempt_count: idempotentAttemptCount,
          },
        });
        if (!notionResult.success) {
          console.warn('[Payment Verify] Notion log failed:', notionResult.error);
        }

        return NextResponse.json({
          success: true,
          jellies_credited: order.jellies,
          payment_key: paymentKey,
          order_id: normalizedOrderId,
          idempotent_attempt_count: idempotentAttemptCount,
          message: 'Already processed',
          monitoring_event: 'payment_verify_idempotent_success',
        });
      }

      return createErrorResponse('PAYMENT_ORDER_NOT_PENDING', 'Order is not in pending state', 409);
    }

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
          order_id: normalizedOrderId,
        },
      });

    if (txError) {
      const notionResult = await insertNotionRow({
        category: 'PAYMENT_EVENT',
        title: `Payment verify failed: cannot credit (${normalizedOrderId})`,
        description: 'Jelly transaction insert failed',
        metadata: { orderId: normalizedOrderId, userId, error: txError },
      });
      if (!notionResult.success) {
        console.warn('[Payment Verify] Notion log failed:', notionResult.error);
      }
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
        metadata: { order_id: normalizedOrderId },
      });
      if (rewardResult.error) {
        const notionResult = await insertNotionRow({
          category: 'PAYMENT_EVENT',
          title: `Payment verify reward log failed (${normalizedOrderId})`,
          description: 'First purchase reward insert failed',
          metadata: { orderId: normalizedOrderId, userId, error: rewardResult.error },
        });
        if (!notionResult.success) {
          console.warn('[Payment Verify] Notion log failed:', notionResult.error);
        }
      }

      const bonusResult = await supabase.from('jelly_transactions').insert({
        user_id: userId,
        type: 'bonus',
        jellies: 1,
        purpose: 'First purchase bonus',
      });
      if (bonusResult.error) {
        const notionResult = await insertNotionRow({
          category: 'PAYMENT_EVENT',
          title: `Payment verify bonus transaction failed (${normalizedOrderId})`,
          description: 'First purchase bonus transaction failed',
          metadata: { orderId: normalizedOrderId, userId, error: bonusResult.error },
        });
        if (!notionResult.success) {
          console.warn('[Payment Verify] Notion log failed:', notionResult.error);
        }
      }

      totalJellies += 1;
    }

    const { data: wallet, error: walletLookupError } = await supabase
      .from('jelly_wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (walletLookupError && walletLookupError.code !== 'PGRST116') {
      const notionResult = await insertNotionRow({
        category: 'PAYMENT_EVENT',
        title: `Payment verify failed: wallet lookup failed (${normalizedOrderId})`,
        description: 'Could not query existing wallet',
        metadata: { orderId: normalizedOrderId, userId, error: walletLookupError },
      });
      if (!notionResult.success) {
        console.warn('[Payment Verify] Notion log failed:', notionResult.error);
      }
      return createErrorResponse('PAYMENT_WALLET_LOOKUP_FAILED', 'Failed to load wallet', 500);
    }

    if (wallet) {
      const walletUpdate = await supabase
        .from('jelly_wallets')
        .update({ balance: wallet.balance + totalJellies })
        .eq('user_id', userId);

      if (walletUpdate.error) {
        const notionResult = await insertNotionRow({
          category: 'PAYMENT_EVENT',
          title: `Payment verify failed: wallet update failed (${normalizedOrderId})`,
          description: 'Could not update existing wallet balance',
          metadata: { orderId: normalizedOrderId, userId, error: walletUpdate.error },
        });
        if (!notionResult.success) {
          console.warn('[Payment Verify] Notion log failed:', notionResult.error);
        }
        return createErrorResponse('PAYMENT_WALLET_UPDATE_FAILED', 'Failed to update wallet', 500);
      }

      const { data: refreshedWallet, error: refreshedWalletError } = await supabase
        .from('jelly_wallets')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (refreshedWalletError) {
        const notionResult = await insertNotionRow({
          category: 'PAYMENT_EVENT',
          title: `Payment verify failed: wallet post-update verification failed (${normalizedOrderId})`,
          description: 'Could not verify wallet balance after credit',
          metadata: { orderId: normalizedOrderId, userId, error: refreshedWalletError },
        });
        if (!notionResult.success) {
          console.warn('[Payment Verify] Notion log failed:', notionResult.error);
        }
        return createErrorResponse('PAYMENT_WALLET_VERIFY_FAILED', 'Failed to verify updated wallet', 500);
      }

      const expectedBalance = wallet.balance + totalJellies;
      if (refreshedWallet && refreshedWallet.balance !== expectedBalance) {
        const mismatchCount = (WALLET_MISMATCH_COUNTER.get(userId) || 0) + 1;
        WALLET_MISMATCH_COUNTER.set(userId, mismatchCount);
        const walletMismatchPayload = {
          orderId: normalizedOrderId,
          userId,
          expectedBalance,
          actualBalance: refreshedWallet.balance,
          wallet_mismatch_count: mismatchCount,
          idempotentAttemptCount: idempotentAttemptCount ?? 0,
        };
        const notionResult = await insertNotionRow({
          category: 'PAYMENT_EVENT',
          title: `Payment verify wallet mismatch detected (${normalizedOrderId})`,
          description: 'Wallet balance mismatch detected after credit',
          metadata: walletMismatchPayload,
        });
        if (!notionResult.success) {
          console.warn('[Payment Verify] Notion log failed:', notionResult.error);
        }

        if (mismatchCount >= WALLET_MISMATCH_WARNING_THRESHOLD) {
          await insertNotionRow({
            category: 'ERROR',
            title: `Wallet mismatch threshold exceeded (${normalizedOrderId})`,
            description: 'Wallet balance divergence occurred repeatedly',
            metadata: { ...walletMismatchPayload },
          });
        }
      }
    } else {
      const walletInsert = await supabase
        .from('jelly_wallets')
        .insert({ user_id: userId, balance: totalJellies });

      if (walletInsert.error) {
        const notionResult = await insertNotionRow({
          category: 'PAYMENT_EVENT',
          title: `Payment verify failed: wallet creation failed (${normalizedOrderId})`,
          description: 'Could not create wallet balance',
          metadata: { orderId: normalizedOrderId, userId, error: walletInsert.error },
        });
        if (!notionResult.success) {
          console.warn('[Payment Verify] Notion log failed:', notionResult.error);
        }
        return createErrorResponse('PAYMENT_WALLET_CREATE_FAILED', 'Failed to initialize wallet', 500);
      }
    }

    const notionResult = await insertNotionRow({
      category: 'PAYMENT_EVENT',
      title: `Payment verified and credited (${normalizedOrderId})`,
      description: 'Payment completed and jelly balance updated',
      metadata: { orderId: normalizedOrderId, userId, paymentKey, totalJellies },
    });
    if (!notionResult.success) {
      console.warn('[Payment Verify] Notion log failed:', notionResult.error);
    }

    const { data: buyer } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (buyer?.email) {
      const receiptResult = await sendPaymentReceiptEmail(
        buyer.email,
        normalizedOrderId,
        claimedOrder.amount,
        totalJellies
      );
      if (!receiptResult.success) {
        const mailResult = await insertNotionRow({
          category: 'PAYMENT_EVENT',
          title: `Payment verify receipt email failed (${normalizedOrderId})`,
          description: 'Payment completed but receipt email failed',
          metadata: { orderId: normalizedOrderId, userId, recipient: buyer.email, error: receiptResult.error },
        });
        if (!mailResult.success) {
          console.warn('[Payment Verify] Notion log failed:', mailResult.error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      jellies_credited: totalJellies,
      payment_key: paymentKey,
      order_id: normalizedOrderId,
      idempotent_attempt_count: idempotentAttemptCount,
      monitoring_event: 'payment_verify_success',
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    const notionResult = await insertNotionRow({
      category: 'ERROR',
      title: 'Payment verification exception',
      description: 'Unhandled error during verify endpoint',
      metadata: { error: String(error) },
    });
    if (!notionResult.success) {
      console.warn('[Payment Verify] Notion log failed:', notionResult.error);
    }
    return createErrorResponse(
      'PAYMENT_INTERNAL_ERROR',
      'Internal server error',
      500
    );
  }
}
