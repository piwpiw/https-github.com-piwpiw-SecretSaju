import { NextResponse } from 'next/server';
import { sendSajuResultEmail } from '@/lib/integrations/mail';
import { getAuthenticatedUser } from '@/lib/auth/api-auth';
import crypto from 'crypto';
import { APP_CONFIG } from '@/config';
import { isMockMode } from '@/lib/app/use-mock';

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

        const { targetName, targetBirthDate, targetEmail } = await req.json();

        if (!targetName || !targetBirthDate || !targetEmail) {
            return NextResponse.json({ error: '필수 입력값이 누락되었습니다.' }, { status: 400 });
        }

        const senderName = isMockMode() ? '테스트유저' : ((user as any)?.name || '익명의 친구');

        // 1. Generate an exchange token for the gift result
        const resultToken = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + GIFT_TOKEN_TTL_SECONDS * 1000).toISOString();

        // In production:
        // - Persist token + recipient metadata to a gift table and invalidate after use.

        // 2. Send the email using Resend
        const domain = APP_CONFIG.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || '';
        if (!domain) {
            return NextResponse.json({ error: '서버 설정 오류로 발송할 수 없습니다. 잠시 후 다시 시도해 주세요.' }, { status: 500 });
        }
        // TODO: 토큰 영속화(gift 테이블 저장) 후 결과 링크(`/result/{token}`) 복원.
        // resultToken이 아직 DB에 저장되지 않아 `/result/{token}` 링크는 수신자에게
        // 빈 페이지로 이어진다. 죽은 링크 대신 서비스 홈으로 안내한다.
        const giftLink = new URL('/', domain).toString();
        const emailResult = await sendSajuResultEmail(targetEmail, senderName, giftLink);

        if (!emailResult.success) {
            return NextResponse.json({ error: '이메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.' }, { status: 500 });
        }

        // 3. Deduct Jelly (Future Integration)
        // await deductJelly(user.id, 300);

        return NextResponse.json({ success: true, linkId: resultToken, expires_at: expiresAt, expires_in_seconds: GIFT_TOKEN_TTL_SECONDS });

    } catch (error: any) {
        console.error('[API/Gift] Error sending gift:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' }, { status: 500 });
    }
}
