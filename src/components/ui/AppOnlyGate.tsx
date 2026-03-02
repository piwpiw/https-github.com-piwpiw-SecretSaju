"use client";

import { useState } from "react";
import { Smartphone } from "lucide-react";
import AppOnlyModal from "./AppOnlyModal";

export default function AppOnlyGate({ children, title = "App Only Feature" }: { children: React.ReactNode, title?: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative group">
            <div className="blur-sm grayscale pointer-events-none transition-all group-hover:blur-md opacity-40">
                {children}
            </div>
            <div className="absolute inset-0 flex items-center justify-center p-8 bg-black/20 rounded-[2.5rem] backdrop-blur-sm border border-white/5 shadow-2xl scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 cursor-pointer" onClick={() => setIsOpen(true)}>
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto animate-bounce shadow-xl border border-amber-500/20">
                        <Smartphone className="w-8 h-8 text-amber-500" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white italic tracking-tighter uppercase mb-1">앱 전용 기능</h4>
                        <p className="text-[10px] text-slate-400 font-medium">점신 앱에서만 제공되는 프리미엄 기능입니다.</p>
                    </div>
                    <button className="px-6 py-2.5 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all">앱으로 보기</button>
                </div>
            </div>
            <AppOnlyModal isOpen={isOpen} onClose={() => setIsOpen(false)} title={title} />
        </div>
    );
}
