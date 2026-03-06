import { motion } from 'framer-motion';

interface RadarData {
    label: string;
    me: number;
    you: number;
}

const MOCK_DATA: RadarData[] = [
    { label: '성격합', me: 80, you: 90 },
    { label: '가치관', me: 60, you: 85 },
    { label: '생활력', me: 95, you: 70 },
    { label: '애정운', me: 75, you: 95 },
    { label: '재물운', me: 85, you: 65 },
];

export default function RelationshipRadar() {
    const center = 100;
    const radius = 80;

    const getPoint = (score: number, index: number, total: number) => {
        const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
        const dist = (score / 100) * radius;
        return {
            x: center + dist * Math.cos(angle),
            y: center + dist * Math.sin(angle),
        };
    };

    const mePoints = MOCK_DATA.map((d, i) => getPoint(d.me, i, MOCK_DATA.length));
    const youPoints = MOCK_DATA.map((d, i) => getPoint(d.you, i, MOCK_DATA.length));

    const mePath = `M ${mePoints.map(p => `${p.x},${p.y}`).join(' L ')} Z`;
    const youPath = `M ${youPoints.map(p => `${p.x},${p.y}`).join(' L ')} Z`;

    return (
        <div className="relative w-full max-w-[240px] aspect-square mx-auto flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                {/* Rings */}
                {[0.2, 0.4, 0.6, 0.8, 1].map((r) => (
                    <circle
                        key={r} cx="100" cy="100" r={radius * r}
                        fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="1"
                    />
                ))}
                {/* Spokes */}
                {MOCK_DATA.map((_, i) => {
                    const angle = (Math.PI * 2 * i) / MOCK_DATA.length - Math.PI / 2;
                    return (
                        <line
                            key={i} x1="100" y1="100"
                            x2={100 + radius * Math.cos(angle)} y2={100 + radius * Math.sin(angle)}
                            stroke="white" strokeOpacity="0.05" strokeWidth="1"
                        />
                    );
                })}

                {/* Data Paths */}
                <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                    d={mePath} fill="rgba(99, 102, 241, 0.2)" stroke="#6366f1" strokeWidth="2"
                />
                <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.3 }}
                    d={youPath} fill="rgba(244, 114, 182, 0.2)" stroke="#f472b6" strokeWidth="2"
                />

                {/* Points */}
                {mePoints.map((p, i) => (
                    <circle key={`me-${i}`} cx={p.x} cy={p.y} r="3" fill="#6366f1" />
                ))}
                {youPoints.map((p, i) => (
                    <circle key={`you-${i}`} cx={p.x} cy={p.y} r="3" fill="#f472b6" />
                ))}
            </svg>

            {/* Labels */}
            {MOCK_DATA.map((d, i) => {
                const angle = (Math.PI * 2 * i) / MOCK_DATA.length - Math.PI / 2;
                const x = 100 + (radius + 20) * Math.cos(angle);
                const y = 100 + (radius + 20) * Math.sin(angle);
                return (
                    <div
                        key={d.label}
                        className="absolute text-[9px] font-black text-slate-500 uppercase tracking-tighter"
                        style={{ left: `${x / 2}%`, top: `${y / 2}%`, transform: 'translate(-50%, -50%)' }}
                    >
                        {d.label}
                    </div>
                );
            })}

            <div className="absolute top-0 right-0 flex flex-col gap-1 items-end pr-2 pt-2">
                <div className="flex items-center gap-1.5">
                    <span className="text-[7px] font-bold text-indigo-400">ME</span>
                    <div className="w-2 h-0.5 bg-indigo-500" />
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-[7px] font-bold text-fuchsia-400">YOU</span>
                    <div className="w-2 h-0.5 bg-fuchsia-500" />
                </div>
            </div>
        </div>
    );
}
