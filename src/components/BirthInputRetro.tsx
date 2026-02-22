"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface BirthInputRetroProps {
    onSubmit: (data: { year: number; month: number; day: number }) => void;
}

export default function BirthInputRetro({ onSubmit }: BirthInputRetroProps) {
    const [year, setYear] = useState("");
    const [month, setMonth] = useState("");
    const [day, setDay] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (year && month && day) {
            onSubmit({
                year: parseInt(year),
                month: parseInt(month),
                day: parseInt(day),
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-xl mx-auto"
        >
            {/* CRT Screen Container */}
            <div className="relative bg-black rounded-3xl p-8 border-4 border-slate-700 shadow-2xl">
                {/* Scanlines Effect */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-10 rounded-3xl"
                    style={{
                        background:
                            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.5) 2px, rgba(0, 255, 255, 0.5) 4px)",
                    }}
                ></div>

                {/* Screen Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-xl rounded-3xl"></div>

                <div className="relative z-10">
                    {/* Title */}
                    <motion.h2
                        className="text-3xl font-bold text-center mb-8 font-mono"
                        style={{
                            color: "#00ffff",
                            textShadow:
                                "0 0 10px #00ffff, 0 0 20px #00ffff, 2px 2px 0 #ff00ff",
                        }}
                        animate={{
                            textShadow: [
                                "0 0 10px #00ffff, 0 0 20px #00ffff, 2px 2px 0 #ff00ff",
                                "0 0 15px #ff00ff, 0 0 25px #ff00ff, 2px 2px 0 #00ffff",
                                "0 0 10px #00ffff, 0 0 20px #00ffff, 2px 2px 0 #ff00ff",
                            ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        ▶ ENTER YOUR DATA
                    </motion.h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Year Input */}
                        <div>
                            <label className="block text-cyan-400 font-mono text-sm mb-2 tracking-wider">
                                연도 (YEAR)
                            </label>
                            <input
                                type="number"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                placeholder="1990"
                                min="1900"
                                max="2024"
                                required
                                className="w-full bg-slate-900 border-2 border-cyan-500 rounded-lg px-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-pink-500 focus:shadow-[0_0_20px_rgba(255,105,180,0.5)] transition-all"
                                style={{
                                    boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.6)",
                                }}
                            />
                        </div>

                        {/* Month Input */}
                        <div>
                            <label className="block text-purple-400 font-mono text-sm mb-2 tracking-wider">
                                월 (MONTH)
                            </label>
                            <input
                                type="number"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                placeholder="1-12"
                                min="1"
                                max="12"
                                required
                                className="w-full bg-slate-900 border-2 border-purple-500 rounded-lg px-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-pink-500 focus:shadow-[0_0_20px_rgba(255,105,180,0.5)] transition-all"
                                style={{
                                    boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.6)",
                                }}
                            />
                        </div>

                        {/* Day Input */}
                        <div>
                            <label className="block text-pink-400 font-mono text-sm mb-2 tracking-wider">
                                일 (DAY)
                            </label>
                            <input
                                type="number"
                                value={day}
                                onChange={(e) => setDay(e.target.value)}
                                placeholder="1-31"
                                min="1"
                                max="31"
                                required
                                className="w-full bg-slate-900 border-2 border-pink-500 rounded-lg px-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(0,255,255,0.5)] transition-all"
                                style={{
                                    boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.6)",
                                }}
                            />
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-xl font-bold text-white text-xl font-mono shadow-lg hover:shadow-pink-500/50 transition-all relative overflow-hidden"
                            style={{
                                boxShadow: "0 0 30px rgba(255, 105, 180, 0.6)",
                            }}
                        >
                            {/* Rainbow Animation */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
                                animate={{
                                    x: ["-100%", "100%"],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                            />

                            <span className="relative z-10">▶ START ◀</span>
                        </motion.button>
                    </form>

                    {/* Retro Message */}
                    <motion.div
                        className="mt-6 text-center text-green-400 font-mono text-sm"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        &gt; PRESS START TO EXTRACT YOUR SOUL DATA_
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
