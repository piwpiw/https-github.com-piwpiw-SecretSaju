"use client";

import { getPsychologyForToday } from "@/data/psychology-daily";
import { BrainCircuit, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DailyPsychologySection() {
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        setItems(getPsychologyForToday());
    }, []);

    return (
        <section className="py-12 sm:py-14 relative px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 sm:mb-10 gap-4 sm:gap-8">
                <div className="flex items-center gap-4 sm:gap-5">
                    <div className="p-3 sm:p-4 bg-rose-500/10 rounded-[1.5rem] sm:rounded-[2rem] border border-rose-500/20 shadow-inner">
                        <BrainCircuit className="w-7 h-7 sm:w-8 sm:h-8 text-rose-400" />
                    </div>
                    <div>
                        <h2 className="ui-title-gradient text-2xl sm:text-3xl tracking-[0.08em]">심리 <span className="text-rose-400">요약</span></h2>
                        <p className="text-micro-copy mt-2 opacity-80">오늘의 심리/운세 인사이트를 빠르게 확인하세요</p>
                    </div>
                </div>
                <Link href="/psychology" className="px-4 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-rose-300 hover:bg-rose-500 hover:text-white transition-all uppercase tracking-[0.3em] flex items-center gap-2 sm:gap-3">
                    더보기 <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {items.map((item) => (
                    <Link
                        key={item.id}
                        href={item.path}
                        className="group relative flex items-center justify-between p-6 sm:p-8 panel-shell hover:border-rose-500/35 transition-all hover:-translate-y-1 shadow-2xl overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rose-500/8 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                        <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                            <span className="text-3xl sm:text-4xl grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-125 group-hover:rotate-6">
                                {item.emoji}
                            </span>
                            <div className="space-y-2">
                                <h4 className="text-sm sm:text-base font-black text-white italic tracking-tight group-hover:text-rose-200 transition-colors leading-tight">{item.title}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {item.tags.map((tag: string) => (
                                        <span key={tag} className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[8px] font-black text-rose-400 uppercase tracking-widest">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="relative z-10 p-2 rounded-xl bg-white/10 group-hover:bg-rose-500/25 transition-all">
                            <Sparkles className="w-4 h-4 text-slate-700 group-hover:text-rose-500" />
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-8 sm:mt-12 text-center">
                <p className="text-micro-copy text-slate-500">신경 네트워크 업데이트: 2026.02.28</p>
            </div>
        </section>
    );
}
