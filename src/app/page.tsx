"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BirthInputRetro from "@/components/BirthInputRetro";
import LoadingGlitch from "@/components/LoadingGlitch";
import ResultCard from "@/components/ResultCard";
import TerminalBoot from "@/components/TerminalBoot";
import { calculateSaju, getPillarNameKo, type SajuResult } from "@/lib/saju";
import { getArchetypeByCode } from "@/lib/archetypes";
import JellyShopModal from "@/components/shop/JellyShopModal";
import { Shield, Zap, Activity, Compass } from "lucide-react";
import { handleShare } from '@/lib/share';
import CouponBanner from "@/components/home/CouponBanner";
import FortuneCarousel from "@/components/home/FortuneCarousel";
import DailyPsychologySection from "@/components/home/DailyPsychologySection";
import OracleBall from "@/components/home/OracleBall";
import LuckyScoreCard from "@/components/home/LuckyScoreCard";
import { useProfiles } from "@/components/ProfileProvider";
import LuxuryToast from "@/components/ui/LuxuryToast";
import CampaignFeed from "@/components/home/CampaignFeed";

type FlowState = "boot" | "input" | "loading" | "result";

export default function HomePage() {
  const [flowState, setFlowState] = useState<FlowState>("boot");
  const [sajuData, setSajuData] = useState<SajuResult | null>(null);
  const [showShop, setShowShop] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { activeProfile } = useProfiles();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('secret_saju_ref', ref);
    }
  }, []);

  const handleBirthSubmit = async (data: { year: number; month: number; day: number; hour: number, timeKnown?: boolean }) => {
    setFlowState("loading");

    try {
      const parsedHour = Number.isNaN(data.hour) ? 12 : data.hour;
      const birthDate = new Date(data.year, data.month - 1, data.day, parsedHour, 0);
      const timeStr = `${parsedHour.toString().padStart(2, '0')}:00`;
      const result = await calculateSaju(birthDate, "F", timeStr, 'solar', data.timeKnown === false);
      setSajuData(result);
      setFlowState("result");
    } catch (error) {
      console.error("Saju calculation error:", error);
      setFlowState("input");
      setToastMsg("계산 처리 중 오류가 발생했습니다.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleUnlockClick = () => {
    setShowShop(true);
  };

  const handleShareResult = async () => {
    if (isSharing || !sajuData || !archetype) return;
    setIsSharing(true);
    try {
      const shareText = `[시크릿사주] ${archetype.animal_name} 결과를 공유합니다.`;
      const result = await handleShare('시크릿사주 결과', shareText, window.location.origin);
      if (result === 'copied') {
        setToastMsg('클립보드에 복사되었습니다.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleRestart = () => {
    setFlowState("input");
    setSajuData(null);
  };

  const archetype = sajuData ? getArchetypeByCode(sajuData.code, sajuData.ageGroup) : null;
  const pillarNameKo = sajuData ? getPillarNameKo(sajuData.pillarIndex) : "";

  return (
    <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden font-sans">
      <LuxuryToast message={toastMsg} isVisible={showToast} />

      {/* Atmosphere Background */}
      <div className="absolute inset-x-0 top-0 h-screen bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.15)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-screen bg-[radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.1)_0%,transparent_50%)] pointer-events-none" />

      {/* Boot Sequence */}
      {flowState === "boot" && (
        <TerminalBoot onComplete={() => setFlowState("input")} />
      )}

      {/* Loading State */}
      {flowState === "loading" && (
        <LoadingGlitch onComplete={() => setFlowState("result")} />
      )}

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-10 pb-20">
        {/* Dashboard Portal */}
        {(flowState === "boot" || flowState === "input") && (
          <div className="max-w-5xl mx-auto flex flex-col gap-8 sm:gap-16">
            {/* Hero Section (Banner) */}
            <motion.div className="order-1" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }}>
              <CouponBanner />
            </motion.div>

            {/* Personalized Vibe Section */}
            <section className="order-3 space-y-6 sm:space-y-10">
              <div className="flex flex-col sm:flex-row items-center justify-between px-4 gap-4">
                <div className="text-center sm:text-left">
                  <h2 className="ui-title-gradient text-2xl sm:text-3xl tracking-[0.08em] leading-none">글로벌 <span className="text-indigo-500">운세 동기화</span></h2>
                  <p className="text-micro-copy mt-2 sm:mt-3 opacity-80">오늘 컨디션과 질문 성향 기반 맞춤 분석 결과를 준비합니다</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 ui-chip">
                  <Activity className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-100 italic">시스템 동기 상태: 최적</span>
                </div>
              </div>
              <LuckyScoreCard />
            </section>

            {/* Premium Menu Nexus */}
            <div className="order-4">
              <FortuneCarousel />
            </div>

            {/* Original Saju Input (Classic Core) */}
            <motion.div
              id="saju-input"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="order-2 panel-shell py-12 sm:py-20 px-4 sm:px-10"
            >
              <div className="absolute top-0 right-10 w-48 h-1 bg-gradient-to-l from-indigo-500/50 to-transparent" />
              <div className="text-center mb-6 space-y-3">
                <div className="ui-chip inline-flex">
                  <Compass className="w-3 h-3" /> 핵심 분석 엔진
                </div>
                <h3 className="ui-title text-white text-2xl sm:text-3xl"><span className="text-indigo-500">핵심</span> 사주 입력</h3>
                <p className="text-xs text-slate-400 uppercase tracking-widest">정확한 태어난 시간에 가까운 입력일수록 결과가 정밀해집니다</p>
              </div>
              <div className="max-w-xl mx-auto space-y-4">
                <BirthInputRetro onSubmit={handleBirthSubmit} />
                <div className="flex items-center justify-center gap-2.5 text-[9px] text-slate-500 font-black uppercase tracking-widest italic opacity-60">
                  <Shield className="w-3.5 h-3.5 text-indigo-500/50" /> 보안 처리: 기기 로컬 연산 전용
                </div>
              </div>
            </motion.div>

            {/* Daily Content Feed */}
            <div className="order-5">
              <DailyPsychologySection />
            </div>

            {/* Interaction Layer */}
            <div className="order-6">
              <OracleBall />
            </div>

          </div>
        )}

        {/* Result Flow */}
        {flowState === "result" && sajuData && archetype && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-12"
          >
            <ResultCard
              archetype={archetype}
              pillarNameKo={pillarNameKo}
              ageGroup={sajuData.ageGroup}
              elementScores={sajuData.elementScores}
              elementCounts={sajuData.elementCounts}
              elementBasicPercentages={sajuData.elementBasicPercentages}
              onUnlockClick={handleUnlockClick}
              onInsufficientJelly={handleUnlockClick}
            />

            <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={handleRestart}
                className="w-full sm:flex-1 py-5 rounded-2xl ui-chip bg-white/5 border-white/10 text-slate-300 hover:text-white transition-all flex items-center justify-center"
              >
                결과 다시 계산
              </button>
              <button
                onClick={() => {
                  void handleShareResult();
                }}
                disabled={isSharing}
                aria-label="분석 결과 공유"
                className="w-full sm:flex-1 py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black uppercase italic tracking-widest text-[10px] shadow-xl shadow-indigo-950/20 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <Zap className="w-4 h-4 fill-current" /> 분석 공유하기
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <JellyShopModal
        isOpen={showShop}
        onClose={() => setShowShop(false)}
        onPurchaseSuccess={(jellies) => {
          setShowShop(false);
          setToastMsg(`${jellies}젤리 충전이 완료되었습니다.`);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        }}
      />
    </main>
  );
}
