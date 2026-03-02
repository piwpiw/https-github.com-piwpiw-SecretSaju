'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { getUserFromCookie, clearUserSession } from '@/lib/kakao-auth';
import AuthModal from '@/components/AuthModal';
import JellyShopModal from '@/components/shop/JellyShopModal';
import {
    User as UserIcon,
    LogOut,
    History,
    ShoppingBag,
    Star,
    TrendingUp,
    ChevronRight,
    Gem,
    BookOpen,
    HelpCircle,
    ArrowLeft,
    Gift,
    MessageSquare,
    Share2,
    Award,
    Copy,
    Loader2,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLocale } from '@/lib/i18n';
import { handleShare } from '@/lib/share';

interface UserData {
    id: string | number;
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
        if (confirm(locale === 'ko' ? '정말 로그아웃할까요?' : 'Log out now?')) {
            clearUserSession();
            setUser(null);
            router.push('/');
        }
    };

    const handleCopyReferral = async () => {
        if (!user) return;
        const link = `${window.location.origin}/?ref=${user.id}`;
        const result = await handleShare('시드 초대', 'SecretSaju 친구 초대 링크입니다.', link);
        if (result === 'copied') {
            alert(locale === 'ko' ? '초대 링크를 복사했습니다. 가입 시 5 젤리를 지급합니다.' : 'Referral link copied. 5 Jellies are awarded.');
        }
    };

    const getLevelInfo = (exp: number) => {
        if (exp >= 1000) return { titleKo: '운명의 대가', titleEn: 'Destiny Master', next: 'MAX', percent: 100, color: 'text-rose-500' };
        if (exp >= 300) return { titleKo: '안내자', titleEn: 'Advisor', next: 1000, percent: (exp / 1000) * 100, color: 'text-purple-500' };
        if (exp >= 100) return { titleKo: '탐색자', titleEn: 'Seeker', next: 300, percent: (exp / 300) * 100, color: 'text-emerald-500' };
        return { titleKo: '초보자', titleEn: 'Apprentice', next: 100, percent: (exp / 100) * 100, color: 'text-primary' };
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
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface max-w-lg w-full p-16 rounded-5xl border border-border-color text-center">
                    <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/20">
                        <UserIcon className="w-12 h-12 text-primary" />
                    </div>
                    <h1 className="text-3xl font-black mb-6">로그인이 필요합니다</h1>
                    <p className="text-xl text-secondary mb-12 leading-relaxed">로그인해 사주 분석 결과를 저장하고 관리하세요.</p>
                    <button onClick={() => setShowAuth(true)} className="w-full py-4 rounded-2xl bg-primary text-white font-black text-xl mb-10">
                        로그인하기
                    </button>
                    <Link href="/" className="text-lg font-bold text-secondary hover:text-foreground flex items-center justify-center gap-2">
                        <ArrowLeft className="w-5 h-5" /> 홈으로
                    </Link>
                    <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
                </motion.div>
            </main>
        );
    }

    const mainMenuItems: Array<{ icon: typeof ShoppingBag; label: string; desc: string; href: string; onClick?: () => void }> = [
        { icon: ShoppingBag, label: t('nav.jelly'), desc: '프리미엄 기능을 위한 잔액 관리', href: '/mypage', onClick: () => setShowShop(true) },
        { icon: Star, label: locale === 'ko' ? '내 프로필' : 'My Profiles', desc: locale === 'ko' ? '저장된 사주 데이터' : 'Saved saju profiles', href: '/my-saju/list' },
        { icon: TrendingUp, label: t('nav.fortune'), desc: locale === 'ko' ? '연도별 분석 결과' : 'Yearly fortune report', href: '/fortune' },
        { icon: History, label: locale === 'ko' ? '분석 히스토리' : 'Analysis History', desc: locale === 'ko' ? '과거 기록 모음' : 'Past reports folder', href: '/history' },
    ];

    return (
        <main className="min-h-screen relative overflow-hidden pb-40">
            <div className="max-w-4xl mx-auto px-6 py-16 relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10 mb-20 border-b border-border-color pb-16">
                    <div className="flex items-center gap-6">
                        <div className="w-28 h-28 rounded-4xl bg-background border-4 border-border-color overflow-hidden relative">
                            {user.profileImage ? (
                                <Image src={user.profileImage} alt={user.nickname} fill className="object-cover" unoptimized />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <UserIcon className="w-12 h-12 text-secondary" />
                                </div>
                            )}
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-xl flex items-center justify-center border-2 border-surface">
                                <Gem className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div>
                            <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase mb-3">{getLevelInfo(nyang).titleKo}</div>
                            <h1 className="text-4xl font-black">{user.nickname}</h1>
                            <p className="text-secondary mt-1">{user.email || 'Verified Destiny'}</p>
                            <button onClick={handleCopyReferral} className="mt-4 flex items-center gap-2 text-sm font-bold text-foreground bg-surface border-2 border-border-color px-3 py-2 rounded-xl">
                                <Share2 className="w-4 h-4" /> 친구 초대하고 5젤리 받기
                            </button>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="p-4 rounded-3xl bg-surface border border-border-color">
                        <LogOut className="w-6 h-6" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-surface p-10 rounded-4xl border border-primary/20">
                        <span className="text-sm text-primary uppercase font-black">{t('nav.jelly')}</span>
                        <div className="mt-4 text-5xl font-black">{churu}</div>
                        <button onClick={() => setShowShop(true)} className="mt-6 w-full py-3 rounded-2xl bg-primary text-white">충전하기</button>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-surface p-10 rounded-4xl border border-border-color">
                        <span className="text-sm text-secondary uppercase font-black flex items-center justify-between">
                            <span>운명 EXP</span>
                            <Award className={`w-5 h-5 ${getLevelInfo(nyang).color}`} />
                        </span>
                        <div className="mt-4 text-5xl font-black">{nyang}</div>
                        <div className="mt-2 text-sm">다음 단계: {getLevelInfo(nyang).next === 'MAX' ? 'MAX' : `${getLevelInfo(nyang).next} XP`}</div>
                        <button onClick={handleCopyReferral} className="mt-6 w-full py-3 rounded-2xl border border-border-color flex items-center justify-center gap-2">
                            <Copy className="w-4 h-4" /> 초대 링크 복사
                        </button>
                    </motion.div>
                </div>

                <div className="space-y-5 mb-16">
                    <h2 className="text-2xl font-black">메인 메뉴</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mainMenuItems.map((item) => (
                            <button
                                key={item.label}
                                onClick={item.onClick || (() => router.push(item.href))}
                                className="bg-surface p-6 rounded-3xl border border-border-color hover:border-primary/50 transition-all text-left flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon className="w-6 h-6 text-primary" />
                                    <div>
                                        <h3 className="text-lg font-black">{item.label}</h3>
                                        <p className="text-sm text-secondary">{item.desc}</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-border-color" />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
                    {[
                        { icon: Gift, label: t('nav.more'), href: '/gift' },
                        { icon: MessageSquare, label: locale === 'ko' ? '문의하기' : 'Inquiry', href: '/inquiry' },
                        { icon: BookOpen, label: t('footer.wiki'), href: '/wiki' },
                        { icon: HelpCircle, label: t('footer.faq'), href: '/inquiry' },
                    ].map((item, i) => (
                        <Link
                            key={i}
                            href={item.href}
                            className="bg-surface p-6 rounded-3xl border border-border-color text-center hover:border-primary/30"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-background border border-border-color flex items-center justify-center mx-auto mb-3">
                                <item.icon className="w-6 h-6 text-secondary" />
                            </div>
                            <span className="text-sm font-black">{item.label}</span>
                        </Link>
                    ))}
                </div>

                <div className="text-center border-t border-border-color pt-8">
                    <p className="text-xs uppercase tracking-[0.3em] text-secondary">Secret Saju v4.5</p>
                </div>
            </div>

            <JellyShopModal isOpen={showShop} onClose={() => setShowShop(false)} onPurchaseSuccess={() => setShowShop(false)} />
        </main>
    );
}
