import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/integrations/supabase';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  // @ts-ignore
  return new Stripe(key, { apiVersion: '2026-02-25.clover' as any });
}

function getWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  return secret;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, getWebhookSecret());
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    const userId = session.metadata?.userId;

    if (!orderId || !userId) {
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 });

    // Idempotency guard: claim the order via a conditional pending -> completed
    // transition (same pattern as payment/verify). A duplicate webhook for the
    // same checkout session finds no pending row and credits nothing.
    const { data: claimedOrder, error: claimError } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        payment_key: session.payment_intent as string,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId)
      .eq('status', 'pending')
      .select('*')
      .single();

    if (claimError && claimError.code !== 'PGRST116') {
      console.error('[Stripe Webhook] Failed to claim order:', claimError);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    if (!claimedOrder) {
      // Order missing or already processed (duplicate delivery) — acknowledge
      // without crediting again.
      return NextResponse.json({ received: true, duplicate: true });
    }

    const totalJellies = Number(claimedOrder.jellies || 0);

    const { error: txError } = await supabase.from('jelly_transactions').insert({
      user_id: userId,
      type: 'purchase',
      jellies: claimedOrder.jellies,
      amount: claimedOrder.amount,
      purpose: `Purchase: ${claimedOrder.package_type}`,
      metadata: { order_id: orderId, provider: 'stripe', session_id: session.id },
    });

    if (txError) {
      console.error('[Stripe Webhook] Failed to record transaction:', txError);
      return NextResponse.json({ error: 'Failed to credit jellies' }, { status: 500 });
    }

    // Manually credit the wallet — no DB trigger updates jelly_wallets on a
    // jelly_transactions insert (same pattern as payment/verify).
    const { data: wallet, error: walletLookupError } = await supabase
      .from('jelly_wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (walletLookupError && walletLookupError.code !== 'PGRST116') {
      console.error('[Stripe Webhook] Failed to load wallet:', walletLookupError);
      return NextResponse.json({ error: 'Failed to load wallet' }, { status: 500 });
    }

    if (wallet) {
      const { error: walletUpdateError } = await supabase
        .from('jelly_wallets')
        .update({ balance: wallet.balance + totalJellies })
        .eq('user_id', userId);

      if (walletUpdateError) {
        console.error('[Stripe Webhook] Failed to update wallet:', walletUpdateError);
        return NextResponse.json({ error: 'Failed to update wallet' }, { status: 500 });
      }
    } else {
      const { error: walletInsertError } = await supabase
        .from('jelly_wallets')
        .insert({ user_id: userId, balance: totalJellies });

      if (walletInsertError) {
        console.error('[Stripe Webhook] Failed to initialize wallet:', walletInsertError);
        return NextResponse.json({ error: 'Failed to initialize wallet' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
