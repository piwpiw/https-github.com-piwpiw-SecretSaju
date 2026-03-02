'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Search, ChevronRight, Clock, CircleDot, ArrowLeft, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Types
type TermCategory = 'ALL' | 'BASIC' | 'STEMS' | 'BRANCHES' | 'HIDDEN' | 'STARS' | 'ENERGY';

interface Term {
    id: string;
    name: string;
    hanja: string;
    desc: string;
    category: TermCategory;
    readTime: string;
    tags: string[];
    color: string;
}

const DICTIONARY: Term[] = [
    { id: 'stems', name: '천간 (天干)', hanja: '天干', category: 'STEMS', desc: '천간은 하늘의 기운을 뜻하며 갑을병정무기경신임계의 열 가지로 분류합니다.', readTime: '5m', tags: ['#천기', '#10진법'], color: 'text-cyan-400' },
    { id: 'branches', name: '지지 (地支)', hanja: '地支', category: 'BRANCHES', desc: '지지는 계절의 순환을 표현하는 열두 가지 분류로, 자축인묘진사오미신유술해로 구성됩니다.', readTime: '5m', tags: ['#지기', '#12지신'], color: 'text-emerald-400' },
    { id: 'sipsong', name: '십성 (十星)', hanja: '十星', category: 'STARS', desc: '십성은 나와 다른 글자들 간의 역할과 관계를 해석하는 열 개의 분류입니다.', readTime: '8m', tags: ['#관계', '#심리분석'], color: 'text-rose-400' },
    { id: 'dohwa', name: '도화살 (桃花煞)', hanja: '桃花', category: 'ENERGY', desc: '대인관계에서 매력, 호감, 인기를 확장하는 에너지로 해석됩니다.', readTime: '3m', tags: ['#매력', '#인기'], color: 'text-pink-400' },
    { id: 'baekho', name: '백호살 (白虎煞)', hanja: '白虎', category: 'ENERGY', desc: '강한 의지와 결단을 만드는 공격적인 성향의 기운을 설명합니다.', readTime: '3m', tags: ['#결단력', '#카리스마'], color: 'text-slate-400' },
    { id: 'unseong', name: '12운성 (十二運星)', hanja: '運星', category: 'BASIC', desc: '기운의 생성과 소멸을 열 단계로 구분해 해석합니다.', readTime: '10m', tags: ['#라이프사이클'], color: 'text-amber-400' },
];

const CATEGORIES: { id: TermCategory; label: string }[] = [
    { id: 'ALL', label: '전체' },
    { id: 'BASIC', label: '기초' },
    { id: 'STEMS', label: '천간' },
    { id: 'BRANCHES', label: '지지' },
    { id: 'HIDDEN', label: '지장간' },
    { id: 'STARS', label: '십성' },
    { id: 'ENERGY', label: '신살' },
];

export default function EncyclopediaPage() {
    const router = useRouter();
    const [activeCategory, setActiveCategory] = useState<TermCategory>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTerms = DICTIONARY.filter((term) => {
        const matchCategory = activeCategory === 'ALL' || term.category === activeCategory;
        const matchSearch =
            term.name.includes(searchQuery) ||
            term.hanja.includes(searchQuery) ||
            term.desc.includes(searchQuery) ||
            term.tags.some((tag) => tag.includes(searchQuery));
        return matchCategory && matchSearch;
    });

    return (
        <main className="min-h-screen bg-[#050505] text-foreground relative overflow-hidden pb-40">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
                <div className="flex items-center justify-between mb-16">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-3 text-slate-500 hover:text-white transition-all group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black tracking-widest uppercase italic">BACK</span>
                    </button>
                    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                        <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Archive v4.5</span>
                    </div>
                </div>

                <div className="text-center mb-20 space-y-6">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-block relative">
                        <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full" />
                        <div className="w-20 h-20 mx-auto rounded-3xl bg-surface border border-white/10 flex items-center justify-center relative z-10 shadow-2xl">
                            <Book className="w-10 h-10 text-cyan-400" />
                        </div>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-[0.9]">
                        사주 <span className="text-cyan-400">백과사전</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto italic leading-relaxed">
                        동양철학 지식의 결정체를 담은 아카이브입니다.
                        용어를 검색하고 카테고리로 필터링해 이해를 확장하세요.
                    </p>
                </div>

                <div className="space-y-8 mb-20">
                    <div className="relative group">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="검색할 용어를 입력하세요"
                            className="w-full bg-white/[0.03] border border-white/10 rounded-3xl py-6 pl-16 pr-6 text-white text-xl font-bold placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all shadow-2xl"
                        />
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500 transition-colors" />
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-6 py-3 rounded-2xl text-sm font-black transition-all border ${
                                    activeCategory === cat.id
                                        ? 'bg-cyan-500 text-black border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                                        : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredTerms.map((term, i) => (
                            <motion.div
                                key={term.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-surface border border-white/5 rounded-4xl p-8 hover:border-cyan-500/30 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                    <Zap className={`w-24 h-24 ${term.color}`} />
                                </div>

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-8">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${term.color} bg-white/5 px-3 py-1 rounded-full border border-white/10`}>
                                            {term.category}
                                        </span>
                                        <div className="flex items-center gap-2 text-slate-600 text-[10px] font-black">
                                            <Clock className="w-3 h-3" /> {term.readTime} READ
                                        </div>
                                    </div>

                                    <div className="flex items-baseline gap-3 mb-4">
                                        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase group-hover:text-cyan-400 transition-colors">
                                            {term.name}
                                        </h3>
                                        <span className="text-lg text-slate-500">({term.hanja})</span>
                                    </div>

                                    <p className="text-slate-400 text-sm font-medium leading-relaxed italic mb-8">
                                        {term.desc}
                                    </p>

                                    <div className="mt-auto flex items-center justify-between">
                                        <div className="flex flex-wrap gap-2">
                                            {term.tags.map((tag) => (
                                                <span key={tag} className="text-[10px] font-black text-slate-600 uppercase">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-background border border-border-color flex items-center justify-center group-hover:bg-cyan-500 group-hover:border-cyan-500 transition-all">
                                            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-black" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredTerms.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                        <CircleDot className="w-12 h-12 text-slate-800 mx-auto mb-6 opacity-30" />
                        <p className="text-slate-500 font-black uppercase tracking-widest italic">No Data Nodes Found</p>
                    </motion.div>
                )}
            </div>
        </main>
    );
}
