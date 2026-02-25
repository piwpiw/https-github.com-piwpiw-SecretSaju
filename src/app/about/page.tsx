"use client";

import { motion } from "framer-motion";
import { Sparkles, Heart, Shield, Zap } from "lucide-react";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-background pt-24 pb-20 px-4">
            <div className="max-w-3xl mx-auto space-y-12">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 mb-6">
                        <span className="text-3xl">🐶</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        사주라떼를 소개합니다
                    </h1>
                    <p className="text-slate-400 text-lg">
                        사회적 가면 뒤에 숨겨진 짐승의 본능을 디지털 굿즈로 발급하는 명리학 기반 서비스입니다.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-6">
                    {[
                        { icon: Sparkles, title: "정통 명리학 분석", desc: "수천 년의 데이터를 현대적으로 재해석하여 정확하고 트렌디한 사주 결과를 제공합니다.", color: "text-amber-400", bg: "bg-amber-400/10" },
                        { icon: Heart, title: "관계 대시보드", desc: "가족, 연인, 친구와의 궁합을 직관적인 점수와 팩폭 해설로 알려드립니다.", color: "text-pink-400", bg: "bg-pink-400/10" },
                        { icon: Shield, title: "안전한 데이터 보관", desc: "사용자의 사주 정보는 안전하게 암호화되어 저장되며 다른 용도로 사용되지 않습니다.", color: "text-green-400", bg: "bg-green-400/10" },
                        { icon: Zap, title: "빠르고 쉬운 해금", desc: "복잡한 용어 없이, 젤리 충전 하나로 모든 비밀을 시원하게 해금할 수 있습니다.", color: "text-purple-400", bg: "bg-purple-400/10" }
                    ].map((feature, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass rounded-2xl p-6 border border-white/5">
                            <feature.icon className={`w-8 h-8 mb-4 ${feature.color}`} />
                            <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </main>
    );
}
