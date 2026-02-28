"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import confetti from "canvas-confetti";

interface BirthInputRetroProps {
    onSubmit: (data: { year: number; month: number; day: number; hour: number; timeKnown: boolean }) => void;
}

export default function BirthInputRetro({ onSubmit }: BirthInputRetroProps) {
    const [year, setYear] = useState("");
    const [month, setMonth] = useState("");
    const [day, setDay] = useState("");
    const [hour, setHour] = useState("12");
    const [timeKnown, setTimeKnown] = useState(true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (year && month && day) {
            if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
            confetti({
                particleCount: 80,
                spread: 60,
                origin: { y: 0.6 },
                colors: ['#6366f1', '#a855f7', '#ec4899']
            });

            onSubmit({
                year: parseInt(year),
                month: parseInt(month),
                day: parseInt(day),
                hour: timeKnown ? parseInt(hour) : 12,
                timeKnown
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl mx-auto"
        >
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-1">
                        생년월일 입력
                    </h2>
                    <p className="text-sm text-slate-500">양력 기준으로 입력해 주세요</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Year */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            태어난 연도
                        </label>
                        <input
                            type="number"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            placeholder="예: 1990"
                            min="1900"
                            max="2024"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-base focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all placeholder:text-slate-600"
                        />
                    </div>

                    {/* Month & Day */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                월
                            </label>
                            <input
                                type="number"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                placeholder="1~12"
                                min="1"
                                max="12"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-base focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all placeholder:text-slate-600 text-center"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                일
                            </label>
                            <input
                                type="number"
                                value={day}
                                onChange={(e) => setDay(e.target.value)}
                                placeholder="1~31"
                                min="1"
                                max="31"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-base focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all placeholder:text-slate-600 text-center"
                            />
                        </div>
                    </div>

                    {/* Time known toggle */}
                    <div
                        className="flex items-center gap-3 cursor-pointer py-2"
                        onClick={() => setTimeKnown(!timeKnown)}
                    >
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${!timeKnown ? 'bg-indigo-500 border-indigo-400' : 'bg-transparent border-slate-600'}`}>
                            {!timeKnown && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                        </div>
                        <span className={`text-sm transition-colors ${!timeKnown ? 'text-indigo-300 font-medium' : 'text-slate-500'}`}>
                            태어난 시간을 모릅니다
                        </span>
                    </div>

                    {/* Time Input */}
                    <AnimatePresence>
                        {timeKnown && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="pt-1"
                            >
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    태어난 시각 (0~23시)
                                </label>
                                <input
                                    type="number"
                                    value={hour}
                                    onChange={(e) => setHour(e.target.value)}
                                    placeholder="예: 14"
                                    min="0"
                                    max="23"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-base focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all placeholder:text-slate-600 text-center"
                                />
                                <p className="text-[11px] text-slate-500 mt-2 text-center">
                                    정확한 시간을 입력하면 더 정밀한 분석이 가능합니다
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Submit */}
                    <div className="pt-3">
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-base shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all"
                        >
                            사주 분석하기
                        </motion.button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}
