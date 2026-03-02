"use client";

import { useProfiles } from "../ProfileProvider";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Zap, Star, Shield } from "lucide-react";
import { useEffect, useState } from "react";

const SECRETS = [
    "오늘은 당신의 말 한마디가 천냥 빚을 갚는 날입니다. 자신감 있게 의견을 피력하세요.",
    "오후 3시에서 5시 사이, 붉은색 계열의 소품이 당신에게 기회를 가져다줄 것입니다.",
    "평소 멀리하던 사람에게서 뜻밖의 도움을 받게 될 예감이 있습니다.",
    "오늘은 새로운 것을 배우기에 최적의 날입니다. 짧은 지식이라도 습득해보세요.",
    "당신의 성실함이 윗사람의 눈에 띄어 좋은 평가를 받게 될 시기입니다.",
    "재물운이 들어오는 길목에 서 있으니, 사소한 수입이라도 소중히 하세요."
];

export default function LuckySecretModal() {
    const { activeProfile } = useProfiles();
    const [isOpen, setIsOpen] = useState(false);
    const [secret, setSecret] = useState("");

    useEffect(() => {
        if (activeProfile) {
            const dateStr = new Date().toISOString().split('T')[0];
            const storageKey = `lucky_secret_${activeProfile.id}_${dateStr}`;

            const shown = localStorage.getItem(storageKey);
            if (!shown) {
                // Deterministic secret based on date + profile
                const seed = activeProfile.id.length + new Date().getDate();
                setSecret(SECRETS[seed % SECRETS.length]);

                // Show after a short delay for premium feel
                const timer = setTimeout(() => {
                    setIsOpen(true);
                    localStorage.setItem(storageKey, "true");
                }, 3000);
                return () => clearTimeout(timer);
            }
        }
    }, [activeProfile]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[300]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 50, rotate: -2 }}
                        animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-sm bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30 rounded-[3rem] p-10 z-[301] shadow-[0_0_100px_rgba(99,102,241,0.3)] overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -mr-32 -mt-32" />

                        <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>

                        <div className="text-center space-y-8 relative z-10">
                            <div className="w-24 h-24 bg-white/5 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center mx-auto border border-white/10 shadow-2xl relative group">
                                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
                                <Star className="w-12 h-12 text-amber-400 fill-current group-hover:scale-125 transition-transform duration-700" />
                            </div>

                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                                    <Zap className="w-3 h-3" /> 운명 공개
                                </div>
                                <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-4">
                                    {activeProfile?.name}님을 위한 비밀 가이드
                                </h3>

                                <div className="bg-white/5 rounded-3xl p-6 border border-white/5 shadow-inner">
                                    <p className="text-sm font-bold text-slate-100 leading-relaxed italic">
                                        &ldquo;{secret}&rdquo;
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-full py-4 bg-indigo-600 border border-indigo-400/50 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-indigo-900 transition-all shadow-xl shadow-indigo-950/50"
                                >
                                    확인 후 닫기
                                </button>
                                <div className="flex items-center justify-center gap-2 opacity-30">
                                    <Shield className="w-3 h-3 text-slate-500" />
                                    <span className="text-[8px] font-black uppercase tracking-tighter text-slate-500 italic">개인 맞춤 운명 흐름</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
