"use client";

import { X, Smartphone, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

export default function AppDownloadBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        let isDismissed = false;

        try {
            isDismissed = sessionStorage.getItem("app_banner_dismissed") === "true";
        } catch {
            isDismissed = false;
        }

        if (isMobile && !isDismissed) {
            setIsVisible(true);
        }
    }, []);

    if (!isVisible) return null;

    return (
        <div className="bg-amber-500 text-black px-3 py-2 flex items-start sm:items-center justify-between gap-2 text-xs sm:text-[11px] font-bold relative z-[100] animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-2 min-w-0">
                <Smartphone className="w-4 h-4 flex-shrink-0" />
                <span className="leading-tight">모바일에서 더 편하게 사주 결과를 확인하세요</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <button
                    onClick={() => window.open("https://example.com/app", "_blank")}
                    className="bg-black text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-black/80 transition-colors"
                >
                    앱으로 이동
                    <ArrowRight className="w-3 h-3" />
                </button>
                <button
                    onClick={() => {
                        setIsVisible(false);
                        try {
                            sessionStorage.setItem("app_banner_dismissed", "true");
                        } catch {
                            // Ignore sessionStorage errors in restricted environments.
                        }
                    }}
                    className="hover:scale-110 transition-transform"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
