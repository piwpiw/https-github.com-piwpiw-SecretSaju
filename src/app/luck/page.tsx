"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Flame,
  Shield,
  ShieldCheck,
  Sparkles,
  Zap,
  User,
  RefreshCw,
  Smartphone,
  Palette,
  Heart,
} from "lucide-react";
import { useWallet } from "@/components/WalletProvider";
import { useProfiles } from "@/components/ProfileProvider";
import JellyBalance from "@/components/shop/JellyBalance";
import LuxuryToast from "@/components/ui/LuxuryToast";
import { cn } from "@/lib/utils";

type TalismanId = "gold" | "love" | "shield" | "luck";

type Talisman = {
  id: TalismanId;
  name: string;
  desc: string;
  color: string;
  icon: React.ComponentType<React.ComponentProps<"svg">>;
  glyph: string;
};

const TALISMANS: Talisman[] = [
  {
    id: "gold",
    name: "황금 부적",
    desc: "재물 운의 흐름을 읽고 기회 타이밍을 명확히 읽어줍니다.",
    color: "from-amber-500 to-yellow-500",
    icon: Sparkles,
    glyph: "金",
  },
  {
    id: "love",
    name: "인연 부적",
    desc: "연인 관계를 더 견고하게 하며 새로운 인연을 끌어당깁니다.",
    color: "from-rose-500 to-pink-500",
    icon: Heart,
    glyph: "緣",
  },
  {
    id: "shield",
    name: "수호 부적",
    desc: "액운을 물리치고 내면의 기운을 다지는 역할을 합니다.",
    color: "from-indigo-500 to-blue-500",
    icon: ShieldCheck,
    glyph: "守",
  },
  {
    id: "luck",
    name: "만사 부적",
    desc: "하루 운세의 기운과 행운 행동 우선순위를 정해줍니다.",
    color: "from-purple-500 to-fuchsia-500",
    icon: Smartphone,
    glyph: "萬",
  },
];

function getRitualScore(talismanId?: TalismanId) {
  if (!talismanId) return 0;

  const scoreById: Record<TalismanId, number> = {
    gold: 92,
    love: 89,
    shield: 95,
    luck: 93,
  };

  return scoreById[talismanId];
}

function getRitualAdvice(talismanId?: TalismanId) {
  if (!talismanId) return "당신을 위한 새로운 기운을 불러오는 중입니다.";

  const advice: Record<TalismanId, string> = {
    gold: "부의 원리를 단순화하고 현재 우선순위의 자금 흐름을 명확하게 하는 기운이 실려있습니다.",
    love: "마음을 열어 대화의 흐름을 원활히 하고 관계의 신호에 귀 기울이게 돕습니다.",
    shield: "불필요한 에너지를 소모하지 않고 내실을 다지는 데 집중하여 외부의 흔들림을 완화합니다.",
    luck: "지금 당신의 망설임을 걷어내고 확신 있게 행동을 하도록 유도합니다.",
  };

  return advice[talismanId];
}

