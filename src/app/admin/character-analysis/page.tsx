"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PILLAR_CODES, getPillarNameKo } from "@/lib/saju";
import { analyzeCharacter } from "@/lib/characterAnalysis";
import { WUXING_INFO, type WuxingElement } from "@/lib/wuxing";
import animalsData from "@/data/animals.json";

export default function CharacterAnalysisPage() {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const pillarCode = PILLAR_CODES[selectedIndex];
    const analysis = analyzeCharacter(pillarCode);
    const animal = animalsData.archetypes.find((a) => a.code === pillarCode);
    const pillarName = getPillarNameKo(selectedIndex);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        🔍 사주 명리학 기반 인물 분석
                    </h1>
                    <p className="text-slate-400">
                        점수가 아닌, 균형과 경향성으로 사람을 이해합니다
                    </p>
                </div>

                {/* Selector */}
                <div className="mb-8 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                    <label htmlFor="character-analysis-pillar" className="block text-sm font-semibold mb-2 text-cyan-400">
                        인물 선택
                    </label>
                    <select
                        id="character-analysis-pillar"
                        value={selectedIndex}
                        onChange={(e) => setSelectedIndex(Number(e.target.value))}
                        className="w-full bg-slate-900/80 border border-cyan-500/30 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                </div>

                {/* Main Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Column 1: Summary */}
                    <div className="space-y-6">
                        {/* Animal Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/20"
                        >
                            <div className="text-6xl mb-4 text-center">🐾</div>
                            <h2 className="text-3xl font-bold text-center mb-2">
                                {animal?.animal_name}
                            </h2>
                            <div className="text-center text-slate-300 mb-4">
                                {pillarName}일주
                            </div>
                            <div className="text-center text-lg font-semibold mb-3">
                                &quot;{animal?.base_traits.mask}&quot;
                            </div>
                        </motion.div>

                        {/* Personality Type */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/5 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6"
                        >
                            <h3 className="text-xl font-bold mb-4 text-cyan-400">
                                💫 성격 유형
                            </h3>
                            <div className="text-2xl font-bold mb-4">
                                {analysis.summary.personality_type}
                            </div>

                            <div className="space-y-3 text-sm">
                                <div>
                                    <div className="text-slate-400 mb-1">빛나는 순간</div>
                                    <p className="text-slate-200">{analysis.summary.best_situation}</p>
                                </div>
                                <div>
                                    <div className="text-slate-400 mb-1">어려운 상황</div>
                                    <p className="text-slate-200">{analysis.summary.challenge}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Life Motto */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-xl p-6"
                        >
                            <h3 className="text-xl font-bold mb-3 text-yellow-400">
                                📜 인생 모토
                            </h3>
                            <p className="text-lg italic text-slate-200">
                                &quot;{analysis.core_traits.life_motto}&quot;
                            </p>
                        </motion.div>
                    </div>

                    {/* Column 2: Wuxing Balance */}
                    <div className="space-y-6">
                        {/* Wuxing Balance */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
                        >
                            <h3 className="text-xl font-bold mb-4">⚖️ 오행 균형도</h3>

                            <div className="mb-4">
                                <div className="text-sm text-slate-400 mb-1">종합 평가</div>
                                <div className="text-lg font-bold text-cyan-400">
                                    {analysis.wuxing_balance.overall_balance}
                                </div>
                                <p className="text-sm text-slate-300 mt-2">
                                    {analysis.wuxing_balance.interpretation}
                                </p>
                            </div>

                            <div className="space-y-3">
                                {analysis.wuxing_balance.elements.map((el) => (
                                    <div key={el.element}>
                                        <div className="flex justify-between mb-1">
                                            <span
                                                className="font-semibold"
                                                style={{
                                                    color: WUXING_INFO[el.element as keyof typeof WUXING_INFO].color,
                                                }}
                                            >
                                                {WUXING_INFO[el.element as keyof typeof WUXING_INFO].name_kr}
                                            </span>
                                            <span className="text-sm">{el.presence}</span>
                                        </div>
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${el.presenceValue}%` }}
                                                transition={{ duration: 1, delay: 0.3 }}
                                                className="h-full"
                                                style={{
                                                    backgroundColor:
                                                        WUXING_INFO[el.element as keyof typeof WUXING_INFO].color,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {analysis.wuxing_balance.lacking && (
                                <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                                    <div className="text-sm text-red-300">
                                        ⚠️ 부족한 오행:{" "}
                                        {
                                            WUXING_INFO[
                                                analysis.wuxing_balance.lacking as keyof typeof WUXING_INFO
                                            ].name_kr
                                        }
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">
                                        이 영역을 보완하면 더 균형잡힌 삶을 살 수 있습니다
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        {/* Core Traits */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
                        >
                            <h3 className="text-xl font-bold mb-4">🎯 핵심 특징</h3>

                            <div className="space-y-4">
                                <div>
                                    <div className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                                        <span>✓</span> 강점
                                    </div>
                                    <ul className="space-y-1">
                                        {analysis.core_traits.strength.map((s, idx) => (
                                            <li key={idx} className="text-sm text-slate-300 pl-4">
                                                • {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <div className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                                        <span>✗</span> 약점
                                    </div>
                                    <ul className="space-y-1">
                                        {analysis.core_traits.weakness.map((w, idx) => (
                                            <li key={idx} className="text-sm text-slate-300 pl-4">
                                                • {w}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Column 3: Life Aspects */}
                    <div className="space-y-6">
                        {/* Life Aspects */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
                        >
                            <h3 className="text-xl font-bold mb-4">🌟 인생 5대 영역</h3>
                            <p className="text-sm text-slate-400 mb-6">
                                사주 명리학 기반 경향성 분석
                            </p>

                            <div className="space-y-5">
                                {Object.values(analysis.life_aspects).map((aspect) => (
                                    <div key={aspect.name} className="border-b border-white/10 pb-4 last:border-0">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-semibold text-lg">{aspect.name}</span>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold ${aspect.strength === "매우 강함"
                                                    ? "bg-green-500/20 text-green-400"
                                                    : aspect.strength === "강함"
                                                        ? "bg-cyan-500/20 text-cyan-400"
                                                        : aspect.strength === "보통"
                                                            ? "bg-yellow-500/20 text-yellow-400"
                                                            : aspect.strength === "약함"
                                                                ? "bg-orange-500/20 text-orange-400"
                                                                : "bg-red-500/20 text-red-400"
                                                    }`}
                                            >
                                                {aspect.strength}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-400 mb-2">
                                            {aspect.description}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {aspect.keywords.map((kw, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 bg-slate-800/50 rounded text-xs text-slate-300"
                                                >
                                                    {kw}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Sinsal (Special Abilities) */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
                        >
                            <h3 className="text-xl font-bold mb-4">⭐ 특수 신살</h3>

                            {analysis.sinsal.length > 0 ? (
                                <div className="space-y-3">
                                    {analysis.sinsal.map((s, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-3 rounded-lg border ${s.type === "길신"
                                                ? "bg-green-900/20 border-green-500/30"
                                                : s.type === "흉신"
                                                    ? "bg-red-900/20 border-red-500/30"
                                                    : "bg-yellow-900/20 border-yellow-500/30"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-2xl">{s.emoji}</span>
                                                <div className="flex-1">
                                                    <div className="font-bold">{s.name}</div>
                                                    <div className="text-xs text-slate-400">{s.effect}</div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-300 mt-2">
                                                {s.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-slate-400">
                                    특별한 신살이 없습니다
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-500">
                        사주 명리학의 전통적 분석 방식 | 점수가 아닌 균형과 경향성
                    </p>
                    <p className="text-xs text-slate-600 mt-2">
                        ← <a href="/admin/test-control" className="text-cyan-400 hover:underline">관리자 대시보드</a>
                        {" | "}
                        <a href="/" className="text-cyan-400 hover:underline">홈</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
