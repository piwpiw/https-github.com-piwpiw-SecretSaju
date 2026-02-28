"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Book, ChevronRight, ArrowLeft, Terminal, Cpu, Layout, Activity, Code, Globe, Shield, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/i18n';

interface DocLink {
    titleKo: string;
    titleEn: string;
    slug: string;
    categoryKo: string;
    categoryEn: string;
    icon: any;
    color: string;
}

export default function WikiPage() {
    const router = useRouter();
    const { t, locale } = useLocale();

    const docs: DocLink[] = [
        { titleKo: 'CEO 대시보드', titleEn: 'CEO Dashboard', slug: 'ceo-dashboard', categoryKo: '비즈니스', categoryEn: 'Business', icon: Activity, color: 'text-amber-500' },
        { titleKo: 'CTO 전략', titleEn: 'CTO Strategy', slug: 'cto-technical-strategy', categoryKo: '비즈니스', categoryEn: 'Business', icon: Cpu, color: 'text-blue-500' },
        { titleKo: '임원 요약', titleEn: 'Exec Summary', slug: 'executive-summary', categoryKo: '비즈니스', categoryEn: 'Business', icon: Shield, color: 'text-emerald-500' },
        { titleKo: '개발자 온보딩', titleEn: 'Dev Onboarding', slug: 'developer-onboarding', categoryKo: '개발', categoryEn: 'Development', icon: Code, color: 'text-purple-500' },
        { titleKo: '코딩 가이드', titleEn: 'Coding Standards', slug: 'coding-standards', categoryKo: '개발', categoryEn: 'Development', icon: Terminal, color: 'text-cyan-500' },
        { titleKo: '아키텍처', titleEn: 'Architecture', slug: 'architecture-overview', categoryKo: '개발', categoryEn: 'Development', icon: Layout, color: 'text-pink-500' },
        { titleKo: 'Git 작업 방식', titleEn: 'Git Workflow', slug: 'git-workflow', categoryKo: '개발', categoryEn: 'Development', icon: Globe, color: 'text-orange-500' },
        { titleKo: 'API 레퍼런스', titleEn: 'API Reference', slug: 'api-reference', categoryKo: '개발', categoryEn: 'Development', icon: Book, color: 'text-indigo-500' },
    ];

    const categoryKeys = Array.from(new Set(docs.map(d => locale === 'ko' ? d.categoryKo : d.categoryEn)));

    const groupedDocs = docs.reduce((acc, doc) => {
        const cat = locale === 'ko' ? doc.categoryKo : doc.categoryEn;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(doc);
        return acc;
    }, {} as Record<string, DocLink[]>);

    return (
        <main className="min-h-screen relative overflow-hidden pb-40 text-foreground">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,var(--primary)_0%,transparent_30%)] opacity-5" />
            <div className="max-w-5xl mx-auto px-6 py-16 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 border-b border-border-color pb-16">
                    <div>
                        <button
                            onClick={() => router.push('/')}
                            className="flex items-center gap-3 text-lg font-bold text-secondary hover:text-foreground transition-all group mb-8"
                        >
                            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                            {t('common.back')}
                        </button>
                        <motion.div
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="inline-flex px-4 py-2 rounded-full mb-6 bg-surface border border-border-color"
                        >
                            <span className="text-sm font-bold text-primary tracking-widest leading-none uppercase">
                                {locale === 'ko' ? '지식 베이스' : 'Knowledge Base'}
                            </span>
                        </motion.div>
                        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mb-2">
                            {locale === 'ko' ? '사주' : 'Saju'} <span className="text-primary italic">{locale === 'ko' ? 'Wiki' : 'Wiki'}</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-secondary font-medium italic opacity-70">
                            {locale === 'ko' ? '사주 도메인 전체 문서·기술 명세를 정리한 지식 공간입니다.' : 'Comprehensive technical specifications & docs'}
                        </p>
                    </div>

                    <div className="flex items-center gap-8 bg-surface p-6 rounded-3xl border border-border-color shadow-lg">
                        <div className="text-right border-r border-border-color pr-6">
                            <div className="text-sm font-bold text-secondary uppercase tracking-widest mb-1">{locale === 'ko' ? '최종 갱신' : 'Last Updated'}</div>
                            <div className="text-xl font-black">2026.02.26</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold text-secondary uppercase tracking-widest mb-1">{locale === 'ko' ? '상태' : 'Status'}</div>
                            <div className="text-xl font-black text-emerald-500 flex items-center gap-2">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                                {locale === 'ko' ? '활성' : 'Active'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-16">
                    {categoryKeys.map((cat, idx) => (
                        <motion.div
                            key={cat}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            className="space-y-8"
                        >
                            <div className="flex items-center gap-6 border-b-2 border-border-color pb-4">
                                <div className="w-3 h-10 bg-primary rounded-full" />
                                <h2 className="text-4xl font-black italic tracking-tighter uppercase text-foreground">{cat}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {(groupedDocs[cat] || []).length > 0 ? (
                                    groupedDocs[cat].map((doc) => (
                                        <Link
                                            key={doc.slug}
                                            href={`/wiki/${doc.slug}`}
                                            className="bg-surface p-8 rounded-4xl border border-border-color hover:border-primary/50 group transition-all shadow-md hover:shadow-xl hover:-translate-y-1 relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
                                                <doc.icon className="w-24 h-24 text-primary" />
                                            </div>
                                            <div className="flex flex-col h-full relative z-10">
                                                <div className="w-16 h-16 rounded-2xl bg-background border border-border-color flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-sm">
                                                    <doc.icon className={`w-8 h-8 ${doc.color}`} />
                                                </div>
                                                <div className="flex items-end justify-between mt-auto">
                                                    <span className="text-2xl font-black tracking-tight text-secondary group-hover:text-foreground transition-colors">
                                                        {locale === 'ko' ? doc.titleKo : doc.titleEn}
                                                    </span>
                                                    <ChevronRight className="w-8 h-8 text-border-color group-hover:text-primary group-hover:translate-x-2 transition-all" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="col-span-full p-12 rounded-4xl bg-surface border border-dashed border-border-color flex flex-col items-center justify-center gap-4">
                                        <Sparkles className="w-10 h-10 text-secondary opacity-50" />
                                        <span className="text-xl font-bold text-secondary uppercase tracking-widest">{locale === 'ko' ? '문서 없음' : 'No Documents'}</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-32 p-10 rounded-4xl bg-background border-2 border-border-color backdrop-blur-xl shadow-xl flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex gap-3">
                            <div className="w-4 h-4 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                            <div className="w-4 h-4 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                            <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        </div>
                        <div className="h-2 w-24 bg-border-color rounded-full hidden sm:block" />
                        <span className="text-xl font-black text-secondary tracking-widest uppercase hidden sm:block">Secret Node</span>
                    </div>
                    <div className="text-right text-lg">
                        <p className="font-black text-primary italic">&gt; LOAD_COMPLETE_</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
