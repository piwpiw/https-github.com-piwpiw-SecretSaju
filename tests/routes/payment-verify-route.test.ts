import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { buildPaymentVerifySignature } from '@/lib/payment/payment-verify';

const baseOrder = {
  order_id: 'order_user123_abcd1234',
  user_id: 'user-1',
  amount: 990,
  status: 'pending',
  jellies: 5,
  payment_key: null,
  metadata: {} as Record<string, unknown>,
};

const selectSingleMock = vi.fn();

vi.mock('@/lib/integrations/supabase', () => ({
  getSupabaseAdmin: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table !== 'orders') {
        throw new Error(`Unexpected table: ${table}`);
      }

      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: selectSingleMock,
          })),
        })),
      };
    }),
  })),
}));

vi.mock('@/lib/integrations/notion', () => ({
  insertNotionRow: vi.fn(async () => undefined),
}));

vi.mock('@/lib/integrations/mail', () => ({
  sendPaymentReceiptEmail: vi.fn(async () => ({ success: true })),
}));

describe('/api/payment/verify', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      PAYMENT_VERIFY_SECRET: 'verify-secret',
      TOSS_SECRET_KEY: 'toss-secret',
    };
    selectSingleMock.mockResolvedValue({ data: baseOrder, error: null });
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('fails when Toss returns a different payment key than the client payload', async () => {
    const verifyToken = 'verifytoken123456';
    const verifySignature = buildPaymentVerifySignature(baseOrder.order_id, baseOrder.amount, verifyToken);
    selectSingleMock.mockResolvedValue({
      data: {
        ...baseOrder,
        metadata: {
          verifyToken,
          verifySignature,
        },
      },
      error: null,
    });

    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          status: 'DONE',
          orderId: baseOrder.order_id,
          paymentKey: 'toss-payment-key',
          totalAmount: baseOrder.amount,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const { POST } = await import('@/app/api/payment/verify/route');

    const response = await POST(
      new NextRequest('http://localhost/api/payment/verify', {
        method: 'POST',
        body: JSON.stringify({
          paymentKey: 'client-payment-key',
          orderId: baseOrder.order_id,
          amount: baseOrder.amount,
          verifyToken,
          verifySignature,
        }),
      }),
    );

    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error_code).toBe('PAYMENT_TOSS_PAYMENT_KEY_MISMATCH');
    expect(payload.details).toEqual({
      paymentKey: 'client-payment-key',
      tossPaymentKey: 'toss-payment-key',
    });
  });
});
