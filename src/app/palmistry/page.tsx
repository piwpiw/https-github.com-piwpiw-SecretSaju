"use client";

/**
 * 손금 화면.
 *
 * 예전에는 유형 세 개 중 하나를 고르면 그 유형 설명을 그대로 돌려줬다.
 * 손금을 본 적이 없었다. 이제 실제로 손바닥 사진을 찍거나 앨범에서 골라
 * 올리고, 그 사진을 분석한다.
 */

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Hand,
  Images,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { saveAnalysisToHistory } from "@/lib/app/analysis-history";

type PalmLine = { name: string; reading: string };

type PalmReading = {
  isPalm: boolean;
  retakeReason: string;
  observed: string[];
  summary: string;
  lines: PalmLine[];
  actions: string[];
};

/** 긴 변 기준 축소 크기. 손금 선은 이 정도면 충분히 보인다. */
const MAX_EDGE = 1400;

/**
 * 원본 사진은 요즘 폰에서 5~10MB 라 그대로 보내면 업로드가 오래 걸린다.
 * 캔버스로 줄여서 JPEG 로 다시 뽑는다.
 */
function toResizedDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("사진을 처리하지 못했습니다."));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("사진을 열지 못했습니다. 다른 사진으로 다시 시도해 주세요."));
    };

    img.src = url;
  });
}

const TIPS = [
  "손바닥이 화면을 가득 채우게 찍어 주세요.",
  "밝은 곳에서, 그림자가 지지 않게 찍어 주세요.",
  "손가락을 살짝 펴고 손금이 접히지 않게 해 주세요.",
  "보통 주로 쓰는 손(오른손잡이면 오른손)을 찍습니다.",
];

