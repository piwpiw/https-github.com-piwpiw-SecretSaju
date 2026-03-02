"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PILLAR_CODES, getPillarNameKo, getDayStemElement, getDayBranchElement } from "@/lib/saju"; // Ensure these are exported from lib/saju
import { analyzeRelationship, RelationshipAnalysis } from "@/lib/compatibility";
import animalsData from "@/data/animals.json";
import { HighPrecisionSajuResult } from "@/core/api/saju-engine";
import { SIXTY_GANJI } from "@/core/calendar/ganji";

export default function CompatibilityAdminPage() {
    const [indexA, setIndexA] = useState(0); // My character
    const [indexB, setIndexB] = useState(1); // Partner character

    const codeA = PILLAR_CODES[indexA];
    const codeB = PILLAR_CODES[indexB];

    const animalA = animalsData.archetypes.find((a) => a.code === codeA);
    const animalB = animalsData.archetypes.find((a) => a.code === codeB);

    // Helper to mock a HighPrecisionSajuResult from a Pillar Index
    // This allows testing the logic even without a full birthdate
    const mockSajuResult = (pillarIndex: number, gender: 'M' | 'F'): HighPrecisionSajuResult => {
        const ganji = SIXTY_GANJI[pillarIndex];
        const stemEl = getDayStemElement(pillarIndex);
        const branchEl = getDayBranchElement(pillarIndex);

        // Mock minimal data needed for compatibility
        return {
            fourPillars: {
                year: ganji, // Dummy
                month: ganji, // Dummy
                day: ganji,  // IMPORTANT: The Day Pillar
                hour: ganji  // Dummy
            },
            trueSolarTime: new Date(),
            gender,
            elements: {
                scores: { [stemEl]: 10, [branchEl]: 10, '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 }, // Minimal
                dominant: [stemEl],
                excessive: [],
                lacking: [],
                mainElement: stemEl
            } as any, // Cast to ignore missing fields if any
            sinsal: [],
            sipsong: {} as any,
            gyeokguk: {} as any,
            sibiwoonseong: {} as any,
            gangyak: {} as any,
            yongshin: {} as any,
            daewun: {} as any,
            currentUn: {} as any,
            version: "1.0.0",
            model: "MOCK_MODEL",
            integrity: "MOCK_HASH",
        };
    };

    const sajuA = mockSajuResult(indexA, 'M');
    const sajuB = mockSajuResult(indexB, 'F');

    const result = analyzeRelationship(sajuA, sajuB, '연인');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-pink-950 to-slate-950 text-white p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">
                        💘 정밀 궁합 시스템 (Ver 2.0)
                    </h1>
                    <p className="text-slate-400">
                        Enterprise Engine Integration Test
                    </p>
                </div>

                {/* Selectors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Person A */}
                    <div className="bg-white/5 backdrop-blur-lg border border-pink-500/30 rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4 text-pink-400">나 (Day Pillar)</h2>
                        <select
                            value={indexA}
                            onChange={(e) => setIndexA(Number(e.target.value))}
                            className="w-full bg-slate-900/90 border border-pink-500/30 rounded-lg px-4 py-3 text-white font-mono mb-4"
                        >
                            {PILLAR_CODES.map((code, idx) => (
                                <option key={code} value={idx}>
                                    [{idx.toString().padStart(2, "0")}] {getPillarNameKo(idx)} - {animalsData.archetypes.find(a => a.code === code)?.animal_name}
                                </option>
                            ))}
                        </select>
                        <div className="text-center">
                            <div className="text-4xl mb-2">🐾</div>
                            <div className="text-2xl font-bold">{animalA?.animal_name}</div>
                            <div className="text-pink-300">&quot;{animalA?.base_traits.mask}&quot;</div>
                        </div>
                    </div>

                    {/* Person B */}
                    <div className="bg-white/5 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4 text-cyan-400">상대방 (Day Pillar)</h2>
                        <select
                            value={indexB}
                            onChange={(e) => setIndexB(Number(e.target.value))}
                            className="w-full bg-slate-900/90 border border-cyan-500/30 rounded-lg px-4 py-3 text-white font-mono mb-4"
                        >
                            {PILLAR_CODES.map((code, idx) => (
                                <option key={code} value={idx}>
                                    [{idx.toString().padStart(2, "0")}] {getPillarNameKo(idx)} - {animalsData.archetypes.find(a => a.code === code)?.animal_name}
                                </option>
                            ))}
                        </select>
                        <div className="text-center">
                            <div className="text-4xl mb-2">🐾</div>
                            <div className="text-2xl font-bold">{animalB?.animal_name}</div>
                            <div className="text-cyan-300">&quot;{animalB?.base_traits.mask}&quot;</div>
                        </div>
                    </div>
                </div>

                {/* Result Area */}
                <motion.div
                    key={`${codeA}-${codeB}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-3xl p-8 max-w-4xl mx-auto shadow-2xl"
                >
                    {/* Main Score */}
                    <div className="text-center mb-10">
                        <div className="text-sm text-slate-400 mb-2 tracking-widest">COMPATIBILITY SCORE</div>
                        <div className="flex justify-center items-end gap-2 text-8xl font-black mb-4 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                            {result.score}
                            <span className="text-4xl text-slate-500 pb-4">/100</span>
                        </div>

                        <div className={`inline-block px-6 py-2 rounded-full text-xl font-bold border ${result.grade === "best" ? "bg-pink-500/20 border-pink-500 text-pink-300" :
                            result.grade === "good" ? "bg-green-500/20 border-green-500 text-green-300" :
                                result.grade === "low" ? "bg-red-500/20 border-red-500 text-red-300" :
                                    "bg-slate-500/20 border-slate-500 text-slate-300"
                            }`}>
                            Grade {result.grade.toUpperCase()}
                        </div>

                        <p className="mt-6 text-xl text-white font-medium">
                            &quot;{result.message}&quot;
                        </p>
                    </div>

                    {/* Analysis Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        <div className="bg-slate-900/50 rounded-xl p-4">
                            <h3 className="text-sm text-slate-400 mb-2">🧪 Chemistry</h3>
                            <p className="text-xl font-bold text-yellow-400">{result.chemistry}</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-4">
                            <h3 className="text-sm text-slate-400 mb-2">⚡ Tension</h3>
                            <p className="text-xl font-bold text-red-400">{result.tension || 'None'}</p>
                        </div>
                    </div>

                    {/* Details Table */}
                    <div className="border-t border-white/10 pt-8">
                        <h3 className="text-lg font-bold mb-4 text-slate-300">💡 Scoring Details (Debug)</h3>
                        <div className="bg-slate-800/40 rounded-lg p-4 font-mono text-sm space-y-2">
                            <div className="flex justify-between">
                                <span>Base Score</span>
                                <span>50</span>
                            </div>
                            <div className="flex justify-between text-yellow-300">
                                <span>Element Balance</span>
                                <span>{result.details?.balanceScore ?? 0}</span>
                            </div>
                            <div className="flex justify-between text-pink-300">
                                <span>Harmonies (Hap)</span>
                                <span>{result.details?.harmonyScore ?? 0 > 0 ? result.details?.harmonyScore : 0}</span>
                            </div>
                            <div className="flex justify-between text-red-300">
                                <span>Clashes (Chung)</span>
                                <span>{result.details?.harmonyScore ?? 0 < 0 ? result.details?.harmonyScore : 0}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
