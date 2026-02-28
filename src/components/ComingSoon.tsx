"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ComingSoon({ title, desc }: { title: string, desc?: string }) {
    const router = useRouter();

    return (
        <main className="min-h-[80dvh] flex flex-col items-center justify-center px-6 py-20 bg-background">
            <div className="max-w-md w-full bg-surface p-12 text-center space-y-8 rounded-5xl border border-border-color shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/20 rounded-full blur-3xl" />

                {/* 아이콘 */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring" }}
                    className="w-24 h-24 mx-auto rounded-3xl bg-secondary/10 border border-secondary/20 flex items-center justify-center relative z-10"
                >
                    <Clock className="w-12 h-12 text-secondary" />
                </motion.div>

                {/* 텍스트 */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4 relative z-10"
                >
                    <h1 className="text-4xl font-black text-foreground italic tracking-tighter uppercase">
                        {title}
                    </h1>
                    <p className="text-secondary text-lg font-medium leading-relaxed">
                        {desc || "이 기능은 현재 개발 중입니다.\n더 좋은 서비스로 곧 찾아뵙겠습니다."}
                    </p>
                </motion.div>

                {/* 돌아가기 버튼 */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="pt-6 relative z-10"
                >
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-3 px-10 py-5 bg-background border border-border-color rounded-2xl transition-all shadow-sm hover:shadow-xl hover:text-foreground text-secondary font-bold text-lg"
                    >
                        <ArrowLeft className="w-6 h-6" />
                        돌아가기
                    </button>
                </motion.div>
            </div>
        </main>
    );
}
