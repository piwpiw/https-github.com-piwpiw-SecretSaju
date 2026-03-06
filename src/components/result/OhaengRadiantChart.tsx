import { motion } from 'framer-motion';

interface ElementData {
    name: string;
    score: number;
    color: string;
}

export default function OhaengRadiantChart({ scores }: { scores: number[] }) {
    const elements: ElementData[] = [
        { name: "목(木)", score: scores[0] || 0, color: "#4ade80" },
        { name: "화(火)", score: scores[1] || 0, color: "#f87171" },
        { name: "토(土)", score: scores[2] || 0, color: "#fbbf24" },
        { name: "금(金)", score: scores[3] || 0, color: "#e2e8f0" },
        { name: "수(水)", score: scores[4] || 0, color: "#60a5fa" }
    ];

    const maxScore = Math.max(...elements.map(e => e.score), 1);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] italic">오행 균형 분석</h3>
                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">실시간 엔진</div>
            </div>

            <div className="space-y-4">
                {elements.map((el, i) => (
                    <div key={el.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                            <span className="text-slate-300">{el.name}</span>
                            <span className="text-white italic">{el.score}점</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(el.score / maxScore) * 100}%` }}
                                transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
                                style={{ backgroundColor: el.color }}
                                className="h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-indigo-500/30 flex items-center justify-center bg-indigo-500/10">
                    <span className="text-lg">⚖️</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium italic">
                    당신의 사주는 <span className="text-white font-black">{elements.sort((a, b) => b.score - a.score)[0].name}</span> 기운이 가장 강하며, 이를 보완하는 에너지가 필요합니다.
                </p>
            </div>
        </div>
    );
}
