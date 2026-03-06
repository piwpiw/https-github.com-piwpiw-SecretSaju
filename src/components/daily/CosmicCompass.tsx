import { motion } from 'framer-motion';
import { Compass, Navigation } from 'lucide-react';

export default function CosmicCompass({ direction = "동남(SE)" }: { direction?: string }) {
    return (
        <div className="relative w-full max-w-[280px] aspect-square mx-auto flex items-center justify-center group">
            {/* Outer Rings */}
            <div className="absolute inset-0 rounded-full border border-white/5 bg-white/[0.02] shadow-inner" />
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 rounded-full border-2 border-dashed border-indigo-500/20"
            />

            {/* Markers */}
            {['N', 'E', 'S', 'W'].map((label, i) => (
                <div
                    key={label}
                    className="absolute font-black text-[10px] text-slate-600 tracking-tighter"
                    style={{
                        top: i === 0 ? '8px' : i === 2 ? 'auto' : '50%',
                        bottom: i === 2 ? '8px' : 'auto',
                        left: i === 3 ? '8px' : i === 1 ? 'auto' : '50%',
                        right: i === 1 ? '8px' : 'auto',
                        transform: (i === 1 || i === 3) ? 'translateY(-50%)' : 'translateX(-50%)',
                    }}
                >
                    {label}
                </div>
            ))}

            {/* Needle */}
            <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 135 }} // Pointing to SE for mock
                transition={{ type: 'spring', damping: 10, stiffness: 50, delay: 0.5 }}
                className="relative z-10 w-1 h-32 bg-gradient-to-b from-indigo-500 via-white to-rose-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]"
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white shadow-lg" />
                <Navigation className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 text-indigo-400 rotate-180" />
            </motion.div>

            {/* Center Cap */}
            <div className="absolute w-6 h-6 rounded-full bg-slate-950 border-2 border-white/20 z-20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            </div>

            {/* Direction Label Overlay */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">행운의 오라클</p>
                <div className="px-5 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
                    <span className="text-xl font-black italic text-white tracking-widest">{direction}</span>
                    <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase">오늘의 번영 경로</p>
                </div>
            </div>

            <div className="noise-texture opacity-[0.05]" />
        </div>
    );
}
