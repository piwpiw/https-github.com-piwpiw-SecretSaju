"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";

interface LuxuryToastProps {
    message: string;
    isVisible: boolean;
    onClose?: () => void;
}

export default function LuxuryToast({ message, isVisible, onClose }: LuxuryToastProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_10px_40px_rgba(168,85,247,0.3)] flex items-center gap-3"
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 flex items-center justify-center shadow-inner">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-bold tracking-wide">{message}</span>
                    <Sparkles className="w-4 h-4 text-purple-400 ml-2 animate-pulse" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
