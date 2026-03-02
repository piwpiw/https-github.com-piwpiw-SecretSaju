"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface RadarChartProps {
    dataA: Record<string, number>;
    dataB?: Record<string, number>;
    labels?: string[];
    maxVal?: number;
    size?: number;
    title?: string;
    accentA?: string;
    accentB?: string;
}

const ELEMENTS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
const CHART_TOKENS = {
    backgroundGrid: 'rgba(148, 163, 184, 0.24)',
    backgroundAxis: 'rgba(148, 163, 184, 0.42)',
    textPrimary: '#e2e8f0',
    textSecondary: '#cbd5e1',
};

export default function RadarChart({
    dataA,
    dataB,
    labels = ELEMENTS,
    maxVal = 20, // Typical max score for an element in Saju
    size = 300,
    title,
    accentA = '#fac115',
    accentB = '#2dd4bf'
}: RadarChartProps) {
    const center = size / 2;
    const radius = (size / 2) * 0.8;
    const angleStep = (Math.PI * 2) / labels.length;
    const [pointerActive, setPointerActive] = React.useState(false);
    const pointerRaf = React.useRef<number | null>(null);
    const lastPointerAt = React.useRef(0);

    const handlePointerMove = () => {
        const now = Date.now();
        if (now - lastPointerAt.current < 60) return;
        lastPointerAt.current = now;
        if (pointerRaf.current !== null) return;
        pointerRaf.current = requestAnimationFrame(() => {
            pointerRaf.current = null;
            setPointerActive(true);
            window.setTimeout(() => setPointerActive(false), 120);
        });
    };

    const handlePointerLeave = () => {
        setPointerActive(false);
    };

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
            <motion.svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="overflow-visible drop-shadow-[0_0_30px_rgba(255,255,255,0.05)] cursor-pointer"
                style={{ touchAction: "manipulation", pointerEvents: "all" }}
                whileHover={pointerActive ? { scale: 1.02 } : undefined}
                whileTap={pointerActive ? { scale: 0.99 } : undefined}
                transition={{ duration: 0.2 }}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
            >
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
                        stroke={CHART_TOKENS.backgroundGrid}
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
                            stroke={CHART_TOKENS.backgroundAxis}
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
                            fill={i % 2 === 0 ? CHART_TOKENS.textPrimary : CHART_TOKENS.textSecondary}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 0.6, scale: 1 }}
                            transition={{ delay: 1.5 + i * 0.1 }}
                            className="text-[11px] sm:text-[12px] font-semibold tracking-[0.2em] uppercase"
                            textAnchor="middle"
                            alignmentBaseline="middle"
                        >
                            {label}
                        </motion.text>
                    );
                })}
            </motion.svg>
        </div>
    );
}
