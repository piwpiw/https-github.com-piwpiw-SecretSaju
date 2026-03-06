import { motion } from 'framer-motion';
import { User, Users, Heart, Zap } from 'lucide-react';

interface Member {
    id: string;
    name: string;
    type: 'family' | 'friend' | 'partner';
    animal: string;
    score: number;
}

const MOCK_MEMBERS: Member[] = [
    { id: '1', name: '나', type: 'family', animal: '🐯', score: 100 },
    { id: '2', name: '김철수', type: 'friend', animal: '🐉', score: 85 },
    { id: '3', name: '이영희', type: 'partner', animal: '🐰', score: 92 },
    { id: '4', name: '박민수', type: 'family', animal: '🐶', score: 78 },
];

export default function RelationshipMap() {
    return (
        <div className="relative w-full aspect-square max-w-md mx-auto bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden group">
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
                    {MOCK_MEMBERS.slice(1).map((m, i) => {
                        const angles = [300, 45, 140];
                        const dist = 120;
                        const angle = (angles[i] * Math.PI) / 180;
                        const x = Math.cos(angle) * dist;
                        const y = Math.sin(angle) * dist;

                        return (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1, x, y }}
                                transition={{ delay: i * 0.2, type: 'spring' }}
                                whileHover={{ scale: 1.2, zIndex: 20 }}
                                className="absolute left-1/2 top-1/2 -ml-8 -mt-8 w-16 h-16 rounded-full bg-slate-900 border border-white/10 flex flex-col items-center justify-center cursor-pointer shadow-xl backdrop-blur-md"
                            >
                                <span className="text-xl">{m.animal}</span>
                                <div className="absolute -bottom-6 whitespace-nowrap">
                                    <p className="text-[9px] font-black text-white">{m.name}</p>
                                    <div className="flex items-center gap-1 justify-center mt-0.5">
                                        <Heart className="w-2 h-2 text-rose-400 fill-rose-400" />
                                        <span className="text-[8px] font-bold text-slate-400">{m.score}%</span>
                                    </div>
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
