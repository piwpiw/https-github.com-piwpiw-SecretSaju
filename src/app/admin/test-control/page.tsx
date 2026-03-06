"use client";

import { useState } from "react";
import { PILLAR_CODES, getPillarNameKo } from "@/lib/saju";
import { getArchetypeByCode, type AgeGroup } from "@/lib/archetypes";
import animalsData from "@/data/animals.json";

export default function AdminTestControlPage() {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [ageGroup, setAgeGroup] = useState<AgeGroup>("20s");
    const [copyMessage, setCopyMessage] = useState("");
    const [isCopying, setIsCopying] = useState(false);

    const selectedCode = PILLAR_CODES[selectedIndex];
    const archetype = getArchetypeByCode(selectedCode, ageGroup);

    // Validation stats
    const archetypes = animalsData.archetypes;
    const totalCount = archetypes.length;
    const completeCount = archetypes.filter((a) => {
        return (
            a.animal_name &&
            a.base_traits?.mask &&
            a.base_traits?.hashtags?.length > 0 &&
            a.age_context?.["10s"]?.hook &&
            a.age_context?.["20s"]?.hook &&
            a.age_context?.["30s"]?.hook
        );
    }).length;

    const handleCopy = async () => {
        setIsCopying(true);
        setCopyMessage("");

        try {
            await navigator.clipboard.writeText(JSON.stringify(archetype, null, 2));
            setCopyMessage("선택한 아키타입 JSON이 클립보드에 복사되었습니다.");
        } catch (error) {
            console.error(error);
            setCopyMessage("복사에 실패했습니다. 브라우저 클립보드 권한을 확인해주세요.");
        } finally {
            setIsCopying(false);
            setTimeout(() => setCopyMessage(""), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        Admin Test Control
                    </h1>
                    <p className="text-slate-400">
                        Instant validation dashboard for all 60 Saju archetypes
                    </p>
                </div>

                {/* Validation Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                        <div className="text-3xl font-bold text-cyan-400">
                            {totalCount}/60
                        </div>
                        <div className="text-sm text-slate-400 mt-1">Total Archetypes</div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                        <div className="text-3xl font-bold text-green-400">
                            {completeCount}
                        </div>
                        <div className="text-sm text-slate-400 mt-1">Complete</div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                        <div className="text-3xl font-bold text-purple-400">
                            {selectedIndex + 1}
                        </div>
                        <div className="text-sm text-slate-400 mt-1">Currently Viewing</div>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Pillar Selector */}
                        <div>
                            <label htmlFor="admin-test-control-pillar" className="block text-sm font-semibold mb-2 text-cyan-400">
                                도표 선택 (Select Pillar)
                            </label>
                            <select
                                id="admin-test-control-pillar"
                                value={selectedIndex}
                                onChange={(e) => setSelectedIndex(Number(e.target.value))}
                                className="w-full bg-slate-900/80 border border-cyan-500/30 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                            >
                                {PILLAR_CODES.map((code, idx) => {
                                    const nameKo = getPillarNameKo(idx);
                                    const animal = animalsData.archetypes.find(
                                        (a) => a.code === code
                                    );
                                    return (
                                        <option key={code} value={idx}>
                                            [{idx
                                                .toString()
                                                .padStart(2, "0")}] {nameKo} ({code}) - {animal?.animal_name || "Unknown"}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* Age Group Toggle */}
                        <div>
                            <p id="admin-test-control-age-group" className="block text-sm font-semibold mb-2 text-purple-400">
                                연령대 (Age Group)
                            </p>
                            <div className="flex gap-2" role="radiogroup" aria-labelledby="admin-test-control-age-group">
                                {(["10s", "20s", "30s"] as AgeGroup[]).map((age) => (
                                    <button
                                        key={age}
                                        type="button"
                                        role="radio"
                                        aria-checked={ageGroup === age}
                                        onClick={() => setAgeGroup(age)}
                                        className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${ageGroup === age
                                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50"
                                            : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
                                            }`}
                                    >
                                        {age === "10s" ? "10대" : age === "20s" ? "20대" : "30대+"}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Navigation */}
                    <div className="mt-4 flex gap-2">
                        <button
                            type="button"
                            onClick={() => setSelectedIndex(Math.max(0, selectedIndex - 1))}
                            disabled={selectedIndex === 0}
                            aria-label="이전 도표로 이동"
                            className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            이전
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                setSelectedIndex(Math.min(59, selectedIndex + 1))
                            }
                            disabled={selectedIndex === 59}
                            aria-label="다음 도표로 이동"
                            className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            다음
                        </button>
                        <div className="flex-1" />
                        <button
                            type="button"
                            onClick={handleCopy}
                            disabled={isCopying}
                            aria-label="선택한 아키타입 JSON 복사"
                            className="px-4 py-2 bg-cyan-600/20 border border-cyan-500/30 rounded-lg hover:bg-cyan-600/30 transition-all"
                        >
                            {isCopying ? "복사 중..." : "Copy JSON"}
                        </button>
                    </div>

                    {copyMessage && (
                        <div role="status" aria-live="polite" className="mt-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200">
                            {copyMessage}
                        </div>
                    )}
                </div>

                {/* Result Card Preview */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <span className="text-2xl">👑</span>
                        Result Card Preview
                    </h2>

                    {/* Archetype Display */}
                    <div className="space-y-6">
                        {/* Animal Info */}
                        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/20">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="text-sm text-purple-300 font-mono mb-1">
                                        {selectedCode}
                                    </div>
                                    <h3 className="text-3xl font-bold mb-2">
                                        {archetype.animal_name}
                                    </h3>
                                    <div className="text-lg text-slate-300">
                                        궁: {getPillarNameKo(selectedIndex)}
                                    </div>
                                </div>
                                <div className="text-6xl">🐾</div>
                            </div>
                        </div>

                        {/* Base Traits */}
                        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                            <h4 className="text-sm font-semibold text-cyan-400 mb-3">
                                사회적 가면 (Social Mask)
                            </h4>
                            <div className="text-xl font-semibold mb-3">
                                &quot;{archetype.base_traits.mask}&quot;
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {archetype.base_traits.hashtags.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-full text-sm font-medium text-pink-300"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Age Context */}
                        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                            <h4 className="text-sm font-semibold text-purple-400 mb-3">
                                연령대별 훅 ({ageGroup})
                            </h4>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">HOOK</div>
                                    <div className="text-lg font-semibold text-yellow-300">
                                        {archetype.displayHook}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">
                                        SECRET PREVIEW
                                    </div>
                                    <div className="text-base text-slate-200">
                                        {archetype.displaySecretPreview}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Secret Unlock Simulation */}
                        <div className="relative bg-gradient-to-br from-pink-900/30 to-orange-900/30 rounded-xl p-6 border border-pink-500/30 overflow-hidden">
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-4xl mb-3">🔒</div>
                                    <div className="text-xl font-bold mb-2">19+ 콘텐츠 잠금</div>
                                    <div className="text-sm text-slate-400 mb-4">
                                        잠긴 콘텐츠를 열려면 300포인트가 필요합니다.
                                    </div>
                                    <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg font-bold hover:scale-105 transition-transform shadow-lg shadow-pink-500/50">
                                        잠금 해제하기 (Test)
                                    </button>
                                </div>
                            </div>
                            <div className="blur-sm">
                                <div className="text-sm text-slate-500 mb-2">FULL SECRETS</div>
                                <div className="text-base">
                                    실제 전체 비밀 콘텐츠는 운영 정책상 관리 모드에서만 확인 가능합니다.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Validation Grid (All 60 at a glance) */}
                <div className="mt-8 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span>👑</span>
                        All 60 Archetypes - Quick Validation
                    </h2>
                    <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-10 gap-2">
                        {PILLAR_CODES.map((code, idx) => {
                            const animal = animalsData.archetypes.find(
                                (a) => a.code === code
                            );
                            const isComplete =
                                animal &&
                                animal.animal_name &&
                                animal.base_traits?.mask &&
                                animal.age_context?.["10s"]?.hook;

                            return (
                                <button
                                    key={code}
                                    type="button"
                                    onClick={() => setSelectedIndex(idx)}
                                    className={`aspect-square rounded-lg font-mono text-xs flex items-center justify-center transition-all ${selectedIndex === idx
                                        ? "bg-cyan-500 text-white ring-2 ring-cyan-400 scale-110"
                                        : isComplete
                                            ? "bg-green-900/50 text-green-300 hover:bg-green-800/50"
                                            : "bg-red-900/50 text-red-300 hover:bg-red-800/50"
                                        }`}
                                    title={`${getPillarNameKo(idx)} (${code}) - ${animal?.animal_name || "Missing"
                                        }`}
                                >
                                    {idx}
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-900/50 rounded"></div>
                            Complete
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-cyan-500 rounded"></div>
                            Selected
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-900/50 rounded"></div>
                            Incomplete
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
