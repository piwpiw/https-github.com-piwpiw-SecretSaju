"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/components/WalletProvider";
import { clearUserSession, getUserFromCookie } from "@/lib/kakao-auth";
import { handleShare } from "@/lib/share";
import AuthModal from "@/components/AuthModal";
import JellyShopModal from "@/components/shop/JellyShopModal";
import { Copy, Gem, Gift, History, HelpCircle, LogOut, MessageSquare, ShoppingBag, Star, TrendingUp, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface UserData {
  id: string | number;
  nickname: string;
  email?: string;
  profileImage?: string;
}

const QUICK_MENU = [
  { icon: MessageSquare, label: "문의하기", href: "/inquiry" },
  { icon: Gift, label: "후원하기", href: "/support" },
  { icon: HelpCircle, label: "FAQ", href: "/faq" },
  { icon: History, label: "분석 내역", href: "/analysis-history" },
] as const;

export default function MyPage() {
  const router = useRouter();
  const { churu, nyang } = useWallet();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showShop, setShowShop] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const userData = getUserFromCookie();
    setUser(userData);
    setIsLoading(false);
  }, []);

  const level = nyang >= 1000
    ? { name: "다이아 티어", next: "MAX", percent: 100 }
    : nyang >= 300
      ? { name: "실버 티어", next: 1000, percent: Math.min(100, (nyang / 1000) * 100) }
      : { name: "브론즈 티어", next: 300, percent: Math.min(100, (nyang / 300) * 100) };

  const handleLogout = () => {
    if (!confirm("정말 로그아웃할까요?")) {
      return;
    }

    clearUserSession();
    setUser(null);
    router.push("/");
  };

  const copyReferral = async () => {
    if (!user) return;
    const referralLink = `${window.location.origin}/?ref=${user.id}`;
    const result = await handleShare("초대 링크", `Secret Saju: ${referralLink}`, referralLink);
    if (result === "copied") {
      alert("초대 링크가 복사되었습니다.");
    }
  };

  const mainMenuItems = [
    {
      icon: ShoppingBag,
      label: "젤리 충전",
      desc: "남은 젤리를 충전하고 분석 기능을 이용하세요.",
      onClick: () => setShowShop(true),
    },
    {
      icon: Star,
      label: "내 프로필 관리",
      desc: "저장된 사주 프로필 목록을 열어보세요.",
      onClick: () => router.push("/my-saju/list"),
    },
    {
      icon: TrendingUp,
      label: "토정비결 보기",
      desc: "연간 운세 화면으로 빠르게 이동합니다.",
      onClick: () => router.push("/tojeong"),
    },
    {
      icon: History,
      label: "분석 히스토리",
      desc: "최근 분석 기록과 보관한 결과를 확인하세요.",
      onClick: () => router.push("/analysis-history"),
    },
  ];

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-current border-t-transparent animate-spin" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen relative overflow-hidden flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full p-10 rounded-4xl border border-border-color bg-surface text-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-border-color flex items-center justify-center mx-auto mb-6">
            <UserIcon className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-black mb-2">로그인 필요</h1>
          <p className="text-secondary mb-8">내 프로필, 사용 내역, 혜택을 보려면 로그인해주세요.</p>
          <button
            onClick={() => setShowAuth(true)}
            className="w-full py-4 rounded-2xl bg-primary text-white font-black"
          >
            로그인 하기
          </button>
          <Link href="/" className="text-sm text-secondary hover:text-foreground mt-8 inline-block">
            홈으로 돌아가기
          </Link>
        </motion.div>

        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden pb-40">
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12 border-b border-border-color pb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-4xl bg-background border-4 border-border-color overflow-hidden relative">
              {user.profileImage ? (
                <Image src={user.profileImage} alt={user.nickname} fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-secondary" />
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-xl flex items-center justify-center border-2 border-surface">
                <Gem className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <p className={`inline-flex px-3 py-1 rounded-full border ${level.next === "MAX" ? "text-fuchsia-300 border-fuchsia-500/30" : "text-emerald-300 border-emerald-500/30"} text-sm font-black uppercase mb-2`}>
                {level.name}
              </p>
              <h1 className="text-3xl font-black">{user.nickname}</h1>
              <p className="text-secondary text-sm mt-1">{user.email || "이메일 미등록"}</p>
              <button
                onClick={copyReferral}
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-foreground bg-surface border border-border-color px-3 py-2 rounded-xl"
              >
                <Copy className="w-4 h-4" />
                초대 링크 보내기
              </button>
            </div>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 rounded-3xl border border-border-color">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-surface p-8 rounded-4xl border border-primary/20"
          >
            <p className="text-sm text-primary uppercase font-black">보유 젤리</p>
            <p className="mt-3 text-4xl font-black">{churu}</p>
            <button
              onClick={() => setShowShop(true)}
              className="mt-6 w-full py-3 rounded-2xl bg-primary text-white"
            >
              젤리 충전하기
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-surface p-8 rounded-4xl border border-border-color"
          >
            <p className="text-sm text-secondary uppercase font-black flex items-center justify-between">
              <span>경험치</span>
              <span>{level.next === "MAX" ? "MAX" : `${Math.floor(level.percent)}%`}</span>
            </p>
            <p className="mt-3 text-4xl font-black">{nyang}</p>
            <p className="mt-2 text-sm text-secondary">
              다음 단계: {level.next === "MAX" ? "최대 달성" : `${level.next} EXP`}
            </p>
          </motion.div>
        </div>

        <div className="space-y-4 mb-12">
          <h2 className="text-2xl font-black">빠른 메뉴</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mainMenuItems.map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className="bg-surface p-6 rounded-3xl border border-border-color hover:border-primary/50 transition-all text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <item.icon className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="text-lg font-black">{item.label}</h3>
                    <p className="text-sm text-secondary">{item.desc}</p>
                  </div>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-border-color"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
          {QUICK_MENU.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="bg-surface p-5 rounded-3xl border border-border-color text-center hover:border-primary/30"
            >
              <div className="w-12 h-12 rounded-2xl bg-background border border-border-color flex items-center justify-center mx-auto mb-3">
                <item.icon className="w-6 h-6 text-secondary" />
              </div>
              <span className="text-sm font-black">{item.label}</span>
            </Link>
          ))}
        </div>

        <p className="text-center text-xs uppercase tracking-[0.3em] text-secondary">Secret Saju</p>
      </div>

      <JellyShopModal isOpen={showShop} onClose={() => setShowShop(false)} onPurchaseSuccess={() => setShowShop(false)} />
    </main>
  );
}
