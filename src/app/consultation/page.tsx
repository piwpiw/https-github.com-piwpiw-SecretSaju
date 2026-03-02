"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare, Phone, Star, Clock, ShieldCheck, Zap } from "lucide-react";

const COUNSELORS = [
    {
        id: 1,
        name: "천상궁",
        category: "신점/사주",
        rating: 4.9,
        reviews: 1240,
        status: "online",
        price: "1,500/30초",
        tags: ["#명쾌함", "#미래지향", "#현실조언"],
        image: "🔮"
    },
    {
        id: 2,
        name: "도로시",
        category: "타로/심리",
        rating: 4.8,
        reviews: 856,
        status: "online",
        price: "1,200/30초",
        tags: ["#공감", "#연애상담", "#힐링"],
        image: "🃏"
    },
    {
        id: 3,
        name: "박대인",
        category: "전통사주/동양학",
        rating: 5.0,
        reviews: 2100,
        status: "online",
        price: "2,000/30초",
        tags: ["#정석", "#디테일", "#취업진로"],
        image: "🕯"
    },
    {
        id: 4,
        name: "지수쌤",
        category: "작명/지정일",
        rating: 4.7,
        reviews: 432,
        status: "busy",
        price: "1,500/30초",
        tags: ["#명리학", "#개명전문", "#친절함"],
        image: "🧬"
    }
];

export default function ConsultationPage() {
    const router = useRouter();

    return (
        <main className="min-h-[100dvh] bg-slate-950 text-white relative overflow-hidden pb-40">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" />

            <div className="max-w-2xl mx-auto px-4 pt-10">
                <button onClick={() => router.back()} className="flex items-center gap-3 text-slate-400 hover:text-white transition-all mb-10 group">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-black uppercase tracking-tighter">Back</span>
                </button>

                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                        <Zap className="w-3 h-3" /> Live Consultation
                    </div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">점신 1:1 전문 상담</h1>
                    <p className="text-slate-500 text-sm font-medium">혼자 고민하지 마세요. 엄선된 1% 전문가들이 24시간 함께합니다.</p>
                </div>

                <div className="space-y-4">
                    {COUNSELORS.map((c, i) => (
                        <motion.div
                            key={c.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-6 hover:bg-slate-800 hover:border-amber-500/50 transition-all cursor-pointer group"
                        >
                            <div className="flex gap-6">
                                <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform shadow-xl">
                                    {c.image}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-black">{c.name}</h3>
                                            <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-bold">{c.category}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {c.status === "online" ? (
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                                    <span className="text-[9px] text-green-500 font-black uppercase tracking-tighter">Online</span>
                                                </div>
                                            ) : (
                                                <span className="text-[9px] text-slate-600 font-black uppercase tracking-tighter">Busy</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="flex items-center gap-1 text-amber-400">
                                            <Star className="w-3.5 h-3.5 fill-current" />
                                            <span className="text-xs font-black">{c.rating}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-slate-500">
                                            <MessageSquare className="w-3.5 h-3.5" />
                                            <span className="text-xs font-bold">{c.reviews}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-slate-500">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span className="text-xs font-bold">{c.price}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {c.tags.map(tag => (
                                            <span key={tag} className="text-[9px] text-slate-500 font-medium">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <button className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-black transition-all">
                                    <MessageSquare className="w-4 h-4" /> 채팅 상담
                                </button>
                                <button className="flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black transition-all">
                                    <Phone className="w-4 h-4" /> 전화 상담
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-12 p-6 bg-slate-900/30 border border-slate-800 rounded-3xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <ShieldCheck className="w-8 h-8 text-indigo-500" />
                        <div>
                            <p className="text-xs font-black text-slate-100 uppercase tracking-tighter">Safety Shield</p>
                            <p className="text-[10px] text-slate-500 font-medium leading-tight">상담 내용은 암호화되어 보호되며,<br />전문 상담사 연동은 점신 공식 채널을 통합니다.</p>
                        </div>
                    </div>
                    <Link href="/shop" className="text-[10px] font-black text-amber-500 border-b border-amber-500">BUY RECHARGE</Link>
                </div>
            </div>
        </main>
    );
}

// Fixed missing Link import in code above
import Link from 'next/link';
