"use client";

/**
 * T2 — FE-001 / FE-002
 * StitchIcon: SVG Stitch 드로잉 아이콘
 * framer-motion pathLength로 선 그리기 애니메이션 적용
 * PNG/JPG 리소스를 동적 SVG 아이콘으로 전면 대체
 */

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type IconVariant =
    | "wood"         // 목(木) — 나뭇잎
    | "fire"         // 화(火) — 불꽃
    | "earth"        // 토(土) — 산
    | "metal"        // 금(金) — 동전/원
    | "water"        // 수(水) — 물결
    | "yin-yang"     // 음양
    | "star"         // 별
    | "moon"         // 달
    | "sun"          // 해
    | "dragon";      // 용 (천간 상징)

export interface StitchIconProps {
    variant: IconVariant;
    size?: number;
    color?: string;
    strokeWidth?: number;
    className?: string;
    /** 뷰포트 진입시 자동 재생 */
    triggerOnView?: boolean;
    /** 애니메이션 딜레이(초) */
    delay?: number;
    /** 반복 재생 여부 */
    loop?: boolean;
}

// ─────────────────────────────────────────────
// 기본 색상
// ─────────────────────────────────────────────
const VARIANT_COLORS: Record<IconVariant, string> = {
    wood: "#4ade80",
    fire: "#f87171",
    earth: "#fbbf24",
    metal: "#e2e8f0",
    water: "#60a5fa",
    "yin-yang": "#c084fc",
    star: "#fde68a",
    moon: "#bfdbfe",
    sun: "#fed7aa",
    dragon: "#f0abfc",
};

// ─────────────────────────────────────────────
// SVG 경로 정의 (viewBox 0 0 48 48)
// ─────────────────────────────────────────────
const ICON_PATHS: Record<IconVariant, string[]> = {
    // 목(木): 나뭇잎 + 줄기
    wood: [
        "M24 42 L24 22",
        "M24 22 C24 22 14 18 12 10 C12 10 20 12 24 22",
        "M24 22 C24 22 34 18 36 10 C36 10 28 12 24 22",
        "M24 30 C24 30 16 26 14 18",
        "M24 30 C24 30 32 26 34 18",
    ],
    // 화(火): 불꽃
    fire: [
        "M24 42 C24 42 10 32 12 20 C14 12 20 14 22 10 C18 18 26 16 24 8 C28 14 36 16 34 26 C32 36 24 42 24 42Z",
        "M24 34 C24 34 18 28 20 22 C22 18 26 20 24 16 C26 20 30 22 28 28 C26 34 24 34 24 34Z",
    ],
    // 토(土): 산 + 수평선
    earth: [
        "M6 36 L20 14 L34 36",
        "M14 36 L42 36",
        "M18 36 L24 24 L30 36",
    ],
    // 금(金): 동전(원 + 십자)
    metal: [
        "M24 8 A16 16 0 1 1 24 40 A16 16 0 1 1 24 8",
        "M24 14 L24 34",
        "M14 24 L34 24",
    ],
    // 수(水): 물결 3개
    water: [
        "M8 18 C12 14 16 22 20 18 C24 14 28 22 32 18 C36 14 40 20 42 18",
        "M8 26 C12 22 16 30 20 26 C24 22 28 30 32 26 C36 22 40 28 42 26",
        "M8 34 C12 30 16 38 20 34 C24 30 28 38 32 34 C36 30 40 36 42 34",
    ],
    // 음양
    "yin-yang": [
        "M24 8 A16 16 0 0 1 24 40 A8 8 0 0 0 24 24 A8 8 0 0 1 24 8Z",
        "M24 8 A16 16 0 0 0 24 40 A8 8 0 0 1 24 24 A8 8 0 0 0 24 8Z",
        "M24 16 m-2 0 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0",
        "M24 32 m-2 0 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0",
    ],
    // 별 (오각형)
    star: [
        "M24 6 L27.5 17 L39 17 L30 24 L33.5 35 L24 28 L14.5 35 L18 24 L9 17 L20.5 17Z",
    ],
    // 달 (초승달)
    moon: [
        "M18 10 A14 14 0 1 0 18 38 A10 10 0 1 1 18 10Z",
    ],
    // 해 (원 + 광선)
    sun: [
        "M24 14 A10 10 0 1 1 24 34 A10 10 0 1 1 24 14Z",
        "M24 6 L24 10", "M24 38 L24 42",
        "M6 24 L10 24", "M38 24 L42 24",
        "M10.7 10.7 L13.5 13.5", "M34.5 34.5 L37.3 37.3",
        "M37.3 10.7 L34.5 13.5", "M13.5 34.5 L10.7 37.3",
    ],
    // 용 (단순화)
    dragon: [
        "M10 36 C10 36 14 20 24 18 C34 16 38 26 36 36",
        "M20 14 C20 14 22 8 28 10 C28 10 26 14 24 18",
        "M24 18 L28 22 L24 24 L20 22Z",
        "M36 36 L40 32 M36 36 L38 40",
    ],
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function StitchIcon({
    variant,
    size = 48,
    color,
    strokeWidth = 2,
    className = "",
    triggerOnView = true,
    delay = 0,
    loop = false,
}: StitchIconProps) {
    const ref = useRef<SVGSVGElement>(null);
    const inView = useInView(ref, { once: !loop, margin: "-20px" });
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const strokeColor = color || VARIANT_COLORS[variant];
    const paths = ICON_PATHS[variant];
    const shouldPlay = mounted && (triggerOnView ? inView : true);

    return (
        <svg
            ref={ref}
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            className={`overflow-visible ${className}`}
            style={{ filter: `drop-shadow(0 0 8px ${strokeColor}66)` }}
            aria-label={`${variant} icon`}
            role="img"
        >
            {paths.map((d, i) => (
                <motion.path
                    key={`${variant}-path-${i}`}
                    d={d}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={
                        shouldPlay
                            ? { pathLength: 1, opacity: 1 }
                            : { pathLength: 0, opacity: 0 }
                    }
                    transition={{
                        pathLength: {
                            duration: 0.8 + i * 0.15,
                            delay: delay + i * 0.12,
                            ease: "easeInOut",
                        },
                        opacity: {
                            duration: 0.2,
                            delay: delay + i * 0.12,
                        },
                    }}
                />
            ))}
        </svg>
    );
}

// ─────────────────────────────────────────────
// 편의 컴포넌트: 오행 아이콘 세트
// ─────────────────────────────────────────────
export function FiveElementsIcons({
    size = 40,
    className = "",
}: {
    size?: number;
    className?: string;
}) {
    const elements: IconVariant[] = ["wood", "fire", "earth", "metal", "water"];
    const labels = ["목(木)", "화(火)", "토(土)", "금(金)", "수(水)"];

    return (
        <div className={`flex items-center gap-6 ${className}`}>
            {elements.map((variant, i) => (
                <motion.div
                    key={variant}
                    className="flex flex-col items-center gap-1.5"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                    <StitchIcon
                        variant={variant}
                        size={size}
                        delay={i * 0.15}
                    />
                    <span
                        className="text-[10px] font-semibold"
                        style={{ color: VARIANT_COLORS[variant] }}
                    >
                        {labels[i]}
                    </span>
                </motion.div>
            ))}
        </div>
    );
}
