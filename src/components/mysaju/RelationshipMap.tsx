import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface Member {
    id: string;
    name: string;
    animal: string;
}

export interface RelationshipMapProps {
    /** The user's own saved profiles. Only real profiles are shown — this map
     *  must never present invented people or fabricated compatibility numbers
     *  as if they were the user's data. */
    members?: { id: string; name: string }[];
}

// Purely decorative per-node avatars, assigned deterministically by position so
// the same profile keeps the same glyph between renders.
const NODE_GLYPHS = ['🐉', '🐰', '🐶', '🐱', '🐴', '🐷'];

export default function RelationshipMap({ members = [] }: RelationshipMapProps) {
    const satellites: Member[] = members.slice(0, 3).map((m, i) => ({
        id: m.id,
        name: m.name,
        animal: NODE_GLYPHS[i % NODE_GLYPHS.length],
    }));

    if (satellites.length === 0) {
        return (
            <div className="relative w-full aspect-square max-w-md mx-auto bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden flex flex-col items-center justify-center text-center px-10">
                <span className="text-4xl">🧭</span>
                <p className="mt-4 text-sm font-black text-white">아직 연결된 인연이 없습니다</p>
                <p className="mt-2 text-xs leading-6 text-slate-400">
                    프로필을 2명 이상 등록하면 이곳에 실제 인연 네트워크가 그려집니다.
                </p>
                <div className="noise-texture opacity-[0.03]" />
            </div>
        );
    }

    return (
        <div className="relative w-full aspect-square max-w-md mx-auto bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1)_0%,transparent_70%)]" />

            {/* Connection Lines (SVG) */}
            <svg className="absolute inset-0 w-full h-full opacity-30">
                <defs>
                    <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
                        <stop offset="50%" stopColor="#6366f1" stopOpacity="1" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <motion.line
                    x1="50%" y1="50%" x2="20%" y2="30%" stroke="url(#line-grad)" strokeWidth="2"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.line
                    x1="50%" y1="50%" x2="80%" y2="35%" stroke="url(#line-grad)" strokeWidth="2"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                />
                <motion.line
                    x1="50%" y1="50%" x2="70%" y2="80%" stroke="url(#line-grad)" strokeWidth="2"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
                {/* Center Node (User) */}
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="relative z-10 w-24 h-24 rounded-full bg-indigo-600 border-4 border-white/20 shadow-[0_0_30px_rgba(99,102,241,0.4)] flex flex-col items-center justify-center"
                >
                    <span className="text-3xl">🐯</span>
                    <span className="text-[10px] font-black uppercase tracking-widest mt-1">Me</span>
                </motion.div>

                {/* Satellite Nodes */}
                <div className="absolute inset-0">
                    {satellites.map((m, i) => {
                        const angles = [300, 45, 140];
                        const dist = 120;
                        const angle = (angles[i % angles.length] * Math.PI) / 180;
                        const x = Math.cos(angle) * dist;
                        const y = Math.sin(angle) * dist;

                        return (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1, x, y }}
                                transition={{ delay: i * 0.2, type: 'spring' }}
                                className="absolute left-1/2 top-1/2 -ml-8 -mt-8 w-16 h-16 rounded-full bg-slate-900 border border-white/10 flex flex-col items-center justify-center shadow-xl backdrop-blur-md"
                            >
                                <span className="text-xl" aria-hidden="true">{m.animal}</span>
                                <div className="absolute -bottom-5 whitespace-nowrap">
                                    <p className="text-[9px] font-black text-white">{m.name}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[9px] font-black text-indigo-300 uppercase tracking-[0.2em] italic">
                Destiny Alignment Web
            </div>

            <div className="noise-texture opacity-[0.03]" />
        </div>
    );
}