export default function PalmistryPage() {
  const router = useRouter();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string>("");
  const [reading, setReading] = useState<PalmReading | null>(null);
  const [error, setError] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);

  const analyze = useCallback(async (dataUrl: string) => {
    setAnalyzing(true);
    setError("");
    setReading(null);

    try {
      const res = await fetch("/api/palmistry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "분석에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }

      const result = data.reading as PalmReading;
      setReading(result);

      // 손바닥이 아니면 해석이 없으니 기록도 남기지 않는다
      if (result.isPalm) {
        saveAnalysisToHistory({
          type: "PALMISTRY",
          title: "손금 분석",
          subtitle: result.summary.slice(0, 40),
          result,
        });
      }
    } catch {
      setError("연결에 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setError("사진 파일만 올릴 수 있습니다.");
        return;
      }

      setError("");
      setReading(null);

      try {
        const dataUrl = await toResizedDataUrl(file);
        setPreview(dataUrl);
        await analyze(dataUrl);
      } catch (e) {
        setError(e instanceof Error ? e.message : "사진을 처리하지 못했습니다.");
      }
    },
    [analyze],
  );

  const reset = () => {
    setPreview("");
    setReading(null);
    setError("");
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (albumInputRef.current) albumInputRef.current.value = "";
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden pb-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(20,184,166,0.16),transparent_45%)]" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 relative z-10">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => router.back()}
            aria-label="이전 화면으로 돌아가기"
            className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-slate-200" />
          </button>
          {(preview || reading) && (
            <button
              onClick={reset}
              className="text-[15px] px-4 py-2.5 rounded-full border border-white/10 bg-white/10 inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              다시 찍기
            </button>
          )}
        </div>

        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-6">
          <div className="inline-flex items-center gap-2 text-emerald-300 font-black text-[15px]">
            <Hand className="w-4 h-4" /> 손금 보기
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mt-2">손바닥 사진을 올려 주세요</h1>
          <p className="text-[15px] leading-[1.8] text-slate-300 mt-2 break-keep">
            손바닥을 찍은 사진에서 선을 읽어 해석합니다.
            <br />
            사진은 분석에만 쓰고 따로 저장하지 않습니다.
          </p>

          {/* 실제 파일 입력. capture 를 붙이면 폰에서 카메라가 바로 열린다 */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            aria-label="카메라로 손바닥 촬영"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <input
            ref={albumInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            aria-label="앨범에서 손바닥 사진 선택"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          {preview ? (
            <div className="mt-5 rounded-2xl overflow-hidden border border-white/10 bg-black/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="올린 손바닥 사진" className="w-full max-h-[420px] object-contain" />
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-center">
              <Hand className="w-10 h-10 mx-auto text-emerald-300/70" />
              <p className="mt-3 text-[15px] text-slate-300 break-keep">
                아직 올린 사진이 없습니다.
                <br />
                아래에서 촬영하거나 앨범에서 고르세요.
              </p>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={analyzing}
              className="py-4 rounded-2xl bg-emerald-500 text-slate-900 font-black inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Camera className="w-5 h-5" /> 촬영하기
            </button>
            <button
              type="button"
              onClick={() => albumInputRef.current?.click()}
              disabled={analyzing}
              className="py-4 rounded-2xl border border-white/15 bg-white/10 font-black inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Images className="w-5 h-5" /> 사진 고르기
            </button>
          </div>

          {preview && !analyzing && (
            <button
              type="button"
              onClick={() => analyze(preview)}
              className="mt-3 w-full py-4 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 text-emerald-200 font-black inline-flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" /> 이 사진으로 다시 분석
            </button>
          )}

          <ul className="mt-5 space-y-1.5">
            {TIPS.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-[14px] leading-[1.7] text-slate-400 break-keep">
                <span className="mt-2 w-1 h-1 rounded-full bg-slate-500 shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        {analyzing && (
          <section className="mt-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-center">
            <Loader2 className="w-6 h-6 mx-auto text-emerald-300 animate-spin" />
            <p className="mt-3 text-[15px] text-slate-300">사진에서 손금을 읽는 중입니다…</p>
          </section>
        )}

        {error && (
          <section
            role="alert"
            className="mt-4 rounded-3xl border border-rose-500/30 bg-rose-950/40 p-5 text-[15px] leading-[1.8] text-rose-200 break-keep"
          >
            {error}
          </section>
        )}

        {reading && !reading.isPalm && (
          <section className="mt-4 rounded-3xl border border-amber-500/30 bg-amber-950/30 p-5">
            <div className="flex items-center gap-2 text-amber-300 font-black text-[15px]">
              <TriangleAlert className="w-4 h-4" /> 손바닥이 잘 안 보여요
            </div>
            <p className="mt-2 text-[15px] leading-[1.8] text-amber-100/90 break-keep">
              {reading.retakeReason || "사진에서 손바닥을 찾지 못했습니다."}
              <br />
              손바닥이 화면을 채우도록 다시 찍어 주세요.
            </p>
          </section>
        )}

        {reading && reading.isPalm && (
          <div className="mt-4 space-y-4">
            <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-6">
              <div className="flex items-center gap-2 text-pink-300 font-black text-[15px]">
                <Sparkles className="w-4 h-4" /> 한눈에
              </div>
              <p className="mt-3 text-[16px] leading-[1.85] text-slate-100 break-keep">{reading.summary}</p>
            </section>

            {reading.observed.length > 0 && (
              <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-6">
                <div className="flex items-center gap-2 text-cyan-300 font-black text-[15px]">
                  <Search className="w-4 h-4" /> 사진에서 보인 것
                </div>
                <ul className="mt-3 space-y-2">
                  {reading.observed.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[15px] leading-[1.8] text-slate-200 break-keep">
                      <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {reading.lines.length > 0 && (
              <section className="space-y-3">
                {reading.lines.map((line) => (
                  <div key={line.name} className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-6">
                    <p className="text-[15px] font-black text-emerald-300">{line.name}</p>
                    <p className="mt-2 text-[15px] leading-[1.85] text-slate-200 break-keep">{line.reading}</p>
                  </div>
                ))}
              </section>
            )}

            {reading.actions.length > 0 && (
              <section className="rounded-3xl border border-emerald-500/25 bg-emerald-950/30 p-5 sm:p-6">
                <p className="text-[15px] font-black text-emerald-300">오늘 해볼 것</p>
                <ul className="mt-3 space-y-2">
                  {reading.actions.map((action) => (
                    <li key={action} className="flex items-start gap-2 text-[15px] leading-[1.8] text-emerald-50 break-keep">
                      <CheckCircle2 className="w-4 h-4 mt-1 text-emerald-300 shrink-0" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <p className="text-[14px] leading-[1.7] text-slate-500 text-center break-keep">
              손금 해석은 참고용입니다. 건강이 걱정되면 병원에서 확인하세요.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
