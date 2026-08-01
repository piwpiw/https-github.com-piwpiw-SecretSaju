import { NextResponse } from 'next/server';
import { sendSajuResultEmail } from '@/lib/integrations/mail';
import { getAuthenticatedUser } from '@/lib/auth/api-auth';
import crypto from 'crypto';
import { APP_CONFIG } from '@/config';
import { isMockMode } from '@/lib/app/use-mock';
import { buildGiftPayload, createGiftResult } from '../gift-store';

/**
 * [gem-backend] 익명 발송 API. 인증된 유저만 젤리를 소모(추후 연결)하여 발송 가능.
 */
export async function POST(req: Request) {
    try {
        const GIFT_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 3;
        const { user, error } = await getAuthenticatedUser(req as any);
        if (!user && !isMockMode()) {
            return error;
        }

        const { targetName, targetBirthDate, targetEmail, message } = await req.json();

        if (!targetName || !targetBirthDate || !targetEmail) {
            return NextResponse.json({ error: '필수 입력값이 누락되었습니다.' }, { status: 400 });
        }

        const senderName = isMockMode() ? '테스트유저' : ((user as any)?.name || '익명의 친구');

        // 1. Generate an exchange token for the gift result
        const resultToken = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + GIFT_TOKEN_TTL_SECONDS * 1000).toISOString();

        const domain = APP_CONFIG.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || '';
        if (!domain) {
            return NextResponse.json({ error: '서버 설정 오류로 발송할 수 없습니다. 잠시 후 다시 시도해 주세요.' }, { status: 500 });
        }

        // 2. Persist token + recipient summary so the emailed `/result/{token}`
        //    link resolves for the recipient (looked up by /api/gift/[token]).
        const payload = buildGiftPayload(String(targetName), String(targetBirthDate));
        const { saved } = await createGiftResult({
            token: resultToken,
            senderName,
            recipientEmail: String(targetEmail),
            message: typeof message === 'string' && message.trim() ? message.trim() : null,
            payload,
            expiresAt,
        });

        // 저장 실패 시엔 죽은 링크 대신 서비스 홈으로 폴백한다.
        // 메일은 나가되, 응답에 `resultLinkPersisted: false` 로 실패를 드러낸다.
        const giftLink = saved
            ? new URL(`/result/${resultToken}`, domain).toString()
            : new URL('/', domain).toString();

        // 3. Send the email using Resend
        const emailResult = await sendSajuResultEmail(targetEmail, senderName, giftLink);

        if (!emailResult.success) {
            return NextResponse.json({ error: '이메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.' }, { status: 500 });
        }

        // 4. Deduct Jelly (Future Integration)
        // await deductJelly(user.id, 300);

        return NextResponse.json({
            success: true,
            linkId: resultToken,
            resultLinkPersisted: saved,
            ...(saved
                ? {}
                : { warning: '결과 링크 저장에 실패해 메일에는 홈 링크로 안내되었습니다.' }),
            expires_at: expiresAt,
            expires_in_seconds: GIFT_TOKEN_TTL_SECONDS,
        });

    } catch (error: any) {
        console.error('[API/Gift] Error sending gift:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' }, { status: 500 });
    }
}
