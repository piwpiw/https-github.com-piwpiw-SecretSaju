'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SajuProfile } from '@/lib/storage';
import { RelationshipAnalysis } from '@/lib/compatibility';

interface RelationshipData {
    profile: SajuProfile;
    analysis: RelationshipAnalysis | null;
    isUnlocked: boolean;
}

interface DestinyNetworkProps {
    mainProfile: SajuProfile;
    relationships: RelationshipData[];
    onNodeClick: (id: string) => void;
}

export default function DestinyNetwork({ mainProfile, relationships, onNodeClick }: DestinyNetworkProps) {
    const nodes = useMemo(() => {
        const radius = 240; // Desktop radius

        return relationships.map((rel, i) => {
            const angle = (i / relationships.length) * 2 * Math.PI - Math.PI / 2;
            return {
                ...rel,
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
                angle
            };
        });
    }, [relationships]);

    return (
        <div className="relative w-full aspect-square max-w-4xl mx-auto flex items-center justify-center py-20">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.05)_0%,transparent_70%)]" />

            {/* SVG Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="-400 -400 800 800">
                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(34,211,238,0.3)" />
                        <stop offset="50%" stopColor="rgba(34,211,238,0.6)" />
                        <stop offset="100%" stopColor="rgba(34,211,238,0.3)" />
                    </linearGradient>

                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {nodes.map((node, i) => (
                    <g key={`line-${node.profile.id}`}>
                        {/* Static Path */}
                        <motion.line
                            x1="0"
                            y1="0"
                            x2={node.x}
                            y2={node.y}
                            stroke="rgba(34,211,238,0.15)"
                            strokeWidth="1"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1.5, delay: i * 0.1 }}
                        />

                        {/* Pulsing Highlight Line */}
                        <motion.line
                            x1="0"
                            y1="0"
                            x2={node.x}
                            y2={node.y}
                            stroke="url(#lineGradient)"
                            strokeWidth="1.5"
                            strokeDasharray="10 20"
                            filter="url(#glow)"
                            animate={{
                                strokeDashoffset: [0, -60],
                                opacity: [0.2, 0.5, 0.2]
                            }}
                            transition={{
                                strokeDashoffset: { duration: 3, repeat: Infinity, ease: "linear" },
                                opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                            }}
                        />
                    </g>
                ))}
            </svg>

            {/* Orbiting Relationship Nodes */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {nodes.map((node, i) => (
                    <motion.div
                        key={node.profile.id}
                        className="absolute pointer-events-auto cursor-pointer group"
                        style={{
                            x: node.x,
                            y: node.y,
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 100,
                            damping: 15,
                            delay: 0.5 + i * 0.1
                        }}
                        onClick={() => onNodeClick(node.profile.id)}
                    >
                        {/* Node Halo */}
                        <div className="absolute -inset-6 bg-cyan-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Node Content */}
                        <div className="relative premium-card p-4 border-white/10 bg-white/[0.03] group-hover:border-cyan-500/50 group-hover:bg-cyan-500/10 transition-all duration-300 min-w-[140px] text-center">
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 text-2xl group-hover:scale-110 transition-transform text-white shadow-inner">
                                {node.profile.gender === 'male' ? '👤' : '👸'}
                            </div>
                            <h4 className="text-[10px] font-black text-white italic tracking-tighter uppercase mb-1">{node.profile.name}</h4>
                            <div className="flex items-center justify-center gap-2">
                                <p className="text-[7px] text-slate-500 font-black tracking-widest uppercase">{node.profile.relationship}</p>
                                <div className={`text-[9px] font-black italic ${node.analysis && node.analysis.score >= 80 ? 'text-cyan-400' : node.analysis && node.analysis.score >= 50 ? 'text-yellow-400' : 'text-slate-600'}`}>
                                    {node.analysis?.score}%
                                </div>
                            </div>
                        </div>

                        {/* Interactive Tooltip / Label */}
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            <span className="text-[7px] font-black text-cyan-400 uppercase tracking-[0.3em]">인연의 주파수 확인</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Central Origin Node */}
            <motion.div
                className="relative z-10"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
                {/* Core Reactor Glow */}
                <div className="absolute -inset-20 bg-cyan-500/10 blur-[60px] animate-pulse" />
                <div className="absolute -inset-10 bg-cyan-400/5 border border-cyan-400/10 rounded-full animate-[spin_10s_linear_infinite]" />

                <div className="relative premium-card p-10 border-cyan-500/40 bg-cyan-950/10 shadow-[0_0_50px_rgba(34,211,238,0.15)] text-center min-w-[200px]">
                    <div className="premium-card-border" />
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 mx-auto mb-6 flex items-center justify-center shadow-2xl overflow-hidden relative">
                        <div className="absolute inset-0 bg-cyan-400/20 animate-pulse" />
                        <span className="text-5xl relative z-10">👑</span>
                    </div>
                    <h2 className="text-2xl font-black text-white italic tracking-tighter mb-2 uppercase">{mainProfile.name}</h2>
                    <div className="inline-flex px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-[8px] font-black text-cyan-400 uppercase tracking-[0.2em]">
                        본연의 명식 (Origin)
                    </div>

                    {/* Status Info */}
                    <div className="mt-6 pt-6 border-t border-white/5 flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">인연의 고리 활성화됨</span>
                        </div>
                        <span className="text-[10px] font-black text-white italic">{relationships.length}개의 운명 노드 감지됨</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
