'use client';

import type {
    JellyWallet,
    PricingTier,
    Transaction,
    PurchaseResult,
    ConsumptionResult,
    UnlockRecord,
} from '@/types/jelly';

const WALLET_STORAGE_KEY = 'secret_paws_jelly_wallet';
const UNLOCK_STORAGE_KEY = 'secret_paws_unlocks';

/**
 * Pricing Tiers - Based on Saju-Kid's proven model
 */
export const PRICING_TIERS: PricingTier[] = [
    {
        id: 'taste',
        jellies: 1,
        bonus: 0,
        price: 990,
        label: '맛보기',
    },
    {
        id: 'smart',
        jellies: 3,
        bonus: 1,
        price: 2900,
        label: '똑똑이',
        badge: '25% 할인',
    },
    {
        id: 'pro',
        jellies: 10,
        bonus: 3,
        price: 9900,
        label: '프로',
        badge: '최고 가성비',
        popular: true,
    },
];

/**
 * Initialize wallet if it doesn't exist
 */
function initializeWallet(): JellyWallet {
    const defaultWallet: JellyWallet = {
        balance: 999999999999,
        totalPurchased: 0,
        totalConsumed: 0,
        history: [],
        lastUpdated: Date.now(),
    };

    if (typeof window === 'undefined') return defaultWallet;

    const stored = localStorage.getItem(WALLET_STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(defaultWallet));
        return defaultWallet;
    }

    return JSON.parse(stored);
}

/**
 * Save wallet to localStorage
 */
function saveWallet(wallet: JellyWallet): void {
    if (typeof window === 'undefined') return;
    wallet.lastUpdated = Date.now();
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallet));
}

/**
 * Get current Jelly balance
 */
export function getBalance(): number {
    const wallet = initializeWallet();
    return wallet.balance;
}

/**
 * Get full wallet information
 */
export function getWallet(): JellyWallet {
    return initializeWallet();
}

/**
 * Get pricing tier by ID
 */
export function getPricingTier(tierId: string): PricingTier | undefined {
    return PRICING_TIERS.find((t) => t.id === tierId);
}

/**
 * Calculate per-unit price for a tier
 */
export function getPerUnitPrice(tier: PricingTier): number {
    const totalJellies = tier.jellies + tier.bonus;
    return Math.round(tier.price / totalJellies);
}

/**
 * Purchase Jellies - Initialize payment
 */
export async function purchaseJellies(tierId: string): Promise<PurchaseResult> {
    const tier = getPricingTier(tierId);

    if (!tier) {
        return {
            success: false,
            error: '유효하지 않은 상품입니다.',
        };
    }

    try {
        const response = await fetch('/api/payment/initialize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tierId }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '결제 초기화 실패');
        }

        const data = await response.json();

        // This will be used by the UI to trigger Toss Payments Widget
        return {
            success: true,
            jellies: tier.jellies + tier.bonus,
            paymentConfig: data, // clientKey, orderId, amount, etc.
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || '결제 시스템 연결 오류',
        };
    }
}

/**
 * Consume Jellies (unlock content, add profile, etc.)
 */
export function consumeJelly(
    amount: number,
    purpose: string,
    metadata?: Transaction['metadata']
): ConsumptionResult {
    if (amount <= 0) {
        return {
            success: false,
            error: '유효하지 않은 금액입니다.',
        };
    }

    const wallet = getWallet();

    if (wallet.balance < amount) {
        return {
            success: false,
            error: '젤리가 부족합니다.',
            remainingBalance: wallet.balance,
        };
    }

    const transaction: Transaction = {
        id: crypto.randomUUID(),
        type: 'consume',
        amount: -amount,
        jellies: amount,
        purpose,
        metadata,
        timestamp: Date.now(),
    };

    wallet.balance -= amount;
    wallet.totalConsumed += amount;
    wallet.history.unshift(transaction);

    saveWallet(wallet);

    return {
        success: true,
        remainingBalance: wallet.balance,
    };
}

