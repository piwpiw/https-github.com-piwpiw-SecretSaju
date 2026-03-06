"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/components/WalletProvider";
import { clearUserSession, getUserFromCookie } from "@/lib/kakao-auth";
import AuthModal from "@/components/AuthModal";
import JellyShopModal from "@/components/shop/JellyShopModal";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gem, Gift, History, HelpCircle, LogOut, MessageSquare,
  ShoppingBag, Star, TrendingUp, User as UserIcon,
  ChevronRight, Sparkles, Zap, Award, Clock, BarChart3,
  Shield, Settings, Bell, Crown, Orbit
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import PremiumWalletCard from "@/components/mypage/PremiumWalletCard";
import ReferralCard from "@/components/referral/ReferralCard";

interface UserData {
  id: string | number;
  nickname: string;
  email?: string;
  profileImage?: string;
  auth_provider?: string | null;
}

const QUICK_LINKS = [
  { icon: MessageSquare, label: "문의하기", href: "/inquiry", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { icon: Gift, label: "후원하기", href: "/support", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
  { icon: HelpCircle, label: "FAQ", href: "/faq", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  { icon: History, label: "분석 내역", href: "/analysis-history", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
] as const;

const MAIN_ACTIONS = [
  {
    icon: ShoppingBag,
    label: "젤리 충전",
    desc: "분석 기능 이용을 위한 크레딧 충전",
    gradient: "from-indigo-500 to-purple-600",
    glow: "shadow-indigo-500/20",
    key: "shop",
  },
  {
    icon: Star,
    label: "내 프로필 관리",
    desc: "저장된 사주 프로필 목록",
    gradient: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/20",
    href: "/my-saju/list",
  },
  {
    icon: TrendingUp,
    label: "토정비결",
    desc: "연간 운세 화면으로 이동",
    gradient: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/20",
    href: "/tojeong",
  },
  {
    icon: History,
    label: "분석 히스토리",
    desc: "최근 분석 기록 및 보관",
    gradient: "from-rose-500 to-pink-600",
    glow: "shadow-rose-500/20",
    href: "/analysis-history",
  },
];

function StatCard({ label, value, unit, color, icon: Icon, percent }: {
  label: string; value: string | number; unit: string;
  color: string; icon: typeof Gem; percent?: number;
}) {
  return (
    <div className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-5 flex flex-col gap-3 hover:border-white/15 transition-all group">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">{label}</p>
        <Icon className={`w-4 h-4 ${color} opacity-60 group-hover:opacity-100 transition-opacity`} />
      </div>
      <div className="flex items-end gap-1.5">
        <span className={`text-3xl font-black italic ${color}`}>{value}</span>
        <span className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">{unit}</span>
      </div>
      {percent !== undefined && (
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className={`h-full rounded-full ${color.replace("text-", "bg-")}`}
            style={{ filter: "blur(0px)" }}
          />
        </div>
      )}
    </div>
  );
}

export default function MyPage() {
  const router = useRouter();
  const { churu, nyang } = useWallet();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showShop, setShowShop] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [greeting, setGreeting] = useState("안녕하세요");

  const focusScore = Math.min(100, Math.floor((nyang / 1000) * 100));
  const level = nyang >= 1000
    ? { name: "다이아 티어", badge: "💎", color: "text-fuchsia-400", border: "border-fuchsia-500/30", bg: "bg-fuchsia-500/10", percent: 100 }
    : nyang >= 300
      ? { name: "실버 티어", badge: "⭐", color: "text-slate-300", border: "border-slate-400/30", bg: "bg-slate-400/10", percent: Math.min(100, (nyang / 1000) * 100) }
      : { name: "브론즈 티어", badge: "🔥", color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10", percent: Math.min(100, (nyang / 300) * 100) };

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 6 ? "늦은 밤이에요" : h < 12 ? "좋은 아침이에요" : h < 18 ? "좋은 오후에요" : "좋은 저녁이에요");
    const refreshAuth = () => { setUser(getUserFromCookie()); setIsLoading(false); };
    refreshAuth();
    window.addEventListener("focus", refreshAuth);
    return () => window.removeEventListener("focus", refreshAuth);
  }, []);

  const handleLogout = () => {
    clearUserSession();
    setUser(null);
    setShowLogoutConfirm(false);
    router.push("/");
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 rounded-full border-2 border-indigo-500/30 border-t-indigo-500"
        />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen relative overflow-hidden flex items-center justify-center px-6 py-16 bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent_70%)]" />
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="max-w-sm w-full relative z-10"
        >
          <div className="rounded-[3rem] border border-white/10 bg-slate-900/60 backdrop-blur-2xl p-10 text-center shadow-2xl">
            <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6">
              <Crown className="w-10 h-10 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-black text-white mb-2">로그인 필요</h1>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              내 프로필, 사용 내역, 혜택을 보려면<br />로그인해 주세요.
            </p>
            <button
              onClick={() => setShowAuth(true)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-indigo-500/20"
            >
              로그인 하기
            </button>
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 mt-6 inline-block tracking-widest uppercase transition-colors">
              홈으로 돌아가기
            </Link>
          </div>
        </motion.div>
        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden pb-40">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-20 bg-radial-gradient" style={{ background: "radial-gradient(ellipse at top, rgba(99,102,241,0.25) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] opacity-10" style={{ background: "radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)" }} />
      </div>

      <div className="max-w-4xl mx-auto px-5 py-10 relative z-10">

        {/* ── Header ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-10"
        >
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-white/10 bg-slate-800">
                {user.profileImage ? (
                  <Image src={user.profileImage} alt={user.nickname} fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UserIcon className="w-9 h-9 text-slate-500" />
                  </div>
                )}
              </div>
              {/* Level badge */}
              <div className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-xl ${level.bg} border ${level.border} text-[10px] font-black ${level.color}`}>
                {level.badge}
              </div>
            </div>
            {/* Name & greeting */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-0.5">{greeting} ·</p>
              <h1 className="text-2xl font-black text-white">{user.nickname}<span className="text-indigo-400">님</span></h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${level.bg} border ${level.border} ${level.color}`}>
                  {level.name}
                </span>
                {user.auth_provider && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400/70 bg-indigo-500/5 px-2 py-0.5 rounded-full border border-indigo-500/10">
                    {user.auth_provider === "mcp" ? "MCP" : user.auth_provider}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-all" aria-label="알림">
              <Bell className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-10 h-10 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-rose-500/10 hover:border-rose-500/20 transition-all group"
              aria-label="로그아웃"
            >
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-400 transition-colors" />
            </button>
          </div>
        </motion.div>

        {/* ── Wallet Card ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <PremiumWalletCard jellies={churu} onClickCharge={() => setShowShop(true)} />
        </motion.div>

        {/* ── Referral ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <ReferralCard />
        </motion.div>

        {/* ── Stats Grid ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          <StatCard label="경험치" value={nyang} unit="exp" color="text-indigo-400" icon={Award} percent={level.percent} />
          <StatCard label="포커스" value={`${focusScore}`} unit="%" color="text-emerald-400" icon={Zap} percent={focusScore} />
          <StatCard label="젤리 잔액" value={churu} unit="🍀" color="text-amber-400" icon={Gem} />
        </motion.div>

        {/* ── Main Actions ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">주요 메뉴</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MAIN_ACTIONS.map((item) => {
              const content = (
                <div className="flex items-center gap-4 p-5 rounded-[2rem] bg-white/[0.03] border border-white/8 hover:border-white/15 hover:bg-white/[0.05] transition-all group cursor-pointer">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg ${item.glow} flex-shrink-0`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-white text-sm">{item.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </div>
              );

              return item.href ? (
                <Link key={item.label} href={item.href}>{content}</Link>
              ) : (
                <button key={item.label} onClick={() => setShowShop(true)} className="text-left w-full">{content}</button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Quick Links ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xs font-black uppercase tracking-[0.25em] text-slate-500 mb-4">빠른 바로가기</h2>
          <div className="grid grid-cols-4 gap-3">
            {QUICK_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl ${item.bg} border hover:scale-[1.03] transition-all`}
              >
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span className="text-[11px] font-black text-slate-300 text-center leading-tight">{item.label}</span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* ── Footer brand ────────────────────────────── */}
        <div className="flex items-center justify-center gap-2 pt-4 border-t border-white/5">
          <Orbit className="w-3 h-3 text-indigo-500/50" />
          <p className="text-[10px] uppercase tracking-[0.35em] text-slate-600 font-black">Secret Saju</p>
          <Orbit className="w-3 h-3 text-indigo-500/50" />
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────── */}
      <JellyShopModal isOpen={showShop} onClose={() => setShowShop(false)} onPurchaseSuccess={() => setShowShop(false)} />

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 16 }}
              className="w-full max-w-sm rounded-[2.5rem] border border-white/10 bg-slate-900/95 backdrop-blur-2xl p-8 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-5">
                <LogOut className="w-7 h-7 text-rose-400" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">로그아웃</h3>
              <p className="text-sm text-slate-400 mb-7">현재 기기에서 로그아웃 하시겠습니까?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3.5 rounded-xl border border-white/10 text-slate-300 font-black text-sm hover:bg-white/5 transition-all"
                >
                  취소
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3.5 rounded-xl bg-rose-500 text-white font-black text-sm hover:bg-rose-400 transition-all shadow-lg shadow-rose-500/20"
                >
                  로그아웃
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
