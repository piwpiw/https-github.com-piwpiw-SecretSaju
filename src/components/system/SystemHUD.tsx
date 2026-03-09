"use client";

import { motion } from "framer-motion";
import { Cpu, Globe, Server } from "lucide-react";
import { useEffect, useState } from "react";

export default function SystemHUD() {
    const [systemTime, setSystemTime] = useState("");

    useEffect(() => {
        const timer = setInterval(() => {
            setSystemTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="fixed top-24 left-8 right-8 z-50 pointer-events-none hidden xl:flex justify-between items-start">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xl">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Core: Quantum-V4</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xl">
                    <Globe className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Node: Seoul_Central</span>
                </div>
            </div>
            <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xl">
                    <span className="text-[10px] font-black text-cyan-400 tracking-[0.2em] uppercase">{systemTime}</span>
                    <Server className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-12 h-1 bg-cyan-500/20 rounded-full overflow-hidden">
                        <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-1/2 h-full bg-cyan-400" />
                    </div>
                </div>
            </div>
        </div>
    );
}
