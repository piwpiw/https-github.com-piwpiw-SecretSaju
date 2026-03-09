"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, ChevronRight, Edit3, Heart, Loader2, RefreshCw, Sparkles, WalletCards } from "lucide-react";
import JellyBalance from "@/components/shop/JellyBalance";
import { useWallet } from "@/components/payment/WalletProvider";
import { useProfiles } from "@/components/profile/ProfileProvider";
import LuxuryToast from "@/components/ui/LuxuryToast";
import { saveAnalysisToHistory } from "@/lib/app/analysis-history";

export const dynamic = "force-dynamic";

const CHOSUNG = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
];

const JOONGSUNG = [
  "ㅏ",
  "ㅐ",
  "ㅑ",
  "ㅒ",
  "ㅓ",
  "ㅔ",
  "ㅕ",
  "ㅖ",
  "ㅗ",
  "ㅛ",
  "ㅜ",
  "ㅠ",
  "ㅡ",
  "ㅣ",
  "ㅝ",
  "ㅞ",
  "ㅟ",
  "ㅢ",
  "ㅘ",
  "ㅙ",
  "ㅚ",
  "ㅛ",
];

const JONGSUNG = [
  "",
  "ㄱ",
  "ㄲ",
  "ㄳ",
  "ㄴ",
  "ㄵ",
  "ㄶ",
  "ㄷ",
  "ㄹ",
  "ㄺ",
  "ㄻ",
  "ㄼ",
  "ㄽ",
  "ㄾ",
  "ㄿ",
  "ㅀ",
  "ㅁ",
  "ㅂ",
  "ㅄ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
];

const ELEMENT_BY_CHO: Record<string, "목" | "화" | "토" | "금" | "수"> = {
  "ㄱ": "수",
  "ㄲ": "수",
  "ㄳ": "금",
  "ㄴ": "목",
  "ㄵ": "금",
  "ㄶ": "토",
  "ㄷ": "금",
  "ㄸ": "금",
  "ㄹ": "화",
  "ㄺ": "금",
  "ㄻ": "토",
  "ㄼ": "목",
  "ㄽ": "토",
  "ㄾ": "목",
  "ㄿ": "금",
  "ㅀ": "목",
  "ㅁ": "토",
  "ㅂ": "금",
  "ㅃ": "금",
  "ㅄ": "화",
  "ㅅ": "화",
  "ㅆ": "화",
  "ㅇ": "토",
  "ㅈ": "목",
  "ㅉ": "목",
  "ㅊ": "화",
  "ㅋ": "금",
  "ㅌ": "화",
  "ㅍ": "토",
  "ㅎ": "토",
};

const STROKE_BY_ELEMENT: Record<string, number> = {
  목: 6,
  화: 6,
  토: 5,
  금: 7,
  수: 4,
};

const SCENARIOS = [
  { key: "all", title: "전체" },
  { key: "career", title: "커리어" },
  { key: "money", title: "재정" },
  { key: "love", title: "연애" },
  { key: "health", title: "건강" },
  { key: "execution", title: "실행" },
] as const;

type ScenarioKey = (typeof SCENARIOS)[number]["key"];

type SyllableAnalysis = {
  ch: string;
  strokes: { initial: number; medial: number; final: number; total: number };
  element: string;
};

type NameAnalysis = {
  name: string;
  hanja: string;
  totalStrokes: number;
  harmonyScore: number;
  elementDistribution: Record<string, number>;
  scoreSet: { career: number; money: number; love: number; health: number; execution: number };
  syllables: SyllableAnalysis[];
  personality: string[];
  warning: string[];
  recommendations: Record<string, string>;
};

type HangulDecompose = {
  cho: string;
  jung: string;
  jong: string;
};

