"use client";

/**
 * T2 — FE-001 / FE-002
 * SvgChart: 오행(Five Elements) 및 십성(Sipsong) 레이더 차트
 * SVG Stitch 드로잉 애니메이션 + framer-motion pathLength 적용
 */

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface RadarDataPoint {
    label: string;
    value: number; // 0 ~ 100
    color?: string;
}

export interface SvgChartProps {
    data: RadarDataPoint[];
    size?: number;
    className?: string;
    /** 강조 색상 (기본: 보라) */
    accentColor?: string;
    /** 차트 제목 */
    title?: string;
    /** 애니메이션 딜레이(초) */
    animDelay?: number;
}

// ─────────────────────────────────────────────
// 오행 기본 색상 맵
// ─────────────────────────────────────────────
const ELEMENT_COLORS: Record<string, string> = {
    "목(木)": "#4ade80",
    "화(火)": "#f87171",
    "토(土)": "#fbbf24",
    "금(金)": "#e2e8f0",
    "수(水)": "#60a5fa",
};

// ─────────────────────────────────────────────
// 내부 유틸
// ─────────────────────────────────────────────
function toRadians(deg: number) {
    return (deg * Math.PI) / 180;
}

function polarToCartesian(
    cx: number,
    cy: number,
    r: number,
    angleDeg: number
) {
    const rad = toRadians(angleDeg - 90);
    return {
        x: cx + r * Math.cos(rad),
        y: cy + r * Math.sin(rad),
    };
}

function buildPolygonPoints(
    cx: number,
    cy: number,
    r: number,
    n: number,
    values: number[], // 0~100
    maxR: number
) {
    return values
        .map((v, i) => {
            const angle = (360 / n) * i;
            const dist = maxR * (v / 100);
            const pt = polarToCartesian(cx, cy, dist, angle);
            return `${pt.x},${pt.y}`;
        })
        .join(" ");
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function SvgChart({
    data,
    size = 240,
    className = "",
    accentColor = "#a855f7",
    title,
    animDelay = 0,
}: SvgChartProps) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-40px" });
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const n = data.length;
    const cx = size / 2;
    const cy = size / 2;
    const maxR = size * 0.38;
    const steps = [25, 50, 75, 100];

    const dataPoints = buildPolygonPoints(
        cx, cy, maxR, n,
        data.map((d) => d.value),
        maxR
    );

    const shouldAnimate = mounted && inView;

    return (
        <div ref={ref} className={`flex flex-col items-center gap-2 ${className}`}>
            {title && (
                <motion.p
                    className="text-xs font-semibold tracking-widest text-white/40 uppercase"
                    initial={{ opacity: 0, y: -6 }}
                    animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: animDelay }}
                >
                    {title}
                </motion.p>
            )}

            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="overflow-visible drop-shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                >
                    {/* ── 배경 그리드 링 ── */}
                    {steps.map((step, si) => {
                        const r = maxR * (step / 100);
                        const pts = Array.from({ length: n })
                            .map((_, i) => {
                                const angle = (360 / n) * i;
                                const pt = polarToCartesian(cx, cy, r, angle);
                                return `${pt.x},${pt.y}`;
                            })
                            .join(" ");
                        return (
                            <motion.polygon
                                key={`grid-${si}`}
                                points={pts}
                                fill="none"
                                stroke="rgba(255,255,255,0.06)"
                                strokeWidth={1}
                                initial={{ opacity: 0 }}
                                animate={shouldAnimate ? { opacity: 1 } : {}}
                                transition={{ duration: 0.4, delay: animDelay + si * 0.05 }}
                            />
                        );
                    })}

                    {/* ── 중심선(스포크) ── */}
                    {data.map((_, i) => {
                        const angle = (360 / n) * i;
                        const edge = polarToCartesian(cx, cy, maxR, angle);
                        return (
                            <motion.line
                                key={`spoke-${i}`}
                                x1={cx} y1={cy}
                                x2={edge.x} y2={edge.y}
                                stroke="rgba(255,255,255,0.07)"
                                strokeWidth={1}
                                strokeDasharray="3 4"
                                initial={{ opacity: 0 }}
                                animate={shouldAnimate ? { opacity: 1 } : {}}
                                transition={{ duration: 0.3, delay: animDelay + 0.2 }}
                            />
                        );
                    })}

                    {/* ── SVG Stitch 드로잉 — 데이터 폴리곤 ── */}
                    <motion.polygon
                        points={dataPoints}
                        fill={`${accentColor}22`}
                        stroke={accentColor}
                        strokeWidth={2}
                        strokeLinejoin="round"
                        /* pathLength 애니메이션은 polygon에서 strokeDasharray로 구현 */
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={
                            shouldAnimate
                                ? { opacity: 1, scale: 1 }
                                : {}
                        }
                        transition={{
                            duration: 1.2,
                            delay: animDelay + 0.4,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        style={{ transformOrigin: `${cx}px ${cy}px` }}
                    />

                    {/* ── 데이터 포인트 글로우 도트 ── */}
                    {data.map((d, i) => {
                        const angle = (360 / n) * i;
                        const pt = polarToCartesian(cx, cy, maxR * (d.value / 100), angle);
                        const color =
                            d.color || ELEMENT_COLORS[d.label] || accentColor;

                        return (
                            <motion.circle
                                key={`dot-${i}`}
                                cx={pt.x}
                                cy={pt.y}
                                r={5}
                                fill={color}
                                stroke="rgba(255,255,255,0.8)"
                                strokeWidth={1.5}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={shouldAnimate ? { scale: 1, opacity: 1 } : {}}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 18,
                                    delay: animDelay + 0.7 + i * 0.08,
                                }}
                                style={{ filter: `drop-shadow(0 0 6px ${color})` }}
                            />
                        );
                    })}

                    {/* ── 값 퍼센트 텍스트 ── */}
                    {data.map((d, i) => {
                        const angle = (360 / n) * i;
                        const pt = polarToCartesian(cx, cy, maxR * (d.value / 100) + 14, angle);
                        return (
                            <motion.text
                                key={`val-${i}`}
                                x={pt.x}
                                y={pt.y}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fill="rgba(255,255,255,0.55)"
                                fontSize={9}
                                fontWeight={600}
                                initial={{ opacity: 0 }}
                                animate={shouldAnimate ? { opacity: 1 } : {}}
                                transition={{ delay: animDelay + 1.2 + i * 0.05 }}
                            >
                                {d.value}
                            </motion.text>
                        );
                    })}
                </svg>

                {/* ── 레이블 (SVG 바깥, absolute 오버레이) ── */}
                {data.map((d, i) => {
                    const angle = (360 / n) * i;
                    const pt = polarToCartesian(cx, cy, maxR + 26, angle);
                    const color =
                        d.color || ELEMENT_COLORS[d.label] || "rgba(255,255,255,0.7)";

                    return (
                        <motion.div
                            key={`label-${i}`}
                            className="absolute text-[11px] font-bold pointer-events-none whitespace-nowrap"
                            style={{
                                left: pt.x,
                                top: pt.y,
                                transform: "translate(-50%, -50%)",
                                color,
                                textShadow: `0 0 10px ${color}`,
                            }}
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={shouldAnimate ? { opacity: 1, scale: 1 } : {}}
                            transition={{
                                duration: 0.4,
                                delay: animDelay + 0.9 + i * 0.07,
                            }}
                        >
                            {d.label}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
