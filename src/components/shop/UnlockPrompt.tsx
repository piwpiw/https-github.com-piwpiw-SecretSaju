'use client';

import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';
import { hasSufficientBalance, unlockContent } from '@/lib/jelly-wallet';
import { triggerBalanceUpdate } from './JellyBalance';
import { useState } from 'react';

interface UnlockPromptProps {
    profileId: string;
    sectionId?: string;
    cost?: number;
    title?: string;
    description?: string;
    onUnlock?: () => void;
    onInsufficientBalance?: () => void;
}

export default function UnlockPrompt({
    profileId,
    sectionId,
    cost = 1,
    title = '숨겨진 비밀',
    description = '이 내용을 확인하려면 젤리가 필요해요',
    onUnlock,
    onInsufficientBalance,
}: UnlockPromptProps) {
    const [isUnlocking, setIsUnlocking] = useState(false);
    const hasSufficientJellies = hasSufficientBalance(cost);

    const handleUnlock = async () => {
        if (!hasSufficientJellies) {
            onInsufficientBalance?.();
            return;
        }

        setIsUnlocking(true);

        const result = unlockContent(profileId, sectionId, cost);

        if (result.success) {
            triggerBalanceUpdate();
            setTimeout(() => {
                onUnlock?.();
                setIsUnlocking(false);
            }, 500);
        } else {
            setIsUnlocking(false);
            onInsufficientBalance?.();
        }
    };

    return (
        <div className="relative">
            {/* Blurred Background */}
            <div className="absolute inset-0 backdrop-blur-md bg-black/40 rounded-xl z-10" />

            {/* Unlock Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-20 flex flex-col items-center justify-center p-8 text-center"
            >
                {/* Lock Icon */}
                <motion.div
                    animate={{
                        y: [0, -5, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    className="mb-4"
                >
                    <div className="relative">
                        <Lock className="w-12 h-12 text-yellow-400" />
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                            }}
                            className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl -z-10"
                        />
                    </div>
                </motion.div>

                {/* Title */}
                <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>

                {/* Description */}
                <p className="text-sm text-zinc-400 mb-6">{description}</p>

                {/* Cost Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/20 border border-yellow-400/30 mb-6">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span className="font-bold text-foreground">{cost} 젤리</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 w-full max-w-sm">
                    {hasSufficientJellies ? (
                        <button
                            onClick={handleUnlock}
                            disabled={isUnlocking}
                            className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold hover:from-yellow-500 hover:to-amber-600 transition disabled:opacity-50"
                        >
                            {isUnlocking ? '잠금 해제 중...' : '잠금 해제'}
                        </button>
                    ) : (
                        <button
                            onClick={onInsufficientBalance}
                            className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold hover:from-yellow-500 hover:to-amber-600 transition"
                        >
                            젤리 충전하기
                        </button>
                    )}
                </div>

                {/* Helper Text */}
                {!hasSufficientJellies && (
                    <p className="text-xs text-red-400 mt-3">
                        젤리가 부족해요. 충전 후 이용해주세요!
                    </p>
                )}
            </motion.div>
        </div>
    );
}