/**
 * Get transaction history
 */
export function getHistory(limit?: number): Transaction[] {
    const wallet = getWallet();
    return limit ? wallet.history.slice(0, limit) : wallet.history;
}

/**
 * Check if user has sufficient balance
 */
export function hasSufficientBalance(required: number): boolean {
    return getBalance() >= required;
}

/**
 * Get unlock records
 */
function getUnlockRecords(): UnlockRecord[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(UNLOCK_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

/**
 * Save unlock records
 */
function saveUnlockRecords(records: UnlockRecord[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(UNLOCK_STORAGE_KEY, JSON.stringify(records));
}

/**
 * Check if content is unlocked
 */
export function isUnlocked(profileId: string, sectionId?: string): boolean {
    const records = getUnlockRecords();
    const record = records.find((r) => r.profileId === profileId);

    if (!record) return false;
    if (!sectionId) return true; // Profile itself is unlocked

    return record.sections.includes(sectionId);
}

/**
 * Unlock content (profile or section)
 */
export function unlockContent(
    profileId: string,
    sectionId?: string,
    cost: number = 1
): ConsumptionResult {
    // Check if already unlocked
    if (isUnlocked(profileId, sectionId)) {
        return {
            success: true,
            remainingBalance: getBalance(),
        };
    }

    // Consume Jelly
    const purpose = sectionId ? `unlock_section_${sectionId}` : 'unlock_profile';
    const result = consumeJelly(cost, purpose, {
        profileId,
        sectionId,
    });

    if (!result.success) {
        return result;
    }

    // Record unlock
    const records = getUnlockRecords();
    let record = records.find((r) => r.profileId === profileId);

    if (!record) {
        record = {
            profileId,
            sections: [],
            unlockedAt: Date.now(),
        };
        records.push(record);
    }

    if (sectionId && !record.sections.includes(sectionId)) {
        record.sections.push(sectionId);
    }

    saveUnlockRecords(records);

    return result;
}

/**
 * Gift Jellies (for promotions, rewards, etc.)
 */
export function giftJellies(amount: number, reason: string = 'gift'): void {
    const wallet = getWallet();

    const transaction: Transaction = {
        id: crypto.randomUUID(),
        type: 'purchase',
        amount: 0,
        jellies: amount,
        purpose: reason,
        timestamp: Date.now(),
    };

    wallet.balance += amount;
    wallet.totalPurchased += amount;
    wallet.history.unshift(transaction);

    saveWallet(wallet);
}

/**
 * Reset wallet (for testing/admin purposes)
 */
export function resetWallet(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(WALLET_STORAGE_KEY);
    localStorage.removeItem(UNLOCK_STORAGE_KEY);
}

/**
 * Get wallet analytics
 */
export function getWalletAnalytics() {
    const wallet = getWallet();
    const purchases = wallet.history.filter((t) => t.type === 'purchase');
    const consumptions = wallet.history.filter((t) => t.type === 'consume');

    return {
        currentBalance: wallet.balance,
        totalPurchased: wallet.totalPurchased,
        totalConsumed: wallet.totalConsumed,
        purchaseCount: purchases.length,
        consumptionCount: consumptions.length,
        averagePurchase: purchases.length > 0
            ? purchases.reduce((sum, t) => sum + t.jellies, 0) / purchases.length
            : 0,
        mostPopularTier: getMostPopularTier(purchases),
    };
}

function getMostPopularTier(purchases: Transaction[]): string | null {
    const tierCounts: Record<string, number> = {};

    purchases.forEach((t) => {
        const tierId = t.metadata?.tierId;
        if (tierId) {
            tierCounts[tierId] = (tierCounts[tierId] || 0) + 1;
        }
    });

    let maxTier: string | null = null;
    let maxCount = 0;

    Object.entries(tierCounts).forEach(([tierId, count]) => {
        if (count > maxCount) {
            maxCount = count;
            maxTier = tierId;
        }
    });

    return maxTier;
}
