"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, Calendar } from "lucide-react";

import { AnalysisHistoryLog, AnalysisType } from "@/types/history";
import { getAnalysisTypeInfo, getAnalysisHistoryById } from "@/lib/analysis-history";

const ANALYSIS_TYPES: AnalysisType[] = ["SAJU", "DREAM", "PALMISTRY", "NAMING", "ASTROLOGY", "TAROT"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatDate(timestamp: number) {
  const d = new Date(timestamp);
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getAnalysisSource(type: string) {
  switch (type) {
    case "DREAM":
      return "/dreams";
    case "NAMING":
      return "/naming";
    case "PALMISTRY":
      return "/palmistry";
    case "TAROT":
      return "/tarot";
    case "ASTROLOGY":
      return "/astrology";
    case "SAJU":
      return "/select-fortune";
    default:
      return "/";
  }
}

function toSafeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asLabel(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function renderDreamResult(result: Record<string, any>) {
  const symbols = toSafeArray<{ name: string; value: string }>(result?.symbols);
  return (
    <section className="grid gap-6">
      <div className="rounded-3xl border border-indigo-400/30 bg-white/5 p-6">
        <h2 className="text-sm font-black uppercase tracking-widest text-indigo-300 mb-3">Interpretation</h2>
        <p className="text-lg text-slate-200 leading-relaxed">{asLabel(result?.description)}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Category</div>
          <div className="text-xl font-bold text-white">{asLabel(result?.category)}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Lucky Item</div>
          <div className="text-xl font-bold text-white">{asLabel(result?.luckyItem)}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Lucky Time</div>
          <div className="text-xl font-bold text-white">{asLabel(result?.luckyTime)}</div>
        </div>
      </div>
      <div>
        <div className="text-xs uppercase tracking-widest text-slate-400 mb-3">Resonance</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: "Financial", value: asNumber(result?.resonance?.financial) },
            { label: "Emotional", value: asNumber(result?.resonance?.emotional) },
            { label: "Vitality", value: asNumber(result?.resonance?.vitality) },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="text-[10px] uppercase tracking-widest text-slate-500">{item.label}</div>
              <div className="mt-2 text-3xl font-black text-white">{item.value}%</div>
            </div>
          ))}
        </div>
      </div>
      {symbols.length > 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-xs uppercase tracking-widest text-slate-500 mb-4">Symbols</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {symbols.map((symbol) => (
              <div key={symbol.name} className="rounded-xl border border-white/5 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-widest text-slate-400">{symbol.name}</div>
                <div className="font-black text-lg text-white mt-1">{asLabel(symbol.value)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function renderNamingResult(result: Record<string, any>) {
  const grid = toSafeArray<{ label: string; value: string; desc: string }>(result?.grid);
  const elements = toSafeArray<{ name: string; val: string; color: string }>(result?.elements);
  const sipsong = toSafeArray<{ name: string; impact: string; desc: string }>(result?.sipsong);

  return (
    <section className="grid gap-6">
      <div className="rounded-3xl border border-rose-400/30 bg-white/5 p-6">
        <h2 className="text-sm font-black uppercase tracking-widest text-rose-300 mb-3">Meaning</h2>
        <p className="text-lg text-slate-200 leading-relaxed">{asLabel(result?.meaning)}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Pronunciation</div>
          <div className="text-xl font-black text-white">{asLabel(result?.pronunciation)}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Score</div>
          <div className="text-3xl font-black text-white">{asNumber(result?.score)}</div>
        </div>
      </div>
      {grid.length > 0 && (
        <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Character Grid</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {grid.map((item) => (
              <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                <div className="font-bold text-white mb-2">{item.value}</div>
                <div className="text-sm text-slate-300">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {elements.length > 0 && (
        <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Element Ratio</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {elements.map((item) => (
              <div key={item.name} className="rounded-xl border border-white/5 bg-black/40 p-4">
                <div className="text-xs uppercase tracking-widest text-slate-500">{item.name}</div>
                <div className={`inline-block text-lg font-black text-white ${item.color ? "" : "text-cyan-300"}`}>{asLabel(item.val)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {sipsong.length > 0 && (
        <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Sipsong</h3>
          <div className="space-y-3">
            {sipsong.map((item) => (
              <div key={item.name} className="flex items-start justify-between gap-6 border-b border-white/10 pb-3 last:border-b-0">
                <div>
                  <div className="font-bold text-white">{item.name}</div>
                  <div className="text-sm text-slate-300">{item.desc}</div>
                </div>
                <div className="text-sm font-black text-white">{asLabel(item.impact)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function renderPalmistryResult(result: Record<string, any>) {
  const scores = [
    { label: "Life", value: asNumber(result?.life) },
    { label: "Head", value: asNumber(result?.head) },
    { label: "Heart", value: asNumber(result?.heart) },
    { label: "Luck", value: asNumber(result?.luck) },
  ];

  return (
    <section className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scores.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">{item.label}</div>
            <div className="text-3xl font-black text-white">{item.value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
        <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Raw Result</div>
        <pre className="text-xs text-slate-200 whitespace-pre-wrap break-all">{JSON.stringify(result, null, 2)}</pre>
      </div>
    </section>
  );
}

function renderTarotResult(result: Record<string, any>) {
  const meanings = toSafeArray<string>(result?.meanings);
  const cardName = asLabel(result?.name);
  return (
    <section className="grid gap-4">
      <div className="rounded-3xl border border-amber-400/30 bg-white/5 p-6 text-center">
        <div className="text-5xl mb-3">{asLabel(result?.icon)}</div>
        <div className="text-2xl font-black text-white">{cardName || "Tarot Reading"}</div>
        <div className="text-xs uppercase tracking-widest text-slate-400 mt-2">
          <span className="mr-2">Meanings:</span>
          {meanings.slice(0, 4).join(", ") || "N/A"}
        </div>
        <p className="text-sm text-slate-300 mt-4">{asLabel(result?.desc)}</p>
      </div>
    </section>
  );
}

function renderSajuResult(result: Record<string, any>) {
  const scores = toSafeArray<{ label: string; value: number }>(result?.elementScores);
  const pillars = toSafeArray<{ name: string; value: string }>(result?.fourPillars);

  return (
    <section className="grid gap-4">
      <div className="rounded-3xl border border-amber-400/30 bg-white/5 p-6">
        <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Code</div>
        <div className="text-2xl font-black text-white">{asLabel(result?.code)}</div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="text-xs uppercase tracking-widest text-slate-500 mb-3">Element Scores</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {scores.length > 0 ? (
            scores.map((item) => (
              <div key={item.label} className="rounded-xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs uppercase tracking-widest text-slate-500">{item.label}</div>
                <div className="text-2xl font-black text-white mt-1">{item.value}</div>
              </div>
            ))
          ) : (
            <div className="text-sm text-slate-300">No score data found.</div>
          )}
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
        <div className="text-xs uppercase tracking-widest text-slate-500 mb-3">Four Pillars</div>
        {pillars.length > 0 ? (
          <div className="space-y-2">
            {pillars.map((item) => (
              <div key={item.name} className="flex items-center justify-between border-b border-white/10 last:border-b-0 py-2">
                <span className="text-slate-300">{item.name}</span>
                <span className="font-black text-white">{item.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <pre className="text-xs text-slate-200 whitespace-pre-wrap break-all">{JSON.stringify(result, null, 2)}</pre>
        )}
      </div>
    </section>
  );
}

function renderAstrologyResult(result: Record<string, any>) {
  const scores = toSafeArray<{ key: string; value: number }>(result?.scores);
  return (
    <section className="grid gap-4">
      <div className="rounded-3xl border border-cyan-400/30 bg-white/5 p-6">
        <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Zodiac</div>
        <div className="text-2xl font-black text-white">{asLabel(result?.zodiac?.name || result?.zodiac?.id || "Unknown")}</div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
        <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Summary</div>
        <p className="text-white text-lg">{asLabel(result?.daily || result?.summary)}</p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="text-xs uppercase tracking-widest text-slate-500 mb-3">Scores</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {scores.length > 0 ? (
            scores.map((s) => (
              <div key={s.key} className="rounded-xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs uppercase tracking-widest text-slate-500">{s.key}</div>
                <div className="text-2xl font-black text-white">{s.value}</div>
              </div>
            ))
          ) : (
            <div className="text-sm text-slate-300">No score data found.</div>
          )}
        </div>
      </div>
    </section>
  );
}

function renderFallbackResult(log: AnalysisHistoryLog) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#070707] p-6">
      <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Result Payload</h2>
      <pre className="text-xs text-slate-200 whitespace-pre-wrap break-all bg-black/40 p-6 rounded-2xl border border-white/5 overflow-auto">
        {JSON.stringify(log.result, null, 2)}
      </pre>
    </section>
  );
}

export default function HistoryResultPage() {
  const router = useRouter();
  const params = useParams();
  const rawType = Array.isArray(params?.type) ? params.type[0] : params?.type;
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const id = typeof rawId === "string" ? rawId : "";

  const [log, setLog] = useState<AnalysisHistoryLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLog(null);
      setLoading(false);
      return;
    }

    const found = getAnalysisHistoryById(id);
    setLog(found || null);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <p className="text-slate-400">Loading analysis result...</p>
      </main>
    );
  }

  if (!log) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <div className="max-w-2xl mx-auto px-6 py-20 space-y-6">
          <Link href="/history" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to logs</span>
          </Link>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
            <h1 className="text-2xl font-black uppercase tracking-wide mb-2">Result not found</h1>
            <p className="text-slate-400 text-sm">The selected log may have been removed.</p>
          </div>
        </div>
      </main>
    );
  }

  const info = getAnalysisTypeInfo(log.type);
  const sourceRoute = log.resultUrl || getAnalysisSource(log.type);
  const typeToRender = log.type;

  return (
    <main className="min-h-screen bg-[#050505] text-foreground relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-black uppercase tracking-widest">Back</span>
          </button>
          <Link
            href={sourceRoute}
            className="text-xs uppercase tracking-widest text-slate-400 hover:text-indigo-400 transition-colors"
          >
            Go to source
          </Link>
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${info.color}`}>
              {info.icon}
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">{log.type}</p>
              <h1 className="text-3xl font-black uppercase tracking-tight text-white">{log.title}</h1>
            </div>
          </div>
          <p className="text-slate-300 mb-6">{log.subtitle}</p>
          <div className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            {formatDate(log.timestamp)}
          </div>
        </section>

        {typeToRender === "DREAM" && renderDreamResult(log.result)}
        {typeToRender === "NAMING" && renderNamingResult(log.result)}
        {typeToRender === "PALMISTRY" && renderPalmistryResult(log.result)}
        {typeToRender === "TAROT" && renderTarotResult(log.result)}
        {typeToRender === "SAJU" && renderSajuResult(log.result)}
        {typeToRender === "ASTROLOGY" && renderAstrologyResult(log.result)}
        {!["DREAM", "NAMING", "PALMISTRY", "TAROT", "SAJU", "ASTROLOGY"].includes(typeToRender) && renderFallbackResult(log)}
      </div>
    </main>
  );
}
