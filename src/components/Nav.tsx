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
    const nextIndex = (themes.indexOf(theme) + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <>
      <div className="bg-black/80 backdrop-blur-md border-b border-white/10 relative z-50">
        <div className="max-w-6xl mx-auto px-6 py-2 flex items-center justify-between text-xs font-mono tracking-widest text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 opacity-80 cursor-default">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse" />
              SYSTEM.ONLINE
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/mypage" className="flex items-center gap-2 hover:text-yellow-400 transition-colors group">
              <span className="opacity-70 group-hover:opacity-100">Jelly</span>
              <span className="font-black text-white group-hover:text-yellow-400">{churu || 0}</span>
            </Link>
            <div className="w-px h-3 bg-white/20" />
            <Link href="/mypage" className="flex items-center gap-2 hover:text-pink-400 transition-colors group">
              <span className="opacity-70 group-hover:opacity-100">Bonus</span>
              <span className="font-black text-white group-hover:text-pink-400">{nyang || 0}</span>
            </Link>
            <div className="w-px h-3 bg-white/20" />
            <Link href="/mypage" className="hover:text-white transition-colors">MY_ACCOUNT</Link>
          </div>
        </div>
      </div>

      <nav className="sticky top-4 z-[60] mt-4 px-4 w-full pointer-events-none">
        <div className="max-w-4xl mx-auto bg-black/40 backdrop-blur-2xl border border-white/15 rounded-full px-6 py-3 flex items-center justify-between shadow-2xl pointer-events-auto group/nav hover:border-white/30 transition-all duration-300">
          <Link href="/" className="flex items-center gap-3 relative mr-8 group/logo">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 p-[1px] shadow-lg">
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent" />
                <span className="text-xl relative z-10">🐾</span>
              </div>
            </div>
            <span className="font-black text-lg bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent hidden sm:block tracking-tight">
              Secret Paws
            </span>
          </Link>

          <div className="flex-1 flex items-center justify-center gap-2 overflow-x-auto no-scrollbar">
            {LINKS.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap",
                    isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav_indicator"
                      className="absolute inset-0 bg-white/10 border border-white/20 rounded-full shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10 drop-shadow-sm">{label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/10">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
              aria-label="Toggle Theme"
            >
              <Palette className="w-5 h-5 hover:scale-110 transition-transform" />
            </button>
            <Link
              href="/mypage"
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg hover:shadow-pink-500/25 hover:scale-105 transition-all"
              aria-label="My Page"
            >
              <Menu className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
