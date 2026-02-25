"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import confetti from "canvas-confetti";

interface BirthInputRetroProps {
    onSubmit: (data: { year: number; month: number; day: number; timeKnown: boolean }) => void;
}

export default function BirthInputRetro({ onSubmit }: BirthInputRetroProps) {
    const [year, setYear] = useState("");
    const [month, setMonth] = useState("");
    const [day, setDay] = useState("");
    const [timeKnown, setTimeKnown] = useState(true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (year && month && day) {

            // Haptic/Gamification Event
            if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#22d3ee', '#c084fc', '#f472b6']
            });

            onSubmit({
                year: parseInt(year),
                month: parseInt(month),
                day: parseInt(day),
                timeKnown
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-xl mx-auto"
        >
            {/* Premium Glass & CRT Screen Container */}
            <div className="relative bg-black/60 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden group">
                {/* Subtle Animated Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700 blur-2xl"></div>

                {/* Scanlines Effect - Premium subtle version */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-5 mix-blend-overlay"
                    style={{
                        background:
                            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.8) 2px, rgba(255,255,255,0.8) 4px)",
                    }}
                ></div>

                {/* Premium Inner Border Glow */}
                <div className="absolute inset-0 border border-white/10 rounded-[2.5rem] pointer-events-none shadow-inner"></div>

                <div className="relative z-10">
                    {/* Header */}
                    <motion.div
                        className="text-center mb-10"
                        animate={{ opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        <h2 className="text-3xl md:text-4xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-pink-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] mb-2">
                            SYSTEM.READY
                        </h2>
                        <div className="h-0.5 w-16 bg-gradient-to-r from-cyan-500 to-pink-500 mx-auto rounded-full"></div>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Inputs Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            {/* Year Input */}
                            <div className="col-span-3 pb-2">
                                <label className="block text-cyan-300 font-bold font-mono text-xs mb-2 tracking-widest pl-2">
                                    [ YY ] 연도
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        placeholder="1990"
                                        min="1900"
                                        max="2024"
                                        required
                                        className="w-full bg-white/5 border border-cyan-500/30 rounded-2xl px-6 py-4 text-white font-mono text-xl tracking-widest focus:outline-none focus:border-cyan-400 focus:bg-cyan-500/10 focus:shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-all placeholder:text-slate-600"
                                    />
                                </div>
                            </div>

                            {/* Month Input */}
                            <div className="col-span-1 border-t border-white/10 pt-4">
                                <label className="block text-purple-300 font-bold font-mono text-xs mb-2 tracking-widest pl-2">
                                    [ MM ] 월
                                </label>
                                <input
                                    type="number"
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    placeholder="01"
                                    min="1"
                                    max="12"
                                    required
                                    className="w-full bg-white/5 border border-purple-500/30 rounded-2xl px-4 py-4 text-white font-mono text-xl tracking-widest focus:outline-none focus:border-purple-400 focus:bg-purple-500/10 focus:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all placeholder:text-slate-600 text-center"
                                />
                            </div>

                            {/* Day Input */}
                            <div className="col-span-2 border-t border-white/10 pt-4">
                                <label className="block text-pink-300 font-bold font-mono text-xs mb-2 tracking-widest pl-2">
                                    [ DD ] 일
                                </label>
                                <input
                                    type="number"
                                    value={day}
                                    onChange={(e) => setDay(e.target.value)}
                                    placeholder="15"
                                    min="1"
                                    max="31"
                                    required
                                    className="w-full bg-white/5 border border-pink-500/30 rounded-2xl px-6 py-4 text-white font-mono text-xl tracking-widest focus:outline-none focus:border-pink-400 focus:bg-pink-500/10 focus:shadow-[0_0_30px_rgba(236,72,153,0.2)] transition-all placeholder:text-slate-600 center"
                                />
                            </div>
                        </div>

                        {/* Intelligent Input Toggle */}
                        <motion.div
                            className="pt-2 pb-4 flex items-center gap-3 cursor-pointer"
                            onClick={() => setTimeKnown(!timeKnown)}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all ${!timeKnown ? 'bg-pink-500 border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.5)]' : 'bg-transparent border-slate-600'}`}>
                                {!timeKnown && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-3 h-3 bg-white rounded-sm"></motion.div>}
                            </div>
                            <span className={`font-mono text-sm tracking-widest transition-colors ${!timeKnown ? 'text-pink-300 font-bold' : 'text-slate-500'}`}>태어난 시간을 모릅니다 [UNKNOWN_TIME]</span>
                        </motion.div>

                        <AnimatePresence>
                            {timeKnown && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="pt-2 border-t border-white/10"
                                >
                                    <label className="block text-amber-300 font-bold font-mono text-xs mb-2 tracking-widest pl-2">
                                        [ TT ] 태어난 시간 (00~23)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="14"
                                        min="0"
                                        max="23"
                                        className="w-full bg-white/5 border border-amber-500/30 rounded-2xl px-6 py-4 text-white font-mono text-xl tracking-widest focus:outline-none focus:border-amber-400 focus:bg-amber-500/10 focus:shadow-[0_0_30px_rgba(251,191,36,0.2)] transition-all placeholder:text-slate-600 text-center"
                                    />
                                    <p className="text-[10px] text-amber-500/70 mt-3 text-center font-mono">가장 고도화된 스위스 천문 데이터를 기반으로 지역보정을 수행합니다.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full relative group/btn rounded-2xl overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-90 group-hover/btn:opacity-100 transition-opacity"></div>
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                                <div className="relative px-8 py-5 flex items-center justify-center gap-3 border border-white/20 rounded-2xl">
                                    <span className="font-black text-white text-xl tracking-widest drop-shadow-md">
                                        ANALYZE
                                    </span>
                                    <span className="text-white/80 animate-pulse text-lg">▶</span>
                                </div>
                            </motion.button>
                        </div>
                    </form>

                    {/* Footer Status */}
                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                        <motion.div
                            className="flex items-center gap-2"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_#4ade80]"></div>
                            <span className="text-[10px] font-mono text-green-400 tracking-widest">SECURE_CONNECT</span>
                        </motion.div>
                        <span className="text-[10px] font-mono text-slate-500 tracking-widest">v4.0.9</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
