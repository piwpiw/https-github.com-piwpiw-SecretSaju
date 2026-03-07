"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Sparkles, ChevronRight, Calculator, History, Zap, User2 } from "lucide-react";
import { motion } from "framer-motion";
import JellyBalance from "@/components/shop/JellyBalance";
import { getProfiles, SajuProfile } from "@/lib/storage";
import { useWallet } from "@/components/WalletProvider";
import { calculateSajuFromBirthdate } from "@/lib/saju";
import { saveAnalysisToHistory } from "@/lib/analysis-history";
import ResultCard from "@/components/ResultCard";
import { getArchetypeByCode } from "@/lib/archetypes";
import AdvancedInterpretationPanel from "@/components/saju/AdvancedInterpretationPanel";
import { trackStartAnalysis } from "@/lib/analytics";
import JellyShopModal from "@/components/shop/JellyShopModal";

type Step = {
  key: "select" | "ready" | "run";
  title: string;
  hint: string;
};

const STEPS: Step[] = [
  { key: "select", title: "1. 분석 대상", hint: "프로필 또는 직접 입력으로 대상 정보를 준비합니다." },
  { key: "ready", title: "2. 실행 준비", hint: "젤리 잔고를 확인하고 분석을 시작하세요." },
  { key: "run", title: "3. 결과 해석", hint: "결과를 확인하고 추가 인사이트를 이어 받습니다." },
];

function SajuPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { consumeChuru, churu, isAdmin } = useWallet();

  const [profiles, setProfiles] = useState<SajuProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [archetype, setArchetype] = useState<any>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [useManualInput, setUseManualInput] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);

  const [manualName, setManualName] = useState("");
  const [manualBirthDate, setManualBirthDate] = useState("");
  const [manualBirthTime, setManualBirthTime] = useState("12:00");
  const [manualGender, setManualGender] = useState<"male" | "female">("male");
  const [manualCalendar, setManualCalendar] = useState<"solar" | "lunar">("solar");
  const [manualTimeUnknown, setManualTimeUnknown] = useState(false);

  const [resultProfileName, setResultProfileName] = useState("");
  const [resultProfileSummary, setResultProfileSummary] = useState<{
    name: string;
    birthdate: string;
    birthTime: string;
    calendarType: "solar" | "lunar";
    gender: "male" | "female";
    relationship: string;
  } | null>(null);

  useEffect(() => {
    const saved = getProfiles();
    const profileIdFromQuery = searchParams?.get("profileId") || "";
    setProfiles(saved);

    if (saved.length > 0) {
      const found = saved.find((item) => item.id === profileIdFromQuery);
      setSelectedProfileId(found?.id || saved[0].id);
      if (!profileIdFromQuery) {
        setUseManualInput(false);
      }
    } else {
      setUseManualInput(true);
    }
  }, [searchParams]);

  const buildProfile = (source: SajuProfile) => ({
    name: source.name,
    birthdate: source.birthdate,
    birthTime: source.birthTime,
    calendarType: source.calendarType,
    gender: source.gender,
    relationship: source.relationship,
  });

  const getSourceProfile = (): SajuProfile | null => {
    if (useManualInput) {
      if (!manualName.trim()) {
        setNotice("이름을 먼저 입력해 주세요.");
        return null;
      }
      if (!manualBirthDate || !/^\d{4}-\d{2}-\d{2}$/.test(manualBirthDate)) {
        setNotice("생년월일은 YYYY-MM-DD 형식으로 입력해 주세요.");
        return null;
      }

      return {
        id: "manual-temp",
        name: manualName.trim(),
        relationship: "본인",
        birthdate: manualBirthDate,
        birthTime: manualTimeUnknown ? "12:00" : manualBirthTime,
        isTimeUnknown: manualTimeUnknown,
        calendarType: manualCalendar,
        gender: manualGender,
        createdAt: Date.now(),
      };
    }

    const selected = profiles.find((item) => item.id === selectedProfileId);
    if (!selected) {
      setNotice("사주를 실행할 프로필을 먼저 선택해 주세요.");
      return null;
    }
    return selected;
  };

  const handleRun = async () => {
    const selected = getSourceProfile();
    if (!selected) return;

    if (!isAdmin && churu < 3) {
      setNotice("젤리가 부족합니다. 3젤리가 필요해요.");
      return;
    }

    const consumed = consumeChuru(3);
    if (!consumed) {
      setNotice("젤리 차감에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    // GA4: 분석 시작 이벤트
    trackStartAnalysis(useManualInput ? 'manual' : 'profile', churu);

    setLoading(true);
    setNotice(null);
    try {
      const analysisResult = await calculateSajuFromBirthdate(
        selected.birthdate,
        selected.birthTime,
        selected.calendarType,
        selected.gender === "male" ? "M" : "F",
        selected.isTimeUnknown
      );

      const arch = getArchetypeByCode(analysisResult.code, analysisResult.ageGroup);
      setArchetype(arch);
      setResult(analysisResult);
      setResultProfileName(selected.name);
      setResultProfileSummary(buildProfile(selected));

      saveAnalysisToHistory(
        {
          type: "SAJU",
          title: `${selected.name} 사주 프리미엄 분석`,
          subtitle: "네 기둥 상세 분석",
          profileId: useManualInput ? undefined : selected.id,
          profileName: selected.name,
          result: analysisResult,
          resultPreview: typeof analysisResult?.code === "string" ? analysisResult.code : "사주 결과",
        },
        {
          resultUrlFactory: (id) => `/analysis-history/SAJU/${id}`,
        }
      );
    } catch (error) {
      console.error("[SajuPage]", error);
      setNotice("사주 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-slate-950 text-slate-100 relative overflow-hidden pb-32">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            이전
          </button>
          <JellyBalance />
        </div>

        <section className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 md:p-14 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none group-hover:bg-indigo-600/20 transition-all duration-1000" />

          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Calculator className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">사주 분석</h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">프로필 기반 + 직접 입력 하이브리드</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STEPS.map((step, i) => (
              <div key={step.key} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-[10px] text-indigo-300 uppercase tracking-[0.2em] font-black">{step.title}</p>
                <p className="mt-2 text-sm text-slate-200">{step.hint}</p>
                <div className={`mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden ${i === 2 && result ? 'ring-1 ring-indigo-300/40' : ''}`}>
                  <div className={`h-full transition-all duration-700 ${result && i < 2 ? 'w-full' : i === 2 && result ? 'w-full' : i === 1 && (result || manualName) ? 'w-1/2' : i === 0 && ((manualName || selectedProfileId) || !useManualInput) ? 'w-3/4' : 'w-0'} ${i === 2 && result ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-8 relative z-10 mt-10">
            <div className="flex items-center justify-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => setUseManualInput(false)}
                disabled={profiles.length === 0}
                className={`px-4 py-2 rounded-xl border ${!useManualInput ? "bg-indigo-500/20 border-indigo-400 text-indigo-100" : "bg-black/20 border-white/20 text-slate-300"
                  }`}
              >
                <History className="w-3 h-3 inline mr-2" />
                내 프로필 사용
              </button>
              <button
                type="button"
                onClick={() => setUseManualInput(true)}
                className={`px-4 py-2 rounded-xl border ${useManualInput ? "bg-indigo-500/20 border-indigo-400 text-indigo-100" : "bg-black/20 border-white/20 text-slate-300"
                  }`}
              >
                <User2 className="w-3 h-3 inline mr-2" />
                이름 직접입력
              </button>
            </div>

            {useManualInput ? (
              <div className="space-y-4">
                <label className="text-sm font-black flex items-center gap-2 text-slate-300 uppercase tracking-widest">이름</label>
                <input
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="홍길동"
                  className="w-full rounded-2xl bg-black/40 border border-white/10 px-6 py-4 text-white font-bold text-lg focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />

                <label className="text-sm font-black flex items-center gap-2 text-slate-300 uppercase tracking-widest">생년월일</label>
                <input
                  type="date"
                  value={manualBirthDate}
                  onChange={(e) => setManualBirthDate(e.target.value)}
                  className="w-full rounded-2xl bg-black/40 border border-white/10 px-6 py-4 text-white font-bold text-lg focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />

                <label className="text-sm font-black flex items-center gap-2 text-slate-300 uppercase tracking-widest">성별</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setManualGender("male")}
                    className={`py-3 rounded-xl border ${manualGender === "male" ? "bg-indigo-500/20 border-indigo-300 text-indigo-100" : "bg-black/20 border-white/10 text-slate-300"}`}
                  >
                    남성
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualGender("female")}
                    className={`py-3 rounded-xl border ${manualGender === "female" ? "bg-indigo-500/20 border-indigo-300 text-indigo-100" : "bg-black/20 border-white/10 text-slate-300"}`}
                  >
                    여성
                  </button>
                </div>

                <label className="text-sm font-black flex items-center gap-2 text-slate-300 uppercase tracking-widest">달력</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setManualCalendar("solar")}
                    className={`py-3 rounded-xl border ${manualCalendar === "solar" ? "bg-indigo-500/20 border-indigo-300 text-indigo-100" : "bg-black/20 border-white/10 text-slate-300"}`}
                  >
                    양력
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualCalendar("lunar")}
                    className={`py-3 rounded-xl border ${manualCalendar === "lunar" ? "bg-indigo-500/20 border-indigo-300 text-indigo-100" : "bg-black/20 border-white/10 text-slate-300"}`}
                  >
                    음력
                  </button>
                </div>

                <label className="text-sm font-black flex items-center gap-2 text-slate-300 uppercase tracking-widest">출생시간</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="time"
                    value={manualBirthTime}
                    onChange={(e) => setManualBirthTime(e.target.value)}
                    disabled={manualTimeUnknown}
                    className="flex-1 rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-white font-bold focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setManualTimeUnknown((value) => !value)}
                    className={`px-4 py-3 rounded-2xl border ${manualTimeUnknown ? "bg-indigo-500/20 border-indigo-300 text-indigo-100" : "bg-black/20 border-white/10 text-slate-300"}`}
                  >
                    시간 미상
                  </button>
                </div>
                <p className="text-xs text-slate-400">시간이 불확실하면 `시간 미상`을 켜면 12:00로 계산합니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <label className="text-sm font-black flex items-center gap-2 text-slate-300 uppercase tracking-widest">
                  <History className="w-4 h-4 text-indigo-400" /> 분석할 프로필
                </label>
                <div className="relative">
                  <select
                    value={selectedProfileId}
                    onChange={(e) => setSelectedProfileId(e.target.value)}
                    className="w-full rounded-2xl bg-black/40 border border-white/10 px-6 py-5 text-white font-bold text-lg appearance-none focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  >
                    {profiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name} ({profile.relationship})
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
                    <ChevronRight className="w-5 h-5 text-slate-500 rotate-90" />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              <span className="text-xs bg-indigo-500/20 text-indigo-200 px-3 py-1 rounded-full border border-indigo-500/30">젤리 3개 소모</span>
              <span className="text-xs bg-white/10 text-slate-300 px-3 py-1 rounded-full border border-white/10">관계 분석 포함</span>
              <span className="text-xs bg-white/10 text-slate-300 px-3 py-1 rounded-full border border-white/10">히스토리 저장</span>
            </div>

            <button
              onClick={handleRun}
              disabled={loading}
              className="w-full py-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl uppercase tracking-widest shadow-xl hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-6 h-6 border-2 border-white rounded-full border-t-transparent" />
              ) : (
                <Sparkles className="w-6 h-6 fill-white" />
              )}
              {loading ? "사주 분석 중..." : "3젤리로 사주 실행"}
            </button>

            {notice && <p className="text-sm text-center text-rose-300 font-medium">{notice}</p>}
          </div>
        </section>

        {result && archetype && !loading && (
          <motion.section initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="mt-16">
            <div className="flex items-center gap-4 mb-10 justify-center">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
              <div className="px-6 py-2 rounded-full border border-white/10 bg-white/5 text-xs font-black text-indigo-300 uppercase tracking-[0.3em] flex items-center gap-2 backdrop-blur-md">
                <Sparkles className="w-4 h-4" /> 분석 완료
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
            </div>

            <ResultCard
              personName={resultProfileName}
              analysisMeta={result.analysisMeta}
              archetype={archetype}
              pillarNameKo={result.pillarNameKo}
              ageGroup={result.ageGroup}
              elementScores={result.elementScores}
              elementCounts={result.elementCounts}
              elementBasicPercentages={result.elementBasicPercentages}
              fourPillars={result.fourPillars}
              daewun={result.daewun}
              gyeokguk={result.gyeokguk}
              version={result.version}
              integrity={result.integrity}
              isTimeUnknown={result.isTimeUnknown}
              canonicalFeatures={result.canonicalFeatures}
              evidence={result.evidence}
              secretUnlocked={isAdmin}
              onUnlockClick={() => setShopOpen(true)}
              onInsufficientJelly={() => setShopOpen(true)}
            />
            <AdvancedInterpretationPanel
              result={result}
              profile={
                resultProfileSummary
                  ? {
                    name: resultProfileSummary.name,
                    birthdate: resultProfileSummary.birthdate,
                    birthTime: resultProfileSummary.birthTime,
                    calendarType: resultProfileSummary.calendarType,
                    gender: resultProfileSummary.gender,
                    relationship: resultProfileSummary.relationship,
                  }
                  : undefined
              }
              dayAnimalName={archetype?.animal_name}
            />

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
              <button
                onClick={handleRun}
                disabled={loading}
                className="w-full sm:flex-1 py-5 rounded-2xl border border-white/10 bg-white/5 font-black uppercase tracking-widest text-slate-100 hover:bg-white/10"
              >
                <Zap className="inline w-4 h-4 mr-2" /> 동일 대상 재분석
              </button>
              <button
                onClick={() => {
                  setResult(null);
                  setNotice(null);
                }}
                className="w-full sm:flex-1 py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-widest"
              >
                다른 방식으로 분석
              </button>
            </div>

            <JellyShopModal
              isOpen={shopOpen}
              onClose={() => setShopOpen(false)}
            />
          </motion.section>
        )}
      </div>
    </main>
  );
}

export default function SajuPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 rounded-full border-2 border-indigo-500/30 border-t-indigo-500"
          />
          <p className="text-slate-500 font-black tracking-[0.4em] uppercase text-[10px]">Loading...</p>
        </div>
      </div>
    }>
      <SajuPageContent />
    </Suspense>
  );
}
