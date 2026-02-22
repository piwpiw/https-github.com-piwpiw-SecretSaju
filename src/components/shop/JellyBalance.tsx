'use client';

import { motion } from 'framer-motion';
import { Candy, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getBalance } from '@/lib/jelly-wallet';

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
        setIsLowBalance(currentBalance < 2);
    };

    return (
        <motion.button
            onClick={onClick}
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
                key={balance}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="font-bold text-foreground"
            >
                {balance}
            </motion.span>

            {/* Add Icon */}
            <Plus className="w-4 h-4 text-yellow-400" />

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
