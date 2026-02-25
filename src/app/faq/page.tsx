"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageCircle } from "lucide-react";

const FAQS = [
    { q: "결과가 정확한가요?", a: "기존의 무거운 명리학을 현대인의 시각에서 해석한 것으로, 재미와 참고용으로 즐겨주시면 좋습니다." },
    { q: "비밀 해금(Jelly)은 어떻게 하나요?", a: "로그인 후 '젤리 충전소'에서 결제하거나 친구 초대를 통해 젤리를 획득하여 잠금 해제할 수 있습니다." },
    { q: "가입 시 제공한 생년월일은 안전한가요?", a: "네, 개인정보처리방침에 따라 안전하게 보관되며, 언제든지 삭제하실 수 있습니다." },
    { q: "궁합 분석은 제한이 있나요?", a: "젤리 1개를 소모하여 언제든지 원하는 사람과의 궁합을 무제한으로 리포트 받을 수 있습니다." },
    { q: "환불하고 싶어요.", a: "사용하지 않은 젤리 캐시는 결제일로부터 7일 이내 전액 환불 가능합니다. '문의하기'를 통해 접수해주세요." }
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <main className="min-h-screen bg-background pt-24 pb-20 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-12">
                    <MessageCircle className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">자주 묻는 질문</h1>
                    <p className="text-slate-400">궁금하신 점을 빠르게 해결해드려요.</p>
                </div>

                <div className="space-y-4">
                    {FAQS.map((faq, i) => (
                        <div key={i} className="glass rounded-2xl border border-white/5 overflow-hidden">
                            <button
                                className="w-full px-6 py-5 text-left flex justify-between items-center bg-white/5 hover:bg-white/10 transition-colors"
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                            >
                                <span className="text-white font-medium">{faq.q}</span>
                                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openIndex === i ? "rotate-180" : ""}`} />
                            </button>
                            <AnimatePresence>
                                {openIndex === i && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-5 pt-2 text-slate-400 text-sm leading-relaxed">
                                        {faq.a}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
