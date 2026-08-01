import type { Metadata } from 'next';
import { buildRouteMetadata } from '@/lib/seo/buildRouteMetadata';

export const metadata: Metadata = buildRouteMetadata({
    title: '별자리 운세',
    description:
        '별자리 기반 일일 운세 스냅샷을 제공합니다. 오늘의 에너지 흐름과 주의할 타이밍을 간결하게 정리해 드립니다.',
    path: '/astrology',
    ogPillar: '별자리 운세',
    ogElement: '금',
});

export default function AstrologyLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
