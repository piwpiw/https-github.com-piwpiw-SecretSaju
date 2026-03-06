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

type Locale = "ko" | "en";
type DailyFortune = {
  date: string;
  message: string;
  luckyScore: number;
};

export const dynamic = "force-dynamic";

const WEEK_KO = ["일", "월", "화", "수", "목", "금", "토"];
  const WEEK_EN = ["일", "월", "화", "수", "목", "금", "토"];

const FALLBACK_MESSAGES: Record<Locale, string> = {
  ko: "행운은 숫자가 아닌 패턴을 읽는 과정에서 만들어집니다.",
  en: "행운은 숫자가 아닌 패턴을 읽는 과정에서 만들어집니다.",
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
            {locale === "en" ? "만세력 캘린더" : "만세력 캘린더"}
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
                className={`h-16 rounded-xl border p-2 text-left ${
                  isSelected
                    ? "border-fuchsia-400 bg-fuchsia-500/20"
                    : "border-white/10 bg-white/5 hover:border-white/30"
                } ${isCurrent ? "" : "opacity-40"}`}
              >
                <div className="text-sm font-black">{day.getDate()}</div>
                <div className="text-[10px] text-slate-300">{isToday ? "오늘" : ""}</div>
              </button>
            );
          })}
        </div>

        <section className="mt-8 border border-white/10 rounded-2xl p-5 bg-slate-900/40">
          <p className="text-xs uppercase tracking-[0.2em] text-fuchsia-300">선택한 날짜</p>
          <h2 className="text-2xl mt-1 font-black">{selectedLabel}</h2>
          <p className="text-slate-300 mt-3">{selectedFortune?.message || todayFortune?.message}</p>
          <p className="mt-2 text-sm text-slate-400">행운 점수: {selectedFortune?.luckyScore ?? todayFortune?.luckyScore}</p>
        </section>
      </div>
    </main>
  );
}

