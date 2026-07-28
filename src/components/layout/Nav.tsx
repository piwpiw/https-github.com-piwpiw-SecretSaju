"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/app/utils";
import { useWallet } from "@/components/payment/WalletProvider";
import { useTheme } from "@/components/layout/ThemeProvider";
import { useLocale } from "@/lib/app/i18n";
import { User, Menu, Sun, Moon, ChevronDown, Zap, Activity, Compass, Heart, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import WeatherWidget from "@/components/daily/WeatherWidget";
import AppDownloadBanner from "@/components/layout/AppDownloadBanner";
import { useProfiles } from "@/components/profile/ProfileProvider";
import { isMockMode } from '@/lib/app/use-mock';
import { SITE_MENU } from "@/config/site-menu";

export function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const { churu, isFreeLaunch } = useWallet();
  const { theme, setTheme } = useTheme();
  const { t } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { profiles, activeProfile, setActiveProfileById } = useProfiles();
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    // Only check on client-side
    const checkAuth = async () => {
      const { isLoggedIn } = await import("@/lib/auth/kakao-auth");
      setLogged(isLoggedIn());
    };
    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    const { clearUserSession } = await import("@/lib/auth/kakao-auth");
    clearUserSession();
    setLogged(false);
    router.push("/");
  };

  const LINKS = [
    { href: "/", label: t("nav.home") || "홈", icon: Compass },
    { href: "/luck", label: t("nav.fortune") || "운세/궁합", icon: Zap },
    { href: "/destiny", label: t("nav.destiny") || "사주", icon: Activity },
    { href: "/calendar", label: t("nav.calendar") || "캘린더", icon: Moon },
    { href: "/support", label: t("nav.support") || "후원", icon: Heart },
    { href: "/more", label: t("nav.more") || "더보기", icon: Shield },
  ];

  const themeLabel = theme === "dark" ? "다크 모드" : "라이트 모드";
  const themeToggleNextLabel = theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환";

  // 여기서 테마를 저장하지 않는다.
  //
  // 이 effect 는 마운트 직후 ThemeProvider 의 초기값 'dark' 로 한 번 돈다.
  // ThemeProvider 가 저장된 테마를 복원하기 *전* 이라, 사용자가 골라 둔
  // 'light' 를 매번 'dark' 로 덮어썼다. 그래서 화이트 모드를 켜도 새로고침
  // 한 번이면 다크로 돌아갔다. 저장은 ThemeProvider.setTheme 이 이미 한다.

  const handleThemeToggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <>
      <AppDownloadBanner />
      <nav className="sticky top-0 z-[60] w-full backdrop-blur-xl border-b border-white/5 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo Area */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-950/40 group-hover:rotate-12 transition-transform">
                <span className="text-white text-base font-black italic">S</span>
              </div>
              {/* Admin Badge (Visual Only for now) */}
              {isMockMode() && (
                <div className="absolute -top-1 -right-1 admin-badge border border-black/10">
                  A
                </div>
              )}
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-black text-lg tracking-tighter uppercase italic text-white leading-none">시크릿사주</span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 opacity-60">운명의 통찰</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {LINKS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] italic transition-all flex items-center gap-2",
                    isActive ? "text-indigo-400" : "text-slate-500 hover:text-slate-200"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav_active_glow"
                      className="absolute inset-0 rounded-xl bg-indigo-500/5 border border-indigo-500/10"
                      transition={{ type: "spring", duration: 0.6 }}
                    />
                  )}
                  <Icon className={cn("w-3.5 h-3.5", isActive && "animate-pulse")} />
                  <span className="relative z-10">{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side Tools */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 border-r border-white/5 pr-3 mr-1">
              {logged ? (
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-black tracking-tight transition-colors text-slate-300 hover:text-white hover:bg-white/10 border border-white/10"
                >
                  로그아웃
                </button>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[11px] font-black tracking-tight transition-colors",
                      pathname === "/signup"
                        ? "bg-indigo-500/20 text-indigo-200 border border-indigo-400/30"
                        : "text-slate-300 hover:text-white hover:bg-white/10 border border-white/10"
                    )}
                  >
                    회원가입
                  </Link>
                  <Link
                    href="/login"
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[11px] font-black tracking-tight transition-colors",
                      pathname === "/login"
                        ? "bg-indigo-500/20 text-indigo-200 border border-indigo-400/30"
                        : "text-slate-300 hover:text-white hover:bg-white/10 border border-white/10"
                    )}
                  >
                    로그인
                  </Link>
                </>
              )}
            </div>

            {/* Weather & Active Profile Widget (Desktop) */}
            <div className="hidden xl:flex items-center gap-4 border-r border-white/5 pr-4 mr-2">
              <WeatherWidget />

              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all group"
                >
                  <div className="w-5 h-5 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <User className="w-3 h-3" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-300 italic tracking-widest">
                    {activeProfile?.name || "게스트"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-12 right-0 z-50 w-56 bg-slate-900/95 backdrop-blur-3xl border border-white/5 rounded-3xl shadow-3xl overflow-hidden py-3"
                      >
                        <div className="px-5 py-2 text-[9px] font-black text-slate-600 uppercase tracking-widest border-b border-white/5 mb-2 italic">프로필 슬롯</div>
                        {Array.from({ length: 4 }).map((_, i) => {
                          const profile = profiles[i];
                          return (
                            <button
                              key={i}
                              onClick={() => {
                                if (profile) setActiveProfileById(profile.id);
                                else router.push("/my-saju/add");
                                setProfileOpen(false);
                              }}
                              className={cn(
                                "w-full text-left px-5 py-2.5 text-[10px] flex items-center justify-between hover:bg-white/5 transition-colors",
                                activeProfile?.id === profile?.id ? "text-indigo-400 font-black italic" : "text-slate-400 font-bold italic"
                              )}
                            >
                              <span className="flex items-center gap-3">
                                <span className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black", activeProfile?.id === profile?.id ? "bg-indigo-500/20" : "bg-black/20")}>{i + 1}</span>
                                {profile?.name || "비어 있음"}
                              </span>
                              {!profile && <span className="text-[8px] opacity-30 tracking-widest">+ 추가</span>}
                            </button>
                          );
                        })}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Wallet Integration */}
            <Link
              href="/mypage"
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 group hover:bg-indigo-500/20 transition-all shadow-inner"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-400 fill-current group-hover:scale-110 transition-transform" />
              {/* 무료 오픈 기간에는 게이트를 열어두려고 내부적으로 큰 값을 넣는다.
                  숫자를 그대로 노출하면 "999999 젤리 보유"처럼 읽히므로 상태만 표시. */}
              <span className="text-[11px] font-black text-white italic tracking-tighter break-keep">
                {isFreeLaunch ? "무료" : (churu || 0).toLocaleString("ko-KR")}
              </span>
              {!isFreeLaunch && (
                <span className="hidden sm:inline text-[9px] font-bold text-indigo-400 tracking-widest opacity-60">젤리</span>
              )}
            </Link>

            <button
              type="button"
              onClick={handleThemeToggle}
              aria-pressed={theme === "dark"}
              title={`${themeLabel} -> ${themeToggleNextLabel}`}
              aria-label={themeToggleNextLabel}
              className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 text-slate-300 flex items-center justify-center"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="sr-only">{themeToggleNextLabel}</span>
            </button>

            {/* Settings Mobile/Tablet Toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
              className="lg:hidden w-10 h-10 rounded-2xl bg-white/5 border border-white/5 text-slate-500 flex items-center justify-center"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Portal */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-white/5 bg-slate-950 overflow-hidden"
            >
              <div className="p-6 space-y-2">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {logged ? (
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }}
                      className="col-span-2 flex items-center justify-center px-4 py-3 rounded-xl text-[11px] font-black bg-white/5 text-slate-300 border border-white/10"
                    >
                      로그아웃
                    </button>
                  ) : (
                    <>
                      <Link
                        href="/signup"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center px-4 py-3 rounded-xl text-[11px] font-black bg-indigo-500/20 text-indigo-100 border border-indigo-400/30"
                      >
                        회원가입
                      </Link>
                      <Link
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center px-4 py-3 rounded-xl text-[11px] font-black bg-indigo-500/20 text-indigo-100 border border-indigo-400/30"
                      >
                        로그인
                      </Link>
                    </>
                  )}
                </div>
                {LINKS.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] italic transition-all",
                        isActive ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 bg-white/5"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </Link>
                  );
                })}

                {/* 전체 기능 목록 — 구현된 화면이 메뉴에서 빠지지 않도록 정본(SITE_MENU) 기준으로 노출 */}
                <div className="mt-4 border-t border-white/10 pt-4 space-y-5">
                  {SITE_MENU.map((group) => (
                    <div key={group.title}>
                      <p className="px-2 mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-indigo-300/80 break-keep">
                        {group.title}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {group.items.map((item) => {
                          const isActive = pathname === item.href;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setMobileOpen(false)}
                              className={cn(
                                "flex items-start gap-2 rounded-2xl px-3 py-3 transition-all border",
                                isActive
                                  ? "bg-indigo-600 text-white border-indigo-400/40"
                                  : "bg-white/5 text-slate-200 border-white/10 hover:bg-white/10",
                              )}
                            >
                              <span aria-hidden="true" className="text-base leading-none mt-0.5">
                                {item.emoji}
                              </span>
                              <span className="min-w-0">
                                <span className="block text-[12px] font-bold break-keep">{item.label}</span>
                                {item.desc ? (
                                  <span className="block text-[10px] leading-4 text-slate-400 break-keep">
                                    {item.desc}
                                  </span>
                                ) : null}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
