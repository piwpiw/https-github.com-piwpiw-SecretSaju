import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase';

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
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (order && order.status === 'pending') {
      await supabase.from('orders').update({
        status: 'completed',
        payment_key: session.payment_intent as string,
        updated_at: new Date().toISOString(),
      }).eq('order_id', orderId);

      await supabase.from('jelly_transactions').insert({
        user_id: userId,
        type: 'purchase',
        jellies: order.jellies,
        amount: order.amount,
        purpose: `Purchase: ${order.package_type}`,
        metadata: { order_id: orderId, provider: 'stripe' },
      });
    }
  }

  return NextResponse.json({ received: true });
}
