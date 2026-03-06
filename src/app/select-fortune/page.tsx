'use client';

import { useState, useEffect } from 'react';
import { getProfiles, SajuProfile } from '@/lib/storage';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Star, Calendar, Sparkles, Crown, ChevronRight, Gem, Flame, Rocket, HelpCircle, Sun } from 'lucide-react';
import { useLocale } from '@/lib/i18n';

export default function SelectionPage() {
    const [profiles, setProfiles] = useState<SajuProfile[]>([]);
    const [selectedProfile, setSelectedProfile] = useState<string>('');
    const { t, locale } = useLocale();

    useEffect(() => {
        const saved = getProfiles();
        setProfiles(saved);
        if (saved.length > 0) {
            setSelectedProfile(saved[0].id);
        }
    }, []);

    const services = [
        {
            icon: Sun,
            title: locale === 'ko' ? '오늘의 운세' : '오늘의 운세',
            subtitle: locale === 'ko' ? '매일 업데이트 되는 맞춤 운세' : '매일 업데이트되는 맞춤 운세',
            description: locale === 'ko'
              ? '당신만을 위한 일일 애정운, 재물운, 그리고 프리미엄 딥 인사이트를 분석합니다.'
              : '당신만을 위한 일일 애정운, 재물운, 그리고 프리미엄 심층 인사이트를 분석합니다.',
            badge: locale === 'ko' ? '매일 무료' : '매일 무료',
            href: '/daily',
            color: 'from-amber-400 to-orange-500',
            bgGlow: 'from-amber-500/20',
        },
        {
            icon: Crown,
            title: locale === 'ko' ? '2026 신년운세' : '2026 신년운세',
            subtitle: locale === 'ko' ? '비범한 한 해의 예측' : '한 해의 운명 전망',
            description: locale === 'ko'
              ? '올해 당신이 맞이할 가장 거대한 운명의 파동과 조언을 확인하세요.'
              : '올해 맞이할 가장 큰 운명 파동과 조언을 미리 확인하세요.',
            badge: locale === 'ko' ? '기본 제공' : '기본 제공',
            href: '/fortune',
            color: 'from-yellow-400 to-amber-600',
            bgGlow: 'from-yellow-500/20',
        },
        {
            icon: Sparkles,
            title: locale === 'ko' ? '프리미엄 사주풀이' : '프리미엄 사주풀이',
            subtitle: locale === 'ko' ? '가장 깊은 차원의 분석' : '가장 깊은 차원의 분석',
            description: locale === 'ko'
              ? '12운성과 십신, 오행 밸런스까지 스캐닝하여 당신의 본질을 꿰뚫습니다.'
              : '12운성과 십신, 오행 밸런스까지 분석해 당신의 본질을 꿰뚫어 드립니다.',
            badge: locale === 'ko' ? '젤리 3개' : '젤리 3개',
            href: '/saju',
            color: 'from-primary to-purple-600',
            bgGlow: 'from-primary/20',
        },
        {
            icon: Flame,
            title: locale === 'ko' ? '궁합 열람소' : '궁합 열람소',
            subtitle: locale === 'ko' ? '우리의 싱크로율' : '우리의 운명 동기율',
            description: locale === 'ko'
              ? '두 운명의 얽힘을 계산하여 관계의 주도권과 주의점을 분석합니다.'
              : '두 운명의 얽힘을 계산해 관계의 주도권과 주의점을 분석합니다.',
            badge: locale === 'ko' ? '젤리 2개' : '젤리 2개',
            href: '/compatibility',
            color: 'from-rose-400 to-pink-600',
            bgGlow: 'from-rose-500/20',
        },
        {
            icon: Rocket,
            title: locale === 'ko' ? '인연 대시보드' : '인연 대시보드',
            subtitle: locale === 'ko' ? '내 인맥의 중심' : '내 인연의 중심',
            description: locale === 'ko'
              ? '저장된 모든 사람들의 사주를 연결하여 당신만의 운명망을 구성합니다.'
              : '저장된 사람들의 사주를 연결해 나만의 운명망을 구성합니다.',
            badge: locale === 'ko' ? '기본 무료' : '기본 무료',
            href: '/dashboard',
            color: 'from-cyan-400 to-blue-600',
            bgGlow: 'from-cyan-500/20',
        },
    ];

    return (
        <main className="min-h-screen relative overflow-hidden pb-40">
            <div className="max-w-5xl mx-auto px-6 py-16 relative z-10">
                {/* Header */}
                <div className="text-center md:text-left mb-20 border-b border-border-color pb-16">
                    <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-flex px-4 py-2 rounded-full mb-6 bg-surface border border-border-color">
                        <span className="text-sm font-bold text-primary tracking-widest leading-none uppercase">{t('select.title')}</span>
                    </motion.div>
        <h1 className="text-5xl md:text-7xl font-black text-foreground italic tracking-tighter uppercase mb-4">
                        {locale === 'ko' ? '운명' : '운명'} <span className="text-primary italic">{locale === 'ko' ? '서비스' : '서비스'}</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-secondary font-medium italic opacity-70 max-w-2xl">{t('select.desc')}</p>
                </div>

                {/* Profile Selector */}
                {profiles.length > 0 && (
                    <div className="mb-16">
                        <label className="text-xl font-bold flex items-center gap-4 text-secondary mb-6 pl-2">
                            <Star className="w-6 h-6 text-primary" /> {locale === 'ko' ? '서비스 대상 변경' : '서비스 대상 변경'}
                        </label>
                        <div className="relative group max-w-md">
                            <select
                                value={selectedProfile}
                                onChange={(e) => setSelectedProfile(e.target.value)}
                                className="w-full bg-surface border-2 border-border-color rounded-4xl px-8 py-6 text-foreground font-black text-2xl focus:outline-none focus:border-primary transition-all appearance-none italic shadow-lg hover:shadow-primary/10"
                            >
                                <option value="" disabled>{locale === 'ko' ? '누구의 운세를 볼까요?' : '누구의 운세를 볼까요?'}</option>
                                {profiles.map((p) => (
                                    <option key={p.id} value={p.id} className="bg-background text-foreground font-medium">
                                        {p.name} [{p.relationship}]
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border-color shadow-sm group-hover:bg-primary/10 group-hover:border-primary/30 transition-all">
                                <ChevronDown className="w-6 h-6 text-secondary group-hover:text-primary transition-colors" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Extra Space when no profiles (Fallback handled below) */}
                {profiles.length === 0 && <div className="h-10" />}

                {/* Premium Service Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <AnimatePresence>
                        {services.map((svc, i) => (
                            <motion.div
                                key={svc.title}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                            >
                                <Link href={selectedProfile ? `${svc.href}?profileId=${selectedProfile}` : svc.href} className="block group h-full">
                                    <div className="bg-surface rounded-5xl p-10 border border-border-color h-full flex flex-col relative overflow-hidden transition-all duration-500 hover:border-primary/50 shadow-xl hover:shadow-primary/10 group-hover:-translate-y-2">
                                        <div className={`absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br ${svc.bgGlow} rounded-full blur-3xl opacity-30 group-hover:opacity-70 transition-opacity duration-700`} />

                                        <div className="flex items-start justify-between mb-8 relative z-10">
                                            <div className={`w-20 h-20 rounded-4xl bg-gradient-to-br ${svc.color} flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                                <svc.icon className="w-10 h-10 text-white" />
                                            </div>
                                    <span className="px-5 py-2 rounded-full text-sm font-black bg-background border border-border-color tracking-widest uppercase text-secondary group-hover:text-foreground transition-colors">
                                                {svc.badge}
                                            </span>
                                        </div>

                                        <div className="flex-1 relative z-10">
                                            <h3 className="text-3xl font-black text-foreground mb-2 tracking-tight group-hover:text-primary transition-colors">{svc.title}</h3>
                                            <p className="text-lg font-bold text-secondary italic opacity-80 mb-6">{svc.subtitle}</p>
                                            <p className="text-lg text-secondary leading-relaxed opacity-90 font-medium">
                                                {svc.description}
                                            </p>
                                        </div>

                                        <div className="mt-10 flex items-center justify-between border-t border-border-color pt-8 relative z-10">
                                            <span className="text-sm font-black text-primary tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-4 group-hover:translate-x-0 duration-300">
                                            {locale === 'ko' ? '자세히 보기' : '자세히 보기'}
                                            </span>
                                            <div className="w-12 h-12 rounded-full bg-background border border-border-color flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all shadow-sm">
                                                <ChevronRight className="w-6 h-6 text-secondary group-hover:text-white transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Additional Utilities Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-16 border-t border-border-color">
                    {[
                        { icon: Gem, label: locale === 'ko' ? '젤리 충전소' : '젤리 충전소', href: '/shop', badge: 'HOT' },
                        { icon: HelpCircle, label: locale === 'ko' ? '이용 가이드' : '이용 가이드', href: '/wiki' },
                        { icon: Star, label: locale === 'ko' ? '운명 리뷰' : '운명 리뷰', href: '/inquiry' },
                        { icon: Flame, label: locale === 'ko' ? '특별 부적' : '특별 부적', href: '/gift' },
                    ].map((item, i) => (
                        <Link key={i} href={item.href} className="bg-surface rounded-4xl p-8 border border-border-color flex flex-col items-center justify-center text-center gap-4 group hover:border-primary/30 transition-all hover:bg-background shadow-md hover:shadow-lg">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-3xl bg-background border border-border-color flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                                    <item.icon className="w-8 h-8 text-secondary group-hover:text-primary transition-colors" />
                                </div>
                                {item.badge && (
                                    <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-bounce shadow-md">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <span className="text-lg font-black tracking-tight text-secondary group-hover:text-foreground">{item.label}</span>
                        </Link>
                    ))}
                </div>

                {/* No profiles state */}
                {profiles.length === 0 && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-16 bg-surface rounded-5xl p-16 text-center border-2 border-dashed border-primary/30 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-700" />
                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-primary/10 rounded-4xl flex items-center justify-center mx-auto mb-10 border border-primary/20">
                                <Sparkles className="w-12 h-12 text-primary animate-pulse" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
                                {locale === 'ko' ? '아직 등록된 사주 노드가 없습니다' : '아직 등록된 사주 노드가 없습니다'}
                            </h2>
                            <p className="text-xl text-secondary mb-10 font-medium">
                                {locale === 'ko' ? '분석을 시작하려면 당신의 프로필을 먼저 만들어주세요.' : '분석을 시작하려면 프로필을 먼저 만들어주세요.'}
                            </p>
                            <Link href="/my-saju/add" className="inline-flex items-center gap-4 px-10 py-6 rounded-4xl bg-primary text-white font-black text-xl hover:scale-105 transition-all shadow-xl shadow-primary/20 uppercase tracking-widest">
                                {locale === 'ko' ? '프로필 등록하기' : '프로필 등록하기'} <ChevronRight className="w-6 h-6" />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </div>
        </main>
    );
}
