import { Resend } from 'resend';
import { isMockMode } from '@/lib/use-mock';

// Initialize Resend Client
const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');
const HAS_REAL_RESEND_KEY = Boolean(process.env.RESEND_API_KEY);
export const MAIL_RETRY_TTL_SECONDS = Number(process.env.MAIL_RETRY_TTL_SECONDS ?? 600);
const MAIL_SCHEMA_COMPARE = process.env.MAIL_SCHEMA_COMPARE === 'true';

const FROM_EMAIL = process.env.NEXT_PUBLIC_FROM_EMAIL || 'noreply@secret-saju.com';
type MailServiceError = { code: string; message: string };
type MailResult =
  | { success: true; data?: unknown; mocked?: boolean }
  | { success: false; error: string | MailServiceError; mocked?: false };

function normalizeMailError(error: unknown): string | MailServiceError {
  if (typeof error === 'string') return error;
  if (error instanceof Error) {
    return { code: 'MAIL_ERROR', message: error.message };
  }
  if (typeof error === 'object' && error !== null) {
    const record = error as Record<string, unknown>;
    if (typeof record.code === 'string' || typeof record.message === 'string') {
      return {
        code: typeof record.code === 'string' ? record.code : 'MAIL_ERROR',
        message: typeof record.message === 'string' ? record.message : 'Unknown mail error',
      };
    }
  }
  return { code: 'MAIL_ERROR', message: 'Unknown mail error' };
}

function toMockResult<TData = unknown>(mockedData: TData): MailResult {
  return { success: true, data: mockedData, mocked: true };
}

function normalizeResendError(error: unknown): { code: string; message: string } {
    if (error instanceof Error) {
        return { code: 'RESEND_UNKNOWN_ERROR', message: error.message };
    }

    if (typeof error === 'object' && error !== null) {
        const record = error as Record<string, unknown>;
        const message = typeof record.message === 'string' ? record.message : String(error);
        const code = typeof record.name === 'string' ? record.name : 'RESEND_UNKNOWN_ERROR';
        return { code, message };
    }

    return { code: 'RESEND_UNKNOWN_ERROR', message: String(error) };
}

function logMailSchemaSample(mode: 'mock' | 'live', data?: unknown) {
    if (!MAIL_SCHEMA_COMPARE || !data || typeof data !== 'object') return;
    const keys = Object.keys(data as Record<string, unknown>).sort();
    if (process.env.NODE_ENV === 'development') {
        console.debug(`[Mail Schema:${mode}]`, keys.join(','));
    }
}

/**
 * Sends a welcome email upon successful sign-up.
 */
export async function sendWelcomeEmail(to: string, name: string) {
    if (!isMockMode() && !HAS_REAL_RESEND_KEY) {
        return { success: false, error: 'RESEND_API_KEY is missing' };
    }

    if (isMockMode()) {
        console.log(`[MOCK MAIL] Welcome Email sent to ${to} (${name})`);
        return { success: true, mocked: true };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: `사주라떼 <${FROM_EMAIL}>`,
            to: [to],
            subject: '🎉 사주라떼에 오신 것을 환영합니다!',
            html: `
                <div style="font-family: sans-serif; background-color: #f9f9f9; padding: 20px; border-radius: 12px; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #a855f7;">환영합니다, ${name}님!</h1>
                    <p style="color: #333; font-size: 16px;">
                        사주라떼(멍냥의 이중생활)에 가입해주셔서 감사합니다.<br/>
                        당신을 지배하는 기운과 숨겨진 본능을 지금 확인해보세요.
                    </p>
                    <div style="margin-top: 30px; padding: 15px; background-color: #fff; border-radius: 8px; border-left: 4px solid #a855f7;">
                        <p style="margin: 0; color: #555;">🚀 <strong>시작하기 팁:</strong> 마이페이지에서 프로필을 완성하고 첫 사주 분석을 받아보세요!</p>
                    </div>
                </div>
            `,
        });

        if (error) {
            console.error('Failed to send welcome email:', error);
        const normalized = normalizeResendError(error);
        return { success: false, error: normalized };
      }

        logMailSchemaSample('live', data);
        return { success: true, data } as MailResult;
    } catch (error) {
        console.error('Unhandled email error:', error);
        return { success: false, error };
    }
}

