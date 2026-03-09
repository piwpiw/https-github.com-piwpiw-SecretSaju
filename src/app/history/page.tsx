'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    History, ArrowLeft, Clock, ChevronRight,
    Trash2, Database, Search, Calendar, Zap, Sparkles, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/app/utils';
import Link from 'next/link';

import { getAnalysisHistory, deleteAnalysisFromHistory, getAnalysisTypeInfo } from '@/lib/app/analysis-history';
import { AnalysisHistoryLog } from '@/types/history';

export default function HistoryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<AnalysisHistoryLog[]>([]);
    const [filterOpen, setFilterOpen] = useState(false);
    const [dDayRange, setDDayRange] = useState(30);
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('ALL');
    const [error, setError] = useState("");
    const categoryLabels: Record<string, string> = {
        ALL: '전체',
        SAJU: '사주',
        DREAM: '해몽',
        TAROT: '타로',
        ASTROLOGY: '별자리',
        PALMISTRY: '손금',
        NAMING: '작명',
        TOJEONG: '토정비결',
    };
    const renderCategoryLabel = (key: string) => categoryLabels[key] || key;

    useEffect(() => {
        const historyLogs = getAnalysisHistory();
        setLogs(historyLogs);
        setLoading(false);
    }, []);

    const now = Date.now();
    const filteredLogs = useMemo(() => {
        return logs.filter((log) => {
            const ts = new Date(log.timestamp).getTime();
            const inRange = now - ts <= dDayRange * 24 * 60 * 60 * 1000;
            const inCategory = category === 'ALL' || log.type === category;
            const inQuery =
                query.length === 0 ||
                log.title.toLowerCase().includes(query.toLowerCase()) ||
                (log.profileName || '').toLowerCase().includes(query.toLowerCase());
            return inRange && inCategory && inQuery;
        });
    }, [logs, dDayRange, category, query, now]);

    const typeStats = useMemo(() => {
        const stats: Record<string, number> = {};
        filteredLogs.forEach((log) => {
            stats[log.type] = (stats[log.type] || 0) + 1;
        });
        return stats;
    }, [filteredLogs]);

    const handleDelete = (id: string) => {
        try {
          deleteAnalysisFromHistory(id);
          setLogs(logs.filter(log => log.id !== id));
        } catch (err) {
          setError("로그 삭제에 실패했습니다.");
        }
    };

    const handleViewResult = (log: AnalysisHistoryLog) => {
        const fallbackPath = `/analysis-history/${log.type.toLowerCase()}/${log.id}`;
        router.push(log.resultUrl || fallbackPath);
    };

    const formatDate = (timestamp: number) => {
        const d = new Date(timestamp);
        return `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    };

    return (
        <main className="min-h-screen bg-[#050505] text-foreground relative overflow-hidden pb-40">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(99,102,241,0.05)_0%,transparent_50%)]" />

            <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
                <div className="flex items-center justify-between mb-16">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-3 text-slate-500 hover:text-white transition-all group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black tracking-widest italic">뒤로가기</span>
                    </button>
                    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                        <span className="text-[10px] font-black tracking-widest text-slate-500">기록 보관함</span>
                    </div>
                </div>

                <div className="text-center mb-20">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-block p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] mb-8"
                    >
                        <History className="w-12 h-12 text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.3)]" />
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-[0.9] mb-6">
                        운명 <span className="text-indigo-400">데이터 로그</span>
                    </h1>
                    <p className="text-slate-400 text-lg font-medium italic opacity-70 max-w-xl mx-auto">
                        분석 내역을 검색하고 정렬해 실전에서 바로 재사용하세요.
                    </p>
                </div>

                <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                    <div className="rounded-2xl border border-white/10 bg-surface p-5">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">전체</p>
                        <p className="text-3xl mt-2 font-black text-white">{logs.length}</p>
                        <p className="text-xs text-slate-500 mt-2">전체 분석 이력</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-surface p-5">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">선택 기간</p>
                        <p className="text-3xl mt-2 font-black text-white">최근 {dDayRange}일</p>
                        <p className="text-xs text-slate-500 mt-2">필터 결과: {filteredLogs.length}건</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-surface p-5">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">주요 타입</p>
                        <p className="text-lg mt-2 font-black text-white">{Object.entries(typeStats).slice(0, 2).map(([k]) => renderCategoryLabel(k)).join(', ') || '기록 없음'}</p>
                        <p className="text-xs text-slate-500 mt-2">분석 분포</p>
                    </div>
                </section>

                <div className="mb-16 space-y-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                type="text"
                                placeholder="기록 검색..."
                                className="w-full bg-white/[0.03] border border-white/10 rounded-3xl py-5 pl-14 pr-6 text-white text-lg font-bold placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all shadow-2xl"
                            />
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                        </div>

                        <button
                            onClick={() => setFilterOpen(!filterOpen)}
                            className={cn(
                                "px-8 py-5 rounded-3xl border font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3",
                                filterOpen ? "bg-indigo-500 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                            )}
                        >
                            <Zap className={cn("w-4 h-4", filterOpen ? "fill-white" : "")} />
                            고급 필터
                        </button>

                        {(query || category !== 'ALL' || dDayRange !== 30) && (
                            <button
                                onClick={() => { setQuery(''); setCategory('ALL'); setDDayRange(30); }}
                                className="px-6 py-5 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-black text-[10px] tracking-widest hover:bg-rose-500/20 transition-all"
                            >
                                초기화
                            </button>
                        )}
                    </div>

                    <AnimatePresence>
                        {filterOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-8">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Clock className="w-4 h-4 text-indigo-400" />
                                                <span className="text-[10px] font-black text-slate-500 tracking-widest italic">기간 범위 (D-Day)</span>
                                            </div>
                                            <span className="text-sm font-black text-indigo-400 italic">최근 {dDayRange}일</span>
                                        </div>
                                        <div className="px-4">
                                            <input
                                                type="range"
                                                min="1"
                                                max="365"
                                                value={dDayRange}
                                                onChange={(e) => setDDayRange(parseInt(e.target.value))}
                                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {['ALL', 'SAJU', 'DREAM', 'TAROT', 'ASTROLOGY', 'PALMISTRY', 'NAMING', 'TOJEONG'].map(cat => (
                                            <button key={cat} onClick={() => setCategory(cat)} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border", category === cat ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white hover:border-indigo-500/50')}>
                                                {renderCategoryLabel(cat)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="space-y-2">
                    {error ? <p className="text-rose-300 text-sm border border-rose-500/40 bg-rose-500/10 rounded-xl px-4 py-2">{error}</p> : null}
                    {loading ? <p className="text-sm text-slate-500">데이터를 불러오는 중입니다...</p> : null}
                    {filteredLogs.length > 0 ? null : (
                        <p className="text-slate-400 text-sm">표시할 분석 결과가 없습니다. 프로필 분석을 먼저 실행해 보세요.</p>
                    )}
                </div>

                <div className="space-y-6">
                    <AnimatePresence mode="popLayout">
                        {filteredLogs.map((log, i) => {
                            const info = getAnalysisTypeInfo(log.type);
                            return (
                                <motion.div
                                    key={log.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-surface rounded-[2.5rem] p-5 border border-white/5 hover:border-indigo-500/30 transition-all group flex items-center justify-between shadow-xl"
                                >
                                    <div className="flex items-center gap-4 sm:gap-8">
                                        <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform ${info.color}`}>
                                            <span className="text-3xl">{info.icon}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase group-hover:text-indigo-400 transition-colors">
                                                    {log.title}
                                                </h3>
                                                {log.profileName && (
                                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                                                        {log.profileName}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest italic">
                                                <Clock className="w-3 h-3" /> {formatDate(log.timestamp)}
                                            </div>
                                        </div>
                                    </div>

                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => handleDelete(log.id)}
                                                aria-label={`기록 ${log.title} 삭제`}
                                                className="p-4 rounded-2xl bg-white/5 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                                            >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleViewResult(log)}
                                            aria-label={`${log.title} 상세 보기`}
                                            className="p-4 rounded-2xl bg-white/5 text-slate-400 hover:text-white transition-all border border-white/5"
                                        >
                                            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {filteredLogs.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-40 border-2 border-dashed border-white/5 rounded-[3rem]"
                        >
                            <Database className="w-16 h-16 text-slate-800 mx-auto mb-6 opacity-30" />
                            <p className="text-slate-600 font-black uppercase tracking-widest italic">표시할 데이터가 없습니다.</p>
                            <Link href="/select-fortune" className="mt-8 inline-block px-10 py-5 bg-indigo-500 text-black font-black text-sm rounded-2xl tracking-widest hover:scale-105 transition-all">
                                분석 시작
                            </Link>
                        </motion.div>
                    )}
                </div>

                <div className="mt-16 flex items-center justify-center gap-3 text-slate-300 text-xs tracking-widest">
                    <BarChart3 className="w-4 h-4" />
                    <span>
                        타입별 분포: {Object.entries(typeStats).map(([k, v]) => `${renderCategoryLabel(k)} ${v}건`).join(' · ')}
                    </span>
                </div>
            </div>
        </main>
    );
}
