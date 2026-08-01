import type { Metadata } from 'next';
import { buildRouteMetadata } from '@/lib/seo/buildRouteMetadata';

export const metadata: Metadata = buildRouteMetadata({
    title: '신살 운세 지도',
    description:
        '사주 속 신살을 지도처럼 펼쳐 유리한 기운과 주의할 기운을 구분해 드립니다. 각 신살의 의미와 활용법을 함께 안내합니다.',
    path: '/shinsal',
    ogPillar: '신살 운세 지도',
    ogElement: '금',
});

export default function ShinsalLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
