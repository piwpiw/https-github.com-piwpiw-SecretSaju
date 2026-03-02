'use client';

import { motion } from "framer-motion";
import { Sparkles, Heart, Shield, Zap, ArrowLeft, Globe, Cpu, Zap as Bolt } from "lucide-react";
import Link from 'next/link';

export default function AboutPage() {
    return (
        <main className="min-h-screen relative overflow-hidden pb-32">
            <div className="max-w-4xl mx-auto px-6 pt-16 relative z-10">
                <Link href="/" className="flex items-center gap-3 text-slate-500 hover:text-white transition-all group mb-16">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase">돌아가기</span>
                </Link>

                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6"
                    >
                        <span className="text-[8px] font-black tracking-[0.4em] text-cyan-400 uppercase">
                            프로토콜 암호화 활성
                        </span>
                    </motion.div>

                    <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter uppercase mb-6 leading-none">
                        Secret <span className="text-cyan-400">Saju</span>
                    </h1>
                    <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto leading-relaxed tracking-wide">
                        사회적 가면 뒤에 숨겨진 <span className="text-white italic">본능적 아키텍처</span>를<br />
                        최첨단 Quantum Sync 엔진으로 적출하는 명리학 프로토콜입니다.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
                    {[
                        { icon: Cpu, title: "정밀 알고리즘", desc: "수천 년의 명리학 빅데이터와 최첨단 AI 엔진 DACRE로 당신의 운명 노드를 정밀 분석합니다.", color: "text-cyan-400", bg: "from-cyan-500/20" },
                        { icon: Globe, title: "운명 시그널 동기화", desc: "가족, 연인, 친구와의 관계 매트릭스를 입체적으로 가시화해 유기적인 운명 지도를 완성합니다.", color: "text-purple-400", bg: "from-purple-500/20" },
                        { icon: Shield, title: "보안 규약", desc: "운명 데이터는 종단간 암호화로 보호되며, 오직 당신의 승인 하에만 동기화됩니다.", color: "text-emerald-400", bg: "from-emerald-500/20" },
                        { icon: Bolt, title: "에너지 유닛", desc: "복잡한 결제 체계 없이 젤리(Jelly) 에너지 유닛으로 모든 고급 인사이트를 즉시 해금합니다.", color: "text-yellow-400", bg: "from-yellow-500/20" }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="premium-card p-10 group bg-white/[0.01] border-white/5"
                        >
                            <div className={`mystic-glow ${feature.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
                            <div className="relative z-10">
                                <feature.icon className={`w-10 h-10 mb-6 ${feature.color}`} />
                                <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-4">{feature.title}</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="premium-card p-1 border-white/5 bg-white/[0.01]"
                >
                    <div className="p-12 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] -mr-32 -mt-32" />
                        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4">동기화 시작하기</h2>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto">지금 바로 당신의 고유 주파수를 측정하고 운명의 타래를 분석하세요.</p>
                        <Link
                            href="/"
                            className="inline-flex px-12 py-5 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                        >
                            시스템 입장하기
                        </Link>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
