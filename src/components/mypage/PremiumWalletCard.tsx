import { motion } from 'framer-motion';
import { Gem, Zap, ArrowRight } from 'lucide-react';

interface PremiumWalletCardProps {
    jellies: number;
    onClickCharge: () => void;
}

export default function PremiumWalletCard({ jellies, onClickCharge }: PremiumWalletCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full aspect-[1.586/1] rounded-[2.5rem] bg-[#0c0c0c] border border-white/10 overflow-hidden shadow-2xl group"
        >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-1000" />

            <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
                            <Gem className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] italic">시크릿 멤버십</p>
                            <p className="text-xs font-bold text-white uppercase tracking-widest opacity-60">젤리 지갑</p>
                        </div>
                    </div>
                    <div className="px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-[9px] font-black text-indigo-300 uppercase tracking-widest animate-pulse">
                        프리미엄 상태
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest italic">현재 잔액</p>
                    <div className="flex items-end gap-3">
                        <span className="text-5xl font-black italic text-white tracking-tighter">{jellies.toLocaleString()}</span>
                        <span className="text-2xl font-black italic text-indigo-400 mb-1 tracking-tighter uppercase">젤리</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex -space-x-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-[#0c0c0c] flex items-center justify-center">
                                <Zap className="w-3.5 h-3.5 text-indigo-300 opacity-40" />
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={onClickCharge}
                        className="bg-white text-black px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-200 transition-colors shadow-xl shadow-white/5 active:scale-95 transition-all"
                    >
                        즉시 충전 <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            <div className="noise-texture opacity-[0.08]" />
            <div className="premium-glow opacity-30" />
        </motion.div>
    );
}

