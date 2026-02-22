"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface LoadingGlitchProps {
    onComplete?: () => void;
}

export default function LoadingGlitch({ onComplete }: LoadingGlitchProps) {
    const [progress, setProgress] = useState(0);

    // Simulate loading progress
    useState(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => onComplete?.(), 500);
                    return 100;
                }
                return prev + Math.random() * 30;
            });
        }, 200);

        return () => clearInterval(interval);
    });

    const glitchTexts = [
        "EXTRACTING SOUL DATA...",
        "EXT̴RACT̶ING S̵OUL̷ D̸ATA...",
        "EXTRACTING SOUL DATA...",
        "E̷X̸T̴R̵A̶C̴T̷I̵N̸G̴ ̶S̷O̴U̸L̵ ̸D̶A̵T̷A̸.̴.̷.",
    ];

    const [textIndex, setTextIndex] = useState(0);

    useState(() => {
        const interval = setInterval(() => {
            setTextIndex((prev) => (prev + 1) % glitchTexts.length);
        }, 150);
        return () => clearInterval(interval);
    });

    return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            {/* Scanlines Effect */}
            <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                    background:
                        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.3) 2px, rgba(0, 255, 255, 0.3) 4px)",
                }}
            ></div>

            {/* RGB Split Background */}
            <motion.div
                className="absolute inset-0"
                animate={{
                    background: [
                        "radial-gradient(circle, rgba(255,0,0,0.1) 0%, rgba(0,0,0,1) 100%)",
                        "radial-gradient(circle, rgba(0,255,0,0.1) 0%, rgba(0,0,0,1) 100%)",
                        "radial-gradient(circle, rgba(0,0,255,0.1) 0%, rgba(0,0,0,1) 100%)",
                    ],
                }}
                transition={{ duration: 0.3, repeat: Infinity }}
            />

            <div className="relative z-10 text-center">
                {/* Glitch Text */}
                <motion.div
                    className="text-4xl font-bold mb-8 font-mono"
                    style={{
                        color: "#00ffff",
                        textShadow:
                            "0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 30px #ff00ff, 2px 2px 0 #ff0000, -2px -2px 0 #00ff00",
                    }}
                    animate={{
                        x: [-2, 2, -2, 2, 0],
                        y: [0, -1, 1, -1, 0],
                    }}
                    transition={{ duration: 0.2, repeat: Infinity }}
                >
                    {glitchTexts[textIndex]}
                </motion.div>

                {/* Progress Bar */}
                <div className="w-80 h-4 bg-slate-900 border-2 border-cyan-500 rounded-full overflow-hidden mb-4">
                    <motion.div
                        className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500"
                        style={{
                            width: `${Math.min(progress, 100)}%`,
                            boxShadow: "0 0 20px rgba(0, 255, 255, 0.8)",
                        }}
                        initial={{ width: "0%" }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>

                {/* Percentage */}
                <div className="text-cyan-400 font-mono text-xl">
                    {Math.floor(Math.min(progress, 100))}%
                </div>

                {/* Pulsing Circle */}
                <motion.div
                    className="mt-8 w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-pink-500 to-cyan-500"
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: 360,
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    style={{
                        boxShadow: "0 0 40px rgba(255, 105, 180, 0.8)",
                    }}
                />

                {/* Additional Glitch Elements */}
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-30 pointer-events-none"
                    animate={{
                        clipPath: [
                            "inset(0 0 0 0)",
                            "inset(20% 0 20% 0)",
                            "inset(0 0 0 0)",
                            "inset(40% 0 0 0)",
                            "inset(0 0 0 0)",
                        ],
                    }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                >
                    <div className="text-4xl font-bold font-mono text-cyan-500 blur-sm">
                        {glitchTexts[0]}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
