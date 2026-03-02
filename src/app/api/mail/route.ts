import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail, sendSajuResultEmail } from '@/lib/mail';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { insertNotionRow } from '@/lib/notion';

/**
 * T3 — BE-003
 * POST /api/mail
 * 자동 메일 발송 시스템 API Route Handler (Resend 기반)
 * 
 * Body: {
 *   type: 'welcome' | 'saju-result'
 *   to: string         (수신자 이메일)
 *   name?: string      (welcome용 이름)
 *   senderName?: string (saju-result용 발신자명)
 *   resultLink?: string (saju-result용 결과 링크)
 * }
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { type, to, name, senderName, resultLink } = body;

        // ── 기본 유효성 검사 ──
        if (!type || !to) {
            return NextResponse.json(
                { error: 'Missing required fields: type, to' },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(to)) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            );
        }

        // ── 타입별 발송 ──
        switch (type) {
            case 'welcome': {
                if (!name) {
                    return NextResponse.json({ error: 'Missing name for welcome email' }, { status: 400 });
                }
                const result = await sendWelcomeEmail(to, name);
                if (!result.success) {
                    return NextResponse.json({ error: 'Failed to send welcome email', detail: result.error }, { status: 500 });
                }

                // Notion 로깅 (비블로킹)
                const notionResult = await insertNotionRow({
                    category: 'USER_FEEDBACK',
                    title: `[Mail] Welcome email sent`,
                    description: `Welcome email dispatched to ${to} (${name})`,
                });
                if (!notionResult.success) {
                    console.warn('[Mail API] Notion log failed:', notionResult.error);
                }

                return NextResponse.json({ success: true, type: 'welcome', to });
            }

            case 'saju-result': {
                if (!senderName || !resultLink) {
                    return NextResponse.json(
                        { error: 'Missing senderName or resultLink for saju-result email' },
                        { status: 400 }
                    );
                }

                // 인증 확인 (익명 사주 선물 보내는 사람은 로그인 필요)
                const authResult = await getAuthenticatedUser(req);
                if (!authResult.user) {
                    return NextResponse.json({ error: 'Unauthorized: login required to send saju result' }, { status: 401 });
                }

                const result = await sendSajuResultEmail(to, senderName, resultLink);
                if (!result.success) {
                    return NextResponse.json({ error: 'Failed to send saju result email', detail: result.error }, { status: 500 });
                }

                const notionResult = await insertNotionRow({
                    category: 'USER_FEEDBACK',
                    title: `[Mail] Saju result email sent`,
                    description: `Saju result gift email sent to ${to} by user ${authResult.user.id}`,
                    metadata: { senderId: authResult.user.id, resultLink },
                });
                if (!notionResult.success) {
                    console.warn('[Mail API] Notion log failed:', notionResult.error);
                }

                return NextResponse.json({ success: true, type: 'saju-result', to });
            }

            default:
                return NextResponse.json(
                    { error: `Unknown mail type: ${type}. Valid types: welcome, saju-result` },
                    { status: 400 }
                );
        }
    } catch (err: any) {
        console.error('[Mail API] Error:', err);
        return NextResponse.json(
            { error: err.message || 'Unexpected error' },
            { status: 500 }
        );
    }
}
