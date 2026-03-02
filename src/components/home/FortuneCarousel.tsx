"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, Zap } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

const MENU_ITEMS = [
    { href: "/tojeong", label: "토정비결", emoji: "🪬", desc: "일간운/월간운 핵심 해석", highlight: true },
    { href: "/tarot", label: "타로", emoji: "🔮", desc: "질문형 점성 리포트" },
    { href: "/saju", label: "사주 분석", emoji: "🌙", desc: "원국·운세 스냅샷" },
    { href: "/compatibility", label: "궁합", emoji: "💞", desc: "인연·성향 매칭" },
    { href: "/palmistry", label: "손금", emoji: "🤚", desc: "선천적 성향 진단" },
    { href: "/dreams", label: "꿈 해석", emoji: "✨", desc: "상징 기반 메시지" },
    { href: "/naming", label: "작명", emoji: "📝", desc: "오행 균형 기반 이름 제안" },
    { href: "/daily", label: "데일리", emoji: "☀️", desc: "오늘의 심리 스코어" },
    { href: "/astrology", label: "천문", emoji: "🪐", desc: "천문 시간대 분석" },
];

export default function FortuneCarousel() {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: "left" | "right") => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = dir === "left" ? scrollLeft - 400 : scrollLeft + 400;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
        }
    };

    return (
        <section className="py-16 relative">
            <div className="absolute inset-0 -z-10 pointer-events-none bg-[radial-gradient(circle_at_15%_15%,rgba(129,140,254,0.16),transparent_52%),radial-gradient(circle_at_85%_80%,rgba(168,85,247,0.12),transparent_58%)]" />
            <div className="flex items-center justify-between mb-10 px-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-inner">
                        <Sparkles className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="ui-title-gradient text-2xl tracking-[0.08em]">Premium <span className="text-indigo-400">Nexus</span></h2>
                        <p className="text-micro-copy mt-2 opacity-80">오늘의 운세 메뉴를 빠르게 탐색합니다</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => scroll("left")} className="w-10 h-10 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/5 text-slate-400 hover:text-white hover:border-white/20 transition-all flex items-center justify-center">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => scroll("right")} className="w-10 h-10 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/5 text-slate-400 hover:text-white hover:border-white/20 transition-all flex items-center justify-center">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto no-scrollbar px-6 pb-8 snap-x"
            >
                {MENU_ITEMS.map((item, i) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="group relative flex-shrink-0 w-64 snap-start"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45, delay: i * 0.04 }}
                            className={cn(
                                "panel-shell p-8 transition-all hover:-translate-y-2 overflow-hidden shadow-2xl h-full flex flex-col justify-between",
                                item.highlight
                                    ? "border-indigo-500/45 shadow-indigo-950/45 bg-indigo-950/20"
                                    : "border-white/10 hover:border-indigo-500/30"
                            )}
                        >
                            {/* Animated Background Gradient */}
                            <div className={cn(
                                "absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 group-hover:scale-150 transition-transform duration-1000",
                                item.highlight ? "bg-indigo-500" : "bg-slate-500"
                            )} />

                            <div className="relative z-10">
                                <div className="text-5xl mb-6 grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-110 group-hover:rotate-6 origin-bottom-left">
                                    {item.emoji}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-lg font-black text-white italic tracking-tight">{item.label}</h4>
                                        {item.highlight && (
                                            <Zap className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500 animate-pulse" />
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed font-medium transition-colors group-hover:text-slate-200">{item.desc}</p>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end relative z-10 transition-transform group-hover:translate-x-1">
                                <ChevronRight className={cn("w-5 h-5", item.highlight ? "text-indigo-500" : "text-slate-700 group-hover:text-white")} />
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
