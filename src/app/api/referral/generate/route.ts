/**
 * src/app/api/referral/generate/route.ts
 * Referral Code Generation API
 *
 * POST /api/referral/generate
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveServerBaseUrl } from '@/config/env';
import { getAuthenticatedUser } from '@/lib/auth/api-auth';
import { getSupabaseAdmin } from '@/lib/integrations/supabase';
import { generateReferralCode, REFERRAL_REWARDS } from '@/lib/referral/referrals';

/**
 * 공유 링크는 서버 랜딩(/api/referral/invite)을 거친다. 랜딩이 유입 코드를
 * 쿠키로 보관한 뒤 기존 컨벤션인 /?ref=CODE 로 리다이렉트하므로, 로그인 후
 * ReferralCard 의 자동 상환(useReferralAutoRedeem)이 코드를 이어받을 수 있다.
 *
 * 기준 도메인을 못 구하면 null 을 돌려준다 — 예전에는 실재하지 않는
 * 'https://secretsaju.example.com' 을 fallback 으로 써서, 환경변수가 비면
 * 사용자에게 **열리지 않는 추천 링크가 정상인 것처럼** 발급됐다.
 * /api/gift/send 와 동일하게 조용한 실패 대신 500 으로 드러낸다.
 */
function buildReferralUrl(referralCode: string): string | null {
    const baseUrl = resolveServerBaseUrl();
    if (!baseUrl) return null;
    return `${baseUrl}/api/referral/invite?ref=${encodeURIComponent(referralCode)}`;
}

/** 응답 body 는 1회용 스트림이라 모듈 상수로 재사용할 수 없다 — 매번 새로 만든다. */
function baseUrlMissingResponse() {
    return NextResponse.json(
        { error: '서버 설정 오류로 추천 링크를 만들 수 없습니다. 잠시 후 다시 시도해 주세요.' },
        { status: 500 }
    );
}

export async function POST(req: NextRequest) {
    try {
        const supabase = getSupabaseAdmin();
        const authResult = await getAuthenticatedUser(req);
        if (authResult.error) {
            return authResult.error;
        }

        const userId = authResult.user.id;

        // Return existing code when available
        const { data: existing, error: existingError } = await supabase
            .from('referrals')
            .select('referral_code')
            .eq('referrer_user_id', userId)
            .limit(1)
            .single();

        if (existingError && existingError.code !== 'PGRST116') {
            console.error('[referral/generate] Failed to check existing referral:', existingError);
            return NextResponse.json({ error: 'Failed to check existing referral code' }, { status: 500 });
        }

        if (existing?.referral_code) {
            const referralUrl = buildReferralUrl(existing.referral_code);
            if (!referralUrl) return baseUrlMissingResponse();

            return NextResponse.json({
                code: existing.referral_code,
                referral_code: existing.referral_code,
                referralUrl,
                already_exists: true,
            });
        }

        let referralCode = '';
        let insertData = null;

        for (let attempts = 0; attempts < 10; attempts++) {
            const candidate = generateReferralCode();
            const { data: duplicate, error: duplicateError } = await supabase
                .from('referrals')
                .select('id')
                .eq('referral_code', candidate)
                .single();

            if (duplicateError && duplicateError.code !== 'PGRST116') {
                console.error('[referral/generate] Failed to check duplicate code:', duplicateError);
                return NextResponse.json({ error: 'Failed to generate referral code' }, { status: 500 });
            }

            if (duplicate) {
                continue;
            }

            const { data: created, error: createError } = await supabase
                .from('referrals')
                .insert({
                    referrer_user_id: userId,
                    referral_code: candidate,
                    referrer_reward_jellies: REFERRAL_REWARDS.REFERRER,
                    referred_reward_jellies: REFERRAL_REWARDS.REFERRED,
                })
                .select('referral_code')
                .single();

            if (createError) {
                if (createError.code === '23505') {
                    continue;
                }

                console.error('[referral/generate] Failed to create referral:', createError);
                return NextResponse.json({ error: 'Failed to create referral code' }, { status: 500 });
            }

            referralCode = created?.referral_code || candidate;
            insertData = created;
            break;
        }

        if (!referralCode) {
            return NextResponse.json({ error: 'Failed to generate unique referral code' }, { status: 500 });
        }

        const referralUrl = buildReferralUrl(referralCode);
        if (!referralUrl) return baseUrlMissingResponse();

        return NextResponse.json({
            code: referralCode,
            referral_code: referralCode,
            referralUrl,
            reward_jellies: REFERRAL_REWARDS.REFERRED,
            already_exists: false,
            referral: insertData,
        });
    } catch (error) {
        console.error('[referral/generate]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
