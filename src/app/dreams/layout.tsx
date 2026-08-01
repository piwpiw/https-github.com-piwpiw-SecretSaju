import type { Metadata } from 'next';
import { buildRouteMetadata } from '@/lib/seo/buildRouteMetadata';

export const metadata: Metadata = buildRouteMetadata({
    title: '꿈 해몽',
    description:
        '간밤의 꿈을 키워드로 입력하면 상징과 심리 신호를 해석해 드립니다. 꿈이 전하는 메시지를 오늘의 실천 포인트로 연결합니다.',
    path: '/dreams',
    ogPillar: '꿈 해몽',
    ogElement: '수',
});

export default function DreamsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
