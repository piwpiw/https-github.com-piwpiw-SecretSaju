import { motion } from 'framer-motion';

const MILESTONES = [
    { age: 10, event: '사회적 자아의 형성', color: 'bg-indigo-500' },
    { age: 25, event: '격정적인 변화의 시기', color: 'bg-rose-500' },
    { age: 40, event: '안정적인 재물의 축적', color: 'bg-amber-500' },
    { age: 55, event: '정신적 완성의 단계', color: 'bg-emerald-500' },
    { age: 70, event: '여유로운 황혼의 운명', color: 'bg-indigo-400' },
];

export default function LifeTimeline() {
    return (
        <div className="relative pt-12 pb-8 px-4 overflow-x-auto scrollbar-hide">
            <div className="min-w-[600px] relative">
                {/* Connection Line */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-0.5 bg-white/5" />

                <div className="flex justify-between items-center relative z-10">
                    {MILESTONES.map((m, i) => (
                        <motion.div
                            key={m.age}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.2 }}
                            className="flex flex-col items-center gap-4 group"
                        >
                            <div className={`${m.color} h-2 px-3 flex items-center justify-center rounded-full text-[8px] font-black text-white italic tracking-widest`}>
                                AGE {m.age}
                            </div>
                            <div className="w-4 h-4 rounded-full bg-slate-900 border-2 border-white/20 group-hover:scale-125 group-hover:border-white transition-all z-10" />
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter whitespace-nowrap group-hover:text-white transition-colors">
                                {m.event}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
