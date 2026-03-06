import { motion } from 'framer-motion';

export default function DailyWaveChart() {
    // Sample points for the wave
    const points = [30, 45, 80, 60, 90, 70, 40];
    const width = 400;
    const height = 150;
    const step = width / (points.length - 1);

    const pathData = points.reduce((acc, point, i) => {
        const x = i * step;
        const y = height - (point / 100) * height;
        return acc + `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }, "");

    return (
        <div className="relative w-full h-[150px] bg-white/5 rounded-3xl p-4 overflow-hidden border border-white/5">
            <div className="absolute top-4 left-6 text-[10px] font-black text-indigo-400/60 uppercase tracking-widest">에너지 흐름 지수</div>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full mt-2">
                <defs>
                    <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    d={pathData}
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                />
                <motion.path
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    d={`${pathData} L ${width} ${height} L 0 ${height} Z`}
                    fill="url(#waveGradient)"
                />
                {points.map((p, i) => (
                    <motion.circle
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.5 + i * 0.1 }}
                        cx={i * step}
                        cy={height - (p / 100) * height}
                        r="4"
                        fill="#fff"
                        className="drop-shadow-[0_0_4px_#6366f1]"
                    />
                ))}
            </svg>
            <div className="noise-texture opacity-[0.05]" />
        </div>
    );
}
