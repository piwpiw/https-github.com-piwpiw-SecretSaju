"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Hand, Upload, Scan, Loader2, Sparkles, CheckCircle, ShieldAlert } from "lucide-react";
import JellyBalance from "@/components/shop/JellyBalance";
import { useWallet } from "@/components/WalletProvider";
import LuxuryToast from "@/components/ui/LuxuryToast";

export default function PalmistryPage() {
    const router = useRouter();
    const { consumeChuru, churu } = useWallet();
    const [step, setStep] = useState<"upload" | "scanning" | "result">("upload");
    const [toastMsg, setToastMsg] = useState("");
    const [showToast, setShowToast] = useState(false);

    const handleUploadClick = () => {
        if (churu < 50) {
            setToastMsg("정밀 손금 분석에는 50 젤리가 필요합니다.");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            return;
        }

        // Fake upload process
        consumeChuru(50);
        setStep("scanning");

        setTimeout(() => {
            setStep("result");
        }, 4000);
    };

    return (
        <main className="min-h-[100dvh] bg-background text-foreground relative overflow-hidden pb-40">
            <LuxuryToast message={toastMsg} isVisible={showToast} />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />

            <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-3 text-secondary hover:text-foreground transition-all group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold tracking-widest uppercase">뒤로</span>
                    </button>
                    <JellyBalance />
                </div>

                <AnimatePresence mode="wait">
                    {step === "upload" && (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="text-center space-y-10"
                        >
                            <div className="inline-block relative mt-10">
                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                                <div className="w-32 h-32 rounded-full bg-surface border border-primary/30 flex items-center justify-center relative z-10 shadow-2xl overflow-hidden">
                                    <Hand className="w-16 h-16 text-primary animate-pulse" />
                                </div>
                            </div>

                            <div>
                                <h1 className="text-4xl sm:text-6xl font-black italic tracking-tighter uppercase mb-4 text-foreground">
                                    AI 정밀 손금 리딩
                                </h1>
                                <p className="text-xl text-secondary max-w-lg mx-auto leading-relaxed">
                                    손바닥에 새겨진 생명선, 두뇌선, 감정선을 <br className="hidden sm:block" />
                                    AI가 정밀 스캔하여 당신의 운명을 읽어냅니다.
                                </p>
                            </div>

                            <div className="bg-surface border border-border-color rounded-4xl p-10 max-w-lg mx-auto relative group overflow-hidden">
                                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                                <div className="relative z-10 flex flex-col items-center gap-6">
                                    <div className="w-20 h-20 rounded-2xl bg-background border border-dashed border-primary/50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <Upload className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">오른손바닥 사진 업로드</h3>
                                        <p className="text-sm text-secondary">선명하게 나온 사진일수록 분석이 정확합니다.</p>
                                    </div>
                                    <button
                                        onClick={handleUploadClick}
                                        className="w-full py-4 bg-primary text-white font-black text-lg rounded-2xl shadow-xl hover:shadow-primary/30 hover:-translate-y-1 transition-all"
                                    >
                                        사진 선택하고 분석 시작 (50 젤리)
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-sm text-secondary">
                                <ShieldAlert className="w-4 h-4" />
                                업로드된 이미지는 서버에 저장되지 않으며 즉시 폐기됩니다.
                            </div>
                        </motion.div>
                    )}

                    {step === "scanning" && (
                        <motion.div
                            key="scanning"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-32 space-y-12"
                        >
                            <div className="relative w-64 h-64 rounded-full border-4 border-primary/20 flex items-center justify-center overflow-hidden">
                                <Hand className="w-32 h-32 text-secondary opacity-20" />
                                <motion.div
                                    className="absolute inset-x-0 h-1 bg-primary shadow-[0_0_20px_#a855f7]"
                                    animate={{ y: [-128, 128, -128] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-primary/20 animate-pulse" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-2xl font-black mb-2 animate-pulse text-primary flex items-center justify-center gap-3">
                                    <Scan className="w-6 h-6 animate-spin" /> 주요 선 스캔 중...
                                </h3>
                                <p className="text-secondary font-medium">생명선, 두뇌선, 감정선의 딥러닝 패턴을 분석하고 있습니다.</p>
                            </div>
                        </motion.div>
                    )}

                    {step === "result" && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-3xl mx-auto space-y-8"
                        >
                            <div className="text-center mb-12">
                                <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-10 h-10" />
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-black italic mb-4">손금 분석이 완료되었습니다</h2>
                                <p className="text-secondary">당신의 손바닥에 새겨진 운명의 지도를 확인하세요.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* 생명선 */}
                                <div className="bg-surface p-8 rounded-4xl border border-rose-500/20 relative overflow-hidden group hover:border-rose-500/50 transition-all shadow-xl">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                                    <h3 className="text-xl font-black text-rose-400 mb-2 relative z-10">생명선 (Life Line)</h3>
                                    <div className="h-0.5 w-12 bg-rose-500/50 mb-4 relative z-10" />
                                    <p className="text-sm text-slate-300 leading-relaxed font-medium relative z-10">
                                        선이 굵고 길게 이어져 있어 기초 체력이 우수하며 잔병치레가 적은 편입니다. 중년 이후에 나타나는 옅은 갈래선은 새로운 분야로의 도전을 암시합니다.
                                    </p>
                                </div>

                                {/* 두뇌선 */}
                                <div className="bg-surface p-8 rounded-4xl border border-blue-500/20 relative overflow-hidden group hover:border-blue-500/50 transition-all shadow-xl">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                                    <h3 className="text-xl font-black text-blue-400 mb-2 relative z-10">두뇌선 (Head Line)</h3>
                                    <div className="h-0.5 w-12 bg-blue-500/50 mb-4 relative z-10" />
                                    <p className="text-sm text-slate-300 leading-relaxed font-medium relative z-10">
                                        기울기가 완만하게 떨어지는 형태로, 논리력과 감수성이 균형을 이루고 있습니다. 특히 창의력을 요구하는 기획이나 예술 분야에서 탁월한 재능을 보입니다.
                                    </p>
                                </div>

                                {/* 감정선 */}
                                <div className="bg-surface p-8 rounded-4xl border border-purple-500/20 relative overflow-hidden group hover:border-purple-500/50 transition-all shadow-xl">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                                    <h3 className="text-xl font-black text-purple-400 mb-2 relative z-10">감정선 (Heart Line)</h3>
                                    <div className="h-0.5 w-12 bg-purple-500/50 mb-4 relative z-10" />
                                    <p className="text-sm text-slate-300 leading-relaxed font-medium relative z-10">
                                        검지와 중지 사이로 길게 뻗어 들어갑니다. 감정 표현이 풍부하고 솔직하며 매우 이상적인 사랑을 꿈꿉니다. 인연을 맺으면 매우 헌신하는 타입입니다.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-12 bg-background border border-amber-500/30 rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-8 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                                <div className="w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center shrink-0">
                                    <Sparkles className="w-10 h-10 text-amber-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-amber-500 mb-2">특이점 обнаружение (M자 손금)</h3>
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        감정선, 두뇌선, 생명선, 운명선이 뚜렷하게 교차하며 <span className="font-bold text-amber-400">행운의 &apos;M자&apos; 형태</span>를 띄고 있습니다. 강한 의지와 끈기로 자수성가할 수 있는 매우 희소한 귀격 손금입니다. 직관을 믿고 나아가세요.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-10 text-center">
                                <button
                                    onClick={() => setStep("upload")}
                                    className="px-8 py-3 bg-surface border border-border-color rounded-xl text-secondary hover:text-foreground hover:bg-white/5 transition-all text-sm font-bold"
                                >
                                    다시 분석하기
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
