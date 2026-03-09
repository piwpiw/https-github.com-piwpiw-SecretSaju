'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, ChevronRight, Calendar as CalendarIcon,
    Sparkles, Star, Zap, Moon, Sun, Wind
} from 'lucide-react';
import {
    format, addMonths, subMonths, startOfMonth, endOfMonth,
    eachDayOfInterval, isSameMonth, isSameDay, getDay
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/app/utils';

// ─── Score → Energy level ─────────────────────────────────────────────────
function getEnergyLevel(score: number): { label: string; color: string; bg: string } {
    if (score >= 85) return { label: '대길', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/40' };
    if (score >= 70) return { label: '길', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
    if (score >= 50) return { label: '평', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' };
    if (score >= 30) return { label: '흉', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' };
    return { label: '대흉', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
}

function computeLocalScore(date: Date): number {
    const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    const h = ((seed * 2654435761) ^ (seed >> 16)) >>> 0;
    return (h % 71) + 28;
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function DestinyCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startPad = getDay(monthStart);

    const score = computeLocalScore(selectedDate);
    const energy = getEnergyLevel(score);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-400" />
                    </button>
                    <span className="text-lg font-black italic text-white min-w-[120px] text-center uppercase tracking-tight">
                        {format(currentDate, 'yyyy. MM', { locale: ko })}
                    </span>
                    <button
                        onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
                <div className={cn("px-4 py-2 rounded-xl border flex items-center gap-3", energy.bg)}>
                    <Zap className={cn("w-4 h-4", energy.color)} />
                    <span className={cn("text-xs font-black uppercase tracking-widest", energy.color)}>{energy.label} {score}</span>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {DAYS.map((d, i) => (
                    <div key={d} className={cn(
                        "text-center text-[10px] font-black tracking-widest py-2",
                        i === 0 ? "text-rose-500/70" : i === 6 ? "text-blue-400/70" : "text-slate-600"
                    )}>
                        {d}
                    </div>
                ))}

                {Array.from({ length: startPad }).map((_, i) => (
                    <div key={`pad-${i}`} />
                ))}

                {calendarDays.map((day: Date, idx: number) => {
                    const dScore = computeLocalScore(day);
                    const isSelected = isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, new Date());

                    return (
                        <button
                            key={idx}
                            onClick={() => setSelectedDate(day)}
                            className={cn(
                                "aspect-square relative flex flex-col items-center justify-center rounded-xl border transition-all text-xs font-bold",
                                isSelected
                                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg"
                                    : isToday
                                        ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-400"
                                        : "bg-white/[0.02] border-white/[0.04] text-slate-400 hover:bg-white/5"
                            )}
                        >
                            {format(day, 'd')}
                            {dScore >= 85 && !isSelected && (
                                <div className="absolute top-1 right-1 w-1 h-1 bg-amber-400 rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
