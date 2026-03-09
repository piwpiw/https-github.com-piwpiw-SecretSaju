import { createHmac } from 'node:crypto';

export function buildPaymentVerifySignature(orderId: string, amount: number, token: string): string {
  const secret =
    process.env.PAYMENT_VERIFY_SECRET ||
    process.env.NEXT_PUBLIC_PAYMENT_VERIFY_SECRET ||
    '';

  if (!secret) {
    return '';
  }

  return createHmac('sha256', secret)
    .update(`${orderId}:${amount}:${token}`)
    .digest('hex');
}