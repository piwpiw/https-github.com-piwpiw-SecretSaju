"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone, Download, QrCode, Sparkles } from "lucide-react";

interface AppOnlyModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
}

export default function AppOnlyModal({ isOpen, onClose, title }: AppOnlyModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 z-[201] shadow-2xl overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20" />

                        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>

                        <div className="text-center space-y-6 relative z-10">
                            <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto border border-indigo-500/20 shadow-inner">
                                <Smartphone className="w-10 h-10 text-indigo-400" />
                            </div>

                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
                                    <Sparkles className="w-3 h-3" /> 앱 전용
                                </div>
                                <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2">
                                    [{title}]<br />앱에서만 이용 가능
                                </h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                    이 기능은 시크릿사주 앱 전용 프리미엄 서비스입니다.<br />앱스토어에서 다운로드 후 즉시 이용 가능합니다.
                                </p>
                            </div>

                            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 flex flex-col items-center gap-4">
                                <div className="bg-white p-2 rounded-xl shadow-lg">
                                    <QrCode className="w-24 h-24 text-slate-900" />
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">설치 QR 코드</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button className="flex items-center justify-center gap-2 py-4 bg-white text-slate-900 rounded-2xl text-xs font-black transition-all hover:bg-slate-200">
                                    <Download className="w-4 h-4" /> 앱스토어
                                </button>
                                <button className="flex items-center justify-center gap-2 py-4 bg-slate-800 text-white rounded-2xl text-xs font-black transition-all hover:bg-slate-700">
                                    <Download className="w-4 h-4" /> 플레이스토어
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
