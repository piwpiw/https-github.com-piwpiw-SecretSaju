"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Book, Search, ChevronRight, Hash, Clock, CircleDot } from "lucide-react";

// Types
type TermCategory = "전체" | "기초 용어" | "천간" | "지지" | "지장간" | "십성" | "운성" | "신강약";

interface Term {
    id: string;
    name: string;
    hanja: string;
    desc: string;
    category: TermCategory;
    readTime: string;
    tags: string[];
}

const DICTIONARY: Term[] = [
    {
        id: "chuk",
        name: "축토",
        hanja: "丑",
        category: "지지",
        desc: "소띠, 새벽 1시부터 3시, 겨울의 중간.",
        readTime: "28분",
        tags: ["#축토", "#사주", "#명리학"]
    },
    {
        id: "hae",
        name: "해수",
        hanja: "亥",
        category: "지지",
        desc: "돼지띠, 밤 9시부터 11시, 겨울의 마지막.",
        readTime: "28분",
        tags: ["#해수", "#사주", "#명리학"]
    },
    {
        id: "in",
        name: "인목",
        hanja: "寅",
        category: "지지",
        desc: "호랑이띠, 새벽 3시부터 5시, 봄의 시작.",
        readTime: "28분",
        tags: ["#인목", "#사주", "#명리학"]
    },
    {
        id: "sipsung",
        name: "십성",
        hanja: "十星",
        category: "기초 용어",
        desc: "사주에서 나와 다른 오행의 관계를 10가지로 분류한 것 (비견, 겁재, 식신 등).",
        readTime: "45분",
        tags: ["#십성", "#육친", "#사주기초"]
    },
    {
        id: "chungang",
        name: "천간",
        hanja: "天干",
        category: "천간",
        desc: "하늘의 기운을 뜻하는 10개의 글자. 갑을병정무기경신임계.",
        readTime: "30분",
        tags: ["#천간", "#갑을병정"]
    },
];

const CATEGORIES: TermCategory[] = [
    "전체", "기초 용어", "천간", "지지", "지장간", "십성", "운성", "신강약"
];

export default function EncyclopediaPage() {
    const [activeCategory, setActiveCategory] = useState<TermCategory>("전체");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredTerms = DICTIONARY.filter(term => {
        const matchCategory = activeCategory === "전체" || term.category === activeCategory;
        const matchSearch = term.name.includes(searchQuery) || term.hanja.includes(searchQuery) || term.desc.includes(searchQuery);
        return matchCategory && matchSearch;
    });

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-6 pb-20">
            <div className="max-w-4xl mx-auto px-4">

                {/* Header Area */}
                <div className="text-center mb-10 pt-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 mb-6"
                    >
                        <Book className="w-8 h-8 text-cyan-400" />
                    </motion.div>
                    <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
                        사주 용어 사전
                    </h1>
                    <p className="text-slate-400">
                        어렵게만 느껴졌던 사주 용어들을 쉽고 명쾌하게 이해해보세요.<br className="hidden md:block" />
                        체계적인 카테고리별 분류로 사주 공부를 시작하세요.
                    </p>
                </div>

                {/* Search & Filter */}
                <div className="mb-10 space-y-6">
                    <div className="relative max-w-xl mx-auto">
                        <input
                            type="text"
                            placeholder="궁금한 용어를 검색해보세요... (예: 천간, 축토)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 shadow-lg"
                        />
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat
                                        ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Term List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTerms.length > 0 ? (
                        filteredTerms.map((term, i) => (
                            <motion.div
                                key={term.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-xs font-bold text-cyan-400 bg-cyan-400/10 px-2.5 py-1 rounded-md">
                                        {term.category}
                                    </span>
                                    <div className="flex items-center text-slate-500 text-xs gap-1">
                                        <Clock className="w-3 h-3" />
                                    </div>
                                </div>

                                <div className="flex items-end gap-3 mb-3">
                                    <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                                        {term.name}
                                    </h3>
                                    <span className="text-xl text-slate-500 font-serif pb-1">
                                        {term.hanja}
                                    </span>
                                </div>

                                <p className="text-slate-400 text-sm leading-relaxed mb-6 h-10 line-clamp-2">
                                    {term.desc}
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex flex-wrap gap-2">
                                        {term.tags.map(tag => (
                                            <span key={tag} className="text-xs text-slate-500 flex items-center gap-0.5">
                                                <Hash className="w-3 h-3" /> {tag.replace('#', '')}
                                            </span>
                                        ))}
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <CircleDot className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                            <h3 className="text-white font-medium text-lg mb-2">결과가 없습니다</h3>
                            <p className="text-slate-500 text-sm">다른 키워드로 검색하거나 카테고리를 변경해보세요.</p>
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}
