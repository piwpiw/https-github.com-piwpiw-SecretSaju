import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Search, Languages, ArrowRight, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

function ResultSummaryCard({ title, body, tone }: { title: string; body: string; tone: string }) {
    return (
        <article className={`rounded-3xl border p-5 ${tone}`}>
            <h3 className="text-sm font-black tracking-[0.18em] uppercase">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-100">{body}</p>
        </article>
    );
}

export default function AIDreamParser() {
    const [text, setText] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [keywords, setKeywords] = useState<string[]>([]);

    const handleParse = () => {
        if (!text.trim()) return;
        setIsScanning(true);
        // Mocking extraction
        setTimeout(() => {
            const mockKeywords = ['황금 용', '하늘', '번개', '보물'];
            setKeywords(mockKeywords);
            setIsScanning(false);
        }, 2000);
    };

    return (
        <div className="space-y-6">
            <div className="relative group">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="어젯밤 꿈의 내용을 상세히 적어주세요..."
                    className="w-full h-48 bg-white/[0.02] border border-white/10 rounded-[2rem] p-6 text-sm text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/50 transition-all resize-none italic font-medium"
                />

                <AnimatePresence>
                    {isScanning && (
                        <motion.div
                            initial={{ top: '0%' }}
                            animate={{ top: '100%' }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_20px_rgba(99,102,241,0.8)] z-10"
                        />
                    )}
                </AnimatePresence>
            </div>

            <button
                onClick={handleParse}
                disabled={isScanning || !text.trim()}
                className="w-full py-5 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 transition-all flex items-center justify-center gap-3 group relative overflow-hidden shadow-2xl shadow-indigo-500/20"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Zap className={`w-5 h-5 ${isScanning ? 'animate-spin' : ''}`} />
                <span className="text-sm font-black uppercase tracking-[0.2em] italic">
                    {isScanning ? 'Synchronizing Neural Web...' : 'AI 꿈 엔진 해석하기'}
                </span>
            </button>

            {keywords.length > 0 && (
                <>
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid gap-4 md:grid-cols-3"
                    >
                        <ResultSummaryCard
                            title="🌙 Who You Are"
                            tone="border-indigo-400/30 bg-indigo-500/10"
                            body="지금의 꿈은 단순한 이미지 재생보다, 마음이 놓치고 있던 감정 신호를 다시 수면 위로 올리는 단계에 가깝습니다. 그래서 꿈의 강도보다 반복되는 장면과 정서가 더 중요합니다."
                        />
                        <ResultSummaryCard
                            title="📚 Why It Happens"
                            tone="border-cyan-400/30 bg-cyan-500/10"
                            body={`이번 해석에서는 ${keywords.slice(0, 3).join(", ")} 신호가 먼저 잡혔습니다. 즉, 무의식은 현재의 긴장, 회복, 관계 정리 중 어느 축이 더 급한지를 상징으로 보여주고 있다고 읽을 수 있습니다.`}
                        />
                        <ResultSummaryCard
                            title="✨ What To Do"
                            tone="border-emerald-400/30 bg-emerald-500/10"
                            body="오늘은 꿈에서 가장 선명했던 장면 하나와 그때 든 감정 하나만 기록해 두세요. 꿈을 바로 해석하려 하기보다, 반복 신호를 남기면 다음 해석의 정확도와 실전성이 훨씬 올라갑니다."
                        />
                    </motion.section>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                    >
                        {keywords.map((kw) => (
                            <div key={kw} className="px-4 py-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center group hover:bg-white/10 transition-colors">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-400 mb-2 opacity-50 group-hover:opacity-100" />
                                <span className="text-[11px] font-black text-white">{kw}</span>
                            </div>
                        ))}
                    </motion.div>
                </>
            )}
        </div>
    );
}
