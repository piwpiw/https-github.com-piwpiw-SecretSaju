import { APP_CONFIG } from '@/config/env';

/**
 * Organization / WebSite JSON-LD 구조화 데이터.
 *
 * 홈(`/`)은 root layout 이 담당하는 라우트라 홈 전용 layout 을 신설할 수 없어,
 * 현재는 핵심 서비스 라우트 layout(예: /saju)에 마운트되어 있다.
 * root layout 을 수정할 수 있게 되면 `<OrganizationJsonLd />` 와
 * `<WebSiteJsonLd />` 를 root layout 의 <body> 안으로 옮기는 것을 권장한다.
 *
 * 서버 컴포넌트 전용 (이벤트 핸들러 없음) — layout.tsx 에서 그대로 렌더 가능.
 */

const SITE_URL =
    APP_CONFIG.BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://secret-saju.vercel.app';

const SITE_NAME = 'Secret Saju';

export function OrganizationJsonLd() {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        alternateName: '시크릿사주',
        url: SITE_URL,
        logo: `${SITE_URL}/api/og?name=${encodeURIComponent(SITE_NAME)}`,
        description:
            '최첨단 사주 엔진과 심리 분석으로 당신의 운명을 동기화하는 프리미엄 운세 플랫폼입니다.',
    };

    return (
        <script
            type="application/ld+json"
            // JSON.stringify 결과만 삽입 — 사용자 입력이 섞이지 않는 정적 데이터
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

export function WebSiteJsonLd() {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        alternateName: '시크릿사주',
        url: SITE_URL,
        inLanguage: 'ko-KR',
        description:
            '사주, 타로, 토정비결, 해몽, 별자리 운세를 한곳에서 — 프리미엄 운명 분석 솔루션.',
        publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_URL,
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}
