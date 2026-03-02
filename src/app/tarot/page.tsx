'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Loader2, Star, Target, Zap, Waves } from 'lucide-react';
import JellyBalance from '@/components/shop/JellyBalance';
import { hasSufficientBalance, consumeJelly } from '@/lib/jelly-wallet';
import { triggerBalanceUpdate } from '@/components/shop/JellyBalance';
import { saveAnalysisToHistory } from '@/lib/analysis-history';
import JellyShopModal from '@/components/shop/JellyShopModal';

type GameState = 'intro' | 'picking' | 'drawing' | 'result';

type TarotCard = {
    id: string;
    name: string;
    meanings: string[];
    desc: string;
    bg: string;
    color: string;
    icon: string;
};

const TAROT_CARDS: TarotCard[] = [
    {
        id: 'fool',
        name: '0. The Fool',
        meanings: ['시작', '자유', '낮은 위험'],
        desc: '아직 결과가 정해지지 않은 상태의 가능성을 뜻합니다.',
        bg: 'bg-emerald-500/10',
        color: 'text-emerald-400',
        icon: '🃏',
    },
    {
        id: 'magician',
        name: 'I. The Magician',
        meanings: ['의지', '기회', '실행'],
        desc: '원하는 결정을 현실로 만드는 능력과 집중력을 뜻합니다.',
        bg: 'bg-purple-500/10',
        color: 'text-purple-400',
        icon: '✨',
    },
    {
        id: 'chariot',
        name: 'VII. The Chariot',
        meanings: ['의지', '전진', '돌파'],
        desc: '목표를 향해 확실히 나아가는 추진력을 상징합니다.',
        bg: 'bg-yellow-500/10',
        color: 'text-yellow-400',
        icon: '🛡️',
    },
];

const COST = 10;

export default function TarotPage() {
    const router = useRouter();
    const [gameState, setGameState] = useState<GameState>('intro');
    const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showShopModal, setShowShopModal] = useState(false);

    const handleStartPicking = () => {
        if (!hasSufficientBalance(COST)) {
            setShowShopModal(true);
            return;
        }
        setGameState('picking');
    };

    const handleDraw = () => {
        consumeJelly(COST, 'tarot_reading', { cardId: 'random' });
        triggerBalanceUpdate();

        setGameState('drawing');
        setTimeout(() => {
            const randomCard = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
            setSelectedCard(randomCard);
            setGameState('result');
            setTimeout(() => setIsFlipped(true), 400);
            saveAnalysisToHistory(
                {
                    type: 'TAROT',
                    title: `${randomCard.name} 해석`,
                    subtitle: randomCard.meanings[0],
                    profileName: '현재',
                    result: randomCard,
                },
                {
                    resultUrlFactory: (id) => `/analysis-history/TAROT/${id}`,
                }
            );
        }, 1200);
    };

    const handleReset = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setSelectedCard(null);
            setGameState('intro');
        }, 250);
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <main className="min-h-[100dvh] bg-[#050510] text-foreground relative overflow-hidden pb-40">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-0 w-[420px] h-[420px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
                <div className="flex items-center justify-between mb-16">
                    <button onClick={handleBack} className="flex items-center gap-3 text-slate-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-xs font-black tracking-[0.2em] uppercase">BACK</span>
                    </button>
                    <JellyBalance />
                </div>

                {gameState === 'intro' && (
                    <motion.div key="intro" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-10">
                        <div className="text-6xl mb-2">🌙</div>
                        <div>
                            <h1 className="text-5xl font-black tracking-tight uppercase">타로 리딩</h1>
                            <p className="text-slate-400 mt-4">원하는 질문을 마음속으로 정하고, 한 장의 카드를 뽑아 보세요.</p>
                        </div>
                        <button
                            onClick={handleStartPicking}
                            className="px-12 py-6 bg-white/[0.05] border border-white/15 rounded-[2rem] text-2xl font-black text-white hover:bg-white/[0.1]"
                        >
                            시작하기 ({COST}젤리)
                        </button>
                    </motion.div>
                )}

                {gameState === 'picking' && (
                    <motion.div key="picking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
                        <h2 className="text-3xl font-black text-white mb-2">카드를 선택하세요</h2>
                        <div className="flex flex-wrap justify-center gap-5">
                            {Array.from({ length: 12 }).map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={handleDraw}
                                    className="w-24 h-36 bg-slate-900 rounded-2xl border border-white/10 relative overflow-hidden"
                                >
                                    <div className="absolute inset-2 border border-white/5 rounded-xl" />
                                    <Waves className="w-8 h-8 text-indigo-300 mx-auto mt-12 opacity-40" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {gameState === 'drawing' && (
                    <motion.div key="drawing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-40">
                        <Loader2 className="w-16 h-16 text-indigo-400 animate-spin" />
                        <h3 className="mt-8 text-2xl font-black uppercase">카드를 펼치는 중...</h3>
                    </motion.div>
                )}

                {gameState === 'result' && selectedCard && (
                    <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto py-8">
                        <div className="text-center space-y-6">
                            <div className="text-7xl">{selectedCard.icon}</div>
                            <h2 className={`text-4xl font-black tracking-tight ${selectedCard.color}`}>{selectedCard.name}</h2>
                            <div className={`inline-block px-3 py-1 rounded-full ${selectedCard.bg} border border-white/15`}>
                                Major Arcana
                            </div>
                            <p className="text-xl text-slate-300 max-w-xl mx-auto">{selectedCard.desc}</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {selectedCard.meanings.map((m) => (
                                    <span key={m} className={`px-4 py-2 rounded-full text-xs ${selectedCard.color} font-black uppercase ${selectedCard.bg}`}>
                                        {m}
                                    </span>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
                                <button
                                    onClick={handleReset}
                                    className="w-full sm:w-auto px-8 py-3 bg-white/5 border border-white/10 rounded-2xl"
                                >
                                    처음으로
                                </button>
                                <button
                                    onClick={() => {
                                        setIsFlipped(false);
                                        setTimeout(() => setGameState('picking'), 250);
                                    }}
                                    className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white rounded-2xl flex items-center justify-center gap-2"
                                >
                                    <Target className="w-4 h-4" />
                                    다시 뽑기
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            <JellyShopModal isOpen={showShopModal} onClose={() => setShowShopModal(false)} />
        </main>
    );
}
