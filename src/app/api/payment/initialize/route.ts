import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getSupabaseAdmin } from '@/lib/integrations/supabase';
import { APP_CONFIG } from '@/config';
import { getAuthenticatedUser } from '@/lib/auth/api-auth';
import { insertNotionRow } from '@/lib/integrations/notion';
import { buildErrorResponsePayload } from '@/lib/contracts/error-response';
import { buildPaymentVerifySignature } from '@/lib/payment/payment-verify';

/**
 * POST /api/payment/initialize
 * Initialize Toss Payments for jelly purchase
 */
export async function POST(req: NextRequest) {
  const createErrorResponse = (code: string, message: string, status: number, details?: unknown) =>
    NextResponse.json(buildErrorResponsePayload(code, message, details), { status });

  try {
    const { tierId, callbackOverride, customerName } = await req.json();
    if (!tierId) {
      return createErrorResponse('PAYMENT_MISSING_TIER', 'Tier ID is required', 400);
    }
    if (callbackOverride && typeof callbackOverride !== 'object') {
      return createErrorResponse('PAYMENT_INVALID_CALLBACK_OVERRIDE', 'Callback override must be an object', 400);
    }

    const resolveCallbackUrl = (
      target: 'success' | 'fail' | 'cancel',
      fallback: 'success' | 'fail' | 'cancel',
      verifyToken: string,
      verifySignature: string,
    ) => {
      const baseUrl = APP_CONFIG.BASE_URL;
      if (!baseUrl) {
        return null;
      }

      const fallbackUrl = `${baseUrl}/payment/${fallback}`;
      const raw = callbackOverride?.[target];

      const buildUrl = (input: string) => {
        const url = new URL(input, baseUrl);
        url.searchParams.set('verifyToken', verifyToken);
        url.searchParams.set('verifySignature', verifySignature);
        return url.toString();
      };

      if (!raw || typeof raw !== 'string') {
        return buildUrl(fallbackUrl);
      }

      try {
        const candidate = new URL(raw, baseUrl);
        const allowedHosts = new Set<string>([new URL(baseUrl).host]);
        if (process.env.PAYMENT_CALLBACK_ALLOWLIST) {
          process.env.PAYMENT_CALLBACK_ALLOWLIST
            .split(',')
            .map((value) => value.trim())
            .forEach((host) => {
              if (host) {
                allowedHosts.add(host);
              }
            });
        }

        if (!allowedHosts.has(candidate.host)) {
          return null;
        }

        return buildUrl(candidate.toString());
      } catch {
        return null;
      }
    };

    const tierToPackage: Record<string, string> = {
      'taste': 'TRIAL',
      'smart': 'SMART',
      'pro': 'PRO',
      'donation': 'DONATION',
    };

    const package_type = tierToPackage[tierId];
    if (!package_type) {
      return createErrorResponse('PAYMENT_INVALID_TIER', 'Invalid tier ID', 400, { tierId });
    }

    const packages = {
      TRIAL: { jellies: 1, bonus: 0, amount: 990, name: 'TRIAL - 1 Jelly' },
      SMART: { jellies: 3, bonus: 1, amount: 2900, name: 'SMART - 4 Jellies' },
      PRO: { jellies: 10, bonus: 3, amount: 9900, name: 'PRO - 13 Jellies' },
      DONATION: { jellies: 50, bonus: 10, amount: 49000, name: 'DONATION - 60 Jellies' },
    };

    const selectedPackage = packages[package_type as keyof typeof packages];
    if (!selectedPackage) {
      return createErrorResponse('PAYMENT_INVALID_PACKAGE', 'Invalid package type', 400, { package_type });
    }

    const authResult = await getAuthenticatedUser(req);
    if (!authResult.user) {
      return authResult.error || createErrorResponse('PAYMENT_AUTH_REQUIRED', 'Unauthorized', 401);
    }

    const orderId = `order_${Date.now()}_${randomUUID().replace(/-/g, '')}`;
    const verifyToken = randomUUID().replace(/-/g, '');
    const verifySignature = buildPaymentVerifySignature(
      orderId,
      selectedPackage.amount,
      verifyToken,
    );

    if (!verifySignature) {
      await insertNotionRow({
        category: 'ERROR',
        title: 'Payment initialize failed: missing verification secret',
        description: 'PAYMENT_VERIFY_SECRET is required for payment verification',
        metadata: { userId: authResult.user.id, tierId },
      });
      return createErrorResponse('PAYMENT_CONFIG_MISSING', 'Payment verification config is missing', 500, {
        reason: 'missing_verify_secret',
      });
    }

    const supabase = getSupabaseAdmin();
    const tossClientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

    if (!tossClientKey) {
      console.warn('[Payment Init] Missing Toss client key');
      await insertNotionRow({
        category: 'ERROR',
        title: 'Payment initialize failed: missing Toss key',
        description: 'Client key not configured',
        metadata: { userId: authResult.user.id, tierId },
      });
      return createErrorResponse('PAYMENT_CONFIG_MISSING', 'Payment system not configured', 500, {
        reason: 'missing_toss_client_key',
      });
    }

    const { error: dbError } = await supabase.from('orders').insert({
      order_id: orderId,
      user_id: authResult.user.id,
      package_type,
      amount: selectedPackage.amount,
      jellies: selectedPackage.jellies + selectedPackage.bonus,
      status: 'pending',
      metadata: {
        tierId,
        verifyToken,
        verifySignature,
      },
    });

    if (dbError) {
      if ((dbError as { code?: string }).code === '23505') {
        return createErrorResponse('PAYMENT_ORDER_DUPLICATE', 'Duplicate order detected', 409, { orderId });
      }
      const notionResult = await insertNotionRow({
        category: 'PAYMENT_EVENT',
        title: 'Payment initialization failed',
        description: `Could not create order ${orderId}`,
        metadata: { userId: authResult.user.id, tierId, error: dbError },
      });
      if (!notionResult.success) {
        console.warn('[Payment Init] Notion log failed:', notionResult.error);
      }

      console.error('[Payment Init] DB error:', dbError);
      return createErrorResponse('PAYMENT_ORDER_CREATE_FAILED', 'Failed to create order', 500, {
        orderId,
        error: dbError,
      });
    }

    const notionResult = await insertNotionRow({
      category: 'PAYMENT_EVENT',
      title: `Payment initialized: ${package_type}`,
      description: `Order ${orderId} created for user`,
      metadata: { orderId, userId: authResult.user.id, amount: selectedPackage.amount },
    });
    if (!notionResult.success) {
      console.warn('[Payment Init] Notion log failed:', notionResult.error);
    }

    const baseUrl = APP_CONFIG.BASE_URL;
    if (!baseUrl) {
      const missingBaseUrlResult = await insertNotionRow({
        category: 'ERROR',
        title: 'Payment initialize failed: BASE URL missing',
        description: 'APP_CONFIG.BASE_URL is required for Toss callbacks',
        metadata: { userId: authResult.user.id, orderId },
      });
      if (!missingBaseUrlResult.success) {
        console.warn('[Payment Init] Notion log failed:', missingBaseUrlResult.error);
      }
      return createErrorResponse('PAYMENT_CALLBACK_URL_MISSING', 'Payment callback URL is not configured', 500, {
        orderId,
      });
    }

    const successUrl = resolveCallbackUrl('success', 'success', verifyToken, verifySignature);
    const failUrl = resolveCallbackUrl('fail', 'fail', verifyToken, verifySignature);
    const cancelUrl = resolveCallbackUrl('cancel', 'fail', verifyToken, verifySignature);

    if (!successUrl || !failUrl || !cancelUrl) {
      const invalidCallbackOverride = {
        success: callbackOverride?.success,
        fail: callbackOverride?.fail,
        cancel: callbackOverride?.cancel,
      };
      const invalidResult = await insertNotionRow({
        category: 'ERROR',
        title: 'Payment initialize failed: invalid callback host',
        description: 'Callback override URL host is not allowed',
        metadata: { userId: authResult.user.id, orderId, invalidCallbackOverride },
      });
      if (!invalidResult.success) {
        console.warn('[Payment Init] Notion log failed:', invalidResult.error);
      }
      return createErrorResponse('PAYMENT_CALLBACK_URL_INVALID', 'Payment callback URL is not allowed', 400, {
        orderId,
        invalidCallbackOverride,
      });
    }

    return NextResponse.json({
      clientKey: tossClientKey,
      orderId,
      amount: selectedPackage.amount,
      orderName: selectedPackage.name,
      jellies: selectedPackage.jellies + selectedPackage.bonus,
      packageType: package_type,
      tierId,
      successUrl,
      failUrl,
      cancelUrl,
      customerName: customerName || '고객',
      verifyToken,
      verifySignature,
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    const notionResult = await insertNotionRow({
      category: 'ERROR',
      title: 'Payment initialization exception',
      description: 'Unhandled error during payment initialization',
      metadata: { error: String(error) },
    });
    if (!notionResult.success) {
      console.warn('[Payment Init] Notion log failed:', notionResult.error);
    }

    return createErrorResponse('PAYMENT_INTERNAL_ERROR', 'Internal server error', 500, { error: String(error) });
  }
}