"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PILLAR_CODES, getPillarNameKo } from "@/lib/saju";
import { generateEnhancedProfile } from "@/lib/enhancedProfiles";
import { WUXING_INFO } from "@/lib/wuxing";
import animalsData from "@/data/animals.json";

export default function CharacterProfilePage() {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const pillarCode = PILLAR_CODES[selectedIndex];
    const profile = generateEnhancedProfile(pillarCode);
    const animal = animalsData.archetypes.find((a) => a.code === pillarCode);
    const pillarName = getPillarNameKo(selectedIndex);

    // 레이더 차트용 데이터
    const statsArray = [
        { name: "사교성", value: profile.stats.사교성 },
        { name: "리더십", value: profile.stats.리더십 },
        { name: "재물운", value: profile.stats.재물운 },
        { name: "창의성", value: profile.stats.창의성 },
        { name: "학습력", value: profile.stats.학습력 },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        🎮 캐릭터 프로필 시스템
                    </h1>
                    <p className="text-slate-400">
                        사주 명리학 레이어 적용 - 오행, 스탯, 신살
                    </p>
                </div>

                {/* Selector */}
                <div className="mb-8 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                    <label className="block text-sm font-semibold mb-2 text-cyan-400">
                        캐릭터 선택
                    </label>
                    <select
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

                {/* Main Profile */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Basic Info */}
                    <div className="space-y-6">
                        {/* Animal Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/20"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="text-sm text-purple-300 font-mono mb-1">
                                        {pillarCode}
                                    </div>
                                    <h2 className="text-3xl font-bold">{animal?.animal_name}</h2>
                                    <div className="text-lg text-slate-300 mt-1">
                                        {pillarName}일주
                                    </div>
                                </div>
                                <div className="text-6xl">🐾</div>
                            </div>

                            <div className="text-lg font-semibold mb-2">
                                &quot;{animal?.base_traits.mask}&quot;
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {animal?.base_traits.hashtags.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-full text-sm"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </motion.div>

                        {/* Wuxing Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
                            style={{
                                borderColor: profile.wuxing.color + "40",
                            }}
                        >
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span style={{ color: profile.wuxing.color }}>●</span>
                                오행 (Five Elements)
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <div className="text-sm text-slate-400">주도 오행</div>
                                    <div className="text-2xl font-bold" style={{ color: profile.wuxing.color }}>
                                        {WUXING_INFO[profile.wuxing.dominant as keyof typeof WUXING_INFO].name_kr}
                                    </div>
                                </div>

                                <div className="border-t border-white/10 pt-3">
                                    <div className="text-sm text-slate-400 mb-2">핵심 성격</div>
                                    <p className="text-sm text-slate-200">
                                        {profile.personality_core.element_trait}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <div className="text-xs text-green-400 mb-1">강점</div>
                                        <p className="text-xs text-slate-300">
                                            {profile.personality_core.strength}
                                        </p>
                                    </div>
                                    <div>
                                        <div className="text-xs text-red-400 mb-1">약점</div>
                                        <p className="text-xs text-slate-300">
                                            {profile.personality_core.weakness}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Sinsal (Special Abilities) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
                        >
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                ⭐ 특수 능력 (신살)
                            </h3>

                            {profile.sinsal.length > 0 ? (
                                <div className="space-y-3">
                                    {profile.sinsal.map((s, idx) => (
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
                                                <div>
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
                                    특수 신살이 없습니다
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Right: Stats */}
                    <div className="space-y-6">
                        {/* 5D Radar Chart (Text Version) */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
                        >
                            <h3 className="text-xl font-bold mb-6">
                                📊 5차원 스탯 (100점 만점)
                            </h3>

                            <div className="space-y-4">
                                {statsArray.map((stat) => (
                                    <div key={stat.name}>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-semibold">{stat.name}</span>
                                            <span className="text-sm font-mono">{stat.value}</span>
                                        </div>
                                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${stat.value}%` }}
                                                transition={{ duration: 1, delay: 0.2 }}
                                                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Total Power */}
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold">종합 전투력</span>
                                    <span className="text-2xl font-bold text-cyan-400">
                                        {Math.round(
                                            (profile.stats.사교성 +
                                                profile.stats.리더십 +
                                                profile.stats.재물운 +
                                                profile.stats.창의성 +
                                                profile.stats.학습력) /
                                            5
                                        )}
                                        /100
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Game-style Character Sheet */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-br from-slate-900/50 to-purple-900/30 border border-cyan-500/30 rounded-xl p-6"
                        >
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                🎮 캐릭터 시트
                            </h3>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="text-slate-400">천간 (天干)</div>
                                    <div className="font-mono text-lg">{profile.pillar.cheongan}</div>
                                </div>
                                <div>
                                    <div className="text-slate-400">지지 (地支)</div>
                                    <div className="font-mono text-lg">{profile.pillar.jiji}</div>
                                </div>
                                <div className="col-span-2">
                                    <div className="text-slate-400">오행 조합</div>
                                    <div className="flex gap-2 mt-1">
                                        <span
                                            className="px-2 py-1 rounded"
                                            style={{ backgroundColor: WUXING_INFO[profile.wuxing.cheongan_element as keyof typeof WUXING_INFO].color + "40" }}
                                        >
                                            천간: {WUXING_INFO[profile.wuxing.cheongan_element as keyof typeof WUXING_INFO].name_kr}
                                        </span>
                                        <span
                                            className="px-2 py-1 rounded"
                                            style={{ backgroundColor: WUXING_INFO[profile.wuxing.jiji_element as keyof typeof WUXING_INFO].color + "40" }}
                                        >
                                            지지: {WUXING_INFO[profile.wuxing.jiji_element as keyof typeof WUXING_INFO].name_kr}
                                        </span>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <div className="text-slate-400">보유 신살</div>
                                    <div className="text-lg font-mono">
                                        {profile.sinsal.length}개
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Link */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-500">
                        ← <a href="/admin/test-control" className="text-cyan-400 hover:underline">Admin Dashboard</a>
                        {" | "}
                        <a href="/" className="text-cyan-400 hover:underline">Home</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
