"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Calendar, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { AnalysisHistoryLog } from "@/types/history";
import { getAnalysisHistoryById, getAnalysisTypeInfo } from "@/lib/analysis-history";

function formatDate(timestamp: number) {
  const d = new Date(timestamp);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getSourceRoute(type: string) {
  const fallbackByType: Record<string, string> = {
    DREAM: "/dreams",
    NAMING: "/naming",
    PALMISTRY: "/palmistry",
    TAROT: "/tarot",
    ASTROLOGY: "/astrology",
    TOJEONG: "/tojeong",
    SAJU: "/saju",
  };
  return fallbackByType[type] || "/history";
}

function parseJsonResult(result: unknown) {
  if (typeof result === "string") {
    try {
      return JSON.parse(result);
    } catch {
      return null;
    }
  }
  return result ?? null;
}

export default function HistoryResultPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const id = typeof rawId === "string" ? rawId : "";

  const [log, setLog] = useState<AnalysisHistoryLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    try {
      if (!id) {
        setLog(null);
        return;
      }

      const found = getAnalysisHistoryById(id);
      setLog(found || null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRetry = () => {
    setIsRetrying(true);
    window.setTimeout(() => {
      setIsRetrying(false);
      load();
    }, 250);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center" aria-live="polite">
        <p className="text-slate-400 inline-flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          기록을 불러오는 중입니다.
        </p>
      </main>
    );
  }

  if (!log) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-2xl mx-auto px-6 py-20">
          <Link
            href="/history"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white"
            aria-label="목록으로 돌아가기"
          >
            <ArrowLeft className="w-4 h-4" />
            목록으로 돌아가기
          </Link>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h1 className="text-xl font-bold">기록을 찾을 수 없습니다.</h1>
            <p className="text-sm text-slate-400 mt-2">존재하지 않거나 삭제된 분석 기록입니다.</p>
            <button
              onClick={handleRetry}
              aria-label="기록 다시 불러오기"
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/10"
            >
              {isRetrying ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              기록 다시 불러오기
            </button>
          </div>
        </div>
      </main>
    );
  }

  const info = getAnalysisTypeInfo(log.type);
  const sourceRoute = log.resultUrl || getSourceRoute(log.type);
  const parsedResult = parseJsonResult(log.result);
  const typeLabels: Record<string, string> = {
    SAJU: "사주",
    DREAM: "해몽",
    TAROT: "타로",
    ASTROLOGY: "별자리",
    PALMISTRY: "손금",
    NAMING: "작명",
    TOJEONG: "토정비결",
  };
  const typeLabel = typeLabels[log.type] || log.type;

  const isTarot = log.type === "TAROT";
  const isTojeong = log.type === "TOJEONG";
  const isNaming = log.type === "NAMING";
  const isAstrology = log.type === "ASTROLOGY";
  const isDream = log.type === "DREAM";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100" aria-live="polite">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            aria-label="이전 화면으로 돌아가기"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            이전 화면으로
          </button>
          <Link
            href={sourceRoute}
            className="text-sm text-indigo-300 hover:text-indigo-200"
            aria-label="원본 분석 화면으로 이동"
          >
            원본 분석 화면
          </Link>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className={`w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center ${info.color}`}>{info.icon}</span>
            <div>
              <p className="text-xs text-slate-400">{typeLabel}</p>
              <h1 className="text-2xl font-black">{log.title}</h1>
            </div>
          </div>
          <p className="text-sm text-slate-300">{log.subtitle}</p>
          <div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-3 h-3" />
            {formatDate(log.timestamp)}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/30 p-6 space-y-3">
          <h2 className="text-sm font-bold">결과 요약</h2>
          <p className="text-sm text-slate-300">
            유형 <span className="text-indigo-300 font-black">{typeLabel}</span> | 소스 경로:
            <span className="text-slate-200 ml-1">{log.resultUrl ? "상세 경로" : "로컬 기록"}</span>
          </p>
          <p className="text-xs text-slate-400">
            원본 분석 화면에서 동일 입력으로 다시 실행하거나 기록 보기 화면에서 빠르게 확인할 수 있습니다.
          </p>
        </section>

        {isTarot ? (
          <section className="rounded-2xl border border-white/10 bg-black/30 p-6 space-y-4">
            <h2 className="text-sm font-bold">타로 결과</h2>
            <div className="grid md:grid-cols-3 gap-3">
              {(Array.isArray(parsedResult?.cards) ? parsedResult.cards : []).map((card: any, idx: number) => (
                <article key={`${card?.code || idx}`} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-slate-400">{parsedResult?.positions?.[idx] || `${idx + 1}번째 카드`}</p>
                  <p className="text-sm text-slate-100 mt-1">{card?.name || "-"}</p>
                  {card?.meaning ? <p className="text-xs text-slate-300 mt-1">{card.meaning}</p> : null}
                </article>
              ))}
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">요약</p>
              <p className="text-sm text-slate-200 mt-1">{parsedResult?.summary || "요약 데이터가 비어 있습니다."}</p>
            </div>
            <details className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <summary className="text-xs text-indigo-200 cursor-pointer">근거 신호</summary>
              <div className="mt-2 text-xs text-slate-200 space-y-1">
                {Array.isArray(parsedResult?.evidence) && parsedResult.evidence.length > 0 ? (
                  parsedResult.evidence.map((entry: { title?: string; tone?: string; signal?: string }, idx: number) => (
                    <p key={`${entry?.title}-${idx}`} className="flex items-start gap-2">
                      <ChevronRight className="w-3 h-3 mt-0.5 text-slate-400" />
                      <span>
                        [{entry?.tone || "근거"}] {entry?.title || `근거 ${idx + 1}`}: {entry?.signal || ""}
                      </span>
                    </p>
                  ))
                ) : (
                  <p className="text-slate-400">근거 신호가 아직 없습니다.</p>
                )}
              </div>
            </details>
          </section>
        ) : isTojeong ? (
          <section className="rounded-2xl border border-white/10 bg-black/30 p-6 space-y-4">
            <h2 className="text-sm font-bold">토정 결과</h2>
            <div className="grid md:grid-cols-3 gap-3">
              <article className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-emerald-200">한줄 요약</p>
                <p className="text-sm text-slate-200 mt-1">
                  {parsedResult?.oneLineSummary || parsedResult?.summary || "요약을 불러올 수 없습니다."}
                </p>
              </article>
              <article className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-sky-200">점수 / 등급</p>
                <p className="text-sm text-slate-200 mt-1">
                  {parsedResult?.mainScore || "-"} / {parsedResult?.mainGrade || "-"}
                </p>
              </article>
              <article className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-amber-200">근거</p>
                <p className="text-sm text-slate-200 mt-1">
                  근거 항목 {Array.isArray(parsedResult?.sources) ? parsedResult.sources.length : 0}건
                </p>
              </article>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">세부 항목</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-200">
                {Array.isArray(parsedResult?.categories) ? (
                  parsedResult.categories.map((item: { label?: string; score?: number; tone?: string; reason?: string; action?: string }) => (
                    <li key={`${item.label}-${item.score}`}>
                      - {item.label || "항목"}: {item.score ?? 0}점({item.tone || "-"}) / {item.reason || "-"} / {item.action || "-"}
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400">세부 항목이 비어 있습니다.</li>
                )}
              </ul>
            </div>
          </section>
        ) : isNaming ? (
          <section className="rounded-2xl border border-white/10 bg-black/30 p-6 space-y-4">
            <h2 className="text-sm font-bold">작명 결과</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <article className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-emerald-200">이름 / 한자</p>
                <p className="text-sm text-slate-200 mt-1">
                  {parsedResult?.name || "-"} / {parsedResult?.hanja || "한자 미입력"}
                </p>
              </article>
              <article className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-amber-200">획수</p>
                <p className="text-sm text-slate-200 mt-1">{parsedResult?.totalStrokes ?? "-"}</p>
              </article>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">권장 옵션</p>
              <p className="text-sm text-slate-200 mt-1">{parsedResult?.recommendations?.all || "-"}</p>
            </div>
          </section>
        ) : isAstrology ? (
          <section className="rounded-2xl border border-white/10 bg-black/30 p-6 space-y-4">
            <h2 className="text-sm font-bold">별자리 분석</h2>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">별자리 / 기준일</p>
              <p className="text-sm text-slate-200 mt-1">
                {parsedResult?.profile?.name || "-"} / {parsedResult?.selectedDate || "-"}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">달 위상</p>
              <p className="text-sm text-slate-200 mt-1">{parsedResult?.moonPhase?.label || "-"}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">항목 근거</p>
              <div className="mt-2 space-y-1">
                {Array.isArray(parsedResult?.categories) ? (
                  parsedResult.categories.map((item: any, idx: number) => (
                    <p key={`${item.label}-${idx}`} className="text-sm text-slate-200">
                      - {item.label}: {item.score ?? 0}점 ({item.note || "-"})
                    </p>
                  ))
                ) : (
                  <p className="text-slate-400">항목 근거가 비어 있습니다.</p>
                )}
              </div>
            </div>
          </section>
        ) : isDream ? (
          <section className="rounded-2xl border border-white/10 bg-black/30 p-6 space-y-4">
            <h2 className="text-sm font-bold">해몽 결과</h2>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">입력 문장</p>
              <p className="text-sm text-slate-200 mt-1">{parsedResult?.input || "-"}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">해몽 결과</p>
              <p className="text-sm text-slate-200 mt-1">{parsedResult?.interpretation || parsedResult?.result || "-"}</p>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-white/10 bg-black/30 p-6">
            <h2 className="text-sm font-bold mb-3">원본 결과 데이터</h2>
            <pre className="text-xs text-slate-200 whitespace-pre-wrap break-all">
              {JSON.stringify(log.result, null, 2)}
            </pre>
          </section>
        )}
      </div>
    </main>
  );
}
