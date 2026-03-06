'use client';
import { motion } from 'framer-motion';
import { Sparkles, Quote, BookOpen, Loader2, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Props {
    persona: string;
    model: string;
    // Real data to call the API
    userName?: string;
    ageGroup?: string;
    tendency?: string;
    rawSajuData?: unknown;
}

export default function AINarrativeSection({ persona, model, userName, ageGroup, tendency, rawSajuData }: Props) {
    const [narrative, setNarrative] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeModel, setActiveModel] = useState(model);
    const [error, setError] = useState(false);

    const fetchNarrative = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await fetch('/api/persona', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userName: userName ?? '익명',
                    ageGroup: ageGroup ?? '20s',
                    tendency: tendency ?? 'Balanced',
                    rawSajuData,
                    queryType: 'result',
                }),
            });
            if (!res.ok) throw new Error('API error');
            const data = await res.json();
            setNarrative(data.narrative ?? '');
            if (data.routing?.selectedModel) setActiveModel(data.routing.selectedModel);
        } catch {
            setError(true);
            setNarrative('AI 서사를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch on mount
    useEffect(() => {
        if (rawSajuData) fetchNarrative();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const modelLabel = activeModel.includes('GPT') ? 'GPT-4o'
        : activeModel.includes('CLAUDE') ? 'Claude 3.5'
            : activeModel.includes('GEMINI') ? 'Gemini 1.5'
                : activeModel;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 rounded-[2.5rem] bg-slate-900/40 border border-white/5 p-8 relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <BookOpen className="w-32 h-32 text-indigo-400 -rotate-12" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
                            {loading ? (
                                <Loader2 className="w-5 h-5 text-indigo-300 animate-spin" />
                            ) : (
                                <Quote className="w-5 h-5 text-indigo-300" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-indigo-200 uppercase tracking-widest leading-none mb-1">AI 내러티브 분석</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">페르소나: {persona} · 엔진: {modelLabel}</p>
                        </div>
                    </div>
                    {!loading && (
                        <button
                            onClick={fetchNarrative}
                            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all group/btn"
                            title="새로운 AI 서사 생성"
                        >
                            <RefreshCw className="w-4 h-4 text-slate-500 group-hover/btn:text-indigo-400 transition-colors" />
                        </button>
                    )}
                </div>

                <div className="space-y-4 min-h-[80px]">
                    {loading ? (
                        <div className="space-y-3">
                            <div className="h-4 bg-white/5 rounded-full animate-pulse w-full" />
                            <div className="h-4 bg-white/5 rounded-full animate-pulse w-5/6" />
                            <div className="h-4 bg-white/5 rounded-full animate-pulse w-4/6" />
                            <p className="text-center text-[11px] text-indigo-400 mt-4 animate-pulse">AI가 당신의 운명 서사를 작성하고 있습니다...</p>
                        </div>
                    ) : (
                        <p className={`text-lg md:text-xl font-serif leading-relaxed text-slate-200 italic first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left ${error ? 'text-rose-300' : 'first-letter:text-indigo-400'}`}>
                            {narrative || '사주 데이터를 분석하여 당신만의 운명 서사를 작성 중입니다...'}
                        </p>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center">
                                    <Sparkles className="w-3 h-3 text-indigo-400" />
                                </div>
                            ))}
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">분석 신뢰도: 98%</span>
                    </div>
                    <button className="text-[10px] font-black text-indigo-300 uppercase tracking-widest hover:text-white transition-colors">
                        PDF 리포트 다운로드
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