/**
 * Sends the Saju Analysis Result (Anonymous Gift feature)
 */
export async function sendSajuResultEmail(to: string, senderName: string, resultLink: string) {
    if (!isMockMode() && !HAS_REAL_RESEND_KEY) {
        return { success: false, error: 'RESEND_API_KEY is missing' };
    }

    if (isMockMode()) {
        console.log(`[MOCK MAIL] Result Email sent to ${to} from ${senderName}. Link: ${resultLink}`);
        return { success: true, mocked: true };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: `사주라떼 선물함 <${FROM_EMAIL}>`,
            to: [to],
            subject: `🎁 ${senderName}님이 익명 사주 분석 결과를 보냈어요!`,
            html: `
                <div style="font-family: sans-serif; background-color: #0f172a; color: #fff; padding: 30px; border-radius: 16px; max-width: 600px; margin: 0 auto; text-align: center;">
                    <div style="font-size: 40px; margin-bottom: 10px;">🔮</div>
                    <h2 style="color: #e879f9; margin-bottom: 20px;">당신의 운명이 도착했습니다</h2>
                    <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                        누군가 당신의 생년월일을 분석하여 특별한 사주 카드를 만들었습니다.<br/>
                        아래 버튼을 눌러 당신의 진짜 모습을 확인하세요.
                    </p>
                    <a href="${resultLink}" style="display: inline-block; padding: 14px 28px; background-color: #d946ef; color: #fff; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px;">결과 카드 열어보기</a>
                </div>
            `,
        });

        if (error) {
            console.error('Failed to send result email:', error);
            const normalized = normalizeResendError(error);
            return { success: false, error: normalized };
        }

        logMailSchemaSample('live', data);
        return { success: true, data } as MailResult;
    } catch (error) {
        console.error('Unhandled email error:', error);
        return { success: false, error: normalizeMailError(error) };
    }
}

/**
 * Sends a payment completion receipt email.
 */
export async function sendPaymentReceiptEmail(
  to: string,
  orderId: string,
  amount: number,
  jellies: number
) {
  if (!isMockMode() && !HAS_REAL_RESEND_KEY) {
    return { success: false, error: 'RESEND_API_KEY is missing' };
  }

    if (isMockMode()) {
        console.log(`[MOCK MAIL] Payment receipt email sent to ${to} (${orderId})`);
        const result = toMockResult({ email: to, orderId });
        logMailSchemaSample('mock', result.success ? result.data : undefined);
        return result;
    }

  try {
    const { data, error } = await resend.emails.send({
      from: `Secret Saju <${FROM_EMAIL}>`,
      to: [to],
      subject: `Payment confirmed - Order ${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #111827; color: #fff; padding: 24px; border-radius: 12px; max-width: 560px; margin: 0 auto;">
          <h2 style="color: #a855f7; margin-bottom: 12px;">Payment Completed</h2>
          <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6;">
            Your payment has been verified successfully.
          </p>
          <table style="width: 100%; margin-top: 16px; color: #e2e8f0;">
            <tr><td style="padding: 6px 0;">Order ID</td><td>${orderId}</td></tr>
            <tr><td style="padding: 6px 0;">Paid Amount</td><td>${amount.toLocaleString()} KRW</td></tr>
            <tr><td style="padding: 6px 0;">Jellies Added</td><td>${jellies}</td></tr>
          </table>
          <p style="margin-top: 20px; color: #94a3b8; font-size: 13px;">Thank you for using SecretSaju.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send payment receipt email:', error);
      const normalized = normalizeResendError(error);
      return { success: false, error: normalized };
    }

    logMailSchemaSample('live', data);
    return { success: true, data } as MailResult;
  } catch (error) {
    console.error('Unhandled payment receipt email error:', error);
    return { success: false, error: normalizeMailError(error) };
  }
}
