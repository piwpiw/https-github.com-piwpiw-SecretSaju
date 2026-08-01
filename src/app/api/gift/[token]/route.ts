/**
 * src/app/api/gift/[token]/route.ts
 * GET /api/gift/{token} — 수신자용 선물 결과 조회 (service-role)
 *
 * - 200: 결과 반환 (첫 조회 시 opened_at 기록)
 * - 404: 존재하지 않는 토큰
 * - 410: 만료된 토큰
 */

import { NextResponse } from 'next/server';
import { getGiftResult } from '../gift-store';

export const dynamic = 'force-dynamic';

export async function GET(
    _req: Request,
    { params }: { params: { token: string } }
) {
    try {
        const token = decodeURIComponent(params?.token ?? '');
        const result = await getGiftResult(token);

        if (result.status === 'not_found') {
            return NextResponse.json({ error: '선물 결과를 찾을 수 없습니다.' }, { status: 404 });
        }

        if (result.status === 'expired') {
            return NextResponse.json(
                {
                    error: '선물 결과 링크가 만료되었습니다.',
                    senderName: result.gift?.senderName ?? null,
                    expiresAt: result.gift?.expiresAt ?? null,
                },
                { status: 410 }
            );
        }

        if (result.status === 'error') {
            return NextResponse.json(
                { error: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' },
                { status: 500 }
            );
        }

        const { gift } = result;
        return NextResponse.json({
            success: true,
            mocked: result.mocked === true,
            gift: {
                token: gift.token,
                senderName: gift.senderName,
                message: gift.message,
                payload: gift.payload,
                createdAt: gift.createdAt,
                expiresAt: gift.expiresAt,
                openedAt: gift.openedAt,
            },
        });
    } catch (error) {
        console.error('[API/Gift/Token] Lookup failed:', error);
        return NextResponse.json(
            { error: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' },
            { status: 500 }
        );
    }
}
