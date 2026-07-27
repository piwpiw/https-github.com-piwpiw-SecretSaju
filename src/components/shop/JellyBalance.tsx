'use client';

import { motion } from 'framer-motion';
import { Candy, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getBalance } from '@/lib/payment/jelly-wallet';
import { FREE_LAUNCH } from '@/config/constants';

interface JellyBalanceProps {
    onClick?: () => void;
    showLowBalanceWarning?: boolean;
}

export default function JellyBalance({
    onClick,
    showLowBalanceWarning = true,
}: JellyBalanceProps) {
    const [balance, setBalance] = useState(0);
    const [isLowBalance, setIsLowBalance] = useState(false);

    useEffect(() => {
        updateBalance();

        // Listen for balance updates
        const handleStorageChange = () => {
            updateBalance();
        };

        window.addEventListener('storage', handleStorageChange);
        // Custom event for same-tab updates
        window.addEventListener('jellyBalanceUpdate', updateBalance);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('jellyBalanceUpdate', updateBalance);
        };
    }, []);

    const updateBalance = () => {
        const currentBalance = getBalance();
        setBalance(currentBalance);
        // 무료 오픈 기간에는 잔액이 기능을 막지 않으므로 부족 경고를 띄우지 않는다.
        setIsLowBalance(!FREE_LAUNCH && currentBalance < 2);
    };

    // Defends the pill layout against unexpectedly large balances (e.g. a
    // runaway/dev default) so the badge never overflows the viewport on
    // narrow breakpoints.
    const formattedBalance = new Intl.NumberFormat('ko-KR', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(balance);

    // 무료 오픈 기간에는 숫자를 보여주지 않는다. 내부적으로 큰 값을 넣어 게이트를
    // 열어두기 때문에, 숫자를 그대로 노출하면 "1조 젤리 보유"처럼 읽힌다.
    const balanceLabel = FREE_LAUNCH ? '무료' : formattedBalance;

    return (
        <motion.button
            type="button"
            onClick={onClick}
            aria-label={FREE_LAUNCH ? '무료 오픈 기간 — 모든 기능 무료, 젤리 상점 열기' : `젤리 잔액 ${balance}개, 충전하기`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
        relative flex items-center gap-2 px-4 py-2 rounded-full
        bg-gradient-to-r from-yellow-400/20 to-amber-400/20 
        border border-yellow-400/30
        hover:border-yellow-400/50 transition-all
        ${isLowBalance && showLowBalanceWarning ? 'animate-pulse' : ''}
      `}
        >
            {/* Jelly Icon */}
            <div className="relative">
                <Candy className="w-5 h-5 text-yellow-400" />
                {isLowBalance && showLowBalanceWarning && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
                    />
                )}
            </div>

            {/* Balance */}
            <motion.span
                key={balanceLabel}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="font-bold text-foreground max-w-[72px] truncate"
                title={FREE_LAUNCH ? '무료 오픈 기간에는 모든 기능이 무료입니다' : balance.toLocaleString('ko-KR')}
            >
                {balanceLabel}
            </motion.span>

            {/* Add Icon — 무료 기간에는 충전할 것이 없다 */}
            {!FREE_LAUNCH && <Plus className="w-4 h-4 text-yellow-400" />}

            {/* Glow effect on low balance */}
            {isLowBalance && showLowBalanceWarning && (
                <motion.div
                    animate={{
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                    }}
                    className="absolute inset-0 rounded-full bg-red-500/10 -z-10"
                />
            )}
        </motion.button>
    );
}

// Helper function to trigger balance update across components
export function triggerBalanceUpdate() {
    window.dispatchEvent(new Event('jellyBalanceUpdate'));
}
