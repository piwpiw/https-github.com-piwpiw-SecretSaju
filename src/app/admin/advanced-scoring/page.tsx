"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PILLAR_CODES, getPillarNameKo } from "@/lib/saju";
import {
    calculateGangYak,
} from "@/lib/advancedScoring";
import { FourPillars, Stem, Branch } from "@/core/calendar/ganji";
import animalsData from "@/data/animals.json";

// 일주 → 한자 매핑
const PILLAR_HANJA_MAP: Record<string, [string, string]> = {
    GAP_JA: ["甲", "子"],
    EUL_CHUK: ["乙", "丑"],
    BYEONG_IN: ["丙", "寅"],
    JEONG_MYO: ["丁", "卯"],
    MU_JIN: ["戊", "辰"],
    GI_SA: ["己", "巳"],
    GYEONG_O: ["庚", "午"],
    SIN_MI: ["辛", "未"],
    IM_SIN: ["壬", "申"],
    GYE_YU: ["癸", "酉"],
    GAP_SUL: ["甲", "戌"],
    EUL_HAE: ["乙", "亥"],
    BYEONG_JA: ["丙", "子"],
    JEONG_CHUK: ["丁", "丑"],
    MU_IN: ["戊", "寅"],
    GI_MYO: ["己", "卯"],
    GYEONG_JIN: ["庚", "辰"],
    SIN_SA: ["辛", "巳"],
    IM_O: ["壬", "午"],
    GYE_MI: ["癸", "未"],
    GAP_SIN: ["甲", "申"],
    EUL_YU: ["乙", "酉"],
    BYEONG_SUL: ["丙", "戌"],
    JEONG_HAE: ["丁", "亥"],
    MU_JA: ["戊", "子"],
    GI_CHUK: ["己", "丑"],
    GYEONG_IN: ["庚", "寅"],
    SIN_MYO: ["辛", "卯"],
    IM_JIN: ["壬", "辰"],
    GYE_SA: ["癸", "巳"],
    GAP_O: ["甲", "午"],
    EUL_MI: ["乙", "未"],
    BYEONG_SIN: ["丙", "申"],
    JEONG_YU: ["丁", "酉"],
    MU_SUL: ["戊", "戌"],
    GI_HAE: ["己", "亥"],
    GYEONG_JA: ["庚", "子"],
    SIN_CHUK: ["辛", "丑"],
    IM_IN: ["壬", "寅"],
    GYE_MYO: ["癸", "卯"],
    GAP_JIN: ["甲", "辰"],
    EUL_SA: ["乙", "巳"],
    BYEONG_O: ["丙", "午"],
    JEONG_MI: ["丁", "未"],
    MU_SIN: ["戊", "申"],
    GI_YU: ["己", "酉"],
    GYEONG_SUL: ["庚", "戌"],
    SIN_HAE: ["辛", "亥"],
    IM_JA: ["壬", "子"],
    GYE_CHUK: ["癸", "丑"],
    GAP_IN: ["甲", "寅"],
    EUL_MYO: ["乙", "卯"],
    BYEONG_JIN: ["丙", "辰"],
    JEONG_SA: ["丁", "巳"],
    MU_O: ["戊", "午"],
    GI_MI: ["己", "未"],
    GYEONG_SIN: ["庚", "申"],
    SIN_YU: ["辛", "酉"],
    IM_SUL: ["壬", "戌"],
    GYE_HAE: ["癸", "亥"],
};

