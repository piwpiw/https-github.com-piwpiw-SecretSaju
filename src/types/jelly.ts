/**
 * Jelly Wallet System Types
 * Virtual currency for Secret Paws MVP
 */

export interface PricingTier {
    id: 'taste' | 'smart' | 'pro';
    jellies: number;
    bonus: number;
    price: number;
    label: string;
    badge?: string;
    popular?: boolean;
}

export interface Transaction {
    id: string;
    type: 'purchase' | 'consume' | 'refund';
    amount: number; // Positive for purchase, negative for consumption
    jellies: number; // Total jellies after transaction
    purpose?: string; // e.g., "unlock_profile", "unlock_section"
    metadata?: {
        profileId?: string;
        profileName?: string;
        sectionId?: string;
        tierId?: string;
        [key: string]: any;
    };
    timestamp: number;
}

export interface JellyWallet {
    balance: number;
    totalPurchased: number;
    totalConsumed: number;
    history: Transaction[];
    lastUpdated: number;
}

export interface PurchaseResult {
    success: boolean;
    jellies?: number;
    newBalance?: number;
    transactionId?: string;
    paymentConfig?: any; // For Toss Payments Wiget initialization
    error?: string;
}

export interface ConsumptionResult {
    success: boolean;
    remainingBalance?: number;
    error?: string;
}

// Unlock tracking
export interface UnlockRecord {
    profileId: string;
    sections: string[]; // Array of section IDs that have been unlocked
    unlockedAt: number;
}
