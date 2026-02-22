"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { useTheme } from "./ThemeProvider";
import { useWallet } from "./WalletProvider";
import { Palette, Menu } from "lucide-react";

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
      {/* Top Status Bar */}
      <div className="border-b border-white/5 bg-background/95 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center justify-between text-sm">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-lg">🐶</span>
            </div>
            <span className="font-bold text-foreground">990 사주마미</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/mypage" className="flex items-center gap-1.5 hover:opacity-80">
              <span className="text-lg">🐟</span>
              <span className="font-medium text-foreground">{churu}</span>
            </Link>
            <Link href="/mypage" className="flex items-center gap-1.5 hover:opacity-80">
              <span className="text-lg">🐾</span>
              <span className="font-medium text-foreground">{nyang}</span>
            </Link>
            <Link href="/gift" className="text-lg hover:opacity-80">
              🎁
            </Link>
            <Link href="/inquiry" className="text-lg hover:opacity-80">
              ❓
            </Link>
            <Link href="/mypage" className="text-lg hover:opacity-80">
              ☰
            </Link>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <ul className="flex gap-4">
              {LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "text-sm font-medium transition-colors",
                      pathname === href ? "text-primary" : "text-zinc-400 hover:text-foreground"
                    )}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-zinc-400 hover:text-primary"
            title="테마 변경"
          >
            <Palette className="w-5 h-5" />
          </button>
        </div>
      </nav>
    </>
  );
}
