'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Locale = 'ko' | 'en';

interface LocaleContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
}

// Korean translations
const ko: Record<string, string> = {
    // Nav
    'nav.analysis': '사주 분석',
    'nav.dashboard': '대시보드',
    'nav.compatibility': '궁합',
    'nav.fortune': '운세',
    'nav.more': '더보기',
    'nav.mypage': '마이페이지',
    'nav.jelly': '젤리',
    'nav.menu': '메뉴',
    'nav.daily': '오늘의 운세',

    // Theme
    'theme.dark': '다크 모드',
    'theme.light': '화이트 모드',
    'theme.readable': '가독성 모드',

    // Home
    'home.badge': '사주팔자 정밀 분석 서비스',
    'home.title1': '나만의',
    'home.title2': '사주 성격 분석',
    'home.desc': '생년월일만 입력하면 60가지 성격 유형 중\n당신의 사주팔자를 정밀 분석해 드립니다',
    'home.feature.title': 'AI 기반 사주팔자 분석',
    'home.feature.desc': '음양오행 빅데이터와 최신 알고리즘이 당신의 타고난 성격과 숨겨진 잠재력을 정밀하게 분석해 드립니다.',
    'home.feature.personality': '성격 분석',
    'home.feature.personality.sub': '60가지 유형',
    'home.feature.fortune': '운세 해설',
    'home.feature.fortune.sub': '맞춤형 분석',
    'home.feature.compat': '궁합 분석',
    'home.feature.compat.sub': '관계 호환성',
    'home.feature.elements': '오행 밸런스',
    'home.feature.elements.sub': '木火土金水',
    'home.fortune2026': '2026년 운세',
    'home.fortune2026.sub': '올해의 운세를 확인해 보세요',
    'home.safety.title': '개인정보 안전 보호',
    'home.safety.desc': '입력하신 정보는 기기에서만 처리되며 서버에 저장되지 않습니다',
    'home.restart': '다시 분석하기',
    'home.share': '결과 공유하기',

    // Birth Input
    'input.title': '생년월일 입력',
    'input.subtitle': '양력 기준으로 입력해 주세요',
    'input.year': '태어난 연도',
    'input.month': '월',
    'input.day': '일',
    'input.time': '태어난 시각 (0~23시)',
    'input.timeUnknown': '태어난 시간을 모릅니다',
    'input.timeHint': '정확한 시간을 입력하면 더 정밀한 분석이 가능합니다',
    'input.submit': '사주 분석하기',

    // Fortune labels
    'fortune.overall': '종합운',
    'fortune.love': '애정운',
    'fortune.money': '재물운',
    'fortune.career': '직업운',
    'fortune.health': '건강운',

    // ComingSoon
    'coming.desc': '이 기능은 현재 개발 중입니다.\n더 좋은 서비스로 곧 찾아뵙겠습니다.',
    'coming.back': '돌아가기',

    // Footer
    'footer.service': '서비스',
    'footer.support': '고객지원',
    'footer.analysis.free': '사주 분석 (무료)',
    'footer.dashboard': '대시보드',
    'footer.compatibility': '궁합 분석',
    'footer.fortune': '운세',
    'footer.mypage': '마이페이지',
    'footer.faq': '자주 묻는 질문',
    'footer.terms': '이용약관',
    'footer.privacy': '개인정보처리방침',
    'footer.refund': '환불 정책',
    'footer.wiki': '사주 백과사전',
    'footer.disclaimer': '본 서비스는 오락 및 참고 목적이며, 의학적·법적 조언을 대체하지 않습니다.',

    // Select Fortune
    'select.title': '운세 서비스 선택',
    'select.desc': '원하시는 분석 서비스를 선택해 주세요',

    // Result
    'result.socialMask': '사회적 가면',
    'result.insight': '전용 인사이트',
    'result.secretPreview': '시크릿 미리보기',
    'result.elements': '오행 (五行) 밸런스',
    'result.coreAnalysis': '사주 핵심 분석',
    'result.secretUnlock': '비밀 분석 해금',
    'result.exportTicket': '결과 이미지 저장',
    'result.shareResult': '친구에게 공유하기',

    // Compatibility Page
    'compat.title': '궁합 분석',
    'compat.desc': '두 사람의 사주를 비교 분석합니다',
    'compat.person1': '첫 번째 사람',
    'compat.person2': '두 번째 사람',
    'compat.selectProfile': '프로필 선택',
    'compat.noProfiles': '프로필이 부족합니다',
    'compat.noProfilesDesc': '궁합 분석을 하려면 최소 2명의 프로필이 필요합니다.',
    'compat.addProfile': '프로필 등록하기',
    'compat.relationType': '관계 유형',
    'compat.analyze': '궁합 분석하기',
    'compat.score': '궁합 점수',
    'compat.chemistry': '케미스트리',
    'compat.powerDynamic': '관계 역학',
    'compat.futurePredict': '미래 전망',
    'compat.tension': '주의 포인트',
    'compat.advice': '관계 조언',
    'compat.actionItems': '관계 개선 행동 지침',
    'compat.scoreBreakdown': '점수 상세',
    'compat.pillarCompare': '일주(日柱) 비교',
    'compat.copyResult': '결과 복사',
    'compat.reAnalyze': '다시 분석',
    'compat.viewDetail': '상세 분석',
    'compat.vsMode': '⚔️ VS 모드로 비교하기',
    'compat.samePersonError': '서로 다른 두 사람을 선택해 주세요.',
    'compat.selectBothError': '두 사람을 모두 선택해 주세요.',

    // Common
    'common.back': '뒤로',
    'common.male': '남성',
    'common.female': '여성',
    'common.relation.self': '본인',
    'common.relation.spouse': '배우자',
    'common.relation.child': '자녀',
    'common.relation.parent': '부모',
    'common.relation.friend': '친구',
    'common.relation.lover': '연인',
    'common.relation.other': '기타',
    'common.relation.sibling': '형제자매',

    // Daily
    'daily.title': '오늘의 운세',
    'daily.subtitle': '매일 자정 업데이트 되는\n나만의 맞춤형 일일 사주 리포트',
    'daily.cta': '무료 운세 펼쳐보기',
    'daily.loading': '일진(日辰) 계산 중...',
    'daily.scoreUnit': '점',
    'daily.premium.title': '프리미엄 딥 다이브 인사이트',
    'daily.premium.desc': '단순한 길흉 화복을 넘어 당신의 일지에 걸려있는 암합, 충, 형살을 파악해 구체적인 액션 플랜을 제시합니다.',
    'daily.backHome': '메인으로 돌아가기',
};

