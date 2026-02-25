"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { useTheme } from "./ThemeProvider";
import { useWallet } from "./WalletProvider";
import { Palette, Menu } from "lucide-react";
import { motion } from "framer-motion";

const LINKS = [
  { href: "/", label: "일주 보기" },
  { href: "/dashboard", label: "관계 지도" },
  { href: "/compatibility", label: "궁합" },
  { href: "/fortune", label: "신년운세" },
] as const;

export function Nav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { churu, nyang } = useWallet();

  const toggleTheme = () => {
    const themes: ('mystic' | 'minimal' | 'cyber')[] = ['mystic', 'minimal', 'cyber'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <>
      {/* Top Status Bar (Premium Compact) */}
      <div className="bg-black/80 backdrop-blur-md border-b border-white/10 relative z-50">
        <div className="max-w-6xl mx-auto px-6 py-2 flex items-center justify-between text-xs font-mono tracking-widest text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity cursor-default">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80] animate-pulse"></span>
              SYSTEM.ONLINE
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/mypage" className="flex items-center gap-2 hover:text-yellow-400 transition-colors group">
              <span className="opacity-70 group-hover:opacity-100">Jelly</span>
              <span className="font-black text-white group-hover:text-yellow-400">{churu}</span>
            </Link>
            <div className="w-px h-3 bg-white/20"></div>
            <Link href="/mypage" className="flex items-center gap-2 hover:text-pink-400 transition-colors group">
              <span className="opacity-70 group-hover:opacity-100">Bonus</span>
              <span className="font-black text-white group-hover:text-pink-400">{nyang}</span>
            </Link>
            <div className="w-px h-3 bg-white/20"></div>
            <Link href="/mypage" className="hover:text-white transition-colors">
              MY_ACCOUNT
            </Link>
          </div>
        </div>
      </div>

      {/* Main Floating Nav (Desktop & Mobile Adaptive) */}
      <nav className="sticky top-4 z-[60] mt-4 px-4 w-full pointer-events-none">
        <div className="max-w-4xl mx-auto bg-black/40 backdrop-blur-2xl border border-white/15 rounded-full px-6 py-3 flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.5)] pointer-events-auto group/nav hover:border-white/30 transition-all duration-300">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 relative mr-8 group/logo">
            <div className="absolute inset-0 bg-cyan-400/20 blur-xl opacity-0 group-hover/logo:opacity-100 transition-opacity rounded-full"></div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 p-[1px] shadow-lg">
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent"></div>
                <span className="text-xl relative z-10 drop-shadow-md">🐾</span>
              </div>
            </div>
            <span className="font-black text-lg bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent hidden sm:block tracking-tight">
              Secret Paws
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex-1 flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
            {LINKS.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative px-4 sm:px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap",
                    isActive
                      ? "text-white"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav_indicator"
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 border border-white/20 rounded-full shadow-[inset_0_0_15px_rgba(255,255,255,0.1)]"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 drop-shadow-sm">{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/10">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-slate-400 hover:text-white group relative"
              title="Theme Toggle"
            >
              <Palette className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
            <Link
              href="/mypage"
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg hover:shadow-pink-500/25 hover:scale-105 transition-all"
            >
              <Menu className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
