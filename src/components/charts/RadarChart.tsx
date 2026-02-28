"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface RadarChartProps {
    dataA: Record<string, number>;
    dataB?: Record<string, number>;
    labels?: string[];
    maxVal?: number;
    size?: number;
}

const ELEMENTS = ['목', '화', '토', '금', '수'];

export default function RadarChart({
    dataA,
    dataB,
    labels = ELEMENTS,
    maxVal = 20, // Typical max score for an element in Saju
    size = 300
}: RadarChartProps) {
    const center = size / 2;
    const radius = (size / 2) * 0.8;
    const angleStep = (Math.PI * 2) / labels.length;

    const getCoordinates = (index: number, value: number) => {
        const angle = index * angleStep - Math.PI / 2;
        const normalizedValue = Math.min(value, maxVal) / maxVal;
        const x = center + radius * normalizedValue * Math.cos(angle);
        const y = center + radius * normalizedValue * Math.sin(angle);
        return { x, y };
    };

    const getPathData = (data: Record<string, number>) => {
        return labels.map((label, i) => {
            const { x, y } = getCoordinates(i, data[label] || 0);
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ') + ' Z';
    };

    // Grid lines
    const gridLevels = [0.25, 0.5, 0.75, 1];

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible drop-shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                <defs>
                    <linearGradient id="gradA" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#facc15" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.4" />
                    </linearGradient>
                    <linearGradient id="gradB" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#818cf8" stopOpacity="0.4" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Background Grids */}
                {gridLevels.map((level, i) => (
                    <motion.polygon
                        key={i}
                        points={labels.map((_, j) => {
                            const angle = j * angleStep - Math.PI / 2;
                            const x = center + radius * level * Math.cos(angle);
                            const y = center + radius * level * Math.sin(angle);
                            return `${x},${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="white"
                        strokeOpacity={0.05 + (i * 0.03)}
                        strokeWidth="1"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2, delay: i * 0.3, ease: "easeInOut" }}
                    />
                ))}

                {/* Axis Lines */}
                {labels.map((_, i) => {
                    const angle = i * angleStep - Math.PI / 2;
                    const x = center + radius * Math.cos(angle);
                    const y = center + radius * Math.sin(angle);
                    return (
                        <motion.line
                            key={`axis-${i}`}
                            x1={center}
                            y1={center}
                            x2={x}
                            y2={y}
                            stroke="white"
                            strokeOpacity="0.1"
                            strokeWidth="1"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                        />
                    );
                })}

                {/* Data B (Opponent) - Layered behind for better depth */}
                {dataB && (
                    <motion.path
                        initial={{
                            d: labels.map((_, i) => `${i === 0 ? 'M' : 'L'} ${center} ${center}`).join(' ') + ' Z',
                            opacity: 0
                        }}
                        animate={{
                            d: getPathData(dataB),
                            opacity: 1
                        }}
                        transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1], delay: 1 }}
                        fill="url(#gradB)"
                        stroke="#22d3ee"
                        strokeWidth="3"
                        strokeLinejoin="round"
                        filter="url(#glow)"
                        className="drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                    />
                )}

                {/* Data A (Main) */}
                <motion.path
                    initial={{
                        d: labels.map((_, i) => `${i === 0 ? 'M' : 'L'} ${center} ${center}`).join(' ') + ' Z',
                        opacity: 0
                    }}
                    animate={{
                        d: getPathData(dataA),
                        opacity: 1
                    }}
                    transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                    fill="url(#gradA)"
                    stroke="#facc15"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    filter="url(#glow)"
                    className="drop-shadow-[0_0_15px_rgba(250,204,21,0.3)]"
                />

                {/* Labels */}
                {labels.map((label, i) => {
                    const angle = i * angleStep - Math.PI / 2;
                    const x = center + (radius + 28) * Math.cos(angle);
                    const y = center + (radius + 28) * Math.sin(angle);
                    return (
                        <motion.text
                            key={i}
                            x={x}
                            y={y}
                            fill="white"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 0.6, scale: 1 }}
                            transition={{ delay: 1.5 + i * 0.1 }}
                            className="text-[10px] font-black tracking-widest uppercase"
                            textAnchor="middle"
                            alignmentBaseline="middle"
                        >
                            {label}
                        </motion.text>
                    );
                })}
            </svg>
        </div>
    );
}
