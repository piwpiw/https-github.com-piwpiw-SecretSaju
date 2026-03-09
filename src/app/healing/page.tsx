"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Heart, RefreshCw, Sparkles, Zap } from "lucide-react";
import { useWallet } from "@/components/payment/WalletProvider";
import { useProfiles } from "@/components/profile/ProfileProvider";
import AppOnlyModal from "@/components/ui/AppOnlyModal";
import JellyBalance from "@/components/shop/JellyBalance";

const FORTUNE_TEXTS = [
  "오늘은 작게 멈추고 숨을 고르면 흐름이 정리됩니다.",
  "지금의 고민은 해결 가능한 단계에 들어왔습니다.",
  "관계에서 먼저 듣는 태도가 좋은 신호를 만듭니다.",
  "새로운 시도보다 기존 루틴 정리가 더 큰 효과를 냅니다.",
  "오늘의 선택 하나가 다음 주의 부담을 줄여줍니다.",
  "충분히 잘하고 있습니다. 속도를 조금만 낮추세요.",
];

const APP_ONLY_FEATURES = [
  { key: "breath", title: "호흡 루틴", desc: "3분 안정 호흡 가이드" },
  { key: "sleep", title: "수면 정리", desc: "잠들기 전 감정 정돈" },
  { key: "reset", title: "감정 리셋", desc: "즉시 진정 모듈" },
  { key: "focus", title: "집중 부스터", desc: "작업 몰입 타이머" },
];

export default function HealingPage() {
  const router = useRouter();
  const { consumeChuru } = useWallet();
  const { profiles, activeProfile, setActiveProfileById } = useProfiles();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const profileName = activeProfile?.name || "현재 프로필";

  const profileOptions = useMemo(() => profiles.slice(0, 4), [profiles]);

  const handleDraw = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const consumed = consumeChuru(1);
      if (!consumed) {
        setErrorMsg("젤리가 부족합니다.");
        return;
      }
      const next = FORTUNE_TEXTS[Math.floor(Math.random() * FORTUNE_TEXTS.length)];
      setResult(next);
    } catch {
      setErrorMsg("젤리가 부족하거나 네트워크 상태가 불안정합니다.");
    } finally {
      setLoading(false);
    }
  };

  const openFeature = (title: string) => {
    setModalTitle(title);
    setModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden pb-24">
      <div className="absolute inset-x-0 top-0 h-[55dvh] bg-[radial-gradient(circle_at_70%_0%,rgba(16,185,129,0.2),transparent_60%)] pointer-events-none" />
      <div className="absolute -left-32 top-40 w-96 h-96 rounded-full bg-indigo-700/10 blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto px-5 py-10 relative z-10">
        <header className="flex items-center justify-between mb-10">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300 mb-1">
              Healing Mode
            </p>
            <h1 className="text-3xl font-black italic tracking-tight">마음 회복 스테이션</h1>
          </div>
          <JellyBalance />
        </header>

        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-400">대상 프로필</p>
              <p className="text-lg font-black">{profileName}</p>
            </div>
            <Sparkles className="w-5 h-5 text-emerald-300" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {profileOptions.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveProfileById(p.id)}
                className={`rounded-2xl border p-3 text-sm font-bold truncate ${
                  activeProfile?.id === p.id
                    ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-200"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-amber-500/20 bg-amber-500/5 p-8 text-center mb-8">
          <p className="text-[10px] uppercase tracking-[0.25em] font-black text-amber-300 mb-3">Daily Draw</p>
          <h2 className="text-2xl font-black mb-2">힐링 포춘 1회 뽑기</h2>
          <p className="text-sm text-slate-400 mb-6">젤리 1개를 사용해 오늘의 회복 메시지를 확인합니다.</p>

          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-3xl border border-amber-500/30 bg-black/20 p-6"
              >
                <p className="text-lg font-black text-amber-100 leading-relaxed">“{result}”</p>
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="mt-5 inline-flex items-center gap-2 text-xs font-black text-amber-300 hover:text-amber-100"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  다시 뽑기 준비
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="draw"
                type="button"
                onClick={handleDraw}
                disabled={loading}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-40 h-40 mx-auto rounded-full border border-amber-400/40 bg-slate-900/70 hover:bg-amber-500/10 transition-all flex items-center justify-center"
              >
                {loading ? <RefreshCw className="w-10 h-10 animate-spin text-amber-300" /> : <span className="text-6xl">🍪</span>}
              </motion.button>
            )}
          </AnimatePresence>

          {errorMsg && <p className="mt-4 text-xs font-bold text-rose-300">{errorMsg}</p>}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-indigo-300" />
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-300">App Only Features</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {APP_ONLY_FEATURES.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => openFeature(f.title)}
                className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 text-left hover:bg-slate-800/80"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center mb-3">
                  <Heart className="w-5 h-5 text-indigo-300" />
                </div>
                <p className="font-black text-white">{f.title}</p>
                <p className="text-xs text-slate-400 mt-1">{f.desc}</p>
              </button>
            ))}
          </div>
        </section>
      </div>

      <AppOnlyModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalTitle} />
    </main>
  );
}