const MONTH_JIJI_MAP = [
    { name: "인월 (음력 1월) - 초봄", value: "寅" },
    { name: "묘월 (음력 2월) - 봄", value: "卯" },
    { name: "진월 (음력 3월) - 늦봄", value: "辰" },
    { name: "사월 (음력 4월) - 초여름", value: "巳" },
    { name: "오월 (음력 5월) - 여름", value: "午" },
    { name: "미월 (음력 6월) - 늦여름", value: "未" },
    { name: "신월 (음력 7월) - 초가을", value: "申" },
    { name: "유월 (음력 8월) - 가을", value: "酉" },
    { name: "술월 (음력 9월) - 늦가을", value: "戌" },
    { name: "해월 (음력 10월) - 초겨울", value: "亥" },
    { name: "자월 (음력 11월) - 겨울", value: "子" },
    { name: "축월 (음력 12월) - 늦겨울", value: "丑" },
];

export default function AdvancedScoringPage() {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [selectedMonth, setSelectedMonth] = useState("寅"); // Default Spring

    const pillarCode = PILLAR_CODES[selectedIndex];
    const animal = animalsData.archetypes.find((a) => a.code === pillarCode);
    const pillarName = getPillarNameKo(selectedIndex);

    const [cheongan, jiji] = PILLAR_HANJA_MAP[pillarCode] || ["甲", "子"];

    // Create 4 pillars with selected month
    const fourPillars: FourPillars = {
        year: { stem: "갑" as Stem, branch: "자" as Branch, gan: "갑" as Stem, ji: "자" as Branch, fullName: "갑자", stemIndex: 0, branchIndex: 0, ganjiIndex: 0, code: "GAP_JA" },
        month: { stem: "병" as Stem, branch: selectedMonth as Branch, gan: "병" as Stem, ji: selectedMonth as Branch, fullName: "병" + selectedMonth, stemIndex: 2, branchIndex: 0, ganjiIndex: 0, code: "" },
        day: { stem: cheongan as Stem, branch: jiji as Branch, gan: cheongan as Stem, ji: jiji as Branch, fullName: cheongan + jiji, stemIndex: 0, branchIndex: 0, ganjiIndex: 0, code: "" },
        hour: { stem: "무" as Stem, branch: "오" as Branch, gan: "무" as Stem, ji: "오" as Branch, fullName: "무오", stemIndex: 4, branchIndex: 6, ganjiIndex: 0, code: "" },
    };

    const gangYak = calculateGangYak(fourPillars);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
                        📊 일간 강약 점수 시스템
                    </h1>
                    <p className="text-lg text-slate-300">
                        전통 명리학의 <span className="text-yellow-400 font-semibold">득령득지득세</span> 계산법
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                        &quot;몇 월에 태어났는가?&quot;에 따라 점수가 달라집니다. (시뮬레이션)
                    </p>
                </div>

                {/* Selector */}
                <div className="mb-8 bg-white/10 backdrop-blur-lg border border-yellow-500/30 rounded-xl p-6">
                    <label className="block text-sm font-semibold mb-2 text-yellow-400">
                        일주 선택
                    </label>
                    <select
                        value={selectedIndex}
                        onChange={(e) => setSelectedIndex(Number(e.target.value))}
                        className="w-full bg-slate-900/90 border border-yellow-500/40 rounded-lg px-4 py-3 text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-6"
                    >
                        {PILLAR_CODES.map((code, idx) => {
                            const nameKo = getPillarNameKo(idx);
                            const a = animalsData.archetypes.find((ar) => ar.code === code);
                            return (
                                <option key={code} value={idx}>
                                    [{idx.toString().padStart(2, "0")}] {nameKo} - {a?.animal_name}
                                </option>
                            );
                        })}
                    </select>

                    <label className="block text-sm font-semibold mb-2 text-green-400">
                        태어난 월(계절) 시뮬레이션
                    </label>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-full bg-slate-900/90 border border-green-500/40 rounded-lg px-4 py-3 text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        {MONTH_JIJI_MAP.map((m) => (
                            <option key={m.value} value={m.value}>
                                {m.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Main Score Display */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Character Info */}
                    <div className="space-y-6">
                        {/* Character Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-2xl p-8 border-2 border-purple-500/30"
                        >
                            <div className="text-7xl mb-4 text-center animate-bounce">
                                🐾
                            </div>
                            <h2 className="text-4xl font-bold text-center mb-3">
                                {animal?.animal_name}
                            </h2>
                            <div className="text-center text-2xl text-yellow-300 font-mono mb-4">
                                {pillarName}일주
                            </div>
                            <div className="text-center text-lg text-slate-300">
                                일간: <span className="font-bold text-yellow-400">{cheongan}</span>
                                {" · "}
                                월지(계절): <span className="font-bold text-green-400">{selectedMonth}</span>
                            </div>
                        </motion.div>

                        {/* Total Score */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-2 border-yellow-500/50 rounded-2xl p-8 text-center"
                        >
                            <div className="text-sm text-yellow-300 mb-2 font-semibold">
                                종합 점수 (신강/신약)
                            </div>
                            <div className="text-8xl font-black text-yellow-400 mb-4">
                                {gangYak.total}
                            </div>
                            <div className="text-2xl text-slate-200 mb-2">/100점</div>

                            <div
                                className={`mt-6 px-6 py-3 rounded-xl font-bold text-2xl ${gangYak.level === "신강"
                                    ? "bg-red-500/30 text-red-300 border-2 border-red-500/50"
                                    : gangYak.level === "중화"
                                        ? "bg-green-500/30 text-green-300 border-2 border-green-500/50"
                                        : "bg-blue-500/30 text-blue-300 border-2 border-blue-500/50"
                                    }`}
                            >
                                {gangYak.level}
                            </div>

                            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                                {gangYak.description}
                            </p>
                        </motion.div>
                    </div>

                    {/* Right: Score Breakdown */}
                    <div className="space-y-6">
                        {/* Deukryeong */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl p-6"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-bold text-cyan-400">
                                    1️⃣ 득령 (得令) - 계절
                                </h3>
                                <div className="text-3xl font-bold text-cyan-400">
                                    {gangYak.deukryeong}
                                    <span className="text-lg text-slate-400">/30</span>
                                </div>
                            </div>

                            <p className="text-sm text-slate-300 mb-4">
                                태어난 계절(월지)에서 힘을 얻는가?
                            </p>

                            <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${(gangYak.deukryeong / 30) * 100}%`,
                                    }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                />
                            </div>
                        </motion.div>

                        {/* Deukji */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl p-6"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-bold text-green-400">
                                    2️⃣ 득지 (得地) - 뿌리
                                </h3>
                                <div className="text-3xl font-bold text-green-400">
                                    {gangYak.deukji}
                                    <span className="text-lg text-slate-400">/30</span>
                                </div>
                            </div>

                            <p className="text-sm text-slate-300 mb-4">
                                지지(땅)에 뿌리가 얼마나 튼튼한가?
                            </p>

                            <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${(gangYak.deukji / 30) * 100}%`,
                                    }}
                                    transition={{ duration: 1, delay: 0.7 }}
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                                />
                            </div>
                        </motion.div>

                        {/* Deukse */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl p-6"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-bold text-purple-400">
                                    3️⃣ 득세 (得勢) - 세력
                                </h3>
                                <div className="text-3xl font-bold text-purple-400">
                                    {gangYak.deukse}
                                    <span className="text-lg text-slate-400">/40</span>
                                </div>
                            </div>

                            <p className="text-sm text-slate-300 mb-4">
                                주변(천간)에 도와주는 글자가 있는가?
                            </p>

                            <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${(gangYak.deukse / 40) * 100}%`,
                                    }}
                                    transition={{ duration: 1, delay: 0.9 }}
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-slate-500">
                    <p>전통 명리학의 정통 계산법 | 득령득지득세 100점 체계</p>
                    <p className="mt-2">
                        ← <a href="/admin/character-analysis" className="text-yellow-400 hover:underline">Character Analysis</a>
                        {" | "}
                        <a href="/" className="text-yellow-400 hover:underline">Home</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
