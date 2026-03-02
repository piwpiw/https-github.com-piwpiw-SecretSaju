"use client";

/**
 * T2/T6 — FE-003
 * ScrollReveal: framer-motion 기반 스크롤 & 마우스 오버 인터랙티브 UI 고도화 컴포넌트
 * 
 * 포함 컴포넌트:
 * - ScrollReveal: 뷰포트 진입 시 슬라이드/페이드 애니메이션
 * - HoverGlowCard: 마우스 추적 글로우 카드
 * - ParallaxLayer: 스크롤 패럴랙스 레이어
 * - MagneticButton: 마그네틱 버튼 효과
 */

import {
    motion,
    useInView,
    useMotionValue,
    useSpring,
    useTransform,
    useScroll,
    type Variants,
} from "framer-motion";
import {
    useRef,
    useEffect,
    useState,
    ReactNode,
    MouseEventHandler,
} from "react";

// ═══════════════════════════════════════
// 1. ScrollReveal — 스크롤 진입 애니메이션
// ═══════════════════════════════════════

export type RevealDirection = "up" | "down" | "left" | "right" | "scale" | "fade";

interface ScrollRevealProps {
    children: ReactNode;
    direction?: RevealDirection;
    delay?: number;
    duration?: number;
    className?: string;
    /** 한 번만 실행 (기본 true) */
    once?: boolean;
    /** margin for IntersectionObserver */
    margin?: string;
}

type MotionTarget = Record<string, number | string | number[]>;

const REVEAL_VARIANTS: Record<RevealDirection, { initial: MotionTarget; animate: MotionTarget }> = {
    up: { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 } },
    down: { initial: { opacity: 0, y: -40 }, animate: { opacity: 1, y: 0 } },
    left: { initial: { opacity: 0, x: -40 }, animate: { opacity: 1, x: 0 } },
    right: { initial: { opacity: 0, x: 40 }, animate: { opacity: 1, x: 0 } },
    scale: { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 } },
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
};

export function ScrollReveal({
    children,
    direction = "up",
    delay = 0,
    duration = 0.6,
    className = "",
    once = true,
    margin = "-60px",
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once, margin: margin as any });
    const { initial, animate } = REVEAL_VARIANTS[direction];

    return (
        <motion.div
            ref={ref}
            initial={initial}
            animate={inView ? animate : initial}
            transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ═══════════════════════════════════════
// 2. HoverGlowCard — 마우스 추적 글로우
// ═══════════════════════════════════════

interface HoverGlowCardProps {
    children: ReactNode;
    className?: string;
    glowColor?: string;
    /** 기울기 강도 (기본 15deg) */
    tiltStrength?: number;
}

export function HoverGlowCard({
    children,
    className = "",
    glowColor = "rgba(168, 85, 247, 0.4)",
    tiltStrength = 15,
}: HoverGlowCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [glowPos, setGlowPos] = useState({ x: "50%", y: "50%" });
    const [isHovered, setIsHovered] = useState(false);

    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);
    const springX = useSpring(rotateX, { stiffness: 180, damping: 22 });
    const springY = useSpring(rotateY, { stiffness: 180, damping: 22 });

    const handleMouseMove: MouseEventHandler<HTMLDivElement> = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;

        rotateX.set(((y - cy) / cy) * -tiltStrength);
        rotateY.set(((x - cx) / cx) * tiltStrength);
        setGlowPos({ x: `${(x / rect.width) * 100}%`, y: `${(y / rect.height) * 100}%` });
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
        setIsHovered(false);
        rotateX.set(0);
        rotateY.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX: springX,
                rotateY: springY,
                transformStyle: "preserve-3d",
                perspective: 800,
            }}
            className={`relative overflow-hidden ${className}`}
        >
            {/* 글로우 레이어 */}
            <motion.div
                className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] transition-opacity duration-300"
                style={{
                    background: `radial-gradient(circle at ${glowPos.x} ${glowPos.y}, ${glowColor}, transparent 60%)`,
                    opacity: isHovered ? 1 : 0,
                }}
            />
            <div className="relative z-10">{children}</div>
        </motion.div>
    );
}

// ═══════════════════════════════════════
// 3. ParallaxLayer — 스크롤 패럴랙스
// ═══════════════════════════════════════

interface ParallaxLayerProps {
    children: ReactNode;
    /** 패럴랙스 속도 배수 (0.5 = 절반 속도, -0.5 = 역방향) */
    speed?: number;
    className?: string;
}

export function ParallaxLayer({
    children,
    speed = 0.3,
    className = "",
}: ParallaxLayerProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], [`${-speed * 100}px`, `${speed * 100}px`]);

    return (
        <motion.div ref={ref} style={{ y }} className={className}>
            {children}
        </motion.div>
    );
}

// ═══════════════════════════════════════
// 4. MagneticButton — 마그네틱 버튼
// ═══════════════════════════════════════

interface MagneticButtonProps {
    children: ReactNode;
    className?: string;
    strength?: number;
    onClick?: () => void;
}

export function MagneticButton({
    children,
    className = "",
    strength = 0.4,
    onClick,
}: MagneticButtonProps) {
    const ref = useRef<HTMLButtonElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 200, damping: 20 });
    const springY = useSpring(y, { stiffness: 200, damping: 20 });

    const handleMouseMove: MouseEventHandler<HTMLButtonElement> = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        x.set((e.clientX - cx) * strength);
        y.set((e.clientY - cy) * strength);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.button
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            style={{ x: springX, y: springY }}
            whileTap={{ scale: 0.96 }}
            className={className}
        >
            {children}
        </motion.button>
    );
}

// ═══════════════════════════════════════
// 5. CountUp — 숫자 카운트업 애니메이션
// ═══════════════════════════════════════

interface CountUpProps {
    from?: number;
    to: number;
    duration?: number;
    suffix?: string;
    prefix?: string;
    className?: string;
}

export function CountUp({
    from = 0,
    to,
    duration = 1.5,
    suffix = "",
    prefix = "",
    className = "",
}: CountUpProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });
    const [count, setCount] = useState(from);

    useEffect(() => {
        if (!inView) return;
        let startTime: number | null = null;
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
            const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart
            setCount(Math.round(from + (to - from) * eased));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [inView, from, to, duration]);

    return (
        <span ref={ref} className={className}>
            {prefix}{count.toLocaleString()}{suffix}
        </span>
    );
}

// ═══════════════════════════════════════
// 6. StaggerChildren — 자식 순차 등장
// ═══════════════════════════════════════

interface StaggerChildrenProps {
    children: ReactNode;
    stagger?: number;
    delay?: number;
    className?: string;
    direction?: RevealDirection;
}

export function StaggerChildren({
    children,
    stagger = 0.1,
    delay = 0,
    className = "",
    direction = "up",
}: StaggerChildrenProps) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-40px" });
    const { initial, animate } = REVEAL_VARIANTS[direction];

    const containerVariants: Variants = {
        hidden: {},
        show: {
            transition: {
                staggerChildren: stagger,
                delayChildren: delay,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: initial,
        show: { ...animate, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
    };

    return (
        <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            className={className}
        >
            {Array.isArray(children)
                ? children.map((child, i) => (
                    <motion.div key={i} variants={itemVariants}>
                        {child}
                    </motion.div>
                ))
                : <motion.div variants={itemVariants}>{children}</motion.div>}
        </motion.div>
    );
}
