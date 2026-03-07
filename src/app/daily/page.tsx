"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, CalendarClock, RefreshCw, Sun, Moon, Sunset, Coffee,
  Sparkles, TrendingUp, Star, Flame, Droplets, Wind, Zap, Leaf
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getDayPillar, getHourPillar } from "@/core/calendar/ganji";
import AINarrativeSection from "@/components/result/AINarrativeSection";

type Locale = "ko" | "en";

type DailyApiFortune = {
  date?: string;
  message?: string;
  score?: number;
  luckyColor?: string;
  luckyNumber?: number;
  element?: string;
  caution?: string;
  pillarName?: string;
  pillarCode?: string;
};

const ELEMENT_ICON: Record<string, { icon: typeof Flame; color: string; bg: string }> = {
  "木": { icon: Leaf, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  "火": { icon: Flame, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
  "土": { icon: Star, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  "金": { icon: Zap, color: "text-slate-300", bg: "bg-slate-400/10 border-slate-400/20" },
  "水": { icon: Droplets, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
};

const SEGMENTS = [
  { time: "06:00 – 11:59", label: "활력", sub: "차분히 시작", icon: Sun, color: "from-amber-500 to-orange-500" },
  { time: "12:00 – 17:59", label: "집중", sub: "실행 집중", icon: TrendingUp, color: "from-indigo-500 to-purple-600" },
  { time: "18:00 – 23:59", label: "안정", sub: "회복 루틴", icon: Moon, color: "from-slate-500 to-slate-700" },
] as const;

function getTimeIcon(h: number) {
  if (h < 6) return <Moon className="w-4 h-4 text-indigo-400" />;
  if (h < 12) return <Coffee className="w-4 h-4 text-amber-400" />;
  if (h < 18) return <Sun className="w-4 h-4 text-yellow-400" />;
  return <Sunset className="w-4 h-4 text-rose-400" />;
}

export const dynamic = "force-dynamic";

function toYMD(date: Date) { return date.toISOString().slice(0, 10); }
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

function ScoreRing({ score }: { score: number }) {
  const r = 44; const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? "#34d399" : score >= 60 ? "#818cf8" : "#f87171";
  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="112" height="112" viewBox="0 0 112 112">
        <circle cx="56" cy="56" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <motion.circle cx="56" cy="56" r={r} fill="none" stroke={color}
          strokeWidth="8" strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${dash} ${circ}` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      </svg>
      <div className="text-center z-10">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-3xl font-black" style={{ color }}>
          {score}
        </motion.p>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">점</p>
      </div>
    </div>
  );
}

function ResultSummaryCard({ title, body, tone }: { title: string; body: string; tone: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${tone}`}>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-white/80">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-100">{body}</p>
    </div>
  );
}

export default function DailyFortunePage() {
  const router = useRouter();
  const [locale] = useState<Locale>("ko");
  const [focusDate, setFocusDate] = useState<Date>(() => new Date());
  const [activeTab, setActiveTab] = useState<"today" | "tomorrow" | "month">("today");
  const [fortune, setFortune] = useState<DailyApiFortune | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => { setNow(new Date()); }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const focusParam = params.get("focus");
    const tabParam = params.get("tab");
    if (focusParam) { const p = new Date(`${focusParam}T00:00:00`); if (!isNaN(p.getTime())) setFocusDate(p); }
    if (tabParam === "tomorrow" || tabParam === "month") setActiveTab(tabParam);
  }, []);

  const targetDate = useMemo(() => {
    if (activeTab === "tomorrow") return addDays(focusDate, 1);
    if (activeTab === "month") return new Date(focusDate.getFullYear(), focusDate.getMonth(), 1);
    return focusDate;
  }, [activeTab, focusDate]);

  useEffect(() => {
    const fetch_ = async () => {
      setIsLoading(true);
      const q = toYMD(targetDate);
      try {
        const res = await fetch(`/api/daily-fortune?date=${q}&locale=${locale}`);
        if (!res.ok) throw new Error("api_error");
        const data: DailyApiFortune = await res.json();
        setFortune(data);
      } catch {
        setFortune({ date: q, message: `${q} 운세를 불러올 수 없습니다.`, score: 50 });
      } finally {
        setIsLoading(false);
      }
    };
    setFortune(null);
    void fetch_();
  }, [activeTab, locale, targetDate]);

  // Live ganji
  const liveGanji = useMemo(() => {
    if (!now) return null;
    const day = getDayPillar(now);
    const hour = getHourPillar(now, day.stemIndex);
    return { day, hour };
  }, [now]);

  const elemMeta = fortune?.element ? ELEMENT_ICON[fortune.element] : null;
  const scoreVal = fortune?.score ?? 0;

  const TABS = [
    { key: "today" as const, label: "오늘" },
    { key: "tomorrow" as const, label: "내일" },
    { key: "month" as const, label: "이번 달" },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden pb-32">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px]" style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)" }} />
      </div>

      <div className="max-w-2xl mx-auto px-5 py-10 relative z-10">

        {/* Nav */}
        <div className="flex items-center justify-between mb-10">
          <button onClick={() => router.back()}
            className="w-11 h-11 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-all group">
            <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-black text-white tracking-tight">일일 운세</h1>
            {now && <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1">
              {getTimeIcon(now.getHours())} {now.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
            </p>}
          </div>
          <button
            onClick={() => { setFortune(null); void (async () => { const q = toYMD(targetDate); setIsLoading(true); try { const r = await fetch(`/api/daily-fortune?date=${q}&locale=${locale}`); const d = await r.json(); setFortune(d); } catch { setFortune({ date: q, message: "오류가 발생했습니다.", score: 50 }); } finally { setIsLoading(false); } })(); }}
            className="w-11 h-11 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all group"
            aria-label="새로고침"
          >
            <RefreshCw className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 group-hover:rotate-180 transition-all duration-500" />
          </button>
        </div>

        {/* Live Ganji Pill */}
        {liveGanji && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center justify-center gap-3">
            <div className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-[11px] font-black text-indigo-300 tracking-widest">
                일주 {liveGanji.day.fullName} · 시주 {liveGanji.hour.fullName}시
              </span>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 bg-white/[0.04] border border-white/8 rounded-2xl w-fit mx-auto">
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={cn("px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                activeTab === key
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-500 hover:text-slate-300"
              )}>
              {label}
            </button>
          ))}
        </div>

        {/* Main Fortune Card */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="rounded-[2.5rem] border border-white/8 bg-white/[0.03] p-10 flex flex-col items-center gap-6">
              <div className="space-y-3 w-full">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-4 bg-white/5 rounded-full animate-pulse ${i === 3 ? "w-2/3" : "w-full"}`} />
                ))}
              </div>
              <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">운세 데이터 분석 중...</p>
            </motion.div>
          ) : fortune ? (
            <motion.div key="fortune" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-4">

              {/* Score + Message */}
              <div className="rounded-[2.5rem] border border-white/10 bg-slate-900/60 backdrop-blur-xl p-8 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent rounded-full" />

                <div className="flex items-center gap-8">
                  {/* Score Ring */}
                  <ScoreRing score={scoreVal} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-1">{fortune.date}</p>
                    {fortune.pillarName && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-3">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        <span className="text-[10px] font-black text-indigo-300">{fortune.pillarName}</span>
                      </div>
                    )}
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">{fortune.message}</p>
                  </div>
                </div>

                {/* Lucky Row */}
                {(fortune.luckyColor || fortune.luckyNumber || fortune.element) && (
                  <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-3 gap-3">
                    {fortune.luckyColor && (
                      <div className="text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">럭키 컬러</p>
                        <p className="text-sm font-black text-slate-200">{fortune.luckyColor}</p>
                      </div>
                    )}
                    {fortune.luckyNumber !== undefined && (
                      <div className="text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">럭키 넘버</p>
                        <p className="text-2xl font-black text-amber-400">{fortune.luckyNumber}</p>
                      </div>
                    )}
                    {fortune.element && elemMeta && (
                      <div className="text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">오행 기운</p>
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg ${elemMeta.bg} border`}>
                          <elemMeta.icon className={`w-3 h-3 ${elemMeta.color}`} />
                          <span className={`text-xs font-black ${elemMeta.color}`}>{fortune.element}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <section className="grid gap-3 md:grid-cols-3">
                <ResultSummaryCard
                  title="☀️ Who You Are"
                  body={`오늘 흐름은 ${fortune.pillarName ?? "기본 운세"} 축을 중심으로 읽히며, 전체 에너지는 ${scoreVal}점 수준입니다.`}
                  tone="bg-cyan-500/10 border-cyan-300/20"
                />
                <ResultSummaryCard
                  title="📚 Why It Happens"
                  body={`${fortune.message ?? "운세 메시지"}${fortune.element ? ` 오행상으로는 ${fortune.element} 기운이 오늘의 핵심 축입니다.` : ""}`}
                  tone="bg-amber-500/10 border-amber-300/20"
                />
                <ResultSummaryCard
                  title="✨ What To Do"
                  body={`${fortune.caution ? `${fortune.caution} ` : ""}오늘은 무리하게 벌리기보다, 잘 되는 시간대에 핵심 한두 가지를 선명하게 처리하는 편이 좋습니다.`}
                  tone="bg-emerald-500/10 border-emerald-300/20"
                />
              </section>

              <AINarrativeSection
                persona="daily_timing"
                model="GEMINI-1.5"
                userName="오늘의 사용자"
                ageGroup="20s"
                tendency="Balanced"
                rawSajuData={fortune}
                queryType="daily"
                categoryFocus="base"
              />

              {/* Caution */}
              {fortune.caution && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-4 flex items-start gap-3">
                  <Zap className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-200/80 leading-relaxed">{fortune.caution}</p>
                </div>
              )}

              {/* Time Segments */}
              <div className="rounded-[2.5rem] border border-white/8 bg-white/[0.02] p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-4">시간대별 에너지</p>
                <div className="grid grid-cols-3 gap-3">
                  {SEGMENTS.map((seg) => {
                    const isCurrent = now && (
                      (seg.label === "활력" && now.getHours() >= 6 && now.getHours() < 12) ||
                      (seg.label === "집중" && now.getHours() >= 12 && now.getHours() < 18) ||
                      (seg.label === "안정" && (now.getHours() >= 18 || now.getHours() < 6))
                    );
                    return (
                      <div key={seg.time} className={cn(
                        "rounded-2xl p-4 border transition-all",
                        isCurrent ? "border-indigo-500/40 bg-indigo-500/10" : "border-white/5 bg-white/[0.02]"
                      )}>
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${seg.color} flex items-center justify-center mb-3`}>
                          <seg.icon className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-sm font-black text-slate-200">{seg.label}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{seg.sub}</p>
                        <p className="text-[9px] text-slate-600 mt-1.5 font-bold">{seg.time}</p>
                        {isCurrent && (
                          <div className="mt-2 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                            <span className="text-[9px] font-black text-indigo-400 uppercase">현재</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </main>
  );
}
