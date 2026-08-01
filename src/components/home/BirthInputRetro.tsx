"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, type FormEvent } from "react";
import confetti from "canvas-confetti";
import { validateBirthInput } from "@/lib/app/validation";

interface BirthInputRetroProps {
    onSubmit: (data: {
        year: number;
        month: number;
        day: number;
        name: string;
        gender: "M" | "F";
        hour: number;
        minute: number;
        timeKnown: boolean;
    }) => void;
}

export default function BirthInputRetro({ onSubmit }: BirthInputRetroProps) {
    const [name, setName] = useState("");
    const [year, setYear] = useState("");
    const [month, setMonth] = useState("");
    const [day, setDay] = useState("");
    // 성별은 대운 순행/역행 방향을 가른다. 예전에는 폼이 성별을 받지 않아
    // 홈 사주가 전원 여성("F")으로 계산됐다 — 기본값 여성으로 기존 동작을 보존.
    const [gender, setGender] = useState<"M" | "F">("F");
    const [hour, setHour] = useState("12");
    const [minute, setMinute] = useState("00");
    const [timeKnown, setTimeKnown] = useState(true);
    const [dateError, setDateError] = useState("");

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const parsedYear = Number.parseInt(year, 10);
        const parsedMonth = Number.parseInt(month, 10);
        const parsedDay = Number.parseInt(day, 10);
        const parsedHour = Number.parseInt(hour, 10);
        const parsedMinute = Number.parseInt(minute, 10);
        const safeHour = Number.isFinite(parsedHour) ? Math.min(23, Math.max(0, parsedHour)) : 12;
        const safeMinute = Number.isFinite(parsedMinute) ? Math.min(59, Math.max(0, parsedMinute)) : 0;

        // 예전에는 일자를 1~31로 클램프만 해서 2월 31일이 Date 롤오버로
        // 3월 3일이 되어 엉뚱한 사주가 계산됐다. 존재하지 않는 날짜는
        // 에러를 보여주고 제출을 막는다.
        if (!Number.isFinite(parsedYear) || !Number.isFinite(parsedMonth) || !Number.isFinite(parsedDay)) {
            setDateError("생년월일을 모두 입력해 주세요.");
            return;
        }
        const validation = validateBirthInput({ year: parsedYear, month: parsedMonth, day: parsedDay });
        if (!validation.ok) {
            setDateError(validation.message);
            return;
        }
        setDateError("");

        try {
            if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
            confetti({
                particleCount: 80,
                spread: 60,
                origin: { y: 0.6 },
                colors: ['#6366f1', '#a855f7', '#ec4899']
            });
        } catch { }

        onSubmit({
            name,
            year: parsedYear,
            month: parsedMonth,
            day: parsedDay,
            gender,
            hour: timeKnown ? safeHour : 12,
            minute: timeKnown ? safeMinute : 0,
            timeKnown
        });
    };

    const canSubmit = !!name.trim() && !!year && !!month && !!day;

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
                    <p className="text-micro-copy text-slate-300">정확한 사주 계산을 위해 날짜를 입력해 주세요</p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">이름</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="홍길동"
                            maxLength={32}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-base focus:outline-none focus:border-indigo-500/60 focus:bg-indigo-500/5 transition-all placeholder:text-slate-600"
                        />
                    </div>

                    {/* Year */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">연도</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={year}
                            onChange={(e) => {
                                setDateError("");
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
                                onChange={(e) => { setDateError(""); setMonth(e.target.value.replace(/[^0-9]/g, '')); }}
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
                                onChange={(e) => { setDateError(""); setDay(e.target.value.replace(/[^0-9]/g, '')); }}
                                placeholder="1~31"
                                maxLength={2}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-base focus:outline-none focus:border-indigo-500/60 focus:bg-indigo-500/5 transition-all placeholder:text-slate-600 text-center"
                            />
                        </div>
                    </div>

                    {dateError && (
                        <p role="alert" className="text-[13px] text-rose-300 font-bold text-center -mt-1">
                            {dateError}
                        </p>
                    )}

                    {/* Gender — 대운 순행/역행 방향을 가르는 값 */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">성별</label>
                        <div role="radiogroup" aria-label="성별 선택" className="grid grid-cols-2 gap-3">
                            {([
                                { value: "F", label: "여성" },
                                { value: "M", label: "남성" },
                            ] as const).map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="radio"
                                    aria-checked={gender === option.value}
                                    onClick={() => setGender(option.value)}
                                    className={`w-full rounded-xl px-4 py-3.5 text-base font-medium border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 ${
                                        gender === option.value
                                            ? "bg-indigo-500/10 border-indigo-500/60 text-white"
                                            : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time known toggle */}
                    {/* Real checkbox semantics: this toggle changes the saju
                        calculation, so it must be reachable by keyboard and
                        announced as a checkbox, not just clickable by mouse. */}
                    <button
                        type="button"
                        role="checkbox"
                        aria-checked={!timeKnown}
                        onClick={() => setTimeKnown(!timeKnown)}
                        className="flex w-full items-center gap-3 py-2 text-left cursor-pointer rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70"
                    >
                        <span className={`w-5 h-5 shrink-0 rounded-md flex items-center justify-center border transition-all ${!timeKnown ? 'bg-indigo-500 border-indigo-400' : 'bg-transparent border-slate-600'}`}>
                            {!timeKnown && <span className="w-2.5 h-2.5 bg-white rounded-sm" />}
                        </span>
                        <span className={`text-sm transition-colors ${!timeKnown ? 'text-indigo-300 font-medium' : 'text-slate-500'}`}>
                            태어난 시간이 불확실하면 체크 해제
                        </span>
                    </button>

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
                                <div className="grid grid-cols-2 gap-3">
                                    <select
                                        value={hour}
                                        onChange={(e) => setHour(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-base focus:outline-none focus:border-indigo-500/60 focus:bg-indigo-500/5 transition-all"
                                    >
                                        {Array.from({ length: 24 }, (_, index) => (
                                            <option key={index} value={index.toString()} className="bg-slate-900">
                                                {index.toString().padStart(2, "0")}시
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={minute}
                                        onChange={(e) => setMinute(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-base focus:outline-none focus:border-indigo-500/60 focus:bg-indigo-500/5 transition-all"
                                    >
                                        {Array.from({ length: 60 }, (_, index) => {
                                            const value = index.toString().padStart(2, '0');
                                            return (
                                                <option key={value} value={value} className="bg-slate-900">
                                                    {value}분
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                <p className="text-[13px] text-slate-500 mt-2 text-center">시간이 모호하면 주변 사람의 기억 범위를 기준으로 입력하세요</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Submit */}
                    <div className="pt-3">
                        <motion.button
                            type="submit"
                            disabled={!canSubmit}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-base shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            사주 분석 시작
                        </motion.button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}