function decomposeHangul(char: string): HangulDecompose | null {
  const code = char.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return null;
  const offset = code - 0xac00;
  const cho = Math.floor(offset / (21 * 28));
  const rest = offset % (21 * 28);
  const jung = Math.floor(rest / 28);
  const jong = rest % 28;
  return {
    cho: CHOSUNG[cho] ?? "ㄱ",
    jung: JOONGSUNG[jung] ?? "ㅏ",
    jong: JONGSUNG[jong] ?? "",
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function scoreFromValue(total: number) {
  return clamp(Math.round(42 + (total % 26) + total / 6), 40, 98);
}

function buildScenarioAdvice(scenario: ScenarioKey) {
  const base = {
    all: "하루 1개 핵심 목표만 설정하고 48시간 후 성과를 점검합니다.",
    career: "주간 목표 1개를 정하고 매일 25분 단위 실행 블록을 2회 수행하세요.",
    money: "필요 지출, 선택 지출, 즉흥 지출로 분류해 24시간 룰을 적용합니다.",
    love: "모호한 상황에서는 감정 단정 대신 확인 질문 1개를 먼저 던져 보정하세요.",
    health: "수면, 수분, 호흡 루틴을 7일간 고정하고 편차를 기록하세요.",
    execution: "25분 집중 + 5분 정리 패턴으로 한 세트씩 처리하세요.",
  } as const;
  return base[scenario];
}

export default function NamingPage() {
  const router = useRouter();
  const { consumeChuru, churu, isAdmin } = useWallet();
  const { profiles, activeProfile, setActiveProfileById } = useProfiles();

  const [name, setName] = useState("");
  const [hanja, setHanja] = useState("");
  const [scenario, setScenario] = useState<ScenarioKey>("all");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NameAnalysis | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [nameError, setNameError] = useState("");
  const [hanjaError, setHanjaError] = useState("");

  useEffect(() => {
    if (!name && activeProfile?.name) setName(activeProfile.name);
  }, [activeProfile, name]);

  useEffect(() => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    const params = new URLSearchParams(search);
    const queryName = params.get("name") ?? "";
    const queryHanja = params.get("hanja") ?? "";
    if (queryName && !name) setName(queryName);
    if (queryHanja && !hanja) setHanja(queryHanja);
  }, [name, hanja]);

  const allStrokes = useMemo(() => {
    return name
      .trim()
      .split("")
      .reduce((acc, ch) => {
        const d = decomposeHangul(ch);
        if (!d) return acc;
        const element = ELEMENT_BY_CHO[d.cho] ?? "토";
        const base = STROKE_BY_ELEMENT[element];
        return acc + base + Math.max(1, d.jong.length) + d.cho.length + d.jung.length;
      }, 0);
  }, [name]);
  const isNameValid = name.trim().length >= 2;
  const isHanjaValid = /[\u4e00-\u9fff]|\s/.test(hanja) || hanja.trim().length === 0;

  useEffect(() => {
    if (!name.trim()) {
      setNameError("");
      return;
    }
    setNameError(isNameValid ? "" : "이름은 2자 이상 입력해 주세요.");
  }, [name, isNameValid]);

  useEffect(() => {
    if (!hanja.trim()) {
      setHanjaError("");
      return;
    }
    setHanjaError(isHanjaValid ? "" : "한자는 한글/영문 혼용보다 한자 또는 공백 형태로 입력해 주세요.");
  }, [hanja, isHanjaValid]);

  const toast = (message: string) => {
    setToastMsg(message);
    setShowToast(true);
    window.setTimeout(() => setShowToast(false), 2100);
  };

  const run = async () => {
    if (!isNameValid) {
      toast("이름을 먼저 입력해 주세요.");
      return;
    }

    if (!isHanjaValid) {
      toast("한자 입력 형식을 다시 확인해 주세요.");
      return;
    }

    if (!isAdmin && churu < 30) {
      toast("젤리가 부족합니다. 충전 후 실행해 주세요.");
      return;
    }

    if (!consumeChuru(30)) {
      toast("젤리 차감에 실패했습니다.");
      return;
    }

    setLoading(true);
    try {
      const chars = name.trim().split("");
      const syllables = chars.map((ch) => {
        const d = decomposeHangul(ch);
        const element = d ? (ELEMENT_BY_CHO[d.cho] ?? "토") : "토";
        const initial = STROKE_BY_ELEMENT[element] ?? 5;
        const medial = Math.max(1, Math.round(initial / 2));
        const final = (d?.jong ? d.jong.length : 1) + 1;
        return { ch, strokes: { initial, medial, final, total: initial + medial + final }, element };
      });

      const totalStrokes = syllables.reduce((acc, item) => acc + item.strokes.total, 0);
      const elementDistribution = syllables.reduce<Record<string, number>>((acc, item) => {
        acc[item.element] = (acc[item.element] ?? 0) + 1;
        return acc;
      }, {});

      const scoreSet = {
        career: scoreFromValue(totalStrokes + 12),
        money: scoreFromValue(totalStrokes + 2),
        love: scoreFromValue(totalStrokes + 8),
        health: scoreFromValue(totalStrokes + 5),
        execution: scoreFromValue(totalStrokes + 10),
      };
      const finalScore = Math.round(
        (scoreSet.career + scoreSet.money + scoreSet.love + scoreSet.health + scoreSet.execution) / 5,
      );

      const nextResult: NameAnalysis = {
        name: name.trim(),
        hanja: hanja.trim(),
        totalStrokes,
        harmonyScore: clamp(58 + Math.max(0, 16 - Math.abs(totalStrokes - 42)), 35, 98),
        elementDistribution,
        scoreSet,
        syllables,
        personality: [
          `글자 수 ${chars.length}, 총 획수 ${totalStrokes}.`,
          finalScore >= 65 ? "조화도는 안정적이며 실행 지표가 균형적으로 나옵니다." : "기준값 편차가 있어 조합 점검이 선행되면 정확도가 상승합니다.",
        ],
        warning: [totalStrokes > 72 ? "획수 편중이 커 세부 검증이 유리합니다." : "특별한 경고 포인트는 없습니다."],
        recommendations: {
          all: buildScenarioAdvice("all"),
          career: buildScenarioAdvice("career"),
          money: buildScenarioAdvice("money"),
          love: buildScenarioAdvice("love"),
          health: buildScenarioAdvice("health"),
          execution: buildScenarioAdvice("execution"),
        },
      };

      setResult(nextResult);
      saveAnalysisToHistory(
        {
          type: "NAMING",
          title: `${nextResult.name} 작명 분석`,
          subtitle: `${scenario.toUpperCase()} 시나리오`,
          profileName: nextResult.name,
          resultPreview: `총점 ${finalScore} / 조화 ${nextResult.harmonyScore}`,
          result: nextResult,
        },
        {
          resultUrlFactory: (id) => `/analysis-history/NAMING/${id}`,
        },
      );
      toast("작명 분석이 완료되었습니다.");
    } finally {
      setLoading(false);
    }
  };

  const finalScore = result
    ? Math.round((result.scoreSet.career + result.scoreSet.money + result.scoreSet.love + result.scoreSet.health + result.scoreSet.execution) / 5)
    : 0;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 relative overflow-hidden pb-36">
      <LuxuryToast message={toastMsg} isVisible={showToast} />
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/20 via-slate-900/10 to-transparent pointer-events-none" />
      <div className="max-w-5xl mx-auto px-6 py-10 relative z-10">
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <JellyBalance />
        </header>

        <section className="bg-slate-900/60 border border-white/10 rounded-[2.4rem] p-6 sm:p-8 mb-8">
          <div className="text-3xl sm:text-4xl font-black">
            <Edit3 className="inline-block w-6 h-6 mr-2" />
            작명 분석
          </div>
          <p className="text-sm text-slate-400 mt-2">이름과 한자 후보를 입력해 사운드/획수/시나리오 기반으로 분석합니다.</p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="space-y-2">
              <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">이름</span>
              <input
                id="naming-name"
                aria-label="이름 입력"
                aria-describedby="naming-name-help naming-name-error"
                aria-invalid={!!nameError}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="예: 김진우"
                className="w-full bg-black/45 border border-white/10 rounded-2xl px-5 py-4 text-white text-2xl font-black focus:outline-none"
              />
              <p id="naming-name-help" className="text-[11px] text-slate-400">
                분석을 위해 2자 이상의 한글 이름이 필요합니다.
              </p>
              <p id="naming-name-error" className="text-xs text-rose-400 min-h-[18px]">
                {nameError}
              </p>
            </label>
            <label className="space-y-2">
              <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">한자(선택)</span>
              <input
                id="naming-hanja"
                aria-label="한자 입력(선택)"
                aria-describedby="naming-hanja-help naming-hanja-error"
                aria-invalid={!!hanjaError}
                value={hanja}
                onChange={(event) => setHanja(event.target.value)}
                placeholder="예: 정宇"
                className="w-full bg-black/45 border border-white/10 rounded-2xl px-5 py-4 text-cyan-100 text-lg font-bold focus:outline-none"
              />
              <p id="naming-hanja-help" className="text-[11px] text-slate-400">
                한자가 없다면 빈칸으로 둬도 됩니다. 한글/영문 혼합은 피해주세요.
              </p>
              <p id="naming-hanja-error" className="text-xs text-rose-400 min-h-[18px]">
                {hanjaError}
              </p>
            </label>
          </div>

          {profiles.length > 0 ? (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400">프로필에서 불러오기</span>
              {profiles.slice(0, 5).map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => {
                    setActiveProfileById(profile.id);
                    setName(profile.name);
                  }}
                  className={`w-8 h-8 rounded-xl border ${
                    activeProfile?.id === profile.id
                      ? "bg-cyan-500/20 border-cyan-400"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <WalletCards className="w-3.5 h-3.5 mx-auto" />
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-5 p-4 rounded-2xl border border-white/10 bg-white/5 text-sm text-slate-200">
            <p className="font-black">획수 체크</p>
            <p className="mt-1 text-slate-300">총 획수: {allStrokes} / 현재 입력 이름 길이: {name.trim().length || 0}자</p>
          </div>

          <button
            onClick={run}
            disabled={loading || !isNameValid || !!nameError}
            aria-label={loading ? "작명 분석 실행 중" : "작명 분석 실행"}
            className="mt-5 w-full py-5 rounded-2xl bg-gradient-to-r from-cyan-700 to-violet-600 text-white font-black uppercase tracking-[0.2em] border border-cyan-400/40 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {loading ? "분석 중..." : "작명 분석 실행"}
          </button>
        </section>

        {result && (
          <AnimatePresence>
            <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <section className="bg-slate-900/60 border border-white/10 rounded-[2rem] p-7">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <div className="text-xs tracking-[0.3em] text-slate-500">결과 요약</div>
                    <h2 className="text-3xl font-black mt-1">{result.name}</h2>
                    <p className="text-slate-500">{result.hanja || "한자 미입력"}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/30 to-violet-500/20 border border-cyan-300/40 flex items-center justify-center">
                      <span className="text-4xl font-black">{finalScore}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">통합 점수</div>
                  </div>
                </div>

                <p className="text-slate-400 mt-1">총 획수 {result.totalStrokes} / 조화 점수 {result.harmonyScore}</p>

                <div className="mt-5 grid md:grid-cols-3 gap-3">
                  {Object.entries(result.scoreSet).map(([key, value]) => (
                    <article key={key} className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className="text-xs text-slate-400">{key.toUpperCase()}</div>
                      <div className="text-2xl font-black mt-1">{value} pt</div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="grid lg:grid-cols-2 gap-6">
                <details className="bg-slate-900/60 border border-white/10 rounded-[2rem] p-6" open>
                  <summary className="font-black text-lg mb-3">
                    음절 단위 분석
                  </summary>
                  <div className="space-y-3 mt-2">
                    {result.syllables.map((item) => (
                      <article key={`${item.ch}-${item.strokes.total}`} className="rounded-2xl bg-white/5 border border-white/10 p-4">
                        <div className="flex justify-between">
                          <div className="font-black">{item.ch}</div>
                          <div className="text-sm text-slate-400">{item.element}</div>
                        </div>
                        <div className="text-xs text-slate-300 mt-1">
                          초성 {item.strokes.initial} / 중성 {item.strokes.medial} / 종성 {item.strokes.final} = {item.strokes.total}
                        </div>
                      </article>
                    ))}
                  </div>
                </details>

                <details className="bg-slate-900/60 border border-white/10 rounded-[2rem] p-6" open>
                  <summary className="font-black text-lg mb-3">오행 분포</summary>
                  <div className="space-y-3">
                    {Object.entries(result.elementDistribution).map(([element, count]) => {
                      const percent = name.length ? Math.round((count / name.length) * 100) : 0;
                      return (
                        <div key={element}>
                          <div className="flex justify-between text-xs text-slate-300">
                            <span>{element}</span>
                            <span>
                              {count}개 ({percent}%)
                            </span>
                          </div>
                          <div className="mt-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-cyan-400"
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                              transition={{ duration: 0.6 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    <div className="mt-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                      <div className="text-xs text-slate-400">조화 지수</div>
                      <div className="text-lg font-black">{result.harmonyScore} / 100</div>
                    </div>
                  </div>
                </details>
              </section>

              <section className="bg-slate-900/60 border border-white/10 rounded-[2rem] p-6">
                <div className="font-black mb-3">시나리오 추천</div>
                <div className="mt-3 flex gap-2 flex-wrap">
                  {SCENARIOS.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setScenario(item.key)}
                      className={`px-3 py-2 rounded-full border text-xs ${
                        scenario === item.key
                          ? "bg-cyan-500/20 border-cyan-400"
                          : "border-white/10"
                      }`}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <p>
                    <ChevronRight className="w-4 h-4 inline-block mr-1" />
                    전체: {result.recommendations.all}
                  </p>
                  <p>
                    <CheckCircle2 className="w-4 h-4 inline-block mr-1" />
                    커리어: {result.recommendations.career}
                  </p>
                  <p>
                    <Heart className="w-4 h-4 inline-block mr-1" />
                    연애: {result.recommendations.love}
                  </p>
                </div>
              </section>

              <section className="bg-slate-900/60 border border-white/10 rounded-[2rem] p-6">
                <details className="space-y-3" open>
                  <summary className="font-black text-lg">성향 요약</summary>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 p-4">
                      <div className="text-xs text-cyan-300 mb-1">강점</div>
                      <div className="text-sm text-slate-200 space-y-1">
                        {result.personality.map((line) => (
                          <p key={line}>- {line}</p>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 p-4">
                      <div className="text-xs text-rose-300 mb-1">주의점</div>
                      <div className="text-sm text-slate-200 space-y-1">
                        {result.warning.map((line) => (
                          <p key={line}>- {line}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </details>
              </section>

              <div className="text-center">
          <button
            aria-label="결과 초기화"
            onClick={() => {
              setResult(null);
              toast("새 분석을 실행할 수 있습니다.");
            }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-white/10 text-slate-400 hover:text-white hover:border-cyan-400/40"
                >
                  <RefreshCw className="w-4 h-4" />
                  결과 초기화
                </button>
              </div>
            </motion.section>
          </AnimatePresence>
        )}
      </div>
    </main>
  );
}
