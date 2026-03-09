'use client';

import React, { useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { SajuProfile } from '@/lib/app/storage';
import { RelationshipAnalysis } from '@/lib/saju/compatibility';

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
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 20, stiffness: 100 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    const rotateX = useTransform(springY, [-400, 400], [5, -5]);
    const rotateY = useTransform(springX, [-400, 400], [-5, 5]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        mouseX.set(e.clientX - rect.left - centerX);
        mouseY.set(e.clientY - rect.top - centerY);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    const nodes = useMemo(() => {
        const radius = 240; // Desktop radius

        return relationships.map((rel, i) => {
            const initialAngle = (i / relationships.length) * 2 * Math.PI - Math.PI / 2;
            return {
                ...rel,
                initialAngle,
                radius
            };
        });
    }, [relationships]);

    return (
        <motion.div
            className="relative w-full aspect-square max-w-4xl mx-auto flex items-center justify-center py-20 cursor-crosshair overflow-visible perspective-1000"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY }}
        >
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.08)_0%,transparent_70%)]" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27360%27 height=%27360%27 viewBox=%270 0 360 360%27%3E%3Cdefs%3E%3Cpattern id=%27p%27 x=%270%27 y=%270%27 width=%2712%25%27 height=%2712%25%27 patternUnits=%27userSpaceOnUse%27%3E%3Ccircle cx=%277%27 cy=%277%27 r=%271%27 fill=%27%23ffffff%27 fill-opacity=%270.12%27/%3E%3Ccircle cx=%27360%27 cy=%27360%27 r=%271%27 fill=%27%23ffffff%27 fill-opacity=%270.08%27/%3E%3Cline x1=%270%27 y1=%27360%27 x2=%27360%27 y2=%270%27 stroke=%27%23ffffff%27 stroke-opacity=%270.08%27 stroke-width=%271%27/%3E%3C/pattern%3E%3C/defs%3E%3Crect x=%270%27 y=%270%27 width=%27360%27 height=%27360%27 fill=%27url(%23p)%27/%3E%3C/svg%3E')] opacity-10 pointer-events-none" />

            {/* Orbiting SVG Layer */}
            <motion.svg
                className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                viewBox="-400 -400 800 800"
                animate={{ rotate: 360 }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            >
                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(34,211,238,0.3)" />
                        <stop offset="50%" stopColor="rgba(34,211,238,0.8)" />
                        <stop offset="100%" stopColor="rgba(34,211,238,0.3)" />
                    </linearGradient>

                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {nodes.map((node, i) => {
                    const x = Math.cos(node.initialAngle) * node.radius;
                    const y = Math.sin(node.initialAngle) * node.radius;

                    return (
                        <g key={`line-${node.profile.id}`}>
                            {/* Static Path */}
                            <motion.line
                                x1="0"
                                y1="0"
                                x2={x}
                                y2={y}
                                stroke="rgba(34,211,238,0.2)"
                                strokeWidth="1"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1.5, delay: i * 0.1 }}
                            />

                            {/* Data Flow Highlighting */}
                            <motion.line
                                x1="0"
                                y1="0"
                                x2={x}
                                y2={y}
                                stroke="url(#lineGradient)"
                                strokeWidth="2"
                                strokeDasharray="5 30"
                                filter="url(#glow)"
                                animate={{
                                    strokeDashoffset: [0, -100],
                                    opacity: [0.1, 0.4, 0.1]
                                }}
                                transition={{
                                    strokeDashoffset: { duration: 4, repeat: Infinity, ease: "linear" },
                                    opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                                }}
                            />
                        </g>
                    );
                })}
            </motion.svg>

            {/* Orbiting Interaction Layer */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            >
                {nodes.map((node, i) => {
                    const x = Math.cos(node.initialAngle) * node.radius;
                    const y = Math.sin(node.initialAngle) * node.radius;

                    return (
                        <motion.div
                            key={node.profile.id}
                            className="absolute pointer-events-auto cursor-pointer group min-h-[44px] min-w-[44px]"
                            style={{ x, y }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 80,
                                damping: 15,
                                delay: 0.5 + i * 0.1
                            }}
                            onClick={() => onNodeClick(node.profile.id)}
                        >
                            {/* Compensate Rotation for Content */}
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                            >
                                {/* Node Glow */}
                                <div className="absolute -inset-8 bg-cyan-500/0 group-hover:bg-cyan-500/10 rounded-full blur-2xl transition-all duration-500 scale-50 group-hover:scale-100" />

                                {/* Micro-Interactions */}
                                <motion.div
                                    className="relative premium-card p-4 border-white/10 bg-black/40 backdrop-blur-md group-hover:border-cyan-500/40 group-hover:bg-cyan-950/20 transition-all duration-500 min-w-[150px] text-center"
                                    whileHover={{ scale: 1.1, y: -5 }}
                                    whileFocus={{ scale: 1.1, y: -5 }}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`${node.profile.name} 상세 보기`}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            onNodeClick(node.profile.id);
                                        }
                                    }}
                                    onClick={() => onNodeClick(node.profile.id)}
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-3xl group-hover:scale-110 transition-transform text-white shadow-2xl relative overflow-hidden">
                                        <div className="absolute inset-0 bg-cyan-400/5 group-hover:bg-cyan-400/20 transition-colors" />
                                        {node.profile.gender === 'male' ? '남성' : '여성'}
                                    </div>
                                    <h4 className="text-[11px] sm:text-[10px] font-black text-white italic tracking-tighter uppercase mb-1">{node.profile.name}</h4>
                                    <div className="flex items-center justify-center gap-2">
                                        <p className="text-[10px] sm:text-[8px] text-slate-500 font-black tracking-widest uppercase">{node.profile.relationship}</p>
                                        <div className={`text-[10px] font-black italic drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] ${node.analysis && node.analysis.score >= 80 ? 'text-cyan-400' : node.analysis && node.analysis.score >= 50 ? 'text-yellow-400' : 'text-slate-600'}`}>
                                            {node.analysis?.score}%
                                        </div>
                                    </div>

                                    {/* Action Label */}
                                    <motion.div
                                        className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 scale-50 group-hover:opacity-100 group-focus-within:opacity-100 group-hover:scale-100 group-focus-within:scale-100 transition-all duration-300 group-hover:-translate-y-0.5"
                                        animate={{ y: 0 }}
                                    >
                                        <div className="px-3 py-1 bg-cyan-500 text-black text-[8px] font-black rounded-full uppercase tracking-widest shadow-lg italic">
                                            상세 보기
                                        </div>
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Central Origin Node (Black Hole / Essence) */}
            <motion.div
                className="relative z-20 pointer-events-none"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 150, damping: 25 }}
            >
                {/* Visual Layers */}
                <div className="absolute -inset-24 bg-cyan-500/5 blur-[80px] animate-pulse" />
                <div className="absolute -inset-16 bg-cyan-400/5 border border-cyan-400/10 rounded-full animate-[spin_20s_linear_infinite]" />
                <div className="absolute -inset-10 bg-black/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl" />

                <div className="relative p-10 text-center min-w-[220px]">
                    <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-cyan-400/10 to-indigo-600/10 border border-cyan-500/20 mx-auto mb-6 flex items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.2)] overflow-hidden relative">
                        <div className="absolute inset-0 bg-cyan-400/20 animate-pulse" />
                        <motion.div
                            className="absolute -inset-2 border border-cyan-400/30 rounded-full border-dashed"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        />
                        <span className="text-6xl relative z-10 drop-shadow-2xl">⚷</span>
                    </div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter mb-2 uppercase">{mainProfile.name}</h2>
                    <div className="inline-flex px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[9px] font-black text-cyan-400 uppercase tracking-[0.3em] italic">
                        The Primary Source
                    </div>

                    {/* Dynamic Status Markers */}
                    <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-2">
                        <motion.div
                            className="flex items-center gap-2"
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)]" />
                            <span className="text-[9px] font-black text-cyan-300 uppercase tracking-widest">실시간 연결 상태</span>
                        </motion.div>
                        <span className="text-[11px] font-black text-slate-500 italic uppercase">{relationships.length} NODE CONNECTED</span>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}






