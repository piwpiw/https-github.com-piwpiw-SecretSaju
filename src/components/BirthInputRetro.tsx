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
            <div className="panel-shell p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="ui-title-gradient text-2xl mb-1">출생정보 입력</h2>
                    <p className="text-micro-copy opacity-80">정확한 사주 계산을 위해 날짜를 입력해 주세요</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Year */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">연도</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={year}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                if (val.length === 8) {
                                    setYear(val.substring(0, 4));
                                    setMonth(val.substring(4, 6).replace(/^0+/, ''));
                                    setDay(val.substring(6, 8).replace(/^0+/, ''));
                                } else if (val.length === 6 && year.length < 6) { // Auto-expand YYMMDD only if typing forward
                                    const y = parseInt(val.substring(0, 2));
                                    setYear(y > 30 ? `19${val.substring(0, 2)}` : `20${val.substring(0, 2)}`);
                                    setMonth(val.substring(2, 4).replace(/^0+/, ''));
                                    setDay(val.substring(4, 6).replace(/^0+/, ''));
                                } else {
                                    setYear(val);
                                }
                            }}
                            placeholder="예: 1990 (또는 19900101)"
                            maxLength={8}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-base focus:outline-none focus:border-indigo-500/60 focus:bg-indigo-500/5 transition-all placeholder:text-slate-600"
                        />
                    </div>

                    {/* Month & Day */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">월</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={month}
                                onChange={(e) => setMonth(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="1~12"
                                maxLength={2}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-base focus:outline-none focus:border-indigo-500/60 focus:bg-indigo-500/5 transition-all placeholder:text-slate-600 text-center"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">일</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={day}
                                onChange={(e) => setDay(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="1~31"
                                maxLength={2}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-base focus:outline-none focus:border-indigo-500/60 focus:bg-indigo-500/5 transition-all placeholder:text-slate-600 text-center"
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
                            태어난 시간이 불확실하면 체크 해제
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
                                <label className="block text-sm font-medium text-slate-300 mb-2">태어난 시간 (0~23)</label>
                                <input
                                    type="number"
                                    value={hour}
                                    onChange={(e) => setHour(e.target.value)}
                                    placeholder="예: 14"
                                    min="0"
                                    max="23"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-base focus:outline-none focus:border-indigo-500/60 focus:bg-indigo-500/5 transition-all placeholder:text-slate-600 text-center"
                                />
                                <p className="text-[11px] text-slate-500 mt-2 text-center">시간이 모호하면 주변 사람의 기억 범위를 기준으로 입력하세요</p>
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
                            사주 분석 시작
                        </motion.button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}
