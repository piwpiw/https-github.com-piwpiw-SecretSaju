"use client";

import { useState, useEffect, useMemo, type FormEvent, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import BirthInputRetro from "@/components/BirthInputRetro";
import LoadingGlitch from "@/components/LoadingGlitch";
import { ResultCard } from "@/components/ResultCard";
import TerminalBoot from "@/components/TerminalBoot";
import { calculateSaju, getPillarNameKo, type SajuResult } from "@/lib/saju";
import { getArchetypeByCode } from "@/lib/archetypes";
import { saveAnalysisToHistory } from "@/lib/analysis-history";
import JellyShopModal from "@/components/shop/JellyShopModal";
import { Shield, Zap, Activity, Compass } from "lucide-react";
import { handleShare } from '@/lib/share';
import Link from 'next/link';
import { Search } from "lucide-react";
import CouponBanner from "@/components/home/CouponBanner";
import FortuneCarousel from "@/components/home/FortuneCarousel";
import DailyPsychologySection from "@/components/home/DailyPsychologySection";
import OracleBall from "@/components/home/OracleBall";
import LuckyScoreCard from "@/components/home/LuckyScoreCard";
import { useProfiles } from "@/components/ProfileProvider";
import LuxuryToast from "@/components/ui/LuxuryToast";
import CampaignFeed from "@/components/home/CampaignFeed";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SocialProofTicker from "@/components/home/SocialProofTicker";
import { useRouter } from "next/navigation";

type FlowState = "boot" | "input" | "loading" | "result";

type HomeSearchItem = {
  path: string;
  title: string;
  description: string;
  keywords: string[];
};

const HOME_SEARCH_INPUT_ID = "home-search-input";
const HOME_SEARCH_LISTBOX_ID = "home-search-listbox";
const HOME_SEARCH_HELP_ID = "home-search-help";

const HOME_SEARCH_INDEX: HomeSearchItem[] = [
  { path: "/fortune", title: "사주 분석", description: "태어난 시각 기반 핵심 사주 결과 확인", keywords: ["사주", "운세", "분석", "fortune"] },
  { path: "/daily", title: "오늘의 일진", description: "하루 운세와 시간대별 추천 동선", keywords: ["오늘", "일진", "운세", "daily"] },
  { path: "/calendar", title: "만세력", description: "달력 기반 천간지지 동향 확인", keywords: ["만세력", "력", "달력", "calendar"] },
  { path: "/naming", title: "작명 분석", description: "이름/한자로 성향과 운명을 재해석", keywords: ["작명", "이름", "한자", "naming"] },
  { path: "/compatibility", title: "궁합", description: "연애·결혼 궁합 정밀 진단", keywords: ["궁합", "커플", "연애", "compatibility"] },
  { path: "/psychology", title: "심리 분석", description: "심리 모듈 기반 성향 분석", keywords: ["심리", "테스트", "psychology"] },
  { path: "/dreams", title: "꿈해몽", description: "꿈 키워드 해석 및 패턴 제안", keywords: ["꿈", "해몽", "dream", "dreams"] },
  { path: "/shop", title: "상점", description: "젤리 충전 및 프리미엄 혜택 구매", keywords: ["상점", "젤리", "충전", "shop"] },
  { path: "/history", title: "내 분석 이력", description: "최근 분석 기록을 빠르게 복기", keywords: ["기록", "히스토리", "history"] },
  { path: "/relationship", title: "연애·관계", description: "연애/동반자 관계 전반 분석", keywords: ["연애", "관계", "relationship"] },
];

function searchTermList(value: string): string[] {
  return searchTokenSet(value)
    .split(" ")
    .filter(Boolean);
}

function searchTokenSet(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^가-힣a-zA-Z0-9]+/g, " ")
    .trim();
}

