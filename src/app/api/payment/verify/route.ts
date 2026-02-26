import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * POST /api/payment/verify
 * Verify Toss Payments result and credit jellies
 */
export async function POST(req: NextRequest) {
  try {
    const { paymentKey, orderId, amount } = await req.json();

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { error: 'Missing required payment data' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Get order to find user_id and package info
    const { data: order, error: orderFetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (orderFetchError || !order || !order.user_id) {
      return NextResponse.json(
        { error: 'Order not found or invalid' },
        { status: 404 }
      );
    }

    const userId = order.user_id;

    // Verify payment with Toss API
    const tossSecretKey = process.env.TOSS_SECRET_KEY;

    if (!tossSecretKey) {
      console.error('Toss Secret Key not configured');
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    const verifyUrl = 'https://api.tosspayments.com/v1/payments/confirm';
    const authHeader = 'Basic ' + Buffer.from(tossSecretKey + ':').toString('base64');

    const verifyResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json();
      console.error('Toss payment verification failed:', errorData);
      return NextResponse.json(
        { error: 'Payment verification failed', details: errorData },
        { status: 400 }
      );
    }

    const paymentData = await verifyResponse.json();

    // Check if already processed
    if (order.status === 'completed') {
      return NextResponse.json({
        success: true,
        jellies_credited: order.jellies,
        payment_key: paymentKey,
        order_id: orderId,
        message: 'Already processed',
      });
    }

    // Update order status
    await supabase
      .from('orders')
      .update({
        status: 'completed',
        payment_key: paymentKey,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId);

    // Credit jellies to user
    const { error: txError } = await supabase
      .from('jelly_transactions')
      .insert({
        user_id: userId,
        type: 'purchase',
        jellies: order.jellies,
        amount: order.amount,
        purpose: `Purchase: ${paymentData.orderName || order.package_type}`,
        metadata: {
          payment_key: paymentKey,
          order_id: orderId,
          payment_method: paymentData.method,
          package_type: order.package_type,
        },
      });

    if (txError) {
      console.error('Error crediting jellies:', txError);
      return NextResponse.json(
        { error: 'Failed to credit jellies' },
        { status: 500 }
      );
    }

    // Check if first purchase for bonus
    const { data: previousPurchases } = await supabase
      .from('jelly_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'purchase')
      .limit(2);

    let totalJellies = order.jellies;
    if (previousPurchases && previousPurchases.length === 1) {
      // This is the first purchase, give bonus
      await supabase.from('rewards').insert({
        user_id: userId,
        reward_type: 'first_purchase',
        jellies: 1,
        metadata: { order_id: orderId },
      });

      await supabase.from('jelly_transactions').insert({
        user_id: userId,
        type: 'bonus',
        jellies: 1,
        purpose: 'First purchase bonus',
      });

      totalJellies += 1; // Add bonus to return value
    }

    // UPDATE REAL JELLY WALLET BALANCE
    const { data: wallet } = await supabase
      .from('jelly_wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (wallet) {
      await supabase
        .from('jelly_wallets')
        .update({ balance: wallet.balance + totalJellies })
        .eq('user_id', userId);
    } else {
      await supabase
        .from('jelly_wallets')
        .insert({ user_id: userId, balance: totalJellies });
    }

    return NextResponse.json({
      success: true,
      jellies_credited: totalJellies,
      payment_key: paymentKey,
      order_id: orderId,
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
