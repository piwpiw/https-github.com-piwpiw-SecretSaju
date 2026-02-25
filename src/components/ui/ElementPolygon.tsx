"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ElementPolygonProps {
    scores: number[]; // [Wood, Fire, Earth, Metal, Water] from 0 to 100
    size?: number;
    className?: string;
}

export default function ElementPolygon({ scores, size = 200, className = "" }: ElementPolygonProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const center = size / 2;
    const radius = size * 0.4;
    const angleStep = (Math.PI * 2) / 5;

    // Calculate polygon points based on scores
    const getPoint = (score: number, index: number) => {
        // Start from top (Fire) and go clockwise: Fire, Earth, Metal, Water, Wood
        // Wait, traditional order is Wood, Fire, Earth, Metal, Water
        // We can map: 0: Wood (Top Right), 1: Fire (Top), 2: Earth (Bottom Right), 3: Metal (Bottom Left), 4: Water (Top Left)
        // Let's standard: 0: Wood, 1: Fire, 2: Earth, 3: Metal, 4: Water
        const angle = index * angleStep - Math.PI / 2;
        const distance = radius * (score / 100);
        return {
            x: center + Math.cos(angle) * distance,
            y: center + Math.sin(angle) * distance,
        };
    };

    const points = scores.map((score, i) => getPoint(score, i));
    const pointsString = points.map(p => `${p.x},${p.y}`).join(" ");

    if (!mounted) return null;

    return (
        <div className={`relative ${className}`} style={{ width: size, height: size }}>
            <svg width={size} height={size} className="drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                {/* Background Pentagon */}
                <polygon
                    points={
                        [100, 100, 100, 100, 100]
                            .map((s, i) => getPoint(s, i))
                            .map(p => `${p.x},${p.y}`).join(" ")
                    }
                    fill="rgba(255, 255, 255, 0.05)"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="1"
                />

                {/* Inner Guide Lines */}
                {[0, 1, 2, 3, 4].map(i => {
                    const edge = getPoint(100, i);
                    return (
                        <line
                            key={`guide-${i}`}
                            x1={center}
                            y1={center}
                            x2={edge.x}
                            y2={edge.y}
                            stroke="rgba(255, 255, 255, 0.1)"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                        />
                    );
                })}

                {/* Data Polygon with Stitch Effect */}
                <motion.polygon
                    points={pointsString}
                    fill="rgba(168, 85, 247, 0.2)"
                    stroke="rgba(168, 85, 247, 0.8)"
                    strokeWidth="2"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
                />

                {/* Data Points Glow */}
                {points.map((p, i) => (
                    <motion.circle
                        key={`point-${i}`}
                        cx={p.x}
                        cy={p.y}
                        r="4"
                        fill="#fff"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 1 + i * 0.1 }}
                        className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                    />
                ))}
            </svg>

            {/* Labels */}
            <div className="absolute inset-0 pointer-events-none">
                {["목(木)", "화(火)", "토(土)", "금(金)", "수(水)"].map((label, i) => {
                    const edge = getPoint(120, i); // Push labels outside
                    return (
                        <motion.div
                            key={`label-${i}`}
                            className="absolute text-xs font-bold text-white/70"
                            style={{
                                left: edge.x,
                                top: edge.y,
                                transform: "translate(-50%, -50%)"
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5 + i * 0.1 }}
                        >
                            {label}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