export default function HomePage() {
  const router = useRouter();
  const [flowState, setFlowState] = useState<FlowState>("boot");
  const [sajuData, setSajuData] = useState<SajuResult | null>(null);
  const [sajuPersonName, setSajuPersonName] = useState("");
  const [showShop, setShowShop] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [hanjaDraft, setHanjaDraft] = useState("");
  const [searchText, setSearchText] = useState("");
  const { activeProfile } = useProfiles();
  const [searchError, setSearchError] = useState("");
  const [activeSearchIndex, setActiveSearchIndex] = useState(-1);
  const [clientHour, setClientHour] = useState<number | null>(null);

  const searchIndex = useMemo(() => {
    return HOME_SEARCH_INDEX.map((item) => ({
      ...item,
      tokens: [item.title, item.description, ...item.keywords]
        .map((token) => searchTokenSet(token))
        .filter(Boolean),
    }));
  }, []);

  const normalizedSearchText = useMemo(() => searchTokenSet(searchText), [searchText]);
  const topSearchMatches = useMemo(() => {
    if (!normalizedSearchText) return [];
    return searchIndex
      .map((item) => {
        const terms = searchTermList(normalizedSearchText);
        const score = terms.reduce((acc, term) => (
          acc + (item.tokens.some((token) => token.includes(term) || term.includes(token)) ? 1 : 0)
        ), 0);
        return { ...item, score };
      })
      .filter((item) => item.score > 0 || item.tokens.includes(normalizedSearchText))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [searchIndex, normalizedSearchText]);

  useEffect(() => {
    if (!normalizedSearchText || topSearchMatches.length === 0) {
      setActiveSearchIndex(-1);
      return;
    }
    setActiveSearchIndex((current) => {
      if (current < 0) return 0;
      return Math.min(current, topSearchMatches.length - 1);
    });
  }, [topSearchMatches.length, normalizedSearchText]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('secret_saju_ref', ref);
    }
    if (activeProfile?.name) {
      setNameDraft(activeProfile.name);
    }
  }, [activeProfile]);

  useEffect(() => {
    setClientHour(new Date().getHours());
  }, []);

  const handleBirthSubmit = async (data: { name: string; year: number; month: number; day: number; hour: number; minute: number; timeKnown?: boolean }) => {
    setFlowState("loading");

    try {
      const parsedHour = Number.isNaN(data.hour) ? 12 : data.hour;
      const parsedMinute = Number.isNaN(data.minute) ? 0 : data.minute;
      const birthDate = new Date(data.year, data.month - 1, data.day, parsedHour, parsedMinute);
      const timeStr = `${parsedHour.toString().padStart(2, '0')}:${parsedMinute.toString().padStart(2, '0')}`;
      const result = await calculateSaju(birthDate, "F", timeStr, 'solar', data.timeKnown === false);
      const resultProfileName = data.name?.trim() || "명주인";
      const safeArchetype = getArchetypeByCode(result.code, result.ageGroup);

      saveAnalysisToHistory({
        type: "SAJU",
        title: `${resultProfileName} 사주 분석`,
        subtitle: `${safeArchetype.animal_name} 중심 해석`,
        profileName: resultProfileName,
        resultPreview: `${safeArchetype.code} / ${result.ageGroup}`,
        result,
      });
      setSajuPersonName(data.name?.trim() || "");
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
    setSajuPersonName("");
  };

  const handleStartNaming = () => {
    const query = new URLSearchParams();
    if (nameDraft.trim()) {
      query.set("name", nameDraft.trim());
    }
    if (hanjaDraft.trim()) {
      query.set("hanja", hanjaDraft.trim());
    }
    const q = query.toString();
    window.location.href = `/naming${q ? `?${q}` : ""}`;
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const matched = topSearchMatches[activeSearchIndex] ?? topSearchMatches[0];
    if (!normalizedSearchText) {
      setSearchError("검색어를 입력해 주세요.");
      setShowToast(true);
      setToastMsg("검색어를 입력해 주세요.");
      setTimeout(() => setShowToast(false), 1700);
      return;
    }
    if (!matched) {
      setSearchError("일치하는 기능을 찾지 못했습니다.");
      setShowToast(true);
      setToastMsg("일치하는 기능을 찾지 못했습니다. 아래 후보를 확인해 보세요.");
      setTimeout(() => setShowToast(false), 1700);
      return;
    }
    setSearchError("");
    setSearchText("");
    router.push(matched.path);
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!normalizedSearchText || topSearchMatches.length === 0) {
      if (event.key === "Escape") {
        setSearchText("");
        setSearchError("");
        setActiveSearchIndex(-1);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSearchIndex((prev) => (prev + 1) % topSearchMatches.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSearchIndex((prev) => (prev - 1 + topSearchMatches.length) % topSearchMatches.length);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const matched = topSearchMatches[activeSearchIndex] ?? topSearchMatches[0];
      if (!matched) {
        setSearchError("일치하는 기능을 찾지 못했습니다.");
        setShowToast(true);
        setToastMsg("일치하는 기능을 찾지 못했습니다. 아래 후보를 확인해 보세요.");
        setTimeout(() => setShowToast(false), 1700);
        return;
      }
      setSearchError("");
      setSearchText("");
      setActiveSearchIndex(-1);
      router.push(matched.path);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setSearchText("");
      setSearchError("");
      setActiveSearchIndex(-1);
    }
  };

  const handleSearchSelect = (path: string) => {
    setSearchText("");
    setSearchError("");
    router.push(path);
  };

  const archetype = sajuData ? getArchetypeByCode(sajuData.code, sajuData.ageGroup) : null;
  const pillarNameKo = sajuData ? getPillarNameKo(sajuData.pillarIndex) : "";

  useEffect(() => {
    // Guard: prevent blank screen if state moves to result without payload.
    if (flowState === "result" && (!sajuData || !archetype)) {
      setFlowState("input");
      setToastMsg("결과 데이터가 불완전하여 입력 화면으로 복구했습니다.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  }, [flowState, sajuData, archetype]);

  return (
    <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden font-sans">
      <LuxuryToast message={toastMsg} isVisible={showToast} />
      <h1 className="sr-only">시크릿사주 홈 대시보드</h1>
      <p id={HOME_SEARCH_HELP_ID} className="sr-only">
        기능 검색에서 방향키로 항목 이동, 엔터로 이동, 이스케이프로 검색을 초기화할 수 있습니다.
      </p>

      {/* 1.4 Background Starfield Parallax */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.05]" />
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.05, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05)_0%,transparent_70%)]"
        />
      </div>

      {/* Atmosphere Background */}
      <div className="absolute inset-x-0 top-0 h-screen bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.15)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-screen bg-[radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.1)_0%,transparent_50%)] pointer-events-none" />

      {/* 1.3 Floating Search Overlay UX */}
      <div className="fixed top-[78px] sm:top-[86px] left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-lg z-[50]">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-3 px-5 py-3.5 bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 group hover:border-indigo-500/30 transition-all active:scale-[0.98]"
        >
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 w-full">
              <Search className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              <label htmlFor={HOME_SEARCH_INPUT_ID} className="sr-only">
                홈 기능 검색
              </label>
              <input
                id={HOME_SEARCH_INPUT_ID}
                type="text"
                value={searchText}
                onKeyDown={handleSearchKeyDown}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="어떤 운명이 궁금하신가요?"
                aria-label="홈 페이지 기능 검색"
                aria-describedby={HOME_SEARCH_HELP_ID}
                aria-controls={HOME_SEARCH_LISTBOX_ID}
                aria-expanded={normalizedSearchText.length > 0 && topSearchMatches.length > 0}
                aria-activedescendant={
                  activeSearchIndex >= 0 ? `home-search-option-${activeSearchIndex}` : undefined
                }
                role="combobox"
                aria-autocomplete="list"
                className="bg-transparent border-none outline-none text-xs font-black text-white placeholder:text-slate-500 w-full tracking-wider italic uppercase"
              />
            <button type="submit" className="sr-only">
              검색
            </button>
          </form>
          <div className="noise-texture opacity-[0.05]" />
        </motion.div>
        {(normalizedSearchText.length > 0 && topSearchMatches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            id={HOME_SEARCH_LISTBOX_ID}
            role="listbox"
            aria-label="검색 결과"
            className="mt-2 rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-xl overflow-hidden"
          >
            {topSearchMatches.map((item, index) => (
              <button
                key={item.path}
                id={`home-search-option-${index}`}
                role="option"
                aria-selected={topSearchMatches[activeSearchIndex]?.path === item.path}
                onClick={() => handleSearchSelect(item.path)}
                onMouseEnter={() => setActiveSearchIndex(index)}
                className={`w-full text-left px-4 py-2.5 hover:bg-white/10 border-b border-white/10 last:border-b-0 flex items-start gap-2 ${topSearchMatches[activeSearchIndex]?.path === item.path ? "bg-fuchsia-500/10" : ""}`}
              >
                <span className="mt-0.5 text-[10px] text-fuchsia-400">{item.title}</span>
                <span className="text-[11px] text-slate-300 font-black tracking-wide">
                  {item.description}
                </span>
              </button>
            ))}
          </motion.div>
        )}
        {searchError && (
          <div className="mt-2 px-1 space-y-2">
            <p className="text-[11px] text-rose-300 font-black uppercase tracking-wider">
              {searchError}
            </p>
            <div className="flex flex-wrap gap-2">
              {HOME_SEARCH_INDEX.slice(0, 3).map((item) => (
                <button
                  key={`fallback-${item.path}`}
                  type="button"
                  onClick={() => handleSearchSelect(item.path)}
                  className="text-[10px] px-2.5 py-1 rounded-full border border-white/15 text-slate-200 hover:bg-white/10"
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Boot Sequence */}
      {flowState === "boot" && (
        <TerminalBoot onComplete={() => setFlowState("input")} />
      )}

      {/* Loading State */}
      {flowState === "loading" && (
        <LoadingGlitch />
      )}

      <SocialProofTicker />
      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 pt-28 pb-20">
        {/* Dashboard Portal */}
        {(flowState === "boot" || flowState === "input") && (
          <div className="max-w-5xl mx-auto flex flex-col gap-8 sm:gap-16">
            {/* Hero Section (Banner) */}
            <motion.div className="order-1" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }}>
              <CouponBanner />
            </motion.div>

            {/* Personalized Vibe Section */}
            <ScrollReveal>
              <div className="flex flex-col sm:flex-row items-center justify-between px-4 gap-4">
                <div className="text-center sm:text-left">
                  <h2 className="ui-title-gradient text-2xl sm:text-3xl tracking-[0.08em] leading-none">글로벌 <span className="text-indigo-500">운세 동기화</span></h2>
                  <p className="text-micro-copy mt-2 sm:mt-3 opacity-80 font-black italic text-indigo-200">
                    {clientHour === null
                      ? "오늘의 운세 흐름을 준비 중입니다"
                      : clientHour >= 5 && clientHour < 11
                        ? "빛나는 시작, 좋은 아침입니다"
                        : clientHour >= 11 && clientHour < 17
                          ? "찬란한 오후의 에너지가 가득하길"
                          : clientHour >= 17 && clientHour < 21
                            ? "차분한 저녁, 오늘을 되돌아보세요"
                            : "고요한 밤, 당신의 꿈을 응원합니다"}
                  </p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 ui-chip">
                  <Activity className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-100 italic">시스템 동기 상태: 최적</span>
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="mt-6"
              >
                <LuckyScoreCard />
                <div className="noise-texture opacity-[0.03]" />
                <div className="premium-glow" />
              </motion.div>
            </ScrollReveal>

            {/* Premium Menu Nexus */}
            <div className="order-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <FortuneCarousel />
                <div className="noise-texture opacity-[0.02]" />
                <div className="premium-glow opacity-50" />
              </motion.div>
            </div>

            {/* Original Saju Input (Classic Core) */}
            <ScrollReveal direction="down">
              <motion.div
                id="saju-input"
                className="order-2 panel-shell py-12 sm:py-20 px-4 sm:px-10"
              >
                <div className="absolute top-0 right-10 w-48 h-1 bg-gradient-to-l from-indigo-500/50 to-transparent" />
                <div className="text-center mb-6 space-y-3">
                  <div className="ui-chip inline-flex text-[9px]">
                    <Compass className="w-3 h-3" /> 핵심 분석 엔진
                  </div>
                  <h3 className="ui-title text-white text-2xl sm:text-3xl font-black italic uppercase tracking-tighter"><span className="text-indigo-500">핵심</span> 사주 분석</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">정확한 태어난 시간에 가까울수록 엔진 정밀도가 수직 상승합니다</p>
                </div>
                <div className="max-w-xl mx-auto space-y-4">
                  <BirthInputRetro onSubmit={handleBirthSubmit} />
                  <div className="flex items-center justify-center gap-2.5 text-[9px] text-slate-500 font-black uppercase tracking-widest italic opacity-60">
                    <Shield className="w-3.5 h-3.5 text-indigo-500/50" /> 보안 처리: AES-256 로컬 연산 전용
                  </div>
                </div>
                <div className="noise-texture opacity-[0.04]" />
                <div className="premium-glow" />
              </motion.div>
            </ScrollReveal>

            <ScrollReveal direction="up">
              <motion.div
                className="panel-shell py-10 px-4 sm:px-10"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <div className="text-center mb-6">
                  <div className="ui-chip inline-flex text-[9px]">
                    <Shield className="w-3 h-3" /> 작명 진입 패널
                  </div>
                  <h3 className="ui-title text-white text-2xl sm:text-3xl font-black italic uppercase tracking-tighter mt-3">
                    <span className="text-fuchsia-400">작명</span> 엔진
                  </h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">이름을 입력하면 작명 분석으로 바로 이동</p>
                </div>
                <div className="max-w-xl mx-auto space-y-3">
                  <label htmlFor="naming-draft-name" className="sr-only">
                    작명용 이름 입력
                  </label>
                  <input
                    id="naming-draft-name"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    placeholder="홍길동"
                    autoComplete="name"
                    maxLength={20}
                    aria-describedby="naming-draft-help"
                    className="w-full rounded-2xl bg-black/40 border border-white/10 px-5 py-4 text-white text-lg font-black focus:outline-none focus:border-fuchsia-400/60"
                  />
                  <label htmlFor="naming-draft-hanja" className="sr-only">
                    작명용 한자 입력
                  </label>
                  <input
                    id="naming-draft-hanja"
                    value={hanjaDraft}
                    onChange={(e) => setHanjaDraft(e.target.value)}
                    placeholder="홍길동 한자(선택)"
                    autoComplete="off"
                    maxLength={20}
                    className="w-full rounded-2xl bg-black/40 border border-white/10 px-5 py-4 text-fuchsia-100 text-sm font-bold focus:outline-none focus:border-fuchsia-400/60"
                  />
                  <p id="naming-draft-help" className="text-[11px] text-slate-400 px-1">
                    이름만 입력해도 작명 분석을 시작할 수 있습니다.
                  </p>
                  <button
                    onClick={handleStartNaming}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-fuchsia-700 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-black uppercase tracking-[0.2em] text-sm border border-fuchsia-400/40 transition-all"
                  >
                    작명 분석으로 이동
                  </button>
                </div>
              </motion.div>
            </ScrollReveal>

            {/* Daily Content Feed */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <DailyPsychologySection />
            </motion.div>

            {/* 9.1 Daily Batch Action */}
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {[
                { label: "만세력", icon: "📅", link: "/calendar" },
                { label: "오늘의 일진", icon: "✨", link: "/daily" },
                { label: "꿈해몽", icon: "🌙", link: "/dreams" },
                { label: "궁합보기", icon: "💖", link: "/compatibility" }
              ].map((item, idx) => (
                <Link key={idx} href={item.link}>
                  <div className="premium-card p-6 flex flex-col items-center justify-center gap-3 group hover:border-primary/50 transition-all text-center h-full">
                    <span className="text-3xl group-hover:scale-125 transition-transform">{item.icon}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                    <div className="noise-texture opacity-[0.05]" />
                    <div className="premium-glow opacity-30" />
                  </div>
                </Link>
              ))}
            </motion.section>

            {/* Interaction Layer */}
            <div className="order-6 relative">
              <OracleBall />
              {/* 1.3 Floating Jelly Indicator Mini */}
              <motion.div
                className="absolute -top-12 -right-4 bg-slate-900/80 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-3 shadow-2xl flex items-center gap-3 z-20"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🍇</span>
                </div>
                <div className="pr-2">
                  <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">현재 잔액</p>
                  <p className="text-sm font-black italic text-white leading-none">340 개</p>
                </div>
              </motion.div>
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
              personName={sajuPersonName}
              archetype={archetype}
              pillarNameKo={pillarNameKo}
              ageGroup={sajuData.ageGroup}
              elementScores={sajuData.elementScores}
              elementCounts={sajuData.elementCounts}
              elementBasicPercentages={sajuData.elementBasicPercentages}
              fourPillars={sajuData.fourPillars}
              daewun={sajuData.daewun}
              gyeokguk={sajuData.gyeokguk}
              version={sajuData.version}
              integrity={sajuData.integrity}
              isTimeUnknown={sajuData.isTimeUnknown}
              analysisMeta={sajuData.analysisMeta}
              canonicalFeatures={sajuData.canonicalFeatures}
              evidence={sajuData.evidence}
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
