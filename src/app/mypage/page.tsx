'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { getUserFromCookie, clearUserSession } from '@/lib/kakao-auth';
import KakaoLoginButton from '@/components/KakaoLoginButton';
import AuthModal from '@/components/AuthModal';
import JellyShopModal from '@/components/shop/JellyShopModal';
import {
    User as UserIcon, LogOut, History, ShoppingBag,
    Star, TrendingUp, ChevronRight, Gem, BookOpen,
    HelpCircle, ArrowLeft, Shield, Gift, MessageSquare, Share2, Award, Copy
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/lib/i18n';
import { handleShare } from '@/lib/share';

interface UserData {
    id: number;
    nickname: string;
    email?: string;
    profileImage?: string;
}

export default function MyPage() {
    const router = useRouter();
    const { t, locale } = useLocale();
    const { churu, nyang } = useWallet();
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showShop, setShowShop] = useState(false);
    const [showAuth, setShowAuth] = useState(false);

    useEffect(() => {
        const userData = getUserFromCookie();
        setUser(userData);
        setIsLoading(false);
    }, []);

    const handleLogout = () => {
        if (confirm(locale === 'ko' ? '로그아웃 하시겠습니까?' : 'Do you want to logout?')) {
            clearUserSession();
            setUser(null);
            router.push('/');
        }
    };

    const handleCopyReferral = async () => {
        if (!user) return;
        const link = `${window.location.origin}/?ref=${user.id}`;
        const result = await handleShare('시크릿사주 초대', '초대 링크로 가입하고 프리미엄 분석 무료 젤리를 받으세요!', link);
        if (result === 'copied') {
            alert(locale === 'ko' ? '초대 링크가 복사되었습니다! 친구가 가입하면 5 젤리가 지급됩니다!' : 'Referral link copied! You get 5 Jellies when they join!');
        }
    };

    const getLevelInfo = (exp: number) => {
        if (exp >= 1000) return { titleKo: '운명의 마스터', titleEn: 'Destiny Master', next: 'MAX', percent: 100, color: 'text-rose-500' };
        if (exp >= 300) return { titleKo: '인연의 조언자', titleEn: 'Advisor', next: 1000, percent: (exp / 1000) * 100, color: 'text-purple-500' };
        if (exp >= 100) return { titleKo: '운명의 탐도자', titleEn: 'Seeker', next: 300, percent: (exp / 300) * 100, color: 'text-emerald-500' };
        return { titleKo: '수습 점술가', titleEn: 'Apprentice', next: 100, percent: (exp / 100) * 100, color: 'text-primary' };
    };

    if (isLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-16 h-16 animate-spin text-primary" />
            </main>
        );
    }

    if (!user) {
        return (
            <main className="min-h-screen relative overflow-hidden flex items-center justify-center px-6">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface max-w-lg w-full p-16 rounded-5xl border border-border-color text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-purple-600" />
                    <div className="w-32 h-32 bg-primary/10 rounded-4xl flex items-center justify-center mx-auto mb-10 border border-primary/20 shadow-xl">
                        <UserIcon className="w-16 h-16 text-primary" />
                    </div>
                    <h1 className="text-4xl font-black mb-6 text-foreground tracking-tight">
                        {locale === 'ko' ? '로그인이 필요합니다' : 'Login Required'}
                    </h1>
                    <p className="text-xl text-secondary mb-12 leading-relaxed">
                        {locale === 'ko' ? '사주 분석 결과를 저장하고 관리하려면\n로그인이 필요합니다.' : 'Sign in to save and manage\nyour Saju analysis results.'}
                    </p>
                    <button onClick={() => setShowAuth(true)} className="w-full py-4 rounded-2xl bg-primary text-white font-black text-xl shadow-xl hover:scale-105 transition-all mb-10">
                        {locale === 'ko' ? '운명의 문 열기 (가입 시 10 젤리)' : 'Unlock Destiny (10 Free Jellies)'}
                    </button>
                    <Link href="/" className="text-lg font-bold text-secondary hover:text-foreground transition-all flex items-center justify-center gap-2">
                        <ArrowLeft className="w-5 h-5" /> {locale === 'ko' ? '홈으로 돌아가기' : 'Back to Home'}
                    </Link>
                    <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
                </motion.div>
            </main >
        );
    }

    const mainMenuItems = [
        { icon: ShoppingBag, label: t('nav.jelly'), desc: locale === 'ko' ? '프리미엄 분석용' : 'For premium reports', onClick: () => setShowShop(true), badge: '999+' },
        { icon: Star, label: locale === 'ko' ? '내 프로필' : 'My Profiles', desc: locale === 'ko' ? '저장된 사주 정보' : 'Saved saju data', href: '/my-saju/list' },
        { icon: TrendingUp, label: t('nav.fortune'), desc: locale === 'ko' ? '올해 실시간 운세' : 'Yearly live report', href: '/fortune' },
        { icon: History, label: locale === 'ko' ? '분석 내역' : 'Analysis History', desc: locale === 'ko' ? '과거 리포트 모음' : 'Past reports folder', href: '/mypage' },
    ];

    return (
        <main className="min-h-screen relative overflow-hidden pb-40">
            <div className="max-w-4xl mx-auto px-6 py-16 relative z-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-20 border-b border-border-color pb-16">
                    <div className="flex items-center gap-10 text-center md:text-left">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
                            <div className="relative w-40 h-40 rounded-5xl bg-background border-4 border-border-color overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-700">
                                {user.profileImage ? (
                                    <Image src={user.profileImage} alt={user.nickname} fill className="object-cover" unoptimized />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <UserIcon className="w-20 h-20 text-secondary opacity-30" />
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-xl border-4 border-surface">
                                <Gem className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div>
                            <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-black uppercase mb-4 tracking-widest leading-none items-center gap-2">
                                <Award className="w-4 h-4" />
                                {locale === 'ko' ? getLevelInfo(nyang).titleKo : getLevelInfo(nyang).titleEn}
                            </div>
                            <h1 className="text-5xl font-black text-foreground italic tracking-tighter uppercase mb-2">
                                {user.nickname}
                            </h1>
                            <p className="text-xl text-secondary font-medium italic opacity-70 mb-4">
                                {user.email || 'Verified Destiny'}
                            </p>
                            <button onClick={handleCopyReferral} className="flex items-center gap-2 text-sm font-bold text-foreground bg-surface border-2 border-border-color px-4 py-2 rounded-xl hover:border-primary hover:text-primary transition-all">
                                <Share2 className="w-4 h-4" />
                                {locale === 'ko' ? '초대하고 5 젤리 받기' : 'Invite & Get 5 Jellies'}
                            </button>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="p-6 rounded-3xl bg-surface border border-border-color text-secondary hover:text-rose-500 hover:bg-rose-500/5 transition-all shadow-lg group">
                        <LogOut className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                    </button>
                </div>

                {/* Wallet Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="bg-surface p-12 rounded-4xl border border-primary/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-700">
                            <Gem className="w-32 h-32 text-primary" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full">
                            <span className="text-xl font-black text-primary uppercase tracking-widest mb-4">{t('nav.jelly')}</span>
                            <div className="flex items-baseline gap-4 mb-10">
                                <span className="text-7xl font-black text-foreground italic tracking-tight">{churu.toLocaleString()}</span>
                                <span className="text-2xl font-bold text-secondary italic">PCS</span>
                            </div>
                            <button onClick={() => setShowShop(true)} className="w-full py-6 rounded-2xl bg-primary text-white font-black text-xl shadow-xl hover:scale-105 transition-all">
                                {locale === 'ko' ? '젤리 충전' : 'Top Up Jellies'}
                            </button>
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="bg-surface p-12 rounded-4xl border border-border-color relative overflow-hidden group hover:border-emerald-500/50 transition-all">
                        <div className="relative z-10 flex flex-col h-full">
                            <span className="text-xl font-black text-secondary uppercase tracking-widest mb-4 flex items-center justify-between">
                                {locale === 'ko' ? '운명 경험치 (EXP)' : 'Destiny EXP'}
                                <Award className={`w-8 h-8 ${getLevelInfo(nyang).color}`} />
                            </span>
                            <div className="flex items-baseline gap-4 mb-4">
                                <span className={`text-6xl font-black italic tracking-tight ${getLevelInfo(nyang).color}`}>{nyang.toLocaleString()}</span>
                                <span className="text-2xl font-bold text-secondary italic">XP</span>
                            </div>

                            <div className="w-full bg-background h-3 rounded-full overflow-hidden mb-2 border border-border-color">
                                <div className={`h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full`} style={{ width: `${getLevelInfo(nyang).percent}%` }} />
                            </div>
                            <p className="text-sm font-bold text-secondary text-right mb-8">
                                {getLevelInfo(nyang).next === 'MAX' ? 'MAX LEVEL' : `Next Tier: ${getLevelInfo(nyang).next} XP`}
                            </p>

                            <button onClick={handleCopyReferral} className="w-full py-6 flex items-center justify-center gap-3 rounded-2xl bg-background border-2 border-border-color text-foreground font-black text-xl hover:border-emerald-500 hover:text-emerald-500 transition-all group/btn shadow-sm">
                                <Copy className="w-5 h-5 group-hover/btn:scale-110" />
                                {locale === 'ko' ? '내 초대 링크 복사' : 'Copy Referral Link'}
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Main Menu Grid */}
                <div className="space-y-6 mb-24">
                    <h2 className="text-2xl font-black text-foreground uppercase tracking-wider mb-8 flex items-center gap-4">
                        <div className="w-2 h-8 bg-primary rounded-full" /> {locale === 'ko' ? '관리 메뉴' : 'Main Menu'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {mainMenuItems.map((item, i) => (
                            <button
                                key={item.label}
                                onClick={item.onClick || (() => router.push(item.href || '#'))}
                                className="bg-surface p-10 rounded-4xl border border-border-color hover:border-primary/50 transition-all text-left flex items-start justify-between group shadow-xl hover:shadow-primary/5"
                            >
                                <div className="flex items-center gap-8">
                                    <div className="w-20 h-20 rounded-3xl bg-background border border-border-color flex items-center justify-center group-hover:scale-110 transition-all duration-500">
                                        <item.icon className="w-10 h-10 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-foreground mb-1 tracking-tight">{item.label}</h3>
                                        <p className="text-lg text-secondary font-medium italic opacity-70">{item.desc}</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-8 h-8 text-border-color group-hover:text-primary group-hover:translate-x-2 transition-all" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sub Menu Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-24">
                    {[
                        { icon: Gift, label: t('nav.more'), href: '/gift' },
                        { icon: MessageSquare, label: locale === 'ko' ? '고객문의' : 'Inquiry', href: '/inquiry' },
                        { icon: BookOpen, label: t('footer.wiki'), href: '/wiki' },
                        { icon: HelpCircle, label: t('footer.faq'), href: '/inquiry' },
                    ].map((item, i) => (
                        <Link
                            key={i}
                            href={item.href}
                            className="bg-surface p-8 rounded-4xl border border-border-color flex flex-col items-center justify-center gap-6 hover:bg-primary/5 transition-all group aspect-square shadow-sm hover:shadow-xl"
                        >
                            <div className="w-16 h-16 rounded-3xl bg-background border border-border-color flex items-center justify-center group-hover:rotate-12 transition-all">
                                <item.icon className="w-8 h-8 text-secondary group-hover:text-primary transition-colors" />
                            </div>
                            <span className="text-xl font-black text-secondary tracking-tighter group-hover:text-foreground">{item.label}</span>
                        </Link>
                    ))}
                </div>

                {/* Footer Credits */}
                <div className="text-center pt-20 border-t border-border-color opacity-50">
                    <div className="flex justify-center gap-10 text-lg font-bold text-secondary uppercase tracking-widest mb-10">
                        <Link href="/terms" className="hover:text-primary transition-all">{t('footer.terms')}</Link>
                        <Link href="/privacy" className="hover:text-primary transition-all">{t('footer.privacy')}</Link>
                        <Link href="/refund" className="hover:text-primary transition-all">{t('footer.refund')}</Link>
                    </div>
                    <p className="text-xl font-black italic text-secondary/30 uppercase tracking-[1em]">Secret Saju v4.5</p>
                </div>
            </div>

            <JellyShopModal
                isOpen={showShop}
                onClose={() => setShowShop(false)}
                onPurchaseSuccess={() => setShowShop(false)}
            />
        </main>
    );
}

function Loader2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}
