"use client";

import Link from 'next/link';
import { Settings, User, Compass, Sparkles, BookOpen, FileText, Lock, RefreshCw, ChevronRight, Gift, Crown, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MorePage() {
    const menus: {
        group: string;
        items: {
            icon: any;
            title: string;
            desc?: string;
            link: string;
            color: string;
            badge?: string;
        }[];
    }[] = [
            {
                group: "My Identity",
                items: [
                    { icon: User, title: "마이페이지", desc: "내 레벨, 젤리 및 네트워크", link: "/mypage", color: "text-cyan-400" },
                    { icon: Gift, title: "친구 초대 상자", desc: "공유하고 10 젤리 받기", link: "/mypage", color: "text-yellow-400" },
                ]
            },
            {
                group: "Destiny Expanding",
                items: [
                    { icon: Sparkles, title: "신살/도화/역마", desc: "내면에 잠재된 기운 분석", link: "/shinsal", color: "text-purple-400" },
                    { icon: Compass, title: "타로/점성술", desc: "별자리와 타로 크로스분석", link: "/tarot", color: "text-indigo-400" },
                    { icon: BookOpen, title: "정통 작명/개명", desc: "사주에 완벽하게 맞는 이름", link: "/naming", color: "text-rose-400" },
                ]
            },
            {
                group: "Information & Legal",
                items: [
                    { icon: FileText, title: "이용약관", link: "/terms", color: "text-slate-400" },
                    { icon: Lock, title: "개인정보 보호", link: "/privacy", color: "text-slate-400" },
                    { icon: RefreshCw, title: "환불 정책", link: "/refund", color: "text-slate-400" },
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
                        <p className="text-sm font-bold text-secondary tracking-widest uppercase">Secret Paws Ecosystem</p>
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
                    <p className="text-lg font-black italic tracking-tighter mb-2 text-foreground">시크릿 파우즈 V4.0</p>
                    <p className="text-xs text-secondary font-bold tracking-widest uppercase">가장 정밀한 운명 분석 알고리즘 시스템</p>
                </div>
            </div>
        </main>
    );
}
