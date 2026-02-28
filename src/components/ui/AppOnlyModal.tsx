"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lock, Smartphone, X } from "lucide-react";
import { useEffect } from "react";

interface AppOnlyModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
}

export function AppOnlyModal({ isOpen, onClose, title = "앱 전용 기능" }: AppOnlyModalProps) {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto border border-slate-100 dark:border-slate-800"
                        >
                            {/* Close Button */}
                            <div className="absolute top-4 right-4 z-10">
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Graphic/Icon Area */}
                            <div className="pt-10 pb-6 px-6 bg-gradient-to-b from-red-50 to-white dark:from-red-950/20 dark:to-slate-900 flex flex-col items-center">
                                <div className="relative mb-6">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20 rotate-3">
                                        <Smartphone className="w-10 h-10 text-white" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-md">
                                        <Lock className="w-4 h-4 text-white" />
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 text-center">
                                    이 메뉴는 앱에서만<br />보실 수 있어요!
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 text-center leading-relaxed px-4">
                                    선택하신 <span className="font-bold text-red-500">&apos;{title}&apos;</span> 기능은<br />더 빠른 모바일 앱 환경에서 제공됩니다.
                                </p>
                            </div>

                            {/* CTA Buttons */}
                            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-3">
                                <button
                                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-red-600/20 transition-all active:scale-[0.98]"
                                    onClick={() => {
                                        // TODO: Replace with actual App Store intent link
                                        alert("시크릿 사주 앱 다운로드 페이지로 이동합니다.");
                                        onClose();
                                    }}
                                >
                                    시크릿 사주 앱 무료로 설치하기
                                </button>
                                <button
                                    className="w-full py-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all"
                                    onClick={onClose}
                                >
                                    나중에 할게요
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
