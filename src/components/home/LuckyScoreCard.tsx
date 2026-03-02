"use client";

import { useProfiles } from "../ProfileProvider";
import { motion } from "framer-motion";
import { Zap, TrendingUp, Sparkles, Activity, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function LuckyScoreCard() {
    const { activeProfile } = useProfiles();
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (activeProfile) {
            const dateStr = new Date().toISOString().split("T")[0];
            const hash = activeProfile.id.charCodeAt(0) + activeProfile.id.charCodeAt(activeProfile.id.length - 1) + dateStr.length;
            const calculated = (hash % 30) + 70;
            setScore(calculated);
        }
    }, [activeProfile]);

    if (!activeProfile) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group mb-8 sm:mb-10"
        >
            <div className="panel-shell p-6 sm:p-8 md:p-10 transition-all hover:shadow-[0_20px_55px_-35px_rgba(129,140,254,0.65)]">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] -mr-40 -mt-40 group-hover:bg-indigo-500/20 transition-all duration-1000" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/8 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none" />

                <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 relative z-10">
                    <div className="flex-shrink-0 relative">
                        <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border border-white/15 flex items-center justify-center relative overflow-hidden group/gauge">
                            <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-2xl" viewBox="0 0 128 128" aria-hidden>
                                <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                                <motion.circle
                                    cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="8"
                                    className="text-indigo-400"
                                    strokeDasharray="351.6"
                                    initial={{ strokeDashoffset: 351.6 }}
                                    animate={{ strokeDashoffset: 351.6 - (351.6 * score / 100) }}
                                    transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="relative z-10 text-center space-y-1">
                                <div className="text-4xl sm:text-5xl font-black text-white italic drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">{score}</div>
                                <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">조화 지수</div>
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-12 h-12 sm:w-14 sm:h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-950/40 border-4 border-slate-900 transform rotate-12 group-hover:rotate-0 transition-all">
                            <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                        </div>
                    </div>

                    <div className="flex-1 text-center lg:text-left space-y-3 sm:space-y-5">
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
                            <div className="ui-chip text-xs sm:text-[10px]">
                                <Activity className="w-3.5 h-3.5" /> {activeProfile.name}의 운세 동조 확인
                            </div>
                            <div className="flex items-center gap-2 text-amber-400 group/help cursor-pointer">
                                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] opacity-70 hover:opacity-100 transition-opacity">현재 최적 채널 감지됨</span>
                            </div>
                        </div>

                        <h3 className="ui-title ui-title-gradient text-xl sm:text-2xl md:text-3xl">
                            {score > 90 ? "당신의 운세 조합은 현재 정렬이 매우 강합니다." : score > 80 ? "운세 흐름이 안정적으로 동작하고 있습니다." : "조금 더 조율하면 더 선명한 흐름을 얻을 수 있습니다."}
                        </h3>

                        <div className="flex flex-wrap justify-center lg:justify-start gap-2.5 pt-3 sm:pt-4">
                            {[
                                { label: "연애", val: "높음", color: "bg-rose-500/10 text-rose-400", icon: Heart },
                                { label: "금전", val: "우수", color: "bg-amber-500/10 text-amber-400", icon: TrendingUp },
                                { label: "건강", val: "양호", color: "bg-emerald-500/10 text-emerald-400", icon: Activity },
                            ].map((stat, i) => (
                                <div key={i} className={cn("flex items-center gap-2.5 px-3 py-2 rounded-2xl border border-white/10", stat.color)}>
                                    <stat.icon className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest border-l border-white/10 pl-2.5">{stat.label}: <span className="text-white italic">{stat.val}</span></span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
