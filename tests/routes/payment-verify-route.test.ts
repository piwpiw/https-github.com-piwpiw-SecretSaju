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
// ops_counters 지표 RPC (increment_ops_counter). 기본값은 "첫 시도"(count=1).
const rpcMock = vi.fn(async () => ({ data: 1, error: null }));

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
    rpc: rpcMock,
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
    // 카운터가 mock 모드에서 no-op 이 되지 않도록 보장 (DB 카운터 경로 검증용)
    delete process.env.NEXT_PUBLIC_USE_MOCK_DATA;
    selectSingleMock.mockResolvedValue({ data: baseOrder, error: null });
    rpcMock.mockReset();
    rpcMock.mockResolvedValue({ data: 1, error: null });
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

  it('returns 429 when the DB attempt counter exceeds the idempotency limit', async () => {
    // DB 카운터(ops_counters)가 한도(30) 초과를 보고하는 경우
    rpcMock.mockResolvedValue({ data: 31, error: null });

    const { POST } = await import('@/app/api/payment/verify/route');

    const response = await POST(
      new NextRequest('http://localhost/api/payment/verify', {
        method: 'POST',
        body: JSON.stringify({
          paymentKey: 'client-payment-key',
          orderId: baseOrder.order_id,
          amount: baseOrder.amount,
          verifyToken: 'token',
          verifySignature: 'sig',
        }),
      }),
    );

    const payload = await response.json();

    expect(response.status).toBe(429);
    expect(payload.error_code).toBe('PAYMENT_IDEMPOTENCY_LIMIT_EXCEEDED');
    expect(payload.details).toEqual({ idempotent_attempt_count: 31 });
    expect(rpcMock).toHaveBeenCalledWith('increment_ops_counter', {
      p_name: `payment_verify_attempts:${baseOrder.order_id}`,
      p_delta: 1,
    });
  });

  it('does not block verification when the ops counter RPC fails (best-effort)', async () => {
    // 카운터 DB 장애 시에도 결제 검증 흐름은 그대로 진행되어야 한다.
    rpcMock.mockRejectedValue(new Error('counter table unavailable'));

    const verifyToken = 'verifytoken123456';
    const verifySignature = buildPaymentVerifySignature(baseOrder.order_id, baseOrder.amount, verifyToken);
    selectSingleMock.mockResolvedValue({
      data: {
        ...baseOrder,
        metadata: { verifyToken, verifySignature },
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

    // 카운터 실패와 무관하게 기존 검증 로직(결제 키 불일치 → 400)에 도달한다.
    expect(response.status).toBe(400);
    expect(payload.error_code).toBe('PAYMENT_TOSS_PAYMENT_KEY_MISMATCH');
  });
});
