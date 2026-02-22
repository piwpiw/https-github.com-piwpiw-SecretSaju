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
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
                {/* Background Grids */}
                {gridLevels.map((level, i) => (
                    <polygon
                        key={i}
                        points={labels.map((_, j) => {
                            const angle = j * angleStep - Math.PI / 2;
                            const x = center + radius * level * Math.cos(angle);
                            const y = center + radius * level * Math.sin(angle);
                            return `${x},${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="white"
                        strokeOpacity="0.1"
                        strokeWidth="1"
                    />
                ))}

                {/* Axis Lines */}
                {labels.map((_, i) => {
                    const angle = i * angleStep - Math.PI / 2;
                    const x = center + radius * Math.cos(angle);
                    const y = center + radius * Math.sin(angle);
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={x}
                            y2={y}
                            stroke="white"
                            strokeOpacity="0.1"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Labels */}
                {labels.map((label, i) => {
                    const angle = i * angleStep - Math.PI / 2;
                    const x = center + (radius + 20) * Math.cos(angle);
                    const y = center + (radius + 20) * Math.sin(angle);
                    return (
                        <text
                            key={i}
                            x={x}
                            y={y}
                            fill="white"
                            fontSize="14"
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            className="font-bold opacity-60"
                        >
                            {label}
                        </text>
                    );
                })}

                {/* Data A (Main) */}
                <motion.path
                    initial={{ d: labels.map((_, i) => `${i === 0 ? 'M' : 'L'} ${center} ${center}`).join(' ') + ' Z' }}
                    animate={{ d: getPathData(dataA) }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    fill="rgba(250, 204, 21, 0.3)" // Yellow-400
                    stroke="#facc15"
                    strokeWidth="3"
                />

                {/* Data B (Relationship) */}
                {dataB && (
                    <motion.path
                        initial={{ d: labels.map((_, i) => `${i === 0 ? 'M' : 'L'} ${center} ${center}`).join(' ') + ' Z' }}
                        animate={{ d: getPathData(dataB) }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                        fill="rgba(56, 189, 248, 0.3)" // Sky-400
                        stroke="#38bdf8"
                        strokeWidth="3"
                    />
                )}
            </svg>
        </div>
    );
}
