"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useWallet } from "./WalletProvider";
import { useTheme } from "./ThemeProvider";
import { useLocale } from "@/lib/i18n";
import { User, Menu, X, Sun, Moon, Eye, Globe, ChevronDown, Smartphone, Zap, Activity, Compass, Heart, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { THEMES, ThemeType } from "@/lib/themes";
import WeatherWidget from "./WeatherWidget";
import AppDownloadBanner from "./AppDownloadBanner";
import { useProfiles } from "./ProfileProvider";

export function Nav() {
  const themeStorageKey = "theme";
  const router = useRouter();
  const pathname = usePathname();
  const { churu } = useWallet();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { profiles, activeProfile, setActiveProfileById } = useProfiles();

  const LINKS = [
    { href: "/", label: "Ȩ", icon: Compass },
    { href: "/luck", label: "�/����", icon: Zap },
    { href: "/destiny", label: "���", icon: Activity },
    { href: "/calendar", label: "Ķ����", icon: Moon },
    { href: "/support", label: "����", icon: Heart },
    { href: "/more", label: "\uB354\uBCF4\uAE30", icon: Shield },
  ];
  const themeLabel = theme === "dark" ? "\uB2E4\uD06C \uBAA8\uB4DC" : "\uB77C\uC774\uD2B8 \uBAA8\uB4DC";
  const themeToggleNextLabel = theme === "dark" ? "\uB77C\uC774\uD2B8 \uBAA8\uB4DC\uB85C \uc804\ud658" : "\uB2E4\uD06C \uBAA8\uB4DC\uB85C \uc804\ud658";

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(themeStorageKey, theme);
      }
    } catch {}
  }, [theme]);

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
              {process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' && (
                <div className="absolute -top-1 -right-1 admin-badge border border-black/10">
                  A
                </div>
              )}
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-black text-lg tracking-tighter uppercase italic text-white leading-none">SECRET SAJU</span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 opacity-60">Celestial Intelligence</span>
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
                    {activeProfile?.name || "GUEST"}
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
                        <div className="px-5 py-2 text-[9px] font-black text-slate-600 uppercase tracking-widest border-b border-white/5 mb-2 italic">Neural Entity Slots</div>
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
                                {profile?.name || "EMPTY SLOT"}
                              </span>
                              {!profile && <span className="text-[8px] opacity-30 tracking-widest">+ ADD</span>}
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
              <span className="text-[11px] font-black text-white italic tracking-tighter">{churu || 0}</span>
              <span className="hidden sm:inline text-[9px] font-bold text-indigo-400 uppercase tracking-widest opacity-60">JELLY</span>
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
              onClick={() => setMobileOpen(!mobileOpen)}
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}





