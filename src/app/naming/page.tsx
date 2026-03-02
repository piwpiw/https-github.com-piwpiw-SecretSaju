"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit3, Loader2, Sparkles, BookOpen, User, Zap } from "lucide-react";
import JellyBalance from "@/components/shop/JellyBalance";
import { useWallet } from "@/components/WalletProvider";
import { useProfiles } from "@/components/ProfileProvider";
import LuxuryToast from "@/components/ui/LuxuryToast";
import { cn } from "@/lib/utils";

export default function NamingPage() {
    const router = useRouter();
    const { consumeChuru, churu } = useWallet();
    const { profiles, activeProfile, setActiveProfileById } = useProfiles();

    const [name, setName] = useState("");
    const [hanja, setHanja] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [toastMsg, setToastMsg] = useState("");
    const [showToast, setShowToast] = useState(false);

    // Pre-fill from active profile
    useEffect(() => {
        if (activeProfile) {
            setName(activeProfile.name);
        }
    }, [activeProfile]);

    const handleAnalyze = (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);

        if (!name.trim()) {
            setToastMsg("분석할 이름을 입력해주세요.");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            setLoading(false);
            return;
        }

        if (churu < 30) {
            setToastMsg("정통 성명학 분석에는 30 젤리가 필요합니다.");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            setLoading(false);
            return;
        }

        consumeChuru(30);

        // ── 한글 자음 획수표 (전통 성명학 기준) ──
        const STROKE_MAP: Record<string, number> = {
            'ㄱ': 2, 'ㄴ': 2, 'ㄷ': 3, 'ㄹ': 5, 'ㅁ': 4,
            'ㅂ': 4, 'ㅅ': 2, 'ㅇ': 1, 'ㅈ': 3, 'ㅊ': 4,
            'ㅋ': 3, 'ㅌ': 4, 'ㅍ': 4, 'ㅎ': 3, 'ㄲ': 4,
            'ㄸ': 6, 'ㅃ': 8, 'ㅆ': 4, 'ㅉ': 6,
        };

        // 한글 각 글자의 획수 추출
        const getCharStrokes = (ch: string): number => {
            const code = ch.charCodeAt(0);
            if (code < 0xAC00 || code > 0xD7A3) return 1;
            const onset = Math.floor((code - 0xAC00) / 588);
            const ONSETS = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
            const onsetChar = ONSETS[onset];
            return (STROKE_MAP[onsetChar] || 2);
        };

        // 이름 글자별 획수
        const chars = name.trim().split('');
        const strokes = chars.map(getCharStrokes);
        const total = strokes.reduce((a, b) => a + b, 0);

        // 원형(元亨利貞) 4격 계산
        const wonHyeong = (strokes[0] || 0) + (strokes[1] || 0);
        const hyeong = (strokes[1] || 0) + (strokes[2] || 0);
        const li = (strokes[0] || 0) + (strokes[1] || 0) + (strokes[2] || 0);
        const jeong = total;

        // 수리별 의미 (1~81수 간략화)
        const getMeaning = (n: number): { name: string; luck: 'good' | 'bad' | 'mid'; desc: string } => {
            const mod = ((n - 1) % 81) + 1;
            const TABLE: Record<string, { name: string; luck: 'good' | 'bad' | 'mid'; desc: string }> = {
                '1': { name: '태초수', luck: 'good', desc: '만물의 으뜸, 강한 독립심과 창의력' },
                '3': { name: '명예수', luck: 'good', desc: '재능이 빛나고 사회적 명성을 얻음' },
                '5': { name: '오행수', luck: 'good', desc: '오행이 균형을 이루어 다방면으로 발전' },
                '6': { name: '복덕수', luck: 'good', desc: '가정이 화목하고 복이 넘침' },
                '7': { name: '독립수', luck: 'good', desc: '강인한 의지력으로 역경을 이겨냄' },
                '8': { name: '발전수', luck: 'good', desc: '노력의 결실이 맺히고 사업이 번창' },
                '11': { name: '박약수', luck: 'bad', desc: '의지가 약하고 변화가 많으나 인내로 극복' },
                '13': { name: '지모수', luck: 'good', desc: '지혜롭고 계획적이며 성공을 일굼' },
                '15': { name: '통솔수', luck: 'good', desc: '리더십이 강하고 주변을 이끄는 힘' },
                '16': { name: '덕망수', luck: 'good', desc: '덕망이 높아 사람들에게 신뢰받음' },
                '21': { name: '두령수', luck: 'good', desc: '자수성가하여 큰 성공을 이룸' },
                '23': { name: '공명수', luck: 'good', desc: '공명정대하여 사회적 성공이 빠름' },
                '24': { name: '입신수', luck: 'good', desc: '재능과 노력으로 사회적 지위 획득' },
                '25': { name: '안강수', luck: 'good', desc: '안정과 강인함으로 장수·행복' },
            };
            return TABLE[String(mod)] || { name: `${mod}수`, luck: 'mid', desc: '평탄하고 안정적인 기운' };
        };

        const wonMeaning = getMeaning(wonHyeong);
        const liMeaning = getMeaning(li);

        // 오행 흐름 (소리 오행)
        const SOUND_ELEMENTS: Record<string, string> = {
            'ㄱ': '목(木)', 'ㄴ': '화(火)', 'ㄷ': '화(火)', 'ㄹ': '화(火)',
            'ㅁ': '토(土)', 'ㅂ': '수(水)', 'ㅅ': '금(金)', 'ㅇ': '토(土)',
            'ㅈ': '금(金)', 'ㅊ': '금(金)', 'ㅋ': '목(木)', 'ㅌ': '화(火)',
            'ㅍ': '수(水)', 'ㅎ': '수(水)',
        };
        const ONSETS_MAP = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
        const soundFlow = chars.map(ch => {
            const code = ch.charCodeAt(0);
            if (code < 0xAC00 || code > 0xD7A3) return '';
            const onset = ONSETS_MAP[Math.floor((code - 0xAC00) / 588)];
            const base = onset?.replace('ㄲ', 'ㄱ').replace('ㄸ', 'ㄷ').replace('ㅃ', 'ㅂ').replace('ㅆ', 'ㅅ').replace('ㅉ', 'ㅈ');
            return SOUND_ELEMENTS[base || ''] || '토(土)';
        }).filter(Boolean).join(' → ');

        // 최종 점수
        const baseScore = 75 + (jeong % 20);
        const bonus = wonMeaning.luck === 'good' ? 5 : liMeaning.luck === 'good' ? 3 : 0;
        const finalScore = Math.min(99, baseScore + bonus);

        setTimeout(() => {
            setResult({
                score: finalScore,
                strokes,
                total,
                wonHyeong,
                hyeong,
                li,
                jeong,
                wonMeaning,
                liMeaning,
                soundFlow,
                pronunciation: `원형(元亨) ${wonHyeong}획 — ${wonMeaning.name}: ${wonMeaning.desc}. 이형(利亨) ${li}획 — ${liMeaning.name}: ${liMeaning.desc}.`,
                meaning: `이름 '${name}'은(는) 총 ${total}획으로 구성되며, ${soundFlow || '오행'} 소리 흐름을 가집니다. ${liMeaning.luck === 'good' ? '길한 수리 구조로 재물과 명예운이 강합니다.' : '수리의 균형을 보완하면 더욱 발전할 수 있습니다.'}`,
                elementalFlow: soundFlow || '－',
            });
            setLoading(false);
        }, 500);
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-200 relative overflow-hidden pb-40 font-sans">
            <LuxuryToast message={toastMsg} isVisible={showToast} />

            {/* Dark Atmosphere */}
            <div className="absolute inset-x-0 top-0 h-[60dvh] bg-gradient-to-b from-rose-900/20 via-slate-900/10 to-transparent pointer-events-none" />
            <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-rose-600/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
                <header className="flex items-center justify-between mb-16">
                    <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                        <ArrowLeft className="w-5 h-5 text-slate-400" />
                    </button>
                    <JellyBalance />
                </header>

                <div className="text-center mb-16 space-y-4">
                    <div className="hero-kicker border-rose-400/50 text-rose-300">
                        <Edit3 className="w-3 h-3" /> 이름 에너지 분석
                    </div>
                    <h1 className="text-4xl sm:text-5xl ui-title">
                        정통 <span className="text-rose-500">성명학</span> 분석
                    </h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest italic animate-pulse">
                        이름의 진동을 해석해 관계·운명 흐름을 제시합니다.
                    </p>
                </div>

                {!result && !loading && (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                        {/* Profile Selector */}
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[3rem] p-8 max-w-xl mx-auto">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">분석 대상</h3>
                                <div className="flex gap-2">
                                    {profiles.slice(0, 4).map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => setActiveProfileById(p.id)}
                                            className={cn(
                                                "w-8 h-8 rounded-xl border flex items-center justify-center transition-all",
                                                activeProfile?.id === p.id
                                                    ? "bg-rose-600 border-rose-400 scale-110 shadow-lg"
                                                    : "bg-white/5 border-white/10 opacity-40 hover:opacity-80"
                                            )}
                                        >
                                            <User className="w-3.5 h-3.5" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="text-center">
                                <span className="text-2xl font-black italic text-rose-200">{activeProfile?.name}</span>
                                <span className="text-[10px] text-slate-500 ml-2 uppercase font-black opacity-70">데이터를 기반으로 한 분석</span>
                            </div>
                        </div>

                        <form onSubmit={handleAnalyze} className="max-w-xl mx-auto space-y-6">
                            <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 shadow-2xl space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2">분석할 이름 (한글)</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="홍길동"
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-8 py-5 text-white font-black text-2xl focus:outline-none focus:border-rose-500/50 transition-all text-center"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2">한자 데이터 (선택)</label>
                                    <input
                                        type="text"
                                        value={hanja}
                                        onChange={(e) => setHanja(e.target.value)}
                                        placeholder="洪吉童"
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-8 py-4 text-slate-300 font-bold text-lg focus:outline-none focus:border-rose-500/30 transition-all text-center"
                                    />
                                </div>
                                <div className="bg-black/40 rounded-3xl p-6 lg:p-8 space-y-4 border border-rose-500/20 shadow-inner w-full text-left">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Zap className="w-3.5 h-3.5 text-rose-500" /> 사용 비용
                                        </span>
                                        <span className="text-sm font-black flex items-center gap-2 text-rose-400 italic tracking-widest bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
                                            30 Jelly
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold hidden sm:block">정통 성명학 데이터베이스 기반 분석</p>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-6 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white rounded-2xl font-black uppercase italic tracking-[0.2em] text-sm shadow-[0_0_40px_rgba(244,63,94,0.3)] hover:shadow-[0_0_60px_rgba(244,63,94,0.5)] transition-all active:scale-95 border border-rose-400/50 group flex items-center justify-center gap-3"
                                >
                                    <Sparkles className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" /> 리딩 즉시 시작 (30 Jelly)
                                </button>
                            </div>
                            <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                                실전 성명학 알고리즘 적용
                            </p>
                        </form>
                    </motion.div>
                )}

                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-40">
                        <div className="relative">
                            <div className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full" />
                            <Loader2 className="w-28 h-28 text-rose-500 animate-spin" strokeWidth={1} />
                            <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-rose-300 animate-pulse" />
                        </div>
                        <h3 className="mt-12 text-2xl font-black uppercase italic tracking-[0.2em] text-rose-200 animate-pulse">이름 특성 추출 중...</h3>
                        <p className="mt-2 text-xs text-slate-500 font-bold uppercase tracking-[0.3em]">이름 데이터를 정밀 분석하는 중입니다</p>
                    </motion.div>
                )}

                {result && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto">
                        <div className="bg-slate-900/60 backdrop-blur-2xl border border-rose-500/20 rounded-[4rem] p-10 sm:p-14 relative overflow-hidden shadow-2xl text-center">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-[100px] -mr-40 -mt-40" />

                            <div className="relative z-10 mb-12">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-500/10 border border-rose-500/30 rounded-full text-rose-300 font-black mb-10 tracking-[0.3em] text-[10px] uppercase">
                                    <Sparkles className="w-3.5 h-3.5" /> 전체 해석 결과
                                </div>
                                <h1 className="text-5xl font-black mb-4 text-white tracking-tighter uppercase italic leading-tight">
                                    {name} <span className="text-2xl text-slate-500 ml-2">{hanja}</span>
                                </h1>
                                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 pb-2">
                                    {result.score}점
                                </div>
                                <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">통합 흥복 지수</div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 relative z-10 text-left">
                                {/* 글자별 획수 시각화 */}
                                {result.strokes && (
                                    <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] space-y-4">
                                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest border-b border-white/10 pb-2">획수 분석표</h4>
                                        <div className="flex justify-center gap-6 flex-wrap">
                                            {name.trim().split('').map((ch: string, i: number) => (
                                                <div key={i} className="flex flex-col items-center">
                                                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-2">
                                                        <span className="text-2xl font-black text-white">{ch}</span>
                                                    </div>
                                                    <span className="text-xs font-black text-indigo-300">{result.strokes[i]}획</span>
                                                </div>
                                            ))}
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-2">
                                                    <span className="text-xl font-black text-amber-300">{result.total}</span>
                                                </div>
                                                <span className="text-xs font-black text-amber-300">합계</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 사격(四格) 분석 */}
                                {result.wonHyeong !== undefined && (
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: '원격(元格)', value: result.wonHyeong, meaning: result.wonMeaning, desc: '초년운' },
                                            { label: '형격(亨格)', value: result.hyeong, meaning: { name: `${result.hyeong}수`, luck: 'mid', desc: '중년 사업·인간관계 기반' }, desc: '중년운' },
                                            { label: '이격(利格)', value: result.li, meaning: result.liMeaning, desc: '성공·재물운' },
                                            { label: '정격(貞格)', value: result.jeong, meaning: { name: `${result.jeong}수`, luck: 'mid', desc: '종합 총운을 관장' }, desc: '총운' },
                                        ].map((grid) => (
                                            <div key={grid.label} className={`p-5 rounded-3xl border ${grid.meaning.luck === 'good' ? 'bg-emerald-500/5 border-emerald-500/20' : grid.meaning.luck === 'bad' ? 'bg-rose-500/5 border-rose-500/20' : 'bg-white/5 border-white/5'}`}>
                                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{grid.label} · {grid.desc}</div>
                                                <div className={`text-2xl font-black mb-1 ${grid.meaning.luck === 'good' ? 'text-emerald-300' : grid.meaning.luck === 'bad' ? 'text-rose-300' : 'text-white'}`}>{grid.value}획</div>
                                                <div className="text-xs font-black text-slate-400">{grid.meaning.name}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] space-y-4">
                                    <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest border-b border-white/10 pb-2">소리 오행 및 수리 풀이</h4>
                                    <p className="text-lg text-slate-300 leading-relaxed font-bold italic opacity-90">
                                        &ldquo;{result.pronunciation}&rdquo;
                                    </p>
                                </div>
                                <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] space-y-4">
                                    <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest border-b border-white/10 pb-2">자원 오행 및 총운</h4>
                                    <p className="text-lg text-slate-300 leading-relaxed font-bold italic opacity-90">
                                        &ldquo;{result.meaning}&rdquo;
                                    </p>
                                </div>
                            </div>

                            <div className="mt-10 p-6 bg-rose-500/5 rounded-3xl border border-rose-500/20">
                                <span className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em]">{result.elementalFlow}</span>
                            </div>

                            <button
                                onClick={() => setResult(null)}
                                className="w-full mt-10 py-5 bg-transparent border-2 border-white/5 rounded-2xl text-slate-500 hover:text-white hover:border-rose-500/30 transition-all font-black uppercase italic tracking-widest text-xs"
                            >
                                다른 이름 분석하기
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </main>
    );
}



