/**
 * src/app/api/gift/gift-store.ts
 * 선물 결과(gift_results) 영속화 공용 로직.
 *
 * - `/api/gift/send` 가 토큰+페이로드를 저장할 때 사용
 * - `/api/gift/[token]` 라우트와 `/result/[token]` 서버 페이지가
 *   동일한 조회 로직을 공유 (fetch 왕복 없이 직접 호출)
 *
 * Supabase 미설정 / mock 환경에서도 500 없이 우아하게 동작해야 한다:
 * - mock 모드: 저장은 mock 클라이언트가 받아주고, 조회는 샘플 결과를 반환
 * - 미설정(비 mock): 저장 불가로 판정(persisted=false → 홈 링크 폴백), 조회는 not_found
 */

import { DATABASE_CONFIG } from '@/config';
import { getSupabaseAdmin } from '@/lib/integrations/supabase';
import { isMockMode } from '@/lib/app/use-mock';
import {
    getDayPillarIndex,
    getPillarNameKo,
    getPillarCode,
    getPrimaryElement,
} from '@/lib/saju';
import { getArchetypeByCode, type AgeGroup } from '@/lib/saju/archetypes';

export type GiftResultPayload = {
    targetName: string;
    targetBirthDate: string;
    pillarNameKo: string;
    pillarCode: string;
    element: string;
    animalName: string;
    mask: string;
    hook: string;
    hashtags: string[];
};

export type GiftResultRecord = {
    token: string;
    senderName: string;
    recipientEmail: string | null;
    message: string | null;
    payload: GiftResultPayload | null;
    createdAt: string | null;
    expiresAt: string | null;
    openedAt: string | null;
};

export type GiftLookupResult =
    | { status: 'ok'; gift: GiftResultRecord; mocked?: boolean }
    | { status: 'expired'; gift: Pick<GiftResultRecord, 'senderName' | 'expiresAt'> | null }
    | { status: 'not_found' }
    | { status: 'error' };

function resolveAgeGroup(birthDate: Date): AgeGroup {
    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age < 20) return '10s';
    if (age < 30) return '20s';
    return '30s';
}

/**
 * 받는 사람의 생년월일로 가벼운(동기) 사주 요약을 만든다.
 * 고정밀 엔진 대신 일주(60갑자) 기반 아키타입 요약을 사용 —
 * 이메일 발송 경로에서 타임아웃 없이 즉시 계산된다.
 */
export function buildGiftPayload(targetName: string, targetBirthDate: string): GiftResultPayload {
    const parsed = new Date(`${targetBirthDate}T12:00:00`);
    const birthDate = Number.isNaN(parsed.getTime()) ? new Date(1990, 0, 1, 12, 0) : parsed;

    const pillarIndex = getDayPillarIndex(birthDate);
    const pillarCode = getPillarCode(pillarIndex);
    const archetype = getArchetypeByCode(pillarCode, resolveAgeGroup(birthDate));

    return {
        targetName,
        targetBirthDate,
        pillarNameKo: getPillarNameKo(pillarIndex),
        pillarCode,
        element: getPrimaryElement(pillarIndex),
        animalName: archetype.animal_name,
        mask: archetype.base_traits?.mask ?? '',
        hook: archetype.displayHook,
        hashtags: Array.isArray(archetype.base_traits?.hashtags) ? archetype.base_traits.hashtags : [],
    };
}

/** 실제 DB에 저장 가능한 환경인지 (mock 모드는 mock 클라이언트가 받아준다) */
function canPersistGiftResults(): boolean {
    if (isMockMode()) return true;
    return DATABASE_CONFIG.isConfigured && Boolean(DATABASE_CONFIG.SERVICE_ROLE_KEY);
}

export async function createGiftResult(input: {
    token: string;
    senderName: string;
    recipientEmail: string;
    message?: string | null;
    payload: GiftResultPayload;
    expiresAt: string;
}): Promise<{ saved: boolean }> {
    if (!canPersistGiftResults()) {
        console.warn('[GiftStore] Supabase is not configured — gift result will not be persisted.');
        return { saved: false };
    }

    try {
        const supabase = getSupabaseAdmin();
        const { error } = await supabase.from('gift_results').insert({
            token: input.token,
            sender_name: input.senderName,
            recipient_email: input.recipientEmail,
            message: input.message ?? null,
            payload: input.payload,
            expires_at: input.expiresAt,
        });

        if (error) {
            console.error('[GiftStore] Failed to persist gift result:', error);
            return { saved: false };
        }

        return { saved: true };
    } catch (error) {
        console.error('[GiftStore] Unhandled error persisting gift result:', error);
        return { saved: false };
    }
}

function buildMockGiftRecord(token: string): GiftResultRecord {
    const payload = buildGiftPayload('테스트 친구', '1995-03-15');
    return {
        token,
        senderName: '테스트유저',
        recipientEmail: 'friend@example.com',
        message: null,
        payload,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        openedAt: null,
    };
}

/**
 * 토큰으로 선물 결과 조회. 만료 검사 + 첫 조회 시 opened_at 기록.
 */
export async function getGiftResult(token: string): Promise<GiftLookupResult> {
    const trimmed = typeof token === 'string' ? token.trim() : '';
    if (!trimmed) {
        return { status: 'not_found' };
    }

    // Mock 모드: 요청 간 상태가 유지되지 않으므로 샘플 결과로 UI 흐름을 재현한다.
    if (isMockMode()) {
        return { status: 'ok', gift: buildMockGiftRecord(trimmed), mocked: true };
    }

    if (!DATABASE_CONFIG.isConfigured || !DATABASE_CONFIG.SERVICE_ROLE_KEY) {
        return { status: 'not_found' };
    }

    try {
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
            .from('gift_results')
            .select('*')
            .eq('token', trimmed)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return { status: 'not_found' };
            }
            console.error('[GiftStore] Failed to look up gift result:', error);
            return { status: 'error' };
        }

        if (!data) {
            return { status: 'not_found' };
        }

        if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
            return {
                status: 'expired',
                gift: { senderName: data.sender_name ?? '익명의 친구', expiresAt: data.expires_at },
            };
        }

        if (!data.opened_at) {
            const openedAt = new Date().toISOString();
            const { error: openError } = await supabase
                .from('gift_results')
                .update({ opened_at: openedAt })
                .eq('id', data.id);
            if (openError) {
                // 열람 기록 실패는 치명적이지 않다 — 결과는 정상 노출한다.
                console.warn('[GiftStore] Failed to record opened_at:', openError);
            } else {
                data.opened_at = openedAt;
            }
        }

        return {
            status: 'ok',
            gift: {
                token: data.token,
                senderName: data.sender_name ?? '익명의 친구',
                recipientEmail: data.recipient_email ?? null,
                message: data.message ?? null,
                payload: (data.payload as GiftResultPayload | null) ?? null,
                createdAt: data.created_at ?? null,
                expiresAt: data.expires_at ?? null,
                openedAt: data.opened_at ?? null,
            },
        };
    } catch (error) {
        console.error('[GiftStore] Unhandled error looking up gift result:', error);
        return { status: 'error' };
    }
}
