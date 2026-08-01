import type { Metadata } from 'next';
import { buildRouteMetadata } from '@/lib/seo/buildRouteMetadata';

export const metadata: Metadata = buildRouteMetadata({
    title: '손금 분석',
    description:
        '손바닥 사진을 올리면 생명선·감정선·두뇌선을 분석해 드립니다. 손금에 담긴 성향과 흐름을 읽어 실전 조언으로 연결합니다.',
    path: '/palmistry',
    ogPillar: '손금 분석',
    ogElement: '토',
});

export default function PalmistryLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
