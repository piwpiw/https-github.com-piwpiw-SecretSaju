import type { Metadata } from 'next';
import { buildRouteMetadata } from '@/lib/seo/buildRouteMetadata';

const base = buildRouteMetadata({
    title: '분석 기록 보관함',
    description:
        '지금까지 진행한 사주·타로·해몽 분석 기록을 한곳에서 관리합니다. 지난 결과를 다시 열어 흐름의 변화를 확인해 보세요.',
    path: '/history',
    ogPillar: '분석 기록',
    ogElement: '수',
});

export const metadata: Metadata = {
    ...base,
    // 개인별 기록 페이지이므로 검색 결과 노출은 제외한다.
    robots: { index: false, follow: true },
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
