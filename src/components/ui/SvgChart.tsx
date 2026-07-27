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
    value: number; // 0 ~ maxValue (기본 100)
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
    /**
     * 바깥 링이 나타내는 값. 기본 100.
     *
     * 오행처럼 **각 축의 합이 100%로 고정된 구성비**를 그릴 때는 100을 쓰면 안 됩니다.
     * 5개 축의 평균이 20%라서 어떤 사주든 도형이 반지름의 20% 언저리에만 그려져
     * "내 밸런스가 유난히 작다"는 잘못된 인상을 줍니다. 이런 데이터는 균형점(20%)의
     * 2배인 40 정도를 최대치로 주는 편이 실제 분포를 제대로 보여줍니다.
     */
    maxValue?: number;
    /** 균형 기준선(점선 링)으로 표시할 값. 오행이면 20(=100/5). */
    baselineValue?: number;
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
    values: number[],
    maxR: number,
    maxValue: number
) {
    return values
        .map((v, i) => {
            const angle = (360 / n) * i;
            const ratio = maxValue > 0 ? Math.min(1, v / maxValue) : 0;
            const dist = maxR * ratio;
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
    maxValue = 100,
    baselineValue,
}: SvgChartProps) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-40px" });
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const n = data.length;
    const cx = size / 2;
    const cy = size / 2;
    const maxR = size * 0.38;
    const safeMax = maxValue > 0 ? maxValue : 100;
    // 링 눈금은 최대치를 4등분해 실제 값 범위에 맞춘다.
    const steps = [0.25, 0.5, 0.75, 1].map((f) => Math.round(safeMax * f));

    const dataPoints = buildPolygonPoints(
        cx, cy, maxR, n,
        data.map((d) => d.value),
        maxR,
        safeMax
    );

    const shouldAnimate = mounted && inView;
    const chartSummary = data.map((item) => `${item.label} ${item.value}`).join(", ");

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
                    role="img"
                    aria-label={title ? `${title}: ${chartSummary}` : chartSummary}
                >
                    {/* ── 배경 그리드 링 ── */}
                    {steps.map((step, si) => {
                        const r = maxR * (step / safeMax);
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

                    {/* ── 균형 기준선 ── 모든 축이 같은 값일 때의 도형.
                        이 링보다 바깥으로 나온 축이 "강한 기운"이다. */}
                    {typeof baselineValue === "number" && baselineValue > 0 && (
                        <motion.polygon
                            points={Array.from({ length: n })
                                .map((_, i) => {
                                    const angle = (360 / n) * i;
                                    const pt = polarToCartesian(
                                        cx, cy,
                                        maxR * Math.min(1, baselineValue / safeMax),
                                        angle,
                                    );
                                    return `${pt.x},${pt.y}`;
                                })
                                .join(" ")}
                            fill="none"
                            stroke="rgba(255,255,255,0.28)"
                            strokeWidth={1}
                            strokeDasharray="4 4"
                            initial={{ opacity: 0 }}
                            animate={shouldAnimate ? { opacity: 1 } : {}}
                            transition={{ duration: 0.4, delay: animDelay + 0.3 }}
                        />
                    )}

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
                        const pt = polarToCartesian(cx, cy, maxR * Math.min(1, d.value / safeMax), angle);
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
                        const pt = polarToCartesian(cx, cy, maxR * Math.min(1, d.value / safeMax) + 14, angle);
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
