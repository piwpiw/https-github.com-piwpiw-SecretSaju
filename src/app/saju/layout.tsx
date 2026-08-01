import type { Metadata } from 'next';
import { buildRouteMetadata } from '@/lib/seo/buildRouteMetadata';
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = buildRouteMetadata({
    title: '사주 분석',
    description:
        '생년월일과 태어난 시간으로 사주팔자를 정밀 분석합니다. 오행 균형과 대운의 흐름을 읽어 지금 필요한 선택 포인트를 제안합니다.',
    path: '/saju',
    ogPillar: '사주 분석',
    ogElement: '목',
});

export default function SajuLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <OrganizationJsonLd />
            <WebSiteJsonLd />
            {children}
        </>
    );
}
