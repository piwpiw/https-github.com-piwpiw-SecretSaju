"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Library, Target, LayoutGrid } from "lucide-react";
import { getTarotDeckRows, TarotDeckCard, TarotArcanaType, TarotSuit, DEFAULT_TAROT_THEME, TarotTheme } from "@/data/tarotDeck";

export default function TarotGalleryPage() {
    const [activeTab, setActiveTab] = useState<"ALL" | "MAJOR" | "MINOR">("ALL");
    const [activeSuit, setActiveSuit] = useState<TarotSuit | "ALL">("ALL");
    const [activeTheme, setActiveTheme] = useState<TarotTheme>(DEFAULT_TAROT_THEME);

    const fullDeck = useMemo(() => getTarotDeckRows(), []);

    const filteredDeck = useMemo(() => {
        return fullDeck.filter((card) => {
            if (activeTab === "MAJOR" && card.arcana !== "major") return false;
            if (activeTab === "MINOR" && card.arcana !== "minor") return false;
            if (activeTab === "MINOR" && activeSuit !== "ALL" && card.suit !== activeSuit) return false;
            return true;
        });
    }, [fullDeck, activeTab, activeSuit]);

    const stats = useMemo(() => {
        const majorCount = fullDeck.filter(c => c.arcana === "major").length;
        const minorCount = fullDeck.filter(c => c.arcana === "minor").length;
        return { total: fullDeck.length, major: majorCount, minor: minorCount };
    }, [fullDeck]);

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
            <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-4">
                        <Link href="/tarot" className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                            <ArrowLeft className="w-5 h-5 text-slate-400" />
                        </Link>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.24em] border border-indigo-500/20 mb-2">
                                <Library className="w-3 h-3" /> Tarot Archive
                            </div>
                            <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white leading-none">Secret Tarot Gallery</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold font-mono text-slate-400 bg-slate-900/50 px-4 py-2 rounded-xl border border-white/10">
                        <Target className="w-4 h-4 text-indigo-400" />
                        TOTAL {stats.total} CARDS (MAJOR {stats.major} / MINOR {stats.minor})
                    </div>
                </header>

                <section className="mb-10 flex items-center justify-between gap-4 border-b border-white/10 pb-6">
                    <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-white/10">
                        {[
                            { id: "ALL", label: "전체보기 (All)" },
                            { id: "MAJOR", label: "메이저 아르카나 (Major)" },
                            { id: "MINOR", label: "마이너 아르카나 (Minor)" }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id as any);
                                    if (tab.id !== "MINOR") setActiveSuit("ALL");
                                }}
                                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25" : "text-slate-400 hover:text-slate-200"}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Theme</span>
                        <select
                            value={activeTheme}
                            onChange={(e) => setActiveTheme(e.target.value as TarotTheme)}
                            className="bg-slate-900 border border-white/10 text-xs font-bold text-slate-300 rounded-xl px-4 py-2 outline-none focus:border-indigo-500/50 transition-colors uppercase tracking-wider"
                        >
                            <option value="standard">Standard (Rider-Waite)</option>
                            <option value="svg_fallback">Vector (Fallback)</option>
                        </select>
                    </div>
                </section>

                {activeTab === "MINOR" && (
                    <div className="mb-8 flex gap-3">
                        {[
                            { id: "ALL", label: "All Suits", icon: "🃏" },
                            { id: "wands", label: "Wands", icon: "🔥" },
                            { id: "cups", label: "Cups", icon: "💧" },
                            { id: "swords", label: "Swords", icon: "⚔️" },
                            { id: "pentacles", label: "Pentacles", icon: "🌾" }
                        ].map((suit) => (
                            <button
                                key={suit.id}
                                onClick={() => setActiveSuit(suit.id as any)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${activeSuit === suit.id ? "bg-white/10 border-white/20 text-white" : "bg-transparent border-transparent text-slate-500 hover:bg-white/5"}`}
                            >
                                <span className="text-base">{suit.icon}</span> {suit.label}
                            </button>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {filteredDeck.map((card) => {
                        const imageUrl = activeTheme === "svg_fallback" ? "" : `/tarot-decks/${activeTheme}/${card.code}.png`;

                        return (
                            <article key={card.code} className="group flex flex-col items-center">
                                <div className="relative w-full aspect-[2/3.2] rounded-[1.5rem] bg-slate-900 border-2 border-slate-700 overflow-hidden shadow-xl group-hover:shadow-indigo-500/30 group-hover:border-indigo-400 transition-all duration-300 group-hover:-translate-y-2 flex flex-col p-2">
                                    {/* The actual Artwork container */}
                                    <div className="relative flex-1 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                                        <div className="absolute inset-0 flex items-center justify-center p-4">
                                            <p className="text-[9px] text-slate-600 font-mono text-center opacity-50">
                                                Image Pending<br />{card.code}
                                            </p>
                                        </div>
                                        {imageUrl ? (
                                            <Image
                                                src={imageUrl}
                                                alt={card.name_kr}
                                                fill
                                                className="object-cover z-10 transition-opacity duration-300"
                                                unoptimized
                                                onError={(e) => {
                                                    (e.target as HTMLElement).style.opacity = '0';
                                                }}
                                            />
                                        ) : null}
                                    </div>

                                    {/* The Card Footer (Korean Name) */}
                                    <div className="mt-2 text-center h-[3.5rem] flex flex-col justify-center border-t border-slate-800 pt-1">
                                        <h3 className="text-sm font-black text-amber-500 tracking-widest">{card.name_kr}</h3>
                                        <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{card.code}</div>
                                    </div>

                                    {/* Minimal shiny overlay when hovered */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-[1.5rem]" />
                                </div>
                                <div className="mt-4 text-center px-2">
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate w-full">{card.name_en}</p>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{card.meaning_upright}</p>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