// English translations
const en: Record<string, string> = {
    // Nav
    'nav.analysis': 'Analysis',
    'nav.dashboard': 'Dashboard',
    'nav.compatibility': 'Compatibility',
    'nav.fortune': 'Fortune',
    'nav.more': 'More',
    'nav.mypage': 'My Page',
    'nav.jelly': 'Jelly',
    'nav.menu': 'Menu',
    'nav.daily': 'Daily Fortune',

    // Theme
    'theme.dark': 'Dark Mode',
    'theme.light': 'Light Mode',
    'theme.readable': 'Readable Mode',

    // Home
    'home.badge': 'Saju Personality Analysis',
    'home.title1': 'Your',
    'home.title2': 'Saju Profile',
    'home.desc': 'Enter your birth date to discover\nyour personality type among 60 archetypes',
    'home.feature.title': 'AI-Powered Saju Analysis',
    'home.feature.desc': 'Our algorithm analyzes your innate personality and hidden potential using Yin-Yang Five Elements data.',
    'home.feature.personality': 'Personality',
    'home.feature.personality.sub': '60 Types',
    'home.feature.fortune': 'Fortune',
    'home.feature.fortune.sub': 'Personalized',
    'home.feature.compat': 'Compatibility',
    'home.feature.compat.sub': 'Relationship Match',
    'home.feature.elements': 'Five Elements',
    'home.feature.elements.sub': '木火土金水',
    'home.fortune2026': '2026 Fortune',
    'home.fortune2026.sub': 'Check your yearly fortune',
    'home.safety.title': 'Privacy Protected',
    'home.safety.desc': 'Your data is processed locally and never stored on servers',
    'home.restart': 'Analyze Again',
    'home.share': 'Share Results',

    // Birth Input
    'input.title': 'Enter Birth Date',
    'input.subtitle': 'Please enter in solar calendar',
    'input.year': 'Birth Year',
    'input.month': 'Month',
    'input.day': 'Day',
    'input.time': 'Birth Hour (0~23)',
    'input.timeUnknown': 'I don\'t know my birth time',
    'input.timeHint': 'Entering exact time enables more precise analysis',
    'input.submit': 'Analyze My Saju',

    // Fortune labels
    'fortune.overall': 'Overall',
    'fortune.love': 'Love',
    'fortune.money': 'Wealth',
    'fortune.career': 'Career',
    'fortune.health': 'Health',

    // ComingSoon
    'coming.desc': 'This feature is currently under development.\nWe\'ll bring you a better service soon.',
    'coming.back': 'Go Back',

    // Footer
    'footer.service': 'Services',
    'footer.support': 'Support',
    'footer.analysis.free': 'Saju Analysis (Free)',
    'footer.dashboard': 'Dashboard',
    'footer.compatibility': 'Compatibility',
    'footer.fortune': 'Fortune',
    'footer.mypage': 'My Page',
    'footer.faq': 'FAQ',
    'footer.terms': 'Terms of Service',
    'footer.privacy': 'Privacy Policy',
    'footer.refund': 'Refund Policy',
    'footer.wiki': 'Saju Encyclopedia',
    'footer.disclaimer': 'This service is for entertainment and reference only, not a substitute for medical or legal advice.',

    // Select Fortune
    'select.title': 'Select Fortune Service',
    'select.desc': 'Choose the analysis service you\'d like',

    // Result
    'result.socialMask': 'Social Mask',
    'result.insight': 'Age Insight',
    'result.secretPreview': 'Secret Preview',
    'result.elements': 'Five Elements Balance',
    'result.coreAnalysis': 'Core Saju Analysis',
    'result.secretUnlock': 'Unlock Secret Analysis',
    'result.exportTicket': 'Save Result Image',
    'result.shareResult': 'Share with Friends',

    // Compatibility Page
    'compat.title': 'Compatibility',
    'compat.desc': 'Analyze the Saju between two people',
    'compat.person1': 'First Person',
    'compat.person2': 'Second Person',
    'compat.selectProfile': 'Select Profile',
    'compat.noProfiles': 'Not Enough Profiles',
    'compat.noProfilesDesc': 'At least 2 profiles are required for compatibility analysis.',
    'compat.addProfile': 'Add Profile',
    'compat.relationType': 'Relationship',
    'compat.analyze': 'Analyze Compatibility',
    'compat.score': 'Compatibility Score',
    'compat.chemistry': 'Chemistry',
    'compat.powerDynamic': 'Power Dynamic',
    'compat.futurePredict': 'Future Outlook',
    'compat.tension': 'Points of Caution',
    'compat.advice': 'Relationship Advice',
    'compat.actionItems': 'Action Plan',
    'compat.scoreBreakdown': 'Score Details',
    'compat.pillarCompare': 'Pillar Comparison',
    'compat.copyResult': 'Copy Results',
    'compat.reAnalyze': 'Reset',
    'compat.viewDetail': 'Details',
    'compat.vsMode': '⚔️ Compare in VS Mode',
    'compat.samePersonError': 'Please select two different people.',
    'compat.selectBothError': 'Please select both people.',

    // Common
    'common.back': 'Back',
    'common.male': 'Male',
    'common.female': 'Female',
    'common.relation.self': 'Self',
    'common.relation.spouse': 'Spouse',
    'common.relation.child': 'Child',
    'common.relation.parent': 'Parent',
    'common.relation.friend': 'Friend',
    'common.relation.lover': 'Lover',
    'common.relation.other': 'Other',
    'common.relation.sibling': 'Sibling',

    // Daily
    'daily.title': 'Daily Fortune',
    'daily.subtitle': 'Your personalized daily Saju report,\nupdated every midnight.',
    'daily.cta': 'Reveal My Fortune',
    'daily.loading': 'Calculating Cosmic Flow...',
    'daily.scoreUnit': 'pts',
    'daily.premium.title': 'Premium Deep-Dive Insight',
    'daily.premium.desc': 'Beyond simple luck, we analyze the hidden combinations and clashes in your chart to provide specific action plans.',
    'daily.backHome': 'Back to Home',
};

const translations: Record<Locale, Record<string, string>> = { ko, en };

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('ko');

    useEffect(() => {
        const saved = localStorage.getItem('locale') as Locale;
        if (saved && (saved === 'ko' || saved === 'en')) {
            setLocaleState(saved);
        }
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('locale', newLocale);
    };

    const t = (key: string): string => {
        return translations[locale][key] || key;
    };

    return (
        <LocaleContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LocaleContext.Provider>
    );
}

export const useLocale = () => {
    const context = useContext(LocaleContext);
    if (!context) {
        throw new Error('useLocale must be used within a LocaleProvider');
    }
    return context;
};
