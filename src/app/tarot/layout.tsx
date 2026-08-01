import type { Metadata } from 'next';
import { buildRouteMetadata } from '@/lib/seo/buildRouteMetadata';

export const metadata: Metadata = buildRouteMetadata({
    title: '타로 리딩',
    description:
        '고민을 떠올리며 카드를 뽑는 온라인 타로 리딩입니다. 카드별 상징 해석과 함께 오늘의 방향을 명확하게 정리해 드립니다.',
    path: '/tarot',
    ogPillar: '타로 리딩',
    ogElement: '화',
});

export default function TarotLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
