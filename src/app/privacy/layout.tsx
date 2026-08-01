import type { Metadata } from 'next';
import { buildRouteMetadata } from '@/lib/seo/buildRouteMetadata';

export const metadata: Metadata = buildRouteMetadata({
    title: '개인정보 처리방침',
    description:
        'Secret Saju 개인정보 처리방침입니다. 수집하는 개인정보 항목과 이용 목적, 보관 기간을 투명하게 안내합니다.',
    path: '/privacy',
    ogPillar: '개인정보 처리방침',
    ogElement: '금',
});

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
