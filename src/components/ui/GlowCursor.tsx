"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export default function GlowCursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Smooth lagging effect for the glow
    const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
    const cursorX = useSpring(0, springConfig);
    const cursorY = useSpring(0, springConfig);

    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
            cursorX.set(e.clientX - 150); // Offset by half the size
            cursorY.set(e.clientY - 150);
            setIsVisible(true);
        };

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        // Interactive element detection
        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (
                target.tagName.toLowerCase() === 'a' ||
                target.tagName.toLowerCase() === 'button' ||
                target.closest('a') ||
                target.closest('button') ||
                target.classList.contains('interactive')
            ) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener("mousemove", updateMousePosition);
        window.addEventListener("mouseleave", handleMouseLeave);
        window.addEventListener("mouseenter", handleMouseEnter);
        window.addEventListener("mouseover", handleMouseOver);

        return () => {
            window.removeEventListener("mousemove", updateMousePosition);
            window.removeEventListener("mouseleave", handleMouseLeave);
            window.removeEventListener("mouseenter", handleMouseEnter);
            window.removeEventListener("mouseover", handleMouseOver);
        };
    }, [cursorX, cursorY]);

    if (typeof window === "undefined") return null;

    return (
        <>
            {/* Soft Ambient Glow (Lags behind cursor) */}
            <motion.div
                className="fixed top-0 left-0 w-[300px] h-[300px] rounded-full pointer-events-none z-0 mix-blend-screen opacity-30"
                style={{
                    x: cursorX,
                    y: cursorY,
                    background: `radial-gradient(circle, ${isHovering ? 'rgba(56,189,248,0.4)' : 'rgba(168,85,247,0.3)'} 0%, rgba(0,0,0,0) 70%)`,
                    display: isVisible ? "block" : "none"
                }}
                animate={{
                    scale: isHovering ? 1.5 : 1,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />

            {/* Tiny Core Dot (Exact cursor position) */}
            <motion.div
                className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:block shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                animate={{
                    x: mousePosition.x - 4,
                    y: mousePosition.y - 4,
                    scale: isHovering ? 3 : 1,
                    opacity: isVisible ? 1 : 0
                }}
                transition={{ type: "spring", stiffness: 800, damping: 20, mass: 0.1 }}
            />
        </>
    );
}
