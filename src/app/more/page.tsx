"use client";

import Link from 'next/link';
import { Settings, User, Compass, Sparkles, BookOpen, FileText, Lock, RefreshCw, ChevronRight, Gift, Crown, Shield, Activity, Moon, Globe, Sun, Zap, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MorePage() {
    const menus = [
        {
            group: "Core Analysis",
            items: [
                { icon: Sparkles, title: "사주 정밀 분석", desc: "60갑자와 오행의 조화", link: "/saju", color: "text-indigo-400" },
                { icon: Compass, title: "토정비결 2026", desc: "신년 위대한 예언", link: "/tojeong", color: "text-amber-400" },
                { icon: Activity, title: "신살/도화/역마", desc: "숨겨진 기운 분석", link: "/shinsal", color: "text-purple-400" },
            ]
        },
        {
            group: "Fortune & Oracle",
            items: [
                { icon: Moon, title: "타로 채널링", desc: "무의식의 메시지", link: "/tarot", color: "text-indigo-400" },
                { icon: Globe, title: "점성술 리포트", desc: "천체의 움직임과 운명", link: "/astrology", color: "text-cyan-400" },
                { icon: Sun, title: "꿈해몽 사전", desc: "꿈속에 숨겨진 힌트", link: "/dreams", color: "text-yellow-400" },
                { icon: Zap, title: "오늘의 운세", desc: "매일의 일진 리포트", link: "/daily", color: "text-orange-400" },
            ]
        },
        {
            group: "Advanced Insights",
            items: [
                { icon: BookOpen, title: "정통 성명학", desc: "운명을 바꾸는 이름", link: "/naming", color: "text-rose-400" },
                { icon: Crown, title: "손금/수상학", desc: "손바닥에 그려진 생애", link: "/palmistry", color: "text-emerald-400" },
                { icon: Heart, title: "심리 테스트", desc: "나도 모르는 나의 성향", link: "/psychology", color: "text-pink-400" },
            ]
        },
        {
            group: "My & Support",
            items: [
                { icon: User, title: "마이페이지", desc: "내 정보 및 젤리 관리", link: "/mypage", color: "text-slate-200" },
                { icon: Gift, title: "개발자 후원", desc: "Secret Saju를 응원해요", link: "/support", color: "text-rose-500", badge: "Support" },
            ]
        }
    ];

    return (
        <main className="min-h-[100dvh] relative overflow-hidden pb-40 bg-background text-foreground">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]" />
            <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
                <div className="flex items-center gap-6 mb-12 pb-8 border-b border-border-color">
                    <div className="w-20 h-20 rounded-3xl bg-surface border border-border-color flex items-center justify-center shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/20 animate-pulse group-hover:scale-150 transition-transform duration-700" />
                        <Settings className="w-10 h-10 text-primary relative z-10 sm:animate-[spin_6s_linear_infinite]" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">More</h1>
                        <p className="text-sm font-bold text-secondary tracking-widest uppercase">Secret Saju Ecosystem</p>
                    </div>
                </div>

                <div className="space-y-12">
                    {menus.map((group, gIdx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: gIdx * 0.1 }}
                            key={gIdx}
                            className="space-y-6"
                        >
                            <h2 className="text-sm font-black text-secondary tracking-widest uppercase flex items-center gap-3">
                                <Shield className="w-4 h-4 text-primary" /> {group.group}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {group.items.map((item, iIdx) => (
                                    <Link key={iIdx} href={item.link}>
                                        <div className="bg-surface border border-border-color p-6 rounded-3xl hover:-translate-y-1 hover:shadow-2xl hover:border-primary/50 transition-all duration-300 group flex items-center justify-between h-full">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-background border border-border-color flex items-center justify-center relative overflow-hidden shrink-0">
                                                    <div className={`absolute inset-0 opacity-10 ${item.color.replace('text', 'bg')} group-hover:opacity-30 transition-opacity`} />
                                                    <item.icon className={`w-7 h-7 relative z-10 ${item.color} group-hover:scale-110 transition-transform`} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg mb-1 flex items-center gap-3">
                                                        {item.title}
                                                        {item.badge && (
                                                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 tracking-widest uppercase">
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </h3>
                                                    {item.desc && <p className="text-xs text-secondary font-medium leading-relaxed">{item.desc}</p>}
                                                </div>
                                            </div>
                                            <ChevronRight className="w-6 h-6 text-secondary group-hover:text-foreground transition-colors group-hover:translate-x-1 shrink-0 ml-4" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 pt-12 border-t border-border-color flex flex-col items-center text-center">
                    <Crown className="w-8 h-8 text-yellow-500 mb-4" />
                    <p className="text-lg font-black italic tracking-tighter mb-2 text-foreground">시크릿 사주 V1.0</p>
                    <p className="text-xs text-secondary font-bold tracking-widest uppercase">가장 정밀한 운명 분석 알고리즘 시스템</p>
                </div>
            </div>
        </main>
    );
}
