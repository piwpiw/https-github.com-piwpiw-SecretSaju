"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageSquare, ArrowLeft, HelpCircle } from "lucide-react";
import Link from "next/link";

const FAQS = [
    { q: "분석 결과의 신뢰도는 어느 정도인가요?", a: "기존의 정적인 명리학 분석을 현대인의 라이프스타일과 심리 상태에 맞춰 재구성한 최첨단 AI 알고리즘을 사용합니다. 재미와 인사이트를 동시에 제공하는 것을 목표로 합니다." },
    { q: "운명 해금(Jelly) 유닛은 어떻게 획득하나요?", a: "마이페이지의 'Jelly Forge'에서 직접 충전하거나, 다양한 시스템 연동 활동을 통해 보너스 유닛을 획득할 수 있습니다." },
    { q: "제 입력 정보가 서버에 영구 저장되나요?", a: "회원님의 입력 정보는 고유 노드에 암호화되어 저장되며, 언제든지 마이페이지에서 데이터 동기화를 해제하거나 삭제할 수 있습니다." },
    { q: "관계 분석(궁합)은 어떻게 진행되나요?", a: "젤리 1개를 소모하여 언제든지 원하는 사람과의 궁합을 분석받을 수 있습니다. 친구나 연인의 데이터가 이미 등록되어 있다면 즉시 분석이 가능합니다." },
    { q: "시스템 오류 발생 시 환불이 가능한가요?", a: "미사용 젤리에 한해 결제일로부터 7일 이내 환불이 가능합니다. 'Support Terminal'을 통해 요청해주시면 즉시 처리 논의를 시작합니다." }
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <main className="min-h-screen bg-[radial-gradient(circle_at_50%_0%,#1e2c4f_0%,#09090b_70%)] relative overflow-hidden pb-32">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

            <div className="max-w-3xl mx-auto px-6 pt-16 relative z-10">
                <Link href="/mypage" className="flex items-center gap-3 text-slate-500 hover:text-white transition-all group mb-16">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">뒤로</span>
                </Link>

                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6"
                    >
                        <span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
                            고객지원
                        </span>
                    </motion.div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--text-foreground)' }}>자주 묻는 <span style={{ color: 'var(--primary)' }}>질문</span></h1>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>서비스 이용 가이드</p>
                </div>

                <div className="space-y-4">
                    {FAQS.map((faq, i) => (
                        <div key={i} className="premium-card group border-white/5 bg-white/[0.01]">
                            <button
                                className="w-full px-8 py-6 text-left flex justify-between items-center relative z-10"
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                            >
                                <div className="flex items-center gap-4">
                                    <HelpCircle className={`w-5 h-5 transition-colors ${openIndex === i ? "text-cyan-400" : "text-slate-600"}`} />
                                    <span className={`text-lg font-black italic tracking-tight transition-colors ${openIndex === i ? "text-white" : "text-slate-400"}`}>{faq.q}</span>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-slate-600 transition-transform duration-500 ${openIndex === i ? "rotate-180 text-cyan-400" : ""}`} />
                            </button>
                            <AnimatePresence>
                                {openIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="relative z-10 overflow-hidden"
                                    >
                                        <div className="px-8 pb-8 pt-2 text-slate-500 font-medium leading-relaxed tracking-wide border-t border-white/5 mt-2">
                                            {faq.a}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                <div className="mt-20 p-10 premium-card text-center border-dashed border-white/10 group">
                    <MessageSquare className="w-12 h-12 text-slate-800 mx-auto mb-6 group-hover:text-cyan-400 transition-colors" />
                    <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--text-foreground)' }}>더 궁금한 점이 있으신가요?</h3>
                    <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>추가 문의가 필요한 경우 고객지원으로 연락해 주세요.</p>
                    <Link
                        href="/inquiry"
                        className="inline-flex px-8 py-4 rounded-xl text-sm font-medium transition-colors" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-foreground)', border: '1px solid var(--border-color)' }}
                    >
                        문의하기
                    </Link>
                </div>
            </div>
        </main>
    );
}
