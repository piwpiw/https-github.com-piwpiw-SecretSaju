"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, Calendar } from "lucide-react";
import { AnalysisHistoryLog } from "@/types/history";
import { getAnalysisHistoryById, getAnalysisTypeInfo } from "@/lib/analysis-history";

function formatDate(timestamp: number) {
  const d = new Date(timestamp);
  const pad = (v: number) => String(v).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getSourceRoute(type: string) {
  if (type === "DREAM") return "/dreams";
  if (type === "NAMING") return "/naming";
  if (type === "PALMISTRY") return "/palmistry";
  if (type === "TAROT") return "/tarot";
  if (type === "ASTROLOGY") return "/astrology";
  if (type === "SAJU") return "/saju";
  return "/history";
}

export default function HistoryResultPage() {
  const router = useRouter();
  const params = useParams();
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
    setLog(getAnalysisHistoryById(id) || null);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-slate-400">분석 결과를 불러오는 중...</p>
      </main>
    );
  }

  if (!log) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-2xl mx-auto px-6 py-20">
          <Link href="/history" className="inline-flex items-center gap-2 text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            기록 목록
          </Link>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h1 className="text-xl font-bold">결과를 찾을 수 없습니다.</h1>
            <p className="text-sm text-slate-400 mt-2">삭제되었거나 접근할 수 없는 기록입니다.</p>
          </div>
        </div>
      </main>
    );
  }

  const info = getAnalysisTypeInfo(log.type);
  const sourceRoute = log.resultUrl || getSourceRoute(log.type);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </button>
          <Link href={sourceRoute} className="text-sm text-indigo-300 hover:text-indigo-200">
            원본 페이지
          </Link>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className={`w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center ${info.color}`}>{info.icon}</span>
            <div>
              <p className="text-xs text-slate-400">{log.type}</p>
              <h1 className="text-2xl font-black">{log.title}</h1>
            </div>
          </div>
          <p className="text-sm text-slate-300">{log.subtitle}</p>
          <div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-3 h-3" />
            {formatDate(log.timestamp)}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/30 p-6">
          <h2 className="text-sm font-bold mb-3">결과 데이터</h2>
          <pre className="text-xs text-slate-200 whitespace-pre-wrap break-all">{JSON.stringify(log.result, null, 2)}</pre>
        </section>
      </div>
    </main>
  );
}