export default function LuckPage() {
  const router = useRouter();
  const { profiles, activeProfile, setActiveProfileById } = useProfiles();
  const { consumeChuru, churu } = useWallet();

  const [phase, setPhase] = useState<"intro" | "select" | "ritual" | "result">("intro");
  const [selectedTalisman, setSelectedTalisman] = useState<Talisman | null>(null);
  const [isBurning, setIsBurning] = useState(false);
  const [ritualScore, setRitualScore] = useState(0);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  const activeName = activeProfile?.name || "사용자";

  const handleStart = () => {
    if (churu < 5 && activeProfile?.name !== "admin") {
      setToastMsg("부적 의식을 시작하려면 최소 5 젤리가 필요합니다.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }
    setPhase("select");
  };

  const handleSelect = (t: Talisman) => {
    setSelectedTalisman(t);
    setPhase("ritual");
  };

  const handleBurn = async () => {
    if (isBurning) return;
    setIsBurning(true);
    consumeChuru(5);

    // Artificial ritual delay
    await new Promise((r) => setTimeout(r, 3000));
    setRitualScore(getRitualScore(selectedTalisman?.id));
    setPhase("result");
    setIsBurning(false);
  };

  const resetFlow = () => {
    setPhase("intro");
    setSelectedTalisman(null);
    setRitualScore(0);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 relative overflow-hidden pb-40">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.12),transparent_60%)] pointer-events-none" />
      {showToast && <LuxuryToast message={toastMsg} isVisible={showToast} />}

      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <header className="flex items-center justify-between mb-16">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white mb-1">운세 & 부적</h1>
            <p className="text-[10px] font-black text-indigo-400 tracking-[0.3em] uppercase">Spiritual Talisman Engine</p>
          </div>
          <JellyBalance />
        </header>

        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.section
              key="intro"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="text-center py-20 space-y-12"
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse" />
                <div className="relative w-32 h-40 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 border border-white/20 flex items-center justify-center shadow-2xl skew-x-3 -rotate-3">
                  <Flame className="w-16 h-16 text-white/90 animate-bounce" />
                </div>
              </div>

              <div className="space-y-6 max-w-lg mx-auto">
                <h2 className="text-5xl font-black text-white italic tracking-tighter leading-tight uppercase">
                  운명의 흐름을<br />바꾸는 기운
                </h2>
                <p className="text-lg text-slate-400 font-medium leading-relaxed italic">
                  동양의 신비로운 에너지를 담은 디지털 부적을 통해<br />
                  당신이 원하는 기운을 강화하고 액운을 막으세요.
                </p>
              </div>

              <div className="pt-10 flex flex-col items-center gap-6">
                <button
                  onClick={handleStart}
                  className="px-12 py-6 bg-white text-black font-black text-2xl italic tracking-tighter border-none rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)] flex items-center gap-4"
                >
                  <Sparkles className="w-8 h-8 text-indigo-500" />
                  의식 시작하기
                </button>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Requires 5 Jellies for Activation</p>
              </div>
            </motion.section>
          )}

          {phase === "select" && (
            <motion.section
              key="select"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="text-center space-y-2">
                <p className="text-xs font-black text-indigo-500 uppercase tracking-[0.4em]">Choice of Destiny</p>
                <h2 className="text-3xl font-black italic uppercase">강화할 기운 선택</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {TALISMANS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelect(t)}
                    className="p-8 rounded-[3rem] bg-slate-900/40 backdrop-blur-xl border border-white/5 hover:border-indigo-500/40 transition-all group flex items-center gap-8 text-left relative overflow-hidden"
                  >
                    <div className={cn(
                      "w-20 h-24 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform",
                      t.color
                    )}>
                      <t.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">{t.name}</h3>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">{t.desc}</p>
                    </div>
                    <div className="ml-auto w-12 h-12 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-indigo-500 group-hover:border-indigo-400 transition-all">
                      <Zap className="w-5 h-5 text-slate-100" />
                    </div>
                    <span className="absolute top-4 right-6 text-sm text-slate-300 font-black tracking-[0.3em] uppercase opacity-30">{t.glyph}</span>
                  </button>
                ))}
              </div>
            </motion.section>
          )}

          {phase === "ritual" && selectedTalisman && (
            <motion.section
              key="ritual"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-12"
            >
              <div className="space-y-2">
                <p className="text-xs font-black text-indigo-500 uppercase tracking-[0.4em]">Ritual Phase</p>
                <h2 className="text-3xl font-black italic uppercase">의식 가이드</h2>
                <p className="text-sm text-slate-400">
                  <span className="text-white font-black">{selectedTalisman.name}</span>을 화면에 배치하며 3초 후 최종 결단이 표시됩니다.
                </p>
              </div>

              <div className="relative w-72 h-96 mx-auto perspective-1000">
                <motion.div
                  animate={
                    isBurning
                      ? {
                        scale: [1, 1.05, 0.98, 0],
                        rotateY: [0, 18, -18, 0],
                        opacity: [1, 1, 0.2, 0],
                        filter: ["blur(0px)", "blur(0px)", "blur(24px)", "blur(0px)"],
                      }
                      : {
                        y: [0, -10, 0],
                        rotateX: [0, 5, 0],
                      }
                  }
                  transition={{ duration: 3, ease: "easeInOut" }}
                  onClick={handleBurn}
                  className={cn(
                    "w-full h-full rounded-[2.5rem] bg-gradient-to-br shadow-[0_0_80px_rgba(0,0,0,0.55)] border border-white/10 flex flex-col items-center justify-center p-10 relative cursor-pointer",
                    selectedTalisman.color
                  )}
                >
                  <div className="absolute inset-4 border-2 border-white/20 rounded-3xl" />
                  <div className="text-7xl mb-8">
                    <selectedTalisman.icon className="w-16 h-16 text-white" />
                  </div>
                  <div className="text-3xl font-black text-white/95 italic uppercase tracking-[0.2em]">{selectedTalisman.name}</div>
                  <div className="absolute bottom-10 inset-x-0 px-8">
                    <p className="text-xs text-white/70 mb-3 uppercase tracking-[0.25em]">터치 시 의식 시작합니다</p>
                    <div className="flex items-center justify-center gap-2">
                      {[1, 2, 3].map((i) => (
                        <Palette key={i} className="w-4 h-4 text-white/45 animate-pulse" />
                      ))}
                    </div>
                  </div>

                  {isBurning && (
                    <div className="absolute inset-0 z-20 overflow-hidden rounded-[2.5rem]">
                      <div className="absolute bottom-0 inset-x-0 h-full bg-gradient-to-t from-orange-500/80 via-yellow-400/40 to-transparent" />
                      <Flame className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-48 text-orange-300 animate-bounce" />
                    </div>
                  )}
                </motion.div>

                {!isBurning && (
                  <div className="absolute -bottom-12 left-0 w-full text-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 animate-pulse">
                      카드 터치 시 의식이 즉시 시작됩니다
                    </span>
                  </div>
                )}
              </div>
            </motion.section>
          )}

          {phase === "result" && selectedTalisman && (
            <motion.section
              key="result"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[4rem] p-10 md:p-12 text-center relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
              <div className="absolute -top-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]" />

              <div className="relative z-10 space-y-10">
                <div className="space-y-4">
                  <p className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-300 rounded-full text-[10px] font-black uppercase tracking-[0.24em] border border-green-500/20">
                    <Smartphone className="w-3 h-3" />
                    분석 완료
                  </p>
                  <h3 className="text-4xl font-black italic uppercase">결과 행렬</h3>
                </div>

                <div className="py-8">
                  <p className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-green-400">{ritualScore}%</p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.25em]">의식 에너지 지수</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div className="bg-white/5 border border-white/5 p-6 rounded-3xl">
                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2">선택된 부적</p>
                    <p className="text-sm font-black text-white">{selectedTalisman.name}</p>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-6 rounded-3xl md:col-span-2">
                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2">전략적 조언</p>
                    <p className="text-sm font-medium text-slate-200 leading-relaxed">{getRitualAdvice(selectedTalisman.id)}</p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/5 p-8 rounded-3xl text-left">
                  <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em]">상세 메시지</h4>
                  <p className="text-sm font-medium text-slate-300 leading-relaxed mt-3">
                    {activeName}님을 위한 {selectedTalisman.name}의 기운을 담았습니다.
                    행운은 노력하고 준비된 자에게 찾아오므로, 오늘의 의식을 당신의 망설임을 걷어내는 계기로 삼으시길 바랍니다.
                  </p>
                </div>

                <button
                  onClick={resetFlow}
                  className="w-full py-5 bg-transparent border-2 border-white/5 rounded-2xl text-slate-500 font-black uppercase tracking-[0.25em] hover:text-white hover:border-indigo-500/40 transition-all text-xs inline-flex items-center justify-center gap-3"
                >
                  <RefreshCw className="w-4 h-4" />
                  의식 다시 하기
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
