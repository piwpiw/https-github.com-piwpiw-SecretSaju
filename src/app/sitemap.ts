import { MetadataRoute } from 'next';
import { resolveServerBaseUrl } from '@/config/env';

/**
 * 공개(마케팅 가치가 있는) 라우트만 담는다.
 *
 * 제외 기준: 인증·결제 결과·개인 데이터·토큰 링크성 라우트는 색인 대상이
 * 아니다 — login, auth/*, payment/*, billing, mypage, dashboard, history,
 * analysis-history, my-saju/*, account/delete, admin, result/[token], gift.
 * robots.ts 의 disallow 목록과 함께 관리한다.
 */

/** [경로, changeFrequency, priority] */
const PUBLIC_ROUTES: Array<[string, 'daily' | 'weekly' | 'monthly', number]> = [
    ['/', 'daily', 1],
    ['/saju', 'weekly', 0.9],
    ['/tarot', 'weekly', 0.9],
    ['/fortune', 'daily', 0.8],
    ['/daily', 'daily', 0.8],
    ['/compatibility', 'weekly', 0.8],
    ['/tojeong', 'weekly', 0.8],
    ['/dreams', 'weekly', 0.7],
    ['/astrology', 'weekly', 0.7],
    ['/palmistry', 'weekly', 0.7],
    ['/naming', 'weekly', 0.7],
    ['/luck', 'weekly', 0.7],
    ['/shinsal', 'weekly', 0.7],
    ['/destiny', 'weekly', 0.7],
    ['/calendar', 'daily', 0.7],
    ['/healing', 'weekly', 0.6],
    ['/psychology', 'weekly', 0.6],
    ['/relationship', 'weekly', 0.6],
    ['/fortune-readers', 'weekly', 0.6],
    ['/encyclopedia', 'monthly', 0.6],
    ['/wiki', 'monthly', 0.6],
    ['/blog', 'weekly', 0.6],
    ['/story', 'monthly', 0.5],
    ['/about', 'monthly', 0.5],
    ['/shop', 'weekly', 0.5],
    ['/faq', 'monthly', 0.5],
    ['/support', 'monthly', 0.5],
    ['/terms', 'monthly', 0.3],
    ['/privacy', 'monthly', 0.3],
    ['/refund', 'monthly', 0.3],
    ['/legal', 'monthly', 0.3],
];

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = resolveServerBaseUrl();
    // sitemap 은 절대 URL 만 허용한다. 기준 도메인을 못 구하면 잘못된 도메인의
    // 목록을 내보내는 대신 빈 sitemap 을 낸다 (Vercel 에서는 시스템 환경변수로
    // 항상 해결되므로 실질적으로 로컬 전용 경로다).
    if (!baseUrl) return [];

    const lastModified = new Date();

    return PUBLIC_ROUTES.map(([path, changeFrequency, priority]) => ({
        url: `${baseUrl}${path === '/' ? '' : path}/`.replace(/\/$/, path === '/' ? '/' : ''),
        lastModified,
        changeFrequency,
        priority,
    }));
}
