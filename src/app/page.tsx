"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BirthInputRetro from "@/components/BirthInputRetro";
import LoadingGlitch from "@/components/LoadingGlitch";
import ResultCard from "@/components/ResultCard";
import TerminalBoot from "@/components/TerminalBoot";
import { calculateSaju, getPillarNameKo, type SajuResult } from "@/lib/saju";
import { getArchetypeByCode } from "@/lib/archetypes";
import JellyShopModal from "@/components/shop/JellyShopModal";
import Link from 'next/link';
import { ChevronRight, Shield, Sparkles, TrendingUp, Users, Star, Gift, Calendar, Heart, BookOpen, Clock, Smile } from 'lucide-react';
import { handleShare } from '@/lib/share';

type FlowState = "boot" | "input" | "loading" | "result";

export default function HomePage() {
  const [flowState, setFlowState] = useState<FlowState>("boot");
  const [sajuData, setSajuData] = useState<SajuResult | null>(null);
  const [showShop, setShowShop] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('secret_saju_ref', ref);
    }
  }, []);

  const handleBirthSubmit = async (data: { year: number; month: number; day: number; hour: number }) => {
    setFlowState("loading");

    try {
      const birthDate = new Date(data.year, data.month - 1, data.day, data.hour);
      const result = await calculateSaju(birthDate);
      setSajuData(result);
      setFlowState("result");
    } catch (error) {
      console.error("Saju calculation error:", error);
      setFlowState("input");
      setToastMessage("분석 중 오류가 발생했습니다. 다시 시도해 주세요.");
    }
  };

  const handleUnlockClick = () => {
    setShowShop(true);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRestart = () => {
    setFlowState("input");
    setSajuData(null);
  };

  const archetype = sajuData ? getArchetypeByCode(sajuData.code, sajuData.ageGroup) : null;
  const pillarNameKo = sajuData ? getPillarNameKo(sajuData.pillarIndex) : "";

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Boot Sequence */}
      {flowState === "boot" && (
        <TerminalBoot onComplete={() => setFlowState("input")} />
      )}

      {/* Loading State */}
      {flowState === "loading" && (
        <LoadingGlitch onComplete={() => setFlowState("result")} />
      )}

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 pb-32">
        {/* Hero Section */}
        {/* Dashboard Portal */}
        {flowState === "boot" || flowState === "input" ? (
          <div className="max-w-5xl mx-auto space-y-12">

            {/* 1. Hero Banner (점신 스타일) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-red-500 to-rose-600 shadow-xl"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
              <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-white space-y-4 text-center md:text-left">
                  <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-md">EVENT</span>
                  <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
                    매일이 특별해지는<br />점신에서 만나요!
                  </h2>
                  <p className="text-red-100 font-medium opacity-90">신규 가입 시 무료 상담 쿠폰 증정 (24시 대기)</p>
                </div>
                <div className="flex flex-col gap-3 w-full md:w-auto">
                  <button className="w-full md:w-auto px-8 py-4 bg-white text-red-600 rounded-xl font-black shadow-lg hover:scale-105 transition-transform active:scale-95 flex items-center justify-center gap-2">
                    <Gift className="w-5 h-5" /> 무료 쿠폰 받기
                  </button>
                  <button className="w-full md:w-auto px-8 py-3 bg-red-700/50 hover:bg-red-700 text-white border border-red-400/30 rounded-xl font-bold transition-colors">
                    전문가 상담하기
                  </button>
                </div>
              </div>
            </motion.div>

            {/* 2. Quick Menu Carousel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 px-2">핵심 운세 바로가기</h3>
              <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 px-2 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
                {[
                  { icon: "📜", label: "신년운세", href: "/fortune" },
                  { icon: "📖", label: "토정비결", href: "/fortune" },
                  { icon: "🔮", label: "정통사주", href: "#saju-input" },
                  { icon: "📅", label: "오늘의 운세", href: "/daily" },
                  { icon: "🌙", label: "내일의 운세", href: "/daily" },
                  { icon: "🤝", label: "짝궁합", href: "/destiny" },
                  { icon: "🎭", label: "관상", href: "/healing" },
                  { icon: "💭", label: "심리풀이", href: "/healing" },
                ].map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    className="flex-shrink-0 snap-start w-24 flex flex-col items-center gap-3 p-4 bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* 3. Original Saju Input (Anchored for "정통사주") */}
            <div id="saju-input" className="pt-8 border-t border-slate-200 dark:border-slate-800">
              <div className="text-center mb-10">
                <span className="text-xs font-bold text-indigo-500 tracking-wider uppercase mb-2 block">Premium Analysis</span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">정통 사주 성격 분석</h3>
                <p className="text-sm text-slate-500 mt-2">생년월일로 알아보는 나의 타고난 명식과 성향</p>
              </div>
              <div className="max-w-md mx-auto relative">
                <div className="absolute -inset-4 bg-gradient-to-b from-indigo-500/5 to-transparent rounded-3xl blur-xl -z-10"></div>
                <BirthInputRetro onSubmit={handleBirthSubmit} />
                <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                  <Shield className="w-3.5 h-3.5" /> 개인정보 처리는 기기 내에서만 안전하게 이루어집니다.
                </div>
              </div>
            </div>

            {/* 4. Daily Content Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="pt-8"
            >
              <div className="flex items-end justify-between mb-6 px-2">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">매일 달라지는 심리풀이</h3>
                  <p className="text-sm text-slate-500 mt-1">{new Date().getMonth() + 1}월 {new Date().getDate()}일 업데이트</p>
                </div>
                <button className="text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center">
                  전체보기 <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "부자가 되기 위한 오늘의 작은 습관", icon: <Calendar className="w-5 h-5 text-amber-500" />, tag: "재물운" },
                  { title: "오늘 나의 아우라는 어떤 색일까?", icon: <Sparkles className="w-5 h-5 text-indigo-500" />, tag: "매력도" },
                  { title: "성형 상담실 입장! 관상으로 보는 매력", icon: <Smile className="w-5 h-5 text-rose-500" />, tag: "관상풀이" },
                  { title: "행운을 부르는 이번 주말 여행지", icon: <Star className="w-5 h-5 text-sky-500" />, tag: "행운스팟" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-5 bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <span className="inline-block px-2 flex py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-500 mb-1 w-max">{item.tag}</span>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-tight group-hover:text-red-500 transition-colors line-clamp-2">{item.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        ) : null}

        {/* Result Flow */}
        {flowState === "result" && sajuData && archetype && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
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

            {/* 하단 버튼 */}
            <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleRestart}
                className="w-full sm:flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-all"
              >
                다시 분석하기
              </button>
              <button
                onClick={async () => {
                  const shareText = `[시크릿사주] 나는 '${archetype.animal_name}'이래! 내 사주 성격 정밀 분석 확인해보귀 🐾`;
                  const result = await handleShare('시크릿사주 운명 분석', shareText, window.location.origin);
                  if (result === 'copied') {
                    showToast('링크가 클립보드에 복사되었습니다');
                  } else if (result === 'shared') {
                    showToast('친구가 당신의 사주를 엿볼 준비가 되었습니다 🔮');
                  }
                }}
                className="w-full sm:flex-1 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.01] transition-all"
              >
                결과 공유하기
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Jelly Shop Modal */}
      <JellyShopModal
        isOpen={showShop}
        onClose={() => setShowShop(false)}
        onPurchaseSuccess={(jellies) => {
          setShowShop(false);
          showToast(`🎉 젤리 ${jellies}개가 충전되었습니다!`);
        }}
      />

      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 bg-slate-800/95 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl text-white text-sm font-medium"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
