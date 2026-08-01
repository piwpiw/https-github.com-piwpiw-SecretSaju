import type { Metadata } from 'next';
import { buildRouteMetadata } from '@/lib/seo/buildRouteMetadata';

export const metadata: Metadata = buildRouteMetadata({
    title: '운세 & 부적',
    description:
        '재물·인연·건강 등 분야별 운의 흐름을 읽고 지금 필요한 맞춤 부적을 제안합니다. 부족한 기운을 보완하는 방법을 안내합니다.',
    path: '/luck',
    ogPillar: '운세 & 부적',
    ogElement: '화',
});

export default function LuckLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
