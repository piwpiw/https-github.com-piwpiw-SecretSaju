import { motion } from 'framer-motion';

const KEYWORDS = [
    { text: '용(Dragon)', scale: 1.5, color: '#fbbf24' },
    { text: '황금(Gold)', scale: 1.2, color: '#fcd34d' },
    { text: '바다(Ocean)', scale: 1.1, color: '#60a5fa' },
    { text: '하늘(Sky)', scale: 1.3, color: '#a78bfa' },
    { text: '호랑이(Tiger)', scale: 1.4, color: '#fb923c' },
    { text: '돈(Money)', scale: 1.2, color: '#34d399' },
    { text: '불(Fire)', scale: 1.1, color: '#f87171' },
];

export default function DreamKeywordCloud() {
    return (
        <div className="relative h-48 w-full bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden p-6 flex flex-wrap gap-4 items-center justify-center">
            {KEYWORDS.map((kw, i) => (
                <motion.div
                    key={kw.text}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.6, scale: kw.scale }}
                    whileHover={{ opacity: 1, scale: kw.scale * 1.1, color: kw.color }}
                    transition={{
                        delay: i * 0.1,
                        duration: 5,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: 'easeInOut'
                    }}
                    className="text-[10px] font-black uppercase tracking-widest cursor-default select-none italic"
                >
                    {kw.text}
                </motion.div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-4 left-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Global Trending Symbols</span>
            </div>
        </div>
    );
}
