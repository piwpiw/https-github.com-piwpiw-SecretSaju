"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, Loader2, Sparkles, Users, User, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import JellyBalance from "@/components/shop/JellyBalance";
import { useWallet } from "@/components/WalletProvider";
import { useProfiles } from "@/components/ProfileProvider";
import LuxuryToast from "@/components/ui/LuxuryToast";

type MonthItem = {
  month: string;
  title: string;
  description: string;
};

const YEAR = 2026;

const MONTH_REPORTS: MonthItem[] = [
  {
    month: "1~3월",
    title: "기반을 다지는 시기",
    description: "계획 수립, 문서 정리, 협업 전환에 유리합니다.",
  },
  {
    month: "4~6월",
    title: "의미 있는 도전",
    description: "관계 정리와 투자 판단에서 감정이 먼저 흔들리기 쉬워 냉정을 유지하세요.",
  },
  {
    month: "7~9월",
    title: "성장과 확장",
    description: "새 일거리나 제안이 생길 수 있어 우선순위를 명확히 하면 좋습니다.",
  },
  {
    month: "10~12월",
    title: "성과 회수기",
    description: "지금까지의 선택을 점검해 마무리 전략을 세우면 효율이 올라갑니다.",
  },
];

export default function TojeongPage() {
  const router = useRouter();
  const { consumeChuru, churu } = useWallet();
  const { profiles, activeProfile } = useProfiles();

  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  const activeName = useMemo(() => {
    if (activeProfile?.name) return activeProfile.name;
    return profiles[0]?.name || "선택된 프로필";
  }, [activeProfile, profiles]);

  const handleCalculate = () => {
    if (churu < 40) {
      setToastMsg("토정비결은 40젤리가 필요합니다.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
      return;
    }

    consumeChuru(40);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 relative overflow-hidden pb-40 font-sans">
      <LuxuryToast message={toastMsg} isVisible={showToast} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(168,85,247,0.12),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.12),transparent_40%)] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => router.back()}
            className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>
          <JellyBalance />
        </div>

        <section className="bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 md:p-12 space-y-7">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-slate-800/60 text-xs font-black uppercase tracking-[0.3em] text-amber-300">
            <CalendarDays className="w-4 h-4" /> 연간 운세 (토정비결)
          </div>
          <h1 className="text-3xl md:text-4xl font-black italic tracking-tight text-white">{YEAR}년 토정비결 리포트</h1>
          <p className="text-slate-300">
            대상: <span className="text-white font-bold">{activeName}</span>. 월별 흐름과 강점·주의점을 정리해 드립니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MONTH_REPORTS.map((item) => (
              <div key={item.month} className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
                <div className="text-sm font-black text-amber-300">{item.month}</div>
                <div className="mt-2 text-lg font-bold text-white">{item.title}</div>
                <p className="mt-2 text-sm text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleCalculate}
            disabled={isLoading}
            className="mt-4 w-full py-5 rounded-2xl bg-amber-500 text-slate-900 font-black text-lg uppercase tracking-[0.2em] disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {isLoading ? "리포트 생성 중..." : "40젤리로 연간 운세 받기"}
          </button>
        </section>

        <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-slate-900/45 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-cyan-300 font-black"><User className="w-4 h-4" /> 핵심 조언</div>
            <p className="mt-3 text-slate-300">큰 판단은 감정 직전이 아니라 기록 기반으로 검토하세요.</p>
          </div>
          <div className="bg-slate-900/45 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-cyan-300 font-black"><Users className="w-4 h-4" /> 관계운</div>
            <p className="mt-3 text-slate-300">관계는 한 번에 급변하지 않습니다. 일주일 단위 피드백을 권장합니다.</p>
          </div>
          <div className="bg-slate-900/45 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-cyan-300 font-black"><ChevronRight className="w-4 h-4" /> 다음 행동</div>
            <p className="mt-3 text-slate-300">월 초 목표 점검표를 만들어 실행하면 성과가 더 또렷해집니다.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
