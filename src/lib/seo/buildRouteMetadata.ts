import type { Metadata } from 'next';

/**
 * 라우트별 SEO 메타데이터 빌더.
 *
 * "use client" 페이지는 자체적으로 metadata 를 export 할 수 없으므로,
 * 각 라우트 디렉터리의 layout.tsx 에서 이 헬퍼로 만든 Metadata 를 export 한다.
 *
 * openGraph/twitter 이미지는 기존 `/api/og` 엣지 라우트를 재사용하며,
 * 상대 경로는 root layout 의 metadataBase 로 절대 URL 로 해석된다.
 */

const SITE_NAME = 'Secret Saju';

/** `/api/og` 라우트가 지원하는 오행 키 (배경 액센트 색상 결정) */
export type OgElement = '목' | '화' | '토' | '금' | '수';

export interface RouteSeoInput {
    /** 페이지 고유 제목 ("| Secret Saju" 는 자동으로 붙는다) */
    title: string;
    /** 자연스러운 한국어 1~2문장 설명 */
    description: string;
    /** 라우트 경로 (예: '/saju') — canonical / og:url 에 사용 */
    path: string;
    /** OG 이미지 중앙 대형 텍스트 (기본값: title, 최대 24자) */
    ogPillar?: string;
    /** OG 이미지 액센트 색상용 오행 (기본값: '목') */
    ogElement?: OgElement;
}

export function buildRouteMetadata({
    title,
    description,
    path,
    ogPillar,
    ogElement = '목',
}: RouteSeoInput): Metadata {
    const fullTitle = `${title} | ${SITE_NAME}`;
    const ogImage = `/api/og?name=${encodeURIComponent(SITE_NAME)}&pillar=${encodeURIComponent(
        ogPillar ?? title,
    )}&element=${encodeURIComponent(ogElement)}&locale=ko`;

    return {
        title: fullTitle,
        description,
        alternates: {
            canonical: path,
        },
        openGraph: {
            title: fullTitle,
            description,
            url: path,
            siteName: SITE_NAME,
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: fullTitle,
                },
            ],
            locale: 'ko_KR',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description,
            images: [ogImage],
        },
    };
}
