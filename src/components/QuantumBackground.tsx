"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function QuantumBackground() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.15] mix-blend-overlay" />

            {/* Animated Light Beams */}
            <div className="absolute inset-0">
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute h-px w-full bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"
                        initial={{ top: `${(i + 1) * 25}%`, left: "-100%" }}
                        animate={{ left: "100%" }}
                        transition={{
                            duration: 10 + i * 5,
                            repeat: Infinity,
                            ease: "linear",
                            delay: i * 2,
                        }}
                    />
                ))}
            </div>

            {/* Radial Voids */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full" />

            {/* Quantum Particles */}
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white/10 rounded-full"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        opacity: [0.1, 0.4, 0.1],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: 4 + Math.random() * 4,
                        repeat: Infinity,
                        delay: Math.random() * 5,
                    }}
                />
            ))}

            {/* Noise Texture */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-soft-light pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        </div>
    );
}
