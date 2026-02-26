'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface WalletContextType {
    churu: number; // Coins
    nyang: number; // Points
    addChuru: (amount: number) => void;
    useChuru: (amount: number) => boolean;
    addNyang: (amount: number) => void;
    useNyang: (amount: number) => boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [churu, setChuru] = useState(0);
    const [nyang, setNyang] = useState(0);

    // Persistence & Server Sync
    useEffect(() => {
        // Optimistic UI from Local Storage
        const savedWallet = localStorage.getItem('secret_paws_wallet');
        if (savedWallet) {
            try {
                const { churu, nyang } = JSON.parse(savedWallet);
                setChuru(churu);
                setNyang(nyang);
            } catch (e) { }
        }

        // Verify with DB
        const fetchBalance = async () => {
            try {
                const res = await fetch('/api/wallet/balance');
                if (res.ok) {
                    const data = await res.json();
                    if (data.balance !== undefined) {
                        setChuru(data.balance);
                    }
                }
            } catch (err) {
                console.error("Failed to sync wallet balance", err);
            }
        };

        fetchBalance();
    }, []);

    useEffect(() => {
        localStorage.setItem('secret_paws_wallet', JSON.stringify({ churu, nyang }));
    }, [churu, nyang]);

    const addChuru = (amount: number) => setChuru((prev) => prev + amount);
    const useChuru = (amount: number) => {
        if (churu >= amount) {
            setChuru((prev) => prev - amount);
            return true;
        }
        return false;
    };

    const addNyang = (amount: number) => setNyang((prev) => prev + amount);
    const useNyang = (amount: number) => {
        if (nyang >= amount) {
            setNyang((prev) => prev - amount);
            return true;
        }
        return false;
    };

    return (
        <WalletContext.Provider value={{ churu, nyang, addChuru, useChuru, addNyang, useNyang }}>
            {children}
        </WalletContext.Provider>
    );
}

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};
