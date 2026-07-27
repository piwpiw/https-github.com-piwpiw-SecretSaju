/**
 * 사이트 전체 메뉴 (단일 정본)
 *
 * 배경: 상단 내비게이션에는 6개 항목만 있었고, 타로·토정비결·꿈해몽·작명·손금·
 * 천문·신살 등 실제로 구현된 기능 대부분은 홈의 가로 스크롤 캐러셀이나 `/more`
 * 안에만 있어서 "메뉴에 없다 = 없는 기능"처럼 보였습니다.
 *
 * 이 파일이 **구현된 모든 사용자 화면의 정본 목록**입니다. 새 페이지를 추가하면
 * 여기에도 등록해 주세요. `scripts/qa/menu-coverage.mjs`가 라우트와 이 목록을
 * 대조해 누락을 잡습니다.
 */

export interface SiteMenuItem {
    href: string;
    label: string;
    /** 한 줄 설명 (메뉴 목록에서 보조 텍스트로 노출) */
    desc?: string;
    emoji?: string;
}

export interface SiteMenuGroup {
    title: string;
    items: SiteMenuItem[];
}

export const SITE_MENU: SiteMenuGroup[] = [
    {
        title: '사주 · 운세',
        items: [
            { href: '/saju', label: '사주 분석', desc: '원국·오행·격국 정밀 해석', emoji: '📜' },
            { href: '/daily', label: '오늘의 운세', desc: '하루 흐름과 시간대별 조언', emoji: '✨' },
            { href: '/tojeong', label: '토정비결', desc: '연도별 일간운·월간운', emoji: '🧭' },
            { href: '/fortune', label: '연간 운세', desc: '한 해 전체 흐름 보기', emoji: '🎯' },
            { href: '/calendar', label: '만세력', desc: '날짜별 천간지지 확인', emoji: '📅' },
            { href: '/shinsal', label: '신살 풀이', desc: '길신·흉살 상세 해석', emoji: '⚡' },
            { href: '/luck', label: '운세·부적', desc: '행운 의식과 부적', emoji: '🍀' },
        ],
    },
    {
        title: '점술 · 해석',
        items: [
            { href: '/tarot', label: '타로', desc: '질문형 카드 리딩', emoji: '🃏' },
            { href: '/tarot/gallery', label: '타로 카드 갤러리', desc: '78장 카드 의미 모음', emoji: '🖼️' },
            { href: '/dreams', label: '꿈해몽', desc: '꿈 상징 기반 메시지', emoji: '🌙' },
            { href: '/palmistry', label: '손금', desc: '선천적 성향 진단', emoji: '🖐️' },
            { href: '/astrology', label: '천문·점성', desc: '별자리와 시간대 분석', emoji: '🔭' },
            { href: '/naming', label: '작명', desc: '오행 균형 기반 이름 제안', emoji: '✍️' },
        ],
    },
    {
        title: '관계 · 궁합',
        items: [
            { href: '/compatibility', label: '궁합', desc: '두 사람의 기운 매칭', emoji: '💞' },
            { href: '/destiny', label: '사주·궁합 종합', desc: '관계 전반 종합 진단', emoji: '🔮' },
            { href: '/relationship', label: '인연 네트워크', desc: '등록한 인연들과의 관계', emoji: '🕸️' },
            { href: '/fortune-readers', label: '역술가 마켓', desc: '해석 스타일 골라 보기', emoji: '👤' },
        ],
    },
    {
        title: '심리 · 힐링',
        items: [
            { href: '/psychology', label: '심리 분석', desc: '내면·애착·번아웃 진단', emoji: '🧠' },
            { href: '/healing', label: '힐링·아트', desc: '마음 회복 콘텐츠', emoji: '🌿' },
            { href: '/consultation', label: '상담', desc: '전문가 상담 안내', emoji: '💬' },
            { href: '/story', label: '운명 이야기', desc: '사례로 읽는 사주', emoji: '📖' },
        ],
    },
    {
        title: '내 정보',
        items: [
            { href: '/dashboard', label: '내 대시보드', desc: '한눈에 보는 내 운세 현황', emoji: '📊' },
            { href: '/mypage', label: '마이페이지', desc: '내 계정과 지갑', emoji: '🙋' },
            { href: '/my-saju/list', label: '내 사주 목록', desc: '저장한 프로필 관리', emoji: '🗂️' },
            { href: '/history', label: '분석 이력', desc: '지난 분석 다시 보기', emoji: '🕘' },
            { href: '/gift', label: '선물하기', desc: '친구에게 분석 선물', emoji: '🎁' },
            { href: '/shop', label: '젤리 상점', desc: '무료 오픈 기간 전체 무료', emoji: '🍇' },
            { href: '/support', label: '후원하기', desc: '서비스 응원하기', emoji: '❤️' },
        ],
    },
    {
        title: '정보 · 도움말',
        items: [
            { href: '/wiki', label: '사주 백과사전', desc: '개념과 용어 정리', emoji: '📚' },
            { href: '/encyclopedia', label: '용어 사전', desc: '빠른 용어 검색', emoji: '🔎' },
            { href: '/about', label: '서비스 소개', desc: '시크릿사주는 어떤 서비스인가', emoji: 'ℹ️' },
            { href: '/blog', label: '블로그', desc: '읽을거리와 소식', emoji: '📰' },
            { href: '/faq', label: '자주 묻는 질문', desc: '궁금한 점 먼저 확인', emoji: '❓' },
            { href: '/inquiry', label: '문의하기', desc: '1:1 문의 접수', emoji: '✉️' },
            { href: '/legal', label: '이용약관·정책', desc: '약관·개인정보·환불', emoji: '📄' },
        ],
    },
];

/** 상단 바에 노출할 대표 메뉴 (좁은 화면에서도 한 줄에 들어가야 함) */
export const PRIMARY_NAV: SiteMenuItem[] = [
    { href: '/', label: '홈' },
    { href: '/saju', label: '사주' },
    { href: '/tarot', label: '타로' },
    { href: '/daily', label: '오늘의 운세' },
    { href: '/compatibility', label: '궁합' },
    { href: '/more', label: '전체 메뉴' },
];

/** 메뉴에 넣지 않는 라우트 (플로우 중간 단계나 콜백 등) */
export const NON_MENU_ROUTES = [
    '/auth/callback',
    '/payment/success',
    '/payment/fail',
    '/payment/loading',
    '/login',
    '/signup',
    '/account/delete',
    '/billing',
    '/analysis-history',
    '/select-fortune',
    '/my-saju/add',
    '/psychology/module',
    '/psychology/premium-report',
    '/custom/partnership',
    '/terms',
    '/privacy',
    '/refund',
    '/more',
    '/',
];
