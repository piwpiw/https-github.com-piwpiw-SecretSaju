import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/integrations/supabase';
import { getAuthenticatedUser } from '@/lib/auth/api-auth';
import { APP_CONFIG } from '@/config';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  // @ts-ignore
  return new Stripe(key, { apiVersion: '2026-02-25.clover' as any });
}

const packages = {
  TRIAL: { jellies: 1, bonus: 0, amount: 990, name: '체험팩 - 젤리 1개' },
  SMART: { jellies: 3, bonus: 1, amount: 2900, name: '똑똑이팩 - 젤리 4개' },
  PRO: { jellies: 10, bonus: 3, amount: 9900, name: '프로팩 - 젤리 13개' },
};

export async function POST(req: NextRequest) {
  try {
    const { tierId } = await req.json();
    const tierToPackage: Record<string, string> = {
      'taste': 'TRIAL',
      'smart': 'SMART',
      'pro': 'PRO',
    };

    const package_type = tierToPackage[tierId];
    if (!package_type) {
      return NextResponse.json({ error: 'Invalid tier ID' }, { status: 400 });
    }

    const selectedPackage = packages[package_type as keyof typeof packages];
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.user) {
      return authResult.error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const supabase = getSupabaseAdmin();

    await supabase.from('orders').insert({
      order_id: orderId,
      user_id: authResult.user.id,
      package_type: package_type,
      amount: selectedPackage.amount,
      jellies: selectedPackage.jellies + selectedPackage.bonus,
      status: 'pending',
      metadata: { tierId, provider: 'stripe' },
    });

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: selectedPackage.name },
          unit_amount: Math.round(selectedPackage.amount / 10), // KRW to USD (approx)
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${APP_CONFIG.BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_CONFIG.BASE_URL}/payment/fail`,
      metadata: { orderId, userId: authResult.user.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
