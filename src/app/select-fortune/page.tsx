'use client';

import { useState, useEffect } from 'react';
import { getProfiles, SajuProfile } from '@/lib/storage';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronDown, Star, Calendar, Sparkles, Crown } from 'lucide-react';

export default function SelectionPage() {
    const [profiles, setProfiles] = useState<SajuProfile[]>([]);
    const [selectedProfile, setSelectedProfile] = useState<string>('');

    useEffect(() => {
        const saved = getProfiles();
        setProfiles(saved);
        if (saved.length > 0) {
            setSelectedProfile(saved[0].id);
        }
    }, []);

    const services = [
        {
            icon: Crown,
            title: '2026 신년운세',
            subtitle: '丙午年 한 해 총운',
            description: '올해의 전체적인 흐름과 월별 핵심 조언',
            color: 'from-red-500 to-pink-600',
            badge: '일별 무료',
            badgeColor: 'bg-red-500',
            href: '/fortune',
            emoji: '🎊',
        },
        {
            icon: Calendar,
            title: '오늘의 운세',
            subtitle: '매일 새로운 운세',
            description: '오늘 하루 주의할 점과 행운의 시간대',
            color: 'from-orange-500 to-amber-600',
            badge: '무료',
            badgeColor: 'bg-green-500',
            href: '/fortune',
            emoji: '📅',
        },
        {
            icon: Sparkles,
            title: '프리미엄 운세 풀이',
            subtitle: '사주 전문 AI 풀이',
            description: '12운성, 십신, 오행 밸런스까지 한눈에',
            color: 'from-purple-500 to-violet-600',
            badge: '젤리 3개',
            badgeColor: 'bg-purple-500',
            href: '/',
            emoji: '🔮',
        },
    ];

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950">
            <div className="max-w-2xl mx-auto pb-12">
                {/* Header */}
                <div className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-black px-4 py-8 text-center">
                    <Star className="w-8 h-8 mx-auto mb-2" />
                    <h1 className="text-2xl font-bold">운세 서비스 선택</h1>
                    <p className="text-black/70 text-sm mt-1">원하는 운세를 골라보세요</p>
                </div>

                {/* Profile Selector */}
                {profiles.length > 0 && (
                    <div className="px-4 mt-6 mb-6">
                        <div className="relative">
                            <select
                                value={selectedProfile}
                                onChange={(e) => setSelectedProfile(e.target.value)}
                                className="w-full px-4 py-4 pr-10 rounded-xl bg-white/5 border border-white/10 text-white appearance-none font-medium"
                            >
                                <option value="">누구의 운세를 볼까요?</option>
                                {profiles.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} ({p.relationship})
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                )}

                {/* Service Cards */}
                <div className="px-4 space-y-4">
                    {services.map((svc, i) => (
                        <motion.div
                            key={svc.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Link href={svc.href} className="block">
                                <div className="border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all hover:scale-[1.01]">
                                    {/* Badge bar */}
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5">
                                        <span className="text-xl">{svc.emoji}</span>
                                        <span className="text-sm font-medium text-white">{svc.title}</span>
                                        <span className={`px-2 py-0.5 rounded-full ${svc.badgeColor} text-white text-xs font-bold ml-auto`}>
                                            {svc.badge}
                                        </span>
                                    </div>
                                    {/* Content */}
                                    <div className={`bg-gradient-to-br ${svc.color} p-6`}>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-2xl font-black text-white mb-1">{svc.subtitle}</h3>
                                                <p className="text-white/80 text-sm">{svc.description}</p>
                                            </div>
                                            <svc.icon className="w-12 h-12 text-white/80 flex-shrink-0" />
                                        </div>
                                    </div>
                                    {/* CTA */}
                                    <button className="w-full bg-black/50 text-white py-4 font-bold hover:bg-black/70 transition-colors text-sm">
                                        지금 확인하기 →
                                    </button>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* No profiles state */}
                {profiles.length === 0 && (
                    <div className="px-4 mt-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                            <p className="text-slate-400 mb-4">먼저 프로필을 등록해주세요</p>
                            <Link
                                href="/my-saju/add"
                                className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:from-purple-600 hover:to-pink-600 transition-all"
                            >
                                프로필 등록하기
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
