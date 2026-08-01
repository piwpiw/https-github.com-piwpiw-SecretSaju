import type { Metadata } from 'next';
import { buildRouteMetadata } from '@/lib/seo/buildRouteMetadata';

export const metadata: Metadata = buildRouteMetadata({
    title: '토정비결',
    description:
        '토정비결로 올해의 총운과 월별 흐름을 풀이합니다. 전통 괘 해석을 현대의 언어로 알기 쉽게 전해 드립니다.',
    path: '/tojeong',
    ogPillar: '토정비결',
    ogElement: '토',
});

export default function TojeongLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
