import { motion } from 'framer-motion';
import { Sparkles, Share2, Download } from 'lucide-react';

export default function ShareCard({ name = "나의 운명" }: { name?: string }) {
    return (
        <div className="bg-slate-900 border border-white/10 rounded-[2rem] p-8 relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-fuchsia-500/10 pointer-events-none" />
            <div className="relative z-10 text-center">
                <div className="w-16 h-16 rounded-3xl bg-indigo-600 mx-auto flex items-center justify-center mb-6 shadow-xl shadow-indigo-900/40">
                    <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-black italic text-white uppercase tracking-widest mb-2">{name}</h3>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-8">시크릿 AI 오라클에서 생성</p>

                <div className="grid grid-cols-2 gap-4">
                    <button className="py-4 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all text-slate-300 hover:text-white group">
                        <Download className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> 이미지 저장
                    </button>
                    <button className="py-4 rounded-xl bg-indigo-600 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/40 hover:bg-indigo-700 transition-all">
                        <Share2 className="w-3.5 h-3.5" /> 빠른 공유
                    </button>
                </div>
            </div>
            <div className="noise-texture opacity-[0.03]" />
        </div>
    );
}
