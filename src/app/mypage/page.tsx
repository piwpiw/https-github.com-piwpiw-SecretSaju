'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { getUserFromCookie, clearUserSession, isLoggedIn } from '@/lib/kakao-auth';
import KakaoLoginButton from '@/components/KakaoLoginButton';
import { User, Gift, MessageSquare, LogOut, History } from 'lucide-react';
import Link from 'next/link';
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

    useEffect(() => {
        // Check authentication status
        const userData = getUserFromCookie();
        setUser(userData);
        setIsLoading(false);
    }, []);

    const handleCharge = () => {
        // Mock charging
        addChuru(100);
        alert('100츄르가 충전되었습니다!');
    };

    const handleLogout = () => {
        clearUserSession();
        setUser(null);
        router.push('/');
    };

    const menuItems = [
        { icon: History, label: '사용내역', href: '/usage-history' },
        { icon: Gift, label: '선물하기', href: '/gift' },
        { icon: MessageSquare, label: '문의하기', href: '/inquiry' },
        { icon: LogOut, label: '로그아웃', href: '#', onClick: handleLogout },
    ];

    // Loading state
    if (isLoading) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-foreground">로딩 중...</div>
            </main>
        );
    }

    // Login gate
    if (!user) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full glass rounded-2xl p-8 border border-white/10"
                >
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-10 h-10 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground mb-2">로그인이 필요합니다</h1>
                        <p className="text-zinc-400 text-sm">
                            마이페이지를 이용하려면<br />
                            카카오 계정으로 로그인해주세요
                        </p>
                    </div>
                    <KakaoLoginButton />
                    <div className="mt-6 text-center">
                        <Link href="/" className="text-sm text-primary hover:underline">
                            홈으로 돌아가기
                        </Link>
                    </div>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="bg-green-600 text-white px-4 py-6">
                    <h1 className="text-xl font-bold mb-1">마이페이지</h1>
                </div>

                {/* User Info */}
                <div className="px-4 py-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        {user.profileImage ? (
                            <img
                                src={user.profileImage}
                                alt={user.nickname}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                <User className="w-6 h-6 text-primary" />
                            </div>
                        )}
                        <div>
                            <p className="text-foreground font-medium">{user.nickname}님</p>
                            <p className="text-sm text-zinc-500">{user.email || '카카오 계정'}</p>
                        </div>
                    </div>
                </div>
                {/* Wallet Cards */}
                <div className="p-4 space-y-4">
                    {/* Churu Card */}
                    <div className="glass rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🐟</span>
                            <h2 className="font-display text-lg text-foreground">내 츄르</h2>
                            <span className="ml-auto font-display text-2xl text-primary">{churu}</span>
                        </div>
                        {churu === 0 && (
                            <p className="text-sm text-zinc-400 mb-4">츄르가 없다냥!</p>
                        )}
                        <button
                            onClick={handleCharge}
                            className="w-full py-3 rounded-xl bg-yellow-400 text-black font-bold hover:bg-yellow-500"
                        >
                            츄르 충전하기
                        </button>
                    </div>

                    {/* Nyang Card */}
                    <div className="glass rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🐾</span>
                            <h2 className="font-display text-lg text-foreground">내 냥</h2>
                            <span className="ml-auto font-display text-2xl text-secondary">{nyang}</span>
                        </div>
                        <p className="text-xs text-zinc-500 mb-4">
                            냥은 <span className="text-secondary">오뚜기 운세 프리미엄</span>에 사용할 수 있어요!
                        </p>
                        <button className="w-full py-3 rounded-xl bg-pink-500 text-white font-bold hover:bg-pink-600">
                            냥을 츄르로 바꾸기
                        </button>
                    </div>
                </div>

                {/* Menu */}
                <div className="px-4 py-2">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            onClick={item.onClick}
                            className="flex items-center gap-4 px-4 py-4 border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                            <item.icon className="w-5 h-5 text-primary" />
                            <span className="flex-1 text-foreground">{item.label}</span>
                            <span className="text-zinc-500">›</span>
                        </Link>
                    ))}
                </div>

                {/* Footer Links */}
                <div className="px-4 py-8 flex justify-center gap-4 text-sm text-zinc-500">
                    <button className="hover:text-foreground">회사소개</button>
                    <button className="hover:text-foreground">이용약관</button>
                    <button className="hover:text-foreground">개인정보 처리방침</button>
                </div>
            </div>
        </main>
    );
}
