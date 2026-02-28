"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useWallet } from "./WalletProvider";
import { useTheme } from "./ThemeProvider";
import { useLocale } from "@/lib/i18n";
import { User, Menu, X, Sun, Moon, Eye, Globe, CloudSun, ChevronDown, Smartphone } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { THEMES, ThemeType } from "@/lib/themes";

export function Nav() {
  const pathname = usePathname();
  const { churu } = useWallet();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeProfile, setActiveProfile] = useState("게스트");

  const LINKS = [
    { href: "/", label: "홈" },
    { href: "/luck", label: "액운/행운" },
    { href: "/destiny", label: "운명/궁합" },
    { href: "/healing", label: "소원/힐링" },
    { href: "/dreams", label: "꿈해몽" }
  ];

  const themeIcons: Record<ThemeType, typeof Sun> = {
    dark: Moon,
    light: Sun,
    readable: Eye,
  };

  const ThemeIcon = themeIcons[theme];

  return (
    <nav className="sticky top-0 z-[60] w-full backdrop-blur-md border-b" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-color)' }}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-md">
            <span className="text-white text-sm font-black">점</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight hidden sm:block" style={{ color: 'var(--text-foreground)' }}>
              점신사주
            </span>
            <span className="text-[10px] text-slate-500 hidden sm:block leading-none">내 인생의 큐레이터</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {LINKS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive ? "font-bold" : "opacity-60 hover:opacity-100"
                )}
                style={{ color: 'var(--text-foreground)' }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav_active"
                    className="absolute inset-0 rounded-lg"
                    style={{ backgroundColor: 'var(--surface)' }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </Link>
            );
          })}
        </div>

        {/* Center: Weather & Profile Widget (Desktop) */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
            <CloudSun className="w-4 h-4 text-sky-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">서울 12℃</span>
            <span className="text-[10px] text-green-500 font-medium ml-1">좋음</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">{activeProfile}님</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-10 right-0 z-50 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden py-2"
                >
                  <div className="px-3 py-1.5 text-[10px] text-slate-500 font-medium uppercase tracking-wider">프로필 선택</div>
                  {["본인 (게스트)", "가족 1", "친구 1", "+ 새 프로필"].map((name, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (!name.includes('+')) setActiveProfile(name.split(' ')[0]);
                        setProfileOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      {name}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Jelly */}
          <Link
            href="/mypage"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            <span className="font-bold" style={{ color: 'var(--primary)' }}>{churu || 0}</span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t('nav.jelly')}</span>
          </Link>

          {/* Settings (theme + language) */}
          <div className="relative">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
              style={{ backgroundColor: 'var(--surface)', color: 'var(--text-secondary)' }}
              aria-label="설정"
            >
              <ThemeIcon className="w-4 h-4" />
            </button>

            {settingsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setSettingsOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute right-0 top-12 z-50 w-56 rounded-xl shadow-2xl border overflow-hidden"
                  style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-color)' }}
                >
                  {/* Theme Section */}
                  <div className="p-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <p className="text-[11px] font-medium mb-2 px-1" style={{ color: 'var(--text-secondary)' }}>테마</p>
                    <div className="space-y-1">
                      {(Object.keys(THEMES) as ThemeType[]).map((key) => {
                        const Icon = themeIcons[key];
                        return (
                          <button
                            key={key}
                            onClick={() => { setTheme(key); }}
                            className={cn(
                              "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left",
                              theme === key ? "font-bold" : "opacity-60 hover:opacity-100"
                            )}
                            style={{
                              color: 'var(--text-foreground)',
                              backgroundColor: theme === key ? 'var(--surface)' : 'transparent',
                            }}
                          >
                            <Icon className="w-4 h-4" />
                            {THEMES[key].label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Language Section */}
                  <div className="p-3">
                    <p className="text-[11px] font-medium mb-2 px-1" style={{ color: 'var(--text-secondary)' }}>언어 / Language</p>
                    <div className="space-y-1">
                      {[
                        { key: 'ko' as const, label: '한국어' },
                        { key: 'en' as const, label: 'English' },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => { setLocale(key); }}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left",
                            locale === key ? "font-bold" : "opacity-60 hover:opacity-100"
                          )}
                          style={{
                            color: 'var(--text-foreground)',
                            backgroundColor: locale === key ? 'var(--surface)' : 'transparent',
                          }}
                        >
                          <Globe className="w-4 h-4" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </div>

          {/* My Page */}
          <Link
            href="/mypage"
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'var(--surface)', color: 'var(--text-secondary)' }}
            aria-label={t('nav.mypage')}
          >
            <User className="w-4 h-4" />
          </Link>

          {/* APP Download CTA */}
          <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold shadow-sm transition-colors">
            <Smartphone className="w-4 h-4" />
            앱으로 보기
          </button>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--surface)', color: 'var(--text-secondary)' }}
            aria-label={t('nav.menu')}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t"
          style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-color)' }}
        >
          <div className="px-4 py-3 space-y-1">
            {LINKS.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    isActive ? "font-bold" : "opacity-60"
                  )}
                  style={{
                    color: 'var(--text-foreground)',
                    backgroundColor: isActive ? 'var(--surface)' : 'transparent',
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
