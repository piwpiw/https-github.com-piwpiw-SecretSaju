"use client";

import { useState } from "react";
import { ArrowLeft, Shield, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import JellyBalance from "@/components/shop/JellyBalance";
import { useWallet } from "@/components/payment/WalletProvider";
import { hasSufficientBalance } from "@/lib/payment/jelly-wallet";
import { useProfiles } from "@/components/profile/ProfileProvider";
import { calculateHighPrecisionSaju } from "@/core/api/saju-engine";
import { SINSAL_DEFINITIONS, type Sinsal as SinsalMeta } from "@/lib/saju/sinsal";
import { parseCivilDate } from "@/lib/saju/civil-date";

/**
 * 신살 진단 — 프로필 사주 전체(연·월·일·시) 기준 실계산.
 *
 * 예전에는 존재하지 않는 신살 이름("조화신", "천을귀살")을 하드코딩해 두고
 * 사주와 무관하게 클릭만 받으며 젤리를 차감했다. 지금은 엔진의
 * analyzeSinsal 결과(기둥 위치 포함)를 그대로 보여준다.
 */

type ComputedSinsal = {
    name: string;
    pillar: string;
    description: string;
    meta: SinsalMeta | null;
};

/** 엔진 신살 이름 → 정의 사전 키 (표기 차이 보정) */
const META_KEY: Record<string, string> = {
    백호살: "백호대살",
};

const PILLAR_KO: Record<string, string> = {
    year: "년주", month: "월주", day: "일주", hour: "시주",
};

const TYPE_BADGE: Record<string, string> = {
    길신: "bg-emerald-500/20 text-emerald-200 border-emerald-300/40",
    흉신: "bg-rose-500/20 text-rose-200 border-rose-300/40",
    중성: "bg-sky-500/20 text-sky-200 border-sky-300/40",
};

export default function ShinsalPage() {
    const router = useRouter();
    const { consumeJelly } = useWallet();
    const { profiles, activeProfile } = useProfiles();

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [pillarsLabel, setPillarsLabel] = useState("");
    const [results, setResults] = useState<ComputedSinsal[] | null>(null);

    const profile = activeProfile ?? profiles[0] ?? null;

    const handleRun = async () => {
        setErrorMessage("");
        if (!profile) {
            setErrorMessage("프로필을 먼저 등록해 주세요.");
            return;
        }
        if (!hasSufficientBalance(5)) {
            setErrorMessage("젤리가 부족합니다. 충전 후 이용해 주세요.");
            return;
        }
        const consumed = await consumeJelly(5, "shinsal_reading");
        if (!consumed) {
            setErrorMessage("결제에 실패했습니다. 다시 시도해 주세요.");
            return;
        }

        setLoading(true);
        try {
            const birthDate = parseCivilDate(profile.birthdate, {
                time: profile.birthTime || "12:00",
                fallbackTime: { hour: 12, minute: 0, second: 0 },
            }) ?? new Date(1990, 0, 1, 12, 0, 0, 0);

            const saju = await calculateHighPrecisionSaju({
                birthDate,
                birthTime: profile.birthTime || "12:00",
                gender: profile.gender === "female" ? "F" : "M",
                calendarType: profile.calendarType,
                isTimeUnknown: profile.isTimeUnknown,
            });

            const fp = saju.fourPillars;
            setPillarsLabel([fp.year, fp.month, fp.day, fp.hour].map((p) => p.fullName).join(" · "));

            const list = saju.canonicalFeatures?.auxiliarySignals?.sinsal ?? [];
            setResults(list.map((s) => ({
                name: s.name,
                pillar: PILLAR_KO[s.pillar] ?? s.pillar,
                description: s.description,
                meta: SINSAL_DEFINITIONS[META_KEY[s.name] ?? s.name] ?? null,
            })));
        } catch (error) {
            console.error(error);
            setErrorMessage("신살 계산 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden pb-28">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.14),transparent_40%),radial-gradient(circle_at_80%_40%,rgba(236,72,153,0.12),transparent_45%)]" />
            <div className="max-w-4xl mx-auto px-0 sm:px-6 py-8 relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => router.back()} className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center" aria-label="뒤로 가기">
                        <ArrowLeft className="w-5 h-5 text-slate-200" />
                    </button>
                    <JellyBalance />
                </div>

                <section className="bg-slate-900/60 border border-white/10 rounded-[2.3rem] p-5 md:p-6 sm:p-9">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-fuchsia-500/10 border border-fuchsia-400/30 text-fuchsia-200 font-black uppercase tracking-[0.2em] text-sm">
                        <Shield className="w-4 h-4" /> 신살 진단
                    </div>
                    <h1 className="text-4xl font-black mt-4">내 사주의 신살 지도</h1>
                    <p className="text-slate-300 mt-2">
                        {profile ? `${profile.name}님의 사주 네 기둥 전체에서` : "프로필 사주 네 기둥 전체에서"} 도화·역마·화개·귀인 같은
                        특수 기운을 찾아 위치와 함께 풀어드립니다.
                    </p>

                    <button
                        onClick={handleRun}
                        disabled={loading}
                        className="mt-6 inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-purple-600 font-black text-white shadow-lg disabled:opacity-60 min-h-[48px]"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        {loading ? "사주 분석 중..." : "내 신살 확인하기 (젤리 5개)"}
                    </button>

                    {errorMessage && (
                        <p role="alert" className="mt-4 text-sm font-bold text-rose-300">{errorMessage}</p>
                    )}

                    {results !== null && !loading && (
                        <div className="mt-8 space-y-4">
                            <p className="text-sm text-slate-400">
                                사주: <span className="font-black text-slate-200">{pillarsLabel}</span>
                            </p>

                            {results.length === 0 ? (
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                                    <p className="font-black text-white">특별히 강하게 작용하는 신살이 없습니다</p>
                                    <p className="mt-2 text-sm text-slate-300">
                                        신살이 없는 사주는 기복보다 안정 쪽에 가깝습니다. 큰 파도 없이
                                        꾸준함으로 성과를 쌓는 구성입니다.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {results.map((item, idx) => (
                                        <motion.div
                                            key={`${item.name}-${item.pillar}-${idx}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="rounded-2xl border border-white/10 bg-white/5 p-5"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="font-black text-white inline-flex items-center gap-2">
                                                    <span>{item.meta?.emoji ?? "✨"}</span>{item.name}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[13px] px-2 py-1 rounded-full border border-white/10 bg-white/5 text-slate-300">{item.pillar}</span>
                                                    {item.meta && (
                                                        <span className={`text-[13px] px-2 py-1 rounded-full border ${TYPE_BADGE[item.meta.type]}`}>{item.meta.type}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="mt-3 text-sm text-slate-300 leading-relaxed">{item.description}</p>
                                            {item.meta && (
                                                <>
                                                    <p className="mt-2 text-sm text-slate-400 leading-relaxed">{item.meta.description}</p>
                                                    {(item.meta.positive.length > 0 || item.meta.negative.length > 0) && (
                                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                                            {item.meta.positive.map((p) => (
                                                                <span key={p} className="text-[13px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-400/20">+ {p}</span>
                                                            ))}
                                                            {item.meta.negative.map((n) => (
                                                                <span key={n} className="text-[13px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-400/20">- {n}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            <p className="text-[13px] text-slate-500">
                                ※ 연지·일지를 기준으로 네 기둥을 함께 본 결과입니다. 신살은 참고 신호일 뿐,
                                사주 전체 균형(용신·강약)과 함께 읽어야 정확합니다.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
