import { NextResponse } from 'next/server';
import { sendSajuResultEmail } from '@/lib/mail';
import { getAuthenticatedUser } from '@/lib/api-auth';
import crypto from 'crypto';

/**
 * [gem-backend] 익명 발송 API. 인증된 유저만 젤리를 소모(추후 연결)하여 발송 가능.
 */
export async function POST(req: Request) {
    try {
        const { user, error } = await getAuthenticatedUser(req as any);
        if (!user && process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'true') {
            return error;
        }

        const { targetName, targetBirthDate, targetEmail } = await req.json();

        if (!targetName || !targetBirthDate || !targetEmail) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const senderName = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ? '테스트유저' : ((user as any)?.name || '익명의 친구');

        // 1. Generate a mock UUID for the result link (In production, saju_profiles in DB)
        const resultToken = crypto.randomUUID();

        // In actual production:
        // await db.insert('saju_profiles').values({ id: resultToken, ... })

        // 2. Send the email using Resend
        const resultLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/result/${resultToken}`;
        const emailResult = await sendSajuResultEmail(targetEmail, senderName, resultLink);

        if (!emailResult.success) {
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
        }

        // 3. Deduct Jelly (Future Integration)
        // await deductJelly(user.id, 300);

        return NextResponse.json({ success: true, linkId: resultToken });

    } catch (error: any) {
        console.error('[API/Gift] Error sending gift:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
