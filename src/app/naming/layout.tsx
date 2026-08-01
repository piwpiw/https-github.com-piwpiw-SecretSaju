import type { Metadata } from 'next';
import { buildRouteMetadata } from '@/lib/seo/buildRouteMetadata';

export const metadata: Metadata = buildRouteMetadata({
    title: '작명 분석',
    description:
        '이름과 한자 후보를 입력하면 소리·획수·시나리오 기반으로 분석합니다. 새 이름이 가져올 기운의 흐름을 함께 검토해 드립니다.',
    path: '/naming',
    ogPillar: '작명 분석',
    ogElement: '목',
});

export default function NamingLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
