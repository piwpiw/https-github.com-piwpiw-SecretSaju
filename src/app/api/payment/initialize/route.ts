import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { APP_CONFIG } from '@/config';
import { getAuthenticatedUser } from '@/lib/api-auth';

/**
 * POST /api/payment/initialize
 * Initialize Toss Payments for jelly purchase
 */
export async function POST(req: NextRequest) {
    try {
        const { tierId } = await req.json();

        // Map tierId to package_type
        const tierToPackage: Record<string, string> = {
            'taste': 'TRIAL',
            'smart': 'SMART',
            'pro': 'PRO',
        };

        const package_type = tierToPackage[tierId];
        if (!package_type) {
            return NextResponse.json(
                { error: 'Invalid tier ID' },
                { status: 400 }
            );
        }

        // Package pricing
        const packages = {
            TRIAL: { jellies: 1, bonus: 0, amount: 990, name: '체험팩 - 젤리 1개' },
            SMART: { jellies: 3, bonus: 1, amount: 2900, name: '똑똑이팩 - 젤리 4개 (+1 보너스)' },
            PRO: { jellies: 10, bonus: 3, amount: 9900, name: '프로팩 - 젤리 13개 (+3 보너스)' },
        };

        const selectedPackage = packages[package_type as keyof typeof packages];

        if (!selectedPackage) {
            return NextResponse.json(
                { error: 'Invalid package type' },
                { status: 400 }
            );
        }

        // Get authenticated user
        const authResult = await getAuthenticatedUser(req);
        if (!authResult.user) {
            return authResult.error || NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Generate order ID
        const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        // Store order in database (pending state)
        const supabase = getSupabaseAdmin();
        await supabase.from('orders').insert({
            order_id: orderId,
            user_id: authResult.user.id,
            package_type: package_type,
            amount: selectedPackage.amount,
            jellies: selectedPackage.jellies + selectedPackage.bonus,
            status: 'pending',
            metadata: { tierId },
        });

        const baseUrl = APP_CONFIG.BASE_URL;

        return NextResponse.json({
            clientKey: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
            orderId,
            amount: selectedPackage.amount,
            orderName: selectedPackage.name,
            jellies: selectedPackage.jellies + selectedPackage.bonus,
            successUrl: `${baseUrl}/payment/success`,
            failUrl: `${baseUrl}/payment/fail`,
            customerName: '고객',
        });

    } catch (error) {
        console.error('Payment initialization error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
