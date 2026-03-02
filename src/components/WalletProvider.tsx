'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface WalletContextType {
    isAdmin: boolean;
    churu: number; // Coins
    nyang: number; // Points
    addChuru: (amount: number) => void;
    consumeChuru: (amount: number) => boolean;
    addNyang: (amount: number) => void;
    consumeNyang: (amount: number) => boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [churu, setChuru] = useState(0);
    const [nyang, setNyang] = useState(0);
    const [isAdmin, setIsAdmin] = useState(false);

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

        // Mock Admin Check
        const mockAdmin = localStorage.getItem('secret_paws_mock_admin');
        if (mockAdmin === 'true') {
            setIsAdmin(true);
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
                    if (data.isAdmin !== undefined) {
                        setIsAdmin(data.isAdmin);
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
    const consumeChuru = (amount: number) => {
        if (isAdmin) return true; // Admin bypass
        if (churu >= amount) {
            setChuru((prev) => prev - amount);
            return true;
        }
        return false;
    };

    const addNyang = (amount: number) => setNyang((prev) => prev + amount);
    const consumeNyang = (amount: number) => {
        if (nyang >= amount) {
            setNyang((prev) => prev - amount);
            return true;
        }
        return false;
    };

    return (
        <WalletContext.Provider value={{ churu, nyang, addChuru, consumeChuru, addNyang, consumeNyang, isAdmin }}>
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
