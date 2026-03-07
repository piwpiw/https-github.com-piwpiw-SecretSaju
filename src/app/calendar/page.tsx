"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ko } from "date-fns/locale";

import { getPillarNameKo, getDayPillarIndex } from "@/lib/saju";

type Locale = "ko" | "en";
type DailyFortune = {
  date: string;
  message: string;
  luckyScore: number;
  luckyColor?: string;
  luckyNumber?: number;
  element?: string;
  caution?: string;
};

export const dynamic = "force-dynamic";

const WEEK_KO = ["일", "월", "화", "수", "목", "금", "토"];
const WEEK_EN = ["일", "월", "화", "수", "목", "금", "토"];

const FALLBACK_MESSAGES: Record<Locale, string> = {
  ko: "오늘의 일진과 기운을 확인하여 하루를 준비하세요.",
  en: "Plan your day by checking the daily energy and pillar.",
};

function dateToYMD(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function fallbackFortune(date: Date): DailyFortune {
  const base = ((date.getFullYear() * 31 + date.getMonth() * 17 + date.getDate()) % 60) + 40;
  return {
    date: dateToYMD(date),
    luckyScore: base,
    message: FALLBACK_MESSAGES.ko,
  };
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedFortune, setSelectedFortune] = useState<DailyFortune | null>(null);
  const [todayFortune, setTodayFortune] = useState<DailyFortune | null>(() => fallbackFortune(new Date()));
  const [locale, setLocale] = useState<Locale>("ko");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setLocale(params.get("locale") === "en" ? "en" : "ko");
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const padDays = getDay(monthStart);

  const weeks = locale === "en" ? WEEK_EN : WEEK_KO;
  const title =
    locale === "en"
      ? format(currentDate, "yyyy년 M월")
      : format(currentDate, "yyyy년 M월", { locale: ko });
  const selectedLabel =
    locale === "en"
      ? format(selectedDate, "M월 d일")
      : format(selectedDate, "M월 d일", { locale: ko });

  const onPick = async (date: Date) => {
    setSelectedDate(date);
    const dateKey = dateToYMD(date);
    try {
      const response = await fetch(`/api/daily-fortune?date=${dateKey}&locale=${locale}`);
      if (!response.ok) {
        setSelectedFortune(fallbackFortune(date));
        return;
      }
      const payload = await response.json();
      const parsed: DailyFortune = {
        date: payload.date || dateKey,
        message: payload.message || FALLBACK_MESSAGES[locale],
        luckyScore: Number(payload.score) || fallbackFortune(date).luckyScore,
        luckyColor: payload.luckyColor,
        luckyNumber: payload.luckyNumber,
        element: payload.element,
        caution: payload.caution,
      };
      setSelectedFortune(parsed);
    } catch {
      setSelectedFortune(fallbackFortune(date));
    }
  };

  const shiftMonth = (delta: -1 | 1) => {
    setCurrentDate((prev) => (delta < 0 ? subMonths(prev, 1) : addMonths(prev, 1)));
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden pb-28">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex items-center gap-3">
            <button
              onClick={() => shiftMonth(-1)}
              className="w-9 h-9 rounded-xl bg-white/10 border border-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => shiftMonth(1)}
              className="w-9 h-9 rounded-xl bg-white/10 border border-white/10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <h1 className="font-black text-xl">{title}</h1>
          <span className="text-xs text-slate-400 inline-flex items-center gap-1">
            <CalendarIcon className="w-4 h-4" />
            {locale === "en" ? "만세력 일진 달력" : "만세력 일진 달력"}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-3 text-xs text-slate-300 font-bold">
          {weeks.map((w) => (
            <div key={w} className="text-center">{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: padDays }).map((_, idx) => (
            <div key={`pad-${idx}`} className="h-16 rounded-xl border border-white/5 bg-white/[0.02]" />
          ))}
          {calendarDays.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const isCurrent = isSameMonth(day, currentDate);
            return (
              <button
                key={day.toISOString()}
                onClick={() => onPick(day)}
                className={`h-16 rounded-xl border p-2 text-left transition-all ${isSelected
                  ? "border-fuchsia-400 bg-fuchsia-500/20"
                  : "border-white/10 bg-white/5 hover:border-white/30"
                  } ${isCurrent ? "" : "opacity-40"}`}
              >
                <div className="flex justify-between items-start">
                  <div className="text-sm font-black">{day.getDate()}</div>
                  <div className="text-[9px] font-black text-fuchsia-400 opacity-80">
                    {getPillarNameKo(getDayPillarIndex(day))}
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">{isToday ? "오늘" : ""}</div>
              </button>
            );
          })}
        </div>

        <section className="mt-8 border border-white/10 rounded-2xl p-6 bg-gradient-to-br from-indigo-900/20 to-slate-900/60 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 blur-2xl rounded-full" />
          <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-300">오늘의 일진 상세 브리핑</p>
          <div className="flex items-end gap-3 mt-2">
            <h2 className="text-3xl font-black text-white">{selectedLabel}</h2>
            <div className="flex-1" />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">행운 지수</span>
              <span className="text-2xl font-black text-fuchsia-400">{selectedFortune?.luckyScore ?? todayFortune?.luckyScore}<span className="text-sm font-normal text-slate-500 ml-1">/ 100</span></span>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 font-medium text-slate-200 leading-relaxed">
            {selectedFortune?.message || todayFortune?.message}
          </div>

          {(selectedFortune?.caution || todayFortune?.caution) && (
            <div className="mt-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-sm">
              <strong className="font-black mr-2">⚠️ 주의:</strong>
              {selectedFortune?.caution || todayFortune?.caution}
            </div>
          )}

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="bg-black/30 rounded-xl p-3 border border-white/5 text-center">
              <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-1">행운의 컬러</p>
              <p className="text-sm font-black text-emerald-300">{selectedFortune?.luckyColor || todayFortune?.luckyColor || "-"}</p>
            </div>
            <div className="bg-black/30 rounded-xl p-3 border border-white/5 text-center">
              <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-1">행운의 숫자</p>
              <p className="text-sm font-black text-cyan-300">{selectedFortune?.luckyNumber ?? todayFortune?.luckyNumber ?? "-"}</p>
            </div>
            <div className="bg-black/30 rounded-xl p-3 border border-white/5 text-center">
              <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-1">오늘의 기운</p>
              <p className="text-sm font-black text-amber-300">{selectedFortune?.element || todayFortune?.element || "-"}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

