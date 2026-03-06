import { motion } from 'framer-motion';
import { BrainCircuit, Cpu, Sparkles } from 'lucide-react';

interface Props {
    model: string;
    isEnsemble: boolean;
}

export default function AIIntelligenceBadge({ model, isEnsemble }: Props) {
    return (
        <div className="flex items-center gap-2 p-1.5 pr-4 rounded-full bg-slate-900/60 border border-white/10 w-fit backdrop-blur-xl group">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <BrainCircuit className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
            </div>
            <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest leading-none">AI 분석 엔진</span>
                    {isEnsemble && <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-bold text-slate-200 tracking-tight">{model}</span>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10">
                        <Cpu className="w-2.5 h-2.5 text-slate-500" />
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">앙상블 모드</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
