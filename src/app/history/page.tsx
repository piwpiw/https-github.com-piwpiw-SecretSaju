'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    History, ArrowLeft, Clock, ChevronRight,
    Trash2, Database, Search, Calendar, Zap, Sparkles
} from 'lucide-react';
import { getProfiles, SajuProfile } from '@/lib/storage';
import { useLocale } from '@/lib/i18n';
import Link from 'next/link';

import { getAnalysisHistory, deleteAnalysisFromHistory, getAnalysisTypeInfo } from '@/lib/analysis-history';
import { AnalysisHistoryLog } from '@/types/history';

export default function HistoryPage() {
    const router = useRouter();
    const { locale } = useLocale();
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<AnalysisHistoryLog[]>([]);

    useEffect(() => {
        // Load real logs
        const historyLogs = getAnalysisHistory();
        setLogs(historyLogs);
        setLoading(false);
    }, []);

    const handleDelete = (id: string) => {
        deleteAnalysisFromHistory(id);
        setLogs(logs.filter(log => log.id !== id));
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
                {/* Header */}
                <div className="flex items-center justify-between mb-16">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-3 text-slate-500 hover:text-white transition-all group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black tracking-widest uppercase italic">BACK_TRACK</span>
                    </button>
                    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                        <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">LOGS_V3.0</span>
                    </div>
                </div>

                {/* Hero Section */}
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
                        당신이 탐구했던 모든 운명의 흔적을<br />
                        타임라인에서 다시 확인하세요.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative mb-16 group">
                    <input
                        type="text"
                        placeholder="해독 기록 검색..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-3xl py-6 pl-16 pr-6 text-white text-xl font-bold placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all shadow-2xl"
                    />
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                </div>

                {/* Timeline Log List */}
                <div className="space-y-6">
                    <AnimatePresence mode="popLayout">
                        {logs.map((log, i) => {
                            const info = getAnalysisTypeInfo(log.type);
                            return (
                                <motion.div
                                    key={log.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-surface rounded-[2.5rem] p-8 border border-white/5 hover:border-indigo-500/30 transition-all group flex items-center justify-between shadow-xl"
                                >
                                    <div className="flex items-center gap-8">
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
                                            className="p-4 rounded-2xl bg-white/5 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleViewResult(log)}
                                            className="p-4 rounded-2xl bg-white/5 text-slate-400 hover:text-white transition-all border border-white/5"
                                        >
                                            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {logs.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-40 border-2 border-dashed border-white/5 rounded-[3rem]"
                        >
                            <Database className="w-16 h-16 text-slate-800 mx-auto mb-6 opacity-30" />
                            <p className="text-slate-600 font-black uppercase tracking-widest italic italic">No Data Nodes Found</p>
                            <Link href="/select-fortune" className="mt-8 inline-block px-10 py-5 bg-indigo-500 text-black font-black text-sm rounded-2xl uppercase tracking-widest hover:scale-105 transition-all">
                                START_ANALYSIS
                            </Link>
                        </motion.div>
                    )}
                </div>
            </div>
        </main>
    );
}


