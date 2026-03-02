"use client";

import { X, Smartphone, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

export default function AppDownloadBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if it's mobile and not dismissed in this session
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const isDismissed = sessionStorage.getItem("app_banner_dismissed");

        if (isMobile && !isDismissed) {
            setIsVisible(true);
        }
    }, []);

    if (!isVisible) return null;

    return (
        <div className="bg-amber-500 text-black px-4 py-2 flex items-center justify-between text-xs font-bold relative z-[100] animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4" />
                <span>점신 앱으로 더욱 편하게 운세를 확인하세요!</span>
            </div>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => window.open("https://example.com/app", "_blank")}
                    className="bg-black text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-black/80 transition-colors"
                >
                    앱으로 보기 <ArrowRight className="w-3 h-3" />
                </button>
                <button
                    onClick={() => {
                        setIsVisible(false);
                        sessionStorage.setItem("app_banner_dismissed", "true");
                    }}
                    className="hover:scale-110 transition-transform"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
