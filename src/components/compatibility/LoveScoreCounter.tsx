import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export default function LoveScoreCounter({ targetScore = 92 }: { targetScore?: number }) {
    const [count, setCount] = useState(0);
    const springValue = useSpring(0, { stiffness: 40, damping: 20 });

    useEffect(() => {
        springValue.set(targetScore);
        const unsubscribe = springValue.on('change', (latest) => {
            setCount(Math.round(latest));
        });
        return () => unsubscribe();
    }, [targetScore, springValue]);

    return (
        <div className="flex flex-col items-center justify-center py-6">
            <div className="relative group">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-8xl font-black italic tracking-tighter text-white drop-shadow-[0_0_30px_rgba(99,102,241,0.5)] flex items-baseline"
                >
                    {count}
                    <span className="text-2xl font-black italic ml-2 text-indigo-400 opacity-80 uppercase tracking-widest">%</span>
                </motion.div>

                {/* Orbital Glow */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                    className="absolute -inset-10 border border-white/5 rounded-full pointer-events-none"
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1]" />
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-4 px-6 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em] inline-block shadow-2xl"
            >
                Ultimate Synergy Quotient
            </motion.div>
        </div>
    );
}
