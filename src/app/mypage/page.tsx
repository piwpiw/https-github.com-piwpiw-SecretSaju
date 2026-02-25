'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { getUserFromCookie, clearUserSession } from '@/lib/kakao-auth';
import KakaoLoginButton from '@/components/KakaoLoginButton';
import JellyShopModal from '@/components/shop/JellyShopModal';
import { User, Gift, MessageSquare, LogOut, History, ShoppingBag, FileText, Shield, Star, TrendingUp, ChevronRight, Gem, BookOpen, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface UserData {
    id: number;
    nickname: string;
    email?: string;
    profileImage?: string;
}

export default function MyPage() {
    const router = useRouter();
    const { churu, nyang, addChuru } = useWallet();
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showShop, setShowShop] = useState(false);

    useEffect(() => {
        const userData = getUserFromCookie();
        setUser(userData);
        setIsLoading(false);
    }, []);

    const handleLogout = () => {
        clearUserSession();
        setUser(null);
        router.push('/');
    };

    // Loading state
    if (isLoading) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">로딩 중...</p>
                </div>
            </main>
        );
    }

    // Login gate
    if (!user) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 flex shadow-2xl items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8"
                >
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                            <User className="w-10 h-10 text-purple-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-3">3초만에 시작하기</h1>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            사주라떼의 모든 기능을 이용하려면<br />
                            안전하게 소셜 계정으로 로그인해주세요
                        </p>
                    </div>

                    <div className="space-y-3">
                        {/* Kakao Login */}
                        <KakaoLoginButton className="shadow-lg" />

                        {/* Naver Login (UI Only) */}
                        <motion.button
                            onClick={() => alert("네이버 로그인은 심사 진행 중입니다. 카카오 로그인을 이용해주세요.")}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3 px-6 rounded-xl bg-[#03C75A] hover:bg-[#02b351] transition flex items-center justify-center gap-3 font-medium shadow-lg"
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.439 10.743L6.963 2H2v16h5.086V8.627l6.505 8.811H18.5V2h-5.061v8.743z" fill="#ffffff" />
                            </svg>
                            <span className="text-white font-bold">네이버 로그인</span>
                        </motion.button>

                        {/* Google Login (UI Only) */}
                        <motion.button
                            onClick={() => alert("Google 로그인은 승인 대기 중입니다. 카카오 로그인을 이용해주세요.")}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3 px-6 rounded-xl bg-white hover:bg-gray-100 transition flex items-center justify-center gap-3 font-medium shadow-lg"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span className="text-black font-bold">Google 로그인</span>
                        </motion.button>
                    </div>

                    <div className="mt-8 text-center border-t border-white/5 pt-6">
                        <p className="text-xs text-slate-500 mb-3">로그인 시 이용약관과 개인정보 처리방침에 동의하게 됩니다.</p>
                        <Link href="/" className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium">
                            ← 홈으로 돌아가기
                        </Link>
                    </div>
                </motion.div>
            </main>
        );
    }

    const mainMenuItems = [
        { icon: ShoppingBag, label: '젤리 충전소', desc: '젤리를 충전하고 프리미엄 콘텐츠를 즐기세요', href: '#', onClick: () => setShowShop(true), badge: '충전' },
        { icon: Star, label: '나의 사주 결과', desc: '저장된 사주 풀이 결과 확인', href: '/my-saju/list', badge: null },
        { icon: TrendingUp, label: '신년운세', desc: '2026년 나의 운세 확인하기', href: '/fortune', badge: 'NEW' },
        { icon: History, label: '이용내역 / 결제내역', desc: '젤리 사용 및 충전 이력', href: '/mypage', badge: null },
    ];

    const subMenuItems = [
        { icon: Gift, label: '친구에게 선물하기', href: '/gift' },
        { icon: MessageSquare, label: '문의하기', href: '/inquiry' },
        { icon: BookOpen, label: '사주 백과사전', href: '/wiki' },
        { icon: HelpCircle, label: '자주 묻는 질문', href: '/inquiry' },
    ];

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950">
            <div className="max-w-2xl mx-auto pb-12">
                {/* Header Profile Section */}
                <div className="relative pt-12 pb-8 px-6 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-700/20 via-black to-slate-950 z-0"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 blur-[100px] rounded-full pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none"></div>

                    <div className="relative z-10 flex items-center gap-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full blur-md opacity-50"></div>
                            {user.profileImage ? (
                                <Image
                                    src={user.profileImage}
                                    alt={user.nickname}
                                    width={96}
                                    height={96}
                                    className="relative w-24 h-24 rounded-full object-cover border-4 border-black shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                                    unoptimized
                                />
                            ) : (
                                <div className="relative w-24 h-24 rounded-full bg-slate-900 border-4 border-black flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                                    <User className="w-10 h-10 text-white/50" />
                                </div>
                            )}
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-tr from-yellow-400 to-amber-600 rounded-full border-2 border-black flex items-center justify-center shadow-lg">
                                <span className="text-xs">👑</span>
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="inline-flex px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono text-cyan-400 tracking-widest mb-2 shadow-inner">
                                VIP 프리미엄 회원
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tight mb-1 drop-shadow-md">
                                {user.nickname}
                            </h1>
                            <p className="text-slate-400 text-sm font-medium">{user.email || 'SNS 연동 계정'}</p>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="self-start p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-slate-400 hover:text-white group"
                            title="로그아웃"
                        >
                            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Premium Wallet Section */}
                <div className="px-6 -mt-6 relative z-20">
                    <div className="grid grid-cols-2 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-yellow-500/10 to-amber-500/5 backdrop-blur-2xl border border-yellow-500/20 rounded-[2rem] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:border-yellow-500/40 hover:shadow-[0_10px_40px_rgba(234,179,8,0.15)] transition-all group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl drop-shadow-md">🐟</span>
                                    <span className="text-xs text-yellow-500/90 font-bold tracking-widest uppercase">Jelly</span>
                                </div>
                            </div>
                            <div className="flex items-end justify-between">
                                <p className="text-4xl font-black text-white group-hover:scale-105 transition-transform origin-left">{churu}</p>
                                <span className="text-yellow-500/50 text-xs">개</span>
                            </div>
                            <button
                                onClick={() => setShowShop(true)}
                                className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-black text-sm tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_5px_20px_rgba(234,179,8,0.3)]"
                            >
                                + 충전하기
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-br from-pink-500/10 to-rose-500/5 backdrop-blur-2xl border border-pink-500/20 rounded-[2rem] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:border-pink-500/40 hover:shadow-[0_10px_40px_rgba(236,72,153,0.15)] transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-2xl rounded-full"></div>
                            <div className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl drop-shadow-md">🐾</span>
                                        <span className="text-xs text-pink-500/90 font-bold tracking-widest uppercase">Bonus</span>
                                    </div>
                                </div>
                                <div className="flex items-end justify-between">
                                    <p className="text-4xl font-black text-white group-hover:scale-105 transition-transform origin-left">{nyang}</p>
                                    <span className="text-pink-500/50 text-xs">개</span>
                                </div>
                                <div className="mt-5 text-center py-3 bg-white/5 rounded-xl border border-white/5">
                                    <p className="text-xs text-slate-400 font-medium">프리미엄 전용</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Main Menu */}
                <div className="px-6 mt-10">
                    <div className="flex items-center gap-2 mb-4 px-2">
                        <div className="w-1 h-4 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                        <h2 className="text-sm font-black text-white tracking-widest uppercase shadow-black drop-shadow-md">Premium Service</h2>
                    </div>
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden p-2">
                        {mainMenuItems.map((item, i) => (
                            <Link
                                key={i}
                                href={item.href}
                                onClick={item.onClick}
                                className="group flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-white/10 transition-all"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 flex items-center justify-center flex-shrink-0 border border-white/5 group-hover:scale-110 transition-transform">
                                    <item.icon className="w-5 h-5 text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-base font-bold mb-0.5 group-hover:text-purple-300 transition-colors">{item.label}</p>
                                    <p className="text-slate-500 text-xs truncate font-medium">{item.desc}</p>
                                </div>
                                {item.badge && (
                                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-black tracking-widest shadow-lg">
                                        {item.badge}
                                    </span>
                                )}
                                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Sub Menu */}
                <div className="px-6 mt-8">
                    <div className="flex items-center gap-2 mb-4 px-2">
                        <div className="w-1 h-4 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                        <h2 className="text-sm font-black text-white tracking-widest uppercase shadow-black drop-shadow-md">Support</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {subMenuItems.map((item, i) => (
                            <Link
                                key={i}
                                href={item.href}
                                className="group flex flex-col items-center justify-center gap-3 p-5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 hover:border-cyan-500/30 transition-all hover:-translate-y-1"
                            >
                                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:scale-110 transition-all">
                                    <item.icon className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                                </div>
                                <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 mt-12 pb-6">
                    <div className="flex justify-center gap-6 text-[10px] tracking-widest font-mono text-slate-500 mb-6">
                        <Link href="/terms" className="hover:text-cyan-400 transition-colors">TOS</Link>
                        <span className="text-white/20">|</span>
                        <Link href="/privacy" className="hover:text-cyan-400 transition-colors">PRIVACY</Link>
                        <span className="text-white/20">|</span>
                        <Link href="/refund" className="hover:text-cyan-400 transition-colors">REFUND</Link>
                    </div>
                    <div className="text-center">
                        <p className="text-slate-600 text-[10px] font-mono tracking-widest">© 2026 SECRET SAJU. ALL RIGHTS RESERVED.</p>
                        <div className="w-12 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent mx-auto mt-4 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Jelly Shop Modal */}
            <JellyShopModal
                isOpen={showShop}
                onClose={() => setShowShop(false)}
                onPurchaseSuccess={() => setShowShop(false)}
            />
        </main>
    );
}
