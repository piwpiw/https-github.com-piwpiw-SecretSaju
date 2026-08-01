import type { Metadata } from 'next';
import { buildRouteMetadata } from '@/lib/seo/buildRouteMetadata';

export const metadata: Metadata = buildRouteMetadata({
    title: '이용약관',
    description:
        'Secret Saju 서비스 이용약관입니다. 서비스 이용 조건과 회원의 권리·의무를 안내합니다.',
    path: '/terms',
    ogPillar: '이용약관',
    ogElement: '금',
});

export default function TermsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
