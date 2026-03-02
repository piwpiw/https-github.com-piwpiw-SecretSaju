'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, ChevronRight, Calendar as CalendarIcon,
    Sparkles, Star, AlertCircle, Zap, Moon, Sun, Wind
} from 'lucide-react';
import {
    format, addMonths, subMonths, startOfMonth, endOfMonth,
    eachDayOfInterval, isSameMonth, isSameDay, getDay
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────
interface DailyFortune {
    date: string;
    message: string;
    luckyScore: number;
    luckyColor?: string;
    luckyNumber?: number;
    element?: string;
    caution?: string;
}

interface DayData {
    date: Date;
    fortune?: DailyFortune;
    isLoading: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

const ELEMENT_META: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    '목': { color: 'text-emerald-400', icon: <Wind className="w-3 h-3" />, label: '나무' },
    '화': { color: 'text-rose-400', icon: <Sun className="w-3 h-3" />, label: '불' },
    '토': { color: 'text-amber-400', icon: <Star className="w-3 h-3" />, label: '흙' },
    '금': { color: 'text-slate-300', icon: <Sparkles className="w-3 h-3" />, label: '금' },
    '수': { color: 'text-blue-400', icon: <Moon className="w-3 h-3" />, label: '물' },
};

// ─── Score → Energy level ─────────────────────────────────────────────────
function getEnergyLevel(score: number): { label: string; color: string; bg: string } {
    if (score >= 85) return { label: '대길', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/40' };
    if (score >= 70) return { label: '길', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
    if (score >= 50) return { label: '평', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' };
    if (score >= 30) return { label: '흉', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' };
    return { label: '대흉', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
}

// ─── Deterministic daily score from date (no API needed per-day) ──────────
function computeLocalScore(date: Date): number {
    const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    // LCG-style hash for stable pseudo-random
    const h = ((seed * 2654435761) ^ (seed >> 16)) >>> 0;
    return (h % 71) + 28; // range 28–98
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedFortune, setSelectedFortune] = useState<DailyFortune | null>(null);
    const [isLoadingFortune, setIsLoadingFortune] = useState(false);
    const [todayFortune, setTodayFortune] = useState<{ message: string } | null>(null);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Pad to start on Sunday
    const startPad = getDay(monthStart);

    // ── Load today's daily fortune from API ──────────────────────────────────
    useEffect(() => {
        const fetchTodayFortune = async () => {
            try {
                const res = await fetch('/api/daily-fortune');
                if (res.ok) {
                    const data = await res.json();
                    setTodayFortune(data);
                }
            } catch {
                // Gracefully degrade — calendar still works with local scores
            }
        };
        fetchTodayFortune();
    }, []);

    // ── Fetch fortune for selected date ─────────────────────────────────────
    const fetchDayFortune = useCallback(async (date: Date) => {
        setIsLoadingFortune(true);
        setSelectedFortune(null);

        const localScore = computeLocalScore(date);
        const energy = getEnergyLevel(localScore);
        const elements = ['목', '화', '토', '금', '수'];
        const element = elements[date.getDate() % 5];
        const luckyNumbers = [1, 3, 5, 7, 8, 9];
        const luckyNumber = luckyNumbers[date.getDate() % luckyNumbers.length];
        const colors = ['인디고', '자주', '금빛', '청록', '은빛'];
        const luckyColor = colors[date.getMonth() % colors.length];

        const messages: string[] = [
            '오늘은 새로운 시작을 알리는 기운이 흐릅니다. 작은 용기가 큰 변화를 만듭니다.',
            '대인 관계에서의 진심 어린 대화가 뜻밖의 행운을 가져올 것입니다.',
            '내면의 직관을 믿으세요. 오늘 당신의 감각은 특별히 예리합니다.',
            '창의적인 에너지가 넘치는 하루입니다. 예술과 표현에 집중해 보세요.',
            '재물운이 움직일 조짐이 있습니다. 작은 투자에 행운이 따릅니다.',
            '인내와 꾸준함이 결실을 맺는 날입니다. 오늘 심은 씨앗이 자랍니다.',
            '예상치 못한 귀인의 도움이 있을 것입니다. 주변을 살펴보세요.',
        ];
        const cautions: string[] = [
            '급한 결정은 잠시 미루는 것이 좋습니다.',
            '금전 거래는 신중히 검토 후 진행하세요.',
            '과로에 주의하고 충분한 휴식을 권합니다.',
            '감정적인 말은 오해를 낳을 수 있으니 신중히 표현하세요.',
            undefined as unknown as string,
        ];

        // Simulate network latency for realism
        await new Promise(r => setTimeout(r, 320));

        const fortune: DailyFortune = {
            date: format(date, 'yyyy-MM-dd'),
            message: messages[date.getDate() % messages.length],
            luckyScore: localScore,
            luckyColor,
            luckyNumber,
            element,
            caution: cautions[date.getDate() % cautions.length],
        };

        setSelectedFortune(fortune);
        setIsLoadingFortune(false);
    }, []);

    // Load fortune for initially selected date
    useEffect(() => {
        fetchDayFortune(selectedDate);
    }, [selectedDate, fetchDayFortune]);

    const handleDayClick = (day: Date) => {
        setSelectedDate(day);
    };

    const energy = selectedFortune ? getEnergyLevel(selectedFortune.luckyScore) : null;
    const elementMeta = selectedFortune?.element ? ELEMENT_META[selectedFortune.element] : null;

    return (
        <div className="py-12 md:py-20 max-w-5xl mx-auto space-y-12 px-4">

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        <span>Celestial Calendar</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display text-mystic">나의 운세 캘린더</h1>
                    <p className="text-slate-400">당신의 일상에 흐르는 우주의 기운을 확인하세요.</p>
                </div>

                {/* Month Navigator */}
                <div className="flex items-center justify-center gap-4 bg-white/5 border border-white/5 p-2 rounded-2xl">
                    <button
                        onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                        aria-label="이전 달"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-400" />
                    </button>
                    <span className="text-lg font-black italic text-white min-w-[140px] text-center uppercase tracking-tight">
                        {format(currentDate, 'yyyy년 M월', { locale: ko })}
                    </span>
                    <button
                        onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                        aria-label="다음 달"
                    >
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
            </header>

            {/* Today's banner (from API) */}
            {todayFortune && isSameMonth(new Date(), currentDate) && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3"
                >
                    <Zap className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">오늘의 운세</p>
                        <p className="text-sm text-slate-300">{todayFortune.message}</p>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ── Calendar Grid ─────────────────────────────────────────── */}
                <div className="lg:col-span-2 premium-card p-4 md:p-6">
                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 mb-3">
                        {DAYS.map((d, i) => (
                            <div key={d} className={cn(
                                "text-center text-[10px] font-black tracking-widest py-2",
                                i === 0 ? "text-rose-500/70" : i === 6 ? "text-blue-400/70" : "text-slate-600"
                            )}>
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Day cells */}
                    <div className="grid grid-cols-7 gap-1 md:gap-1.5">
                        {/* Padding cells */}
                        {Array.from({ length: startPad }).map((_, i) => (
                            <div key={`pad-${i}`} />
                        ))}

                        {calendarDays.map((day: Date, idx: number) => {
                            const score = computeLocalScore(day);
                            const isSelected = isSameDay(day, selectedDate);
                            const isToday = isSameDay(day, new Date());
                            const isWeekend = getDay(day) === 0 || getDay(day) === 6;
                            const isSaturday = getDay(day) === 6;
                            const isSunday = getDay(day) === 0;
                            const dayEnergy = getEnergyLevel(score);
                            const isHighLuck = score >= 85;
                            const isMidLuck = score >= 70;

                            return (
                                <motion.button
                                    key={idx}
                                    whileHover={{ scale: 1.06 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => handleDayClick(day)}
                                    className={cn(
                                        "aspect-square relative flex flex-col items-center justify-center rounded-xl border cursor-pointer transition-all text-center",
                                        isSelected
                                            ? "bg-indigo-600 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-900/50"
                                            : isToday
                                                ? "bg-indigo-500/10 border-indigo-500/40"
                                                : "bg-white/[0.02] border-white/[0.04] hover:border-indigo-500/30 hover:bg-white/5",
                                    )}
                                >
                                    <span className={cn(
                                        "text-sm font-bold leading-none",
                                        isSelected ? "text-white" :
                                            isSunday ? "text-rose-400" :
                                                isSaturday ? "text-blue-400" : "text-slate-300",
                                        isToday && !isSelected && "underline decoration-2 underline-offset-2 decoration-indigo-400"
                                    )}>
                                        {format(day, 'd')}
                                    </span>

                                    {/* Energy indicator dots */}
                                    <div className="mt-1 flex gap-0.5 justify-center">
                                        {isMidLuck && (
                                            <div className={cn(
                                                "w-1 h-1 rounded-full",
                                                isSelected ? "bg-white/70" : "bg-indigo-400"
                                            )} />
                                        )}
                                        {isHighLuck && (
                                            <div className={cn(
                                                "w-1 h-1 rounded-full",
                                                isSelected ? "bg-white" : "bg-amber-400"
                                            )} />
                                        )}
                                    </div>

                                    {/* Sparkle on luckiest days */}
                                    {isHighLuck && !isSelected && (
                                        <div className="absolute top-1 right-1">
                                            <Sparkles className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
                                        </div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-4 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">운세 레벨</span>
                        {[{ label: '대길', color: 'bg-amber-400' }, { label: '길', color: 'bg-emerald-400' }, { label: '평', color: 'bg-slate-500' }].map(l => (
                            <div key={l.label} className="flex items-center gap-1.5">
                                <div className={cn("w-2 h-2 rounded-full", l.color)} />
                                <span className="text-[10px] text-slate-500">{l.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Detail Panel ──────────────────────────────────────────── */}
                <div className="space-y-4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedDate.toISOString()}
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -16 }}
                            transition={{ duration: 0.25 }}
                            className="premium-card p-6 space-y-6 bg-gradient-to-b from-slate-900/80 to-slate-950/80"
                        >
                            {/* Date heading */}
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black italic text-white leading-tight">
                                    {format(selectedDate, 'M월 d일', { locale: ko })}
                                    <span className="text-slate-500 ml-2 text-lg not-italic font-bold">
                                        ({format(selectedDate, 'EEE', { locale: ko })})
                                    </span>
                                </h2>
                                <p className="text-xs text-slate-500 uppercase tracking-[0.2em] font-bold">Daily Cosmic Insight</p>
                            </div>

                            {isLoadingFortune ? (
                                <div className="space-y-3 animate-pulse">
                                    <div className="h-16 rounded-2xl bg-white/5" />
                                    <div className="h-10 rounded-xl bg-white/5" />
                                    <div className="h-10 rounded-xl bg-white/5" />
                                </div>
                            ) : selectedFortune ? (
                                <div className="space-y-4">
                                    {/* Lucky Score */}
                                    <div className={cn("p-4 rounded-2xl border", energy?.bg)}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">운기 지수</span>
                                            <div className="flex items-center gap-2">
                                                <span className={cn("text-xs font-black uppercase tracking-widest", energy?.color)}>{energy?.label}</span>
                                                <span className="text-2xl font-black text-white">{selectedFortune.luckyScore}</span>
                                            </div>
                                        </div>
                                        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${selectedFortune.luckyScore}%` }}
                                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                                className={cn(
                                                    "h-full rounded-full",
                                                    selectedFortune.luckyScore >= 85
                                                        ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                                                        : selectedFortune.luckyScore >= 70
                                                            ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                                                            : "bg-gradient-to-r from-indigo-500 to-purple-500"
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Lucky attributes */}
                                    <div className="grid grid-cols-3 gap-2">
                                        {selectedFortune.element && elementMeta && (
                                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center space-y-1">
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">오행</p>
                                                <div className={cn("flex items-center justify-center gap-1", elementMeta.color)}>
                                                    {elementMeta.icon}
                                                    <span className="text-xs font-black">{elementMeta.label}</span>
                                                </div>
                                            </div>
                                        )}
                                        {selectedFortune.luckyNumber && (
                                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center space-y-1">
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">행운번호</p>
                                                <span className="text-lg font-black text-indigo-400">{selectedFortune.luckyNumber}</span>
                                            </div>
                                        )}
                                        {selectedFortune.luckyColor && (
                                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center space-y-1">
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">행운색</p>
                                                <span className="text-xs font-black text-purple-400">{selectedFortune.luckyColor}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Message */}
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                                            <Star className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">오늘의 메시지</p>
                                            <p className="text-sm text-slate-300 leading-relaxed">{selectedFortune.message}</p>
                                        </div>
                                    </div>

                                    {/* Caution */}
                                    {selectedFortune.caution && (
                                        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                                            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-[10px] font-black text-amber-500/70 uppercase tracking-widest">주의사항</p>
                                                <p className="text-sm text-slate-400 leading-relaxed">{selectedFortune.caution}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : null}

                            <button
                                id="calendar-full-report-btn"
                                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-950/40 transition-all active:scale-[0.98]"
                            >
                                전체 리포트 보기
                            </button>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
