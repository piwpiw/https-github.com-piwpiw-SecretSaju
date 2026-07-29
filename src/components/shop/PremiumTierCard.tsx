import { motion } from 'framer-motion';
import { Check, Sparkles, Zap } from 'lucide-react';
import { FREE_LAUNCH } from '@/config/constants';

interface TierProps {
    name: string;
    jellies: number;
    price: string;
    isPro?: boolean;
    features: string[];
}

export default function PremiumTierCard({ name, jellies, price, isPro, features }: TierProps) {
    // During the free open launch there is nothing to purchase, so this card is
    // purely informational. It must not look clickable — the CTA below has no
    // handler, and a button-styled div that does nothing is worse than no CTA.
    return (
        <div className="relative block h-full">
            <div className={`h-full rounded-[2.5rem] p-8 transition-all duration-500 relative overflow-hidden group border ${isPro
                    ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.1)] scale-105 z-10'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                }`}>
                {isPro && (
                    <div className="absolute top-0 right-0 px-6 py-2 bg-indigo-500 text-[13px] font-black text-white uppercase tracking-widest rounded-bl-3xl">
                        인기 패키지
                    </div>
                )}

                <div className="mb-8">
                    <p className={`text-[13px] font-black uppercase tracking-[0.2em] mb-3 ${isPro ? 'text-indigo-400' : 'text-slate-500'}`}>
                        {name} 패키지
                    </p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-white tracking-tighter">{jellies}</span>
                        <span className="text-sm font-black text-slate-400 uppercase tracking-widest">젤리</span>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    {features.map((f, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${isPro ? 'bg-indigo-500/20 border-indigo-400/30' : 'bg-white/5 border-white/10'}`}>
                                <Check className={`w-3 h-3 ${isPro ? 'text-indigo-400' : 'text-slate-400'}`} />
                            </div>
                            <span className="text-[13px] font-medium text-slate-300 leading-relaxed break-keep">{f}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-auto">
                    <div className="mb-4 text-center">
                        <span
                            className={`text-xl font-black tracking-tighter ${FREE_LAUNCH ? 'text-slate-500 line-through' : 'text-white'
                                }`}
                        >
                            {price}
                        </span>
                        <span className="text-[13px] text-slate-500 ml-1 font-bold">원</span>
                    </div>
                    {FREE_LAUNCH ? (
                        <div className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black tracking-widest text-[13px] border border-emerald-400/30 bg-emerald-500/10 text-emerald-100">
                            <Sparkles className="w-3.5 h-3.5" />
                            무료 오픈 기간 · 전체 무료
                        </div>
                    ) : (
                        <div className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black tracking-widest text-[13px] transition-all ${isPro
                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-950/40'
                                : 'bg-white/5 text-slate-300 group-hover:bg-white/10'
                            }`}>
                            {isPro && <Sparkles className="w-3.5 h-3.5" />}
                            이 플랜 선택
                            {isPro && <Zap className="w-3.5 h-3.5 fill-current" />}
                        </div>
                    )}
                </div>

                {isPro && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-transparent to-rose-500/20 pointer-events-none"
                    />
                )}
                <div className="noise-texture opacity-[0.03]" />
            </div>
        </div>
    );
}

