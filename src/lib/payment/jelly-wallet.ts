'use client';

import { generateUUID } from '@/lib/app/uuid';

import type {
    JellyWallet,
    PricingTier,
    Transaction,
    PurchaseResult,
    ConsumptionResult,
    UnlockRecord,
} from '@/types/jelly';
import { getUserFromCookie } from '@/lib/auth/kakao-auth';
import { FREE_LAUNCH, JELLY_PRICING_TIERS, WELCOME_JELLY } from '@/config/constants';

const WALLET_STORAGE_KEY = 'secret_paws_jelly_wallet';
/** 통합 전 WalletProvider 가 쓰던 churu/nyang 지갑 키. 초기화 시 젤리로 이관 후 삭제한다. */
const LEGACY_WALLET_STORAGE_KEY = 'secret_paws_wallet';
const UNLOCK_STORAGE_KEY = 'secret_paws_unlocks';
const ADMIN_STORAGE_KEY = 'secret_paws_mock_admin';
const ADMIN_EMAILS = ['piwpiw@naver.com'];
const ADMIN_COOKIE_NAME = 'secret_paws_mock_admin';
const AUTH_SESSION_COOKIE_PREFIXES = ['sb-', 'auth-session'];

/** 레거시 churu 잔액 이관 트랜잭션의 purpose — 존재 여부로 마이그레이션 멱등성을 판단한다. */
export const LEGACY_MIGRATION_PURPOSE = 'legacy_churu_migration';
/** 신규 지갑 웰컴 보너스 트랜잭션의 purpose. */
export const WELCOME_BONUS_PURPOSE = 'welcome_bonus';

// ============================================
// Balance-change event (single source for all wallet UIs)
// ============================================

export const BALANCE_UPDATE_EVENT = 'jellyBalanceUpdate';

/**
 * 잔액이 바뀔 때마다 모든 지갑 UI(JellyBalance, WalletProvider)가 재읽기하도록
 * 이벤트를 쏜다. 엔진의 모든 잔액 변경 경로가 이 함수를 호출한다.
 */
export function triggerBalanceUpdate(): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new Event(BALANCE_UPDATE_EVENT));
}

// ============================================
// Storage abstraction (localStorage in the browser, injectable for tests)
// ============================================

export interface WalletStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}

let storageOverride: WalletStorage | null = null;

/** 테스트에서 in-memory 스토리지를 주입한다. null 로 되돌리면 localStorage 를 다시 쓴다. */
export function __setWalletStorageForTests(storage: WalletStorage | null): void {
    storageOverride = storage;
}

function getStorage(): WalletStorage | null {
    if (storageOverride) return storageOverride;
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return null;
    return window.localStorage;
}

// ============================================
// Admin / auth detection
// ============================================

function hasCookieAdminFlag(): boolean {
    if (typeof document === 'undefined') return false;
    const cookiePair = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${ADMIN_COOKIE_NAME}=`));
    return cookiePair?.split('=')[1] === 'true';
}

function hasLocalStorageAdminFlag(): boolean {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(ADMIN_STORAGE_KEY) === 'true';
}

/**
 * Check if current user is admin (mocked via localStorage)
 */
export function isAdminUser(): boolean {
    if (typeof window === 'undefined') return false;
    if (hasLocalStorageAdminFlag() || hasCookieAdminFlag()) return true;
    const user = getUserFromCookie();
    const email = user?.email?.toLowerCase();
    return user?.id === 'admin-bypass-007' || (email ? ADMIN_EMAILS.includes(email) : false);
}

/**
 * 로그인(인증) 사용자 여부 — 인증 사용자의 젤리 차감은 서버(/api/wallet/consume)가
 * 원자적으로 처리하고, 로컬 지갑은 캐시로만 쓴다.
 */
export function isAuthenticatedUser(): boolean {
    if (typeof document === 'undefined') return false;
    const user = getUserFromCookie();
    if (user?.id || user?.email) return true;
    return document.cookie
        .split('; ')
        .some((row) => AUTH_SESSION_COOKIE_PREFIXES.some((prefix) => row.startsWith(prefix)));
}

// ============================================
// Pricing (single source: src/config/constants.ts)
// ============================================

/**
 * Pricing Tiers — 정의는 `src/config/constants.ts` 의 `JELLY_PRICING_TIERS` 가
 * 단일 소스이고 여기서는 re-export 만 한다.
 */
export const PRICING_TIERS: readonly PricingTier[] = JELLY_PRICING_TIERS;

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

// ============================================
// Wallet core
// ============================================

function createDefaultWallet(): JellyWallet {
    // 신규 지갑은 0 에서 시작한다. 웰컴 보너스는 명시적 트랜잭션으로만 적립되어
    // 히스토리에 근거가 남는다. 무료 기간(FREE_LAUNCH) 게이트는
    // hasSufficientBalance/isUnlocked/consumeJelly 가 잔액과 무관하게 열어준다.
    return {
        balance: 0,
        totalPurchased: 0,
        totalConsumed: 0,
        history: [],
        lastUpdated: Date.now(),
    };
}

function makeTransaction(
    type: Transaction['type'],
    amount: number,
    purpose: string,
    metadata?: Transaction['metadata']
): Transaction {
    return {
        id: generateUUID(),
        type,
        amount,
        jellies: Math.abs(amount),
        purpose,
        metadata,
        timestamp: Date.now(),
    };
}

/**
 * Save wallet to storage
 */
function saveWallet(wallet: JellyWallet): void {
    const storage = getStorage();
    if (!storage) return;
    wallet.lastUpdated = Date.now();
    storage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallet));
}

/**
 * 레거시 churu 지갑(`secret_paws_wallet`)을 젤리 지갑으로 1회 이관한다.
 * 멱등성: purpose === LEGACY_MIGRATION_PURPOSE 트랜잭션이 이미 있으면 적립 없이
 * 레거시 키만 제거한다. 반환값은 "지갑/스토리지가 변경되었는가".
 */
function migrateLegacyChuruWallet(storage: WalletStorage, wallet: JellyWallet): boolean {
    const legacyRaw = storage.getItem(LEGACY_WALLET_STORAGE_KEY);
    if (legacyRaw === null) return false;

    const alreadyMigrated = wallet.history.some(
        (t) => t.purpose === LEGACY_MIGRATION_PURPOSE
    );

    if (!alreadyMigrated) {
        let legacyChuru = 0;
        try {
            legacyChuru = Number(JSON.parse(legacyRaw)?.churu);
        } catch {
            legacyChuru = 0;
        }

        if (Number.isFinite(legacyChuru) && legacyChuru > 0) {
            wallet.balance += legacyChuru;
            wallet.totalPurchased += legacyChuru;
            wallet.history.unshift(
                makeTransaction('purchase', legacyChuru, LEGACY_MIGRATION_PURPOSE)
            );
        }
    }

    storage.removeItem(LEGACY_WALLET_STORAGE_KEY);
    return true;
}

/**
 * Initialize wallet if it doesn't exist.
 * - 신규 생성 시 1회 WELCOME_JELLY 만큼 'welcome_bonus' 트랜잭션으로 적립.
 * - 레거시 churu 지갑이 남아 있으면 젤리로 합산 이관 후 레거시 키 삭제.
 */
function initializeWallet(): JellyWallet {
    const storage = getStorage();
    // SSR 등 스토리지가 없는 환경 — 저장 없이 읽기 전용 기본값만 돌려준다.
    if (!storage) return createDefaultWallet();

    let wallet: JellyWallet | null = null;
    const stored = storage.getItem(WALLET_STORAGE_KEY);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (
                parsed &&
                typeof parsed.balance === 'number' &&
                Array.isArray(parsed.history)
            ) {
                wallet = parsed as JellyWallet;
            }
        } catch {
            wallet = null;
        }
    }

    let mutated = false;

    if (!wallet) {
        // 저장소에 지갑이 처음 만들어지는 순간 — 웰컴 보너스를 1회 적립한다.
        wallet = createDefaultWallet();
        if (WELCOME_JELLY > 0) {
            wallet.balance += WELCOME_JELLY;
            wallet.totalPurchased += WELCOME_JELLY;
            wallet.history.unshift(
                makeTransaction('purchase', WELCOME_JELLY, WELCOME_BONUS_PURPOSE)
            );
        }
        mutated = true;
    }

    if (migrateLegacyChuruWallet(storage, wallet)) {
        mutated = true;
    }

    if (mutated) {
        saveWallet(wallet);
        triggerBalanceUpdate();
    }

    return wallet;
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
 * 서버가 알려준 잔액으로 로컬 캐시를 덮어쓴다 (로그인 사용자의 잔액 동기화용).
 * 트랜잭션 히스토리는 만들지 않는다 — 서버가 진실 공급원인 경로의 캐시 갱신이다.
 */
export function setCachedBalance(balance: number): void {
    if (!Number.isFinite(balance) || balance < 0) return;
    const wallet = getWallet();
    if (wallet.balance === balance) return;
    wallet.balance = balance;
    saveWallet(wallet);
    triggerBalanceUpdate();
}

// ============================================
// Purchase
// ============================================

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

// ============================================
// Consumption
// ============================================

export interface ConsumeGateInput {
    amount: number;
    balance: number;
    freeLaunch: boolean;
    isAdmin: boolean;
}

export type ConsumeGateDecision =
    | { allowed: true; deduct: boolean }
    | { allowed: false; error: string };

/**
 * 소비 게이트의 순수 판정 함수 — FREE_LAUNCH/관리자/금액/잔액 규칙을 한곳에 모은다.
 * (부작용이 없어 FREE_LAUNCH=false 분기까지 단위 테스트로 고정할 수 있다.)
 */
export function evaluateConsumeGate(input: ConsumeGateInput): ConsumeGateDecision {
    if (input.freeLaunch) return { allowed: true, deduct: false };
    if (input.isAdmin) return { allowed: true, deduct: false };
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
        return { allowed: false, error: '유효하지 않은 금액입니다.' };
    }
    if (input.balance < input.amount) {
        return { allowed: false, error: '젤리가 부족합니다.' };
    }
    return { allowed: true, deduct: true };
}

/**
 * 로컬(비로그인) 차감 경로 — 검사와 차감이 같은 동기 블록에서 끝나므로 원자적이다.
 * `gateOverrides` 는 테스트에서 FREE_LAUNCH/관리자 분기를 고정하기 위한 주입점이다.
 */
export function consumeJellyLocal(
    amount: number,
    purpose: string,
    metadata?: Transaction['metadata'],
    gateOverrides?: { freeLaunch?: boolean; isAdmin?: boolean }
): ConsumptionResult {
    const wallet = getWallet();
    const decision = evaluateConsumeGate({
        amount,
        balance: wallet.balance,
        freeLaunch: gateOverrides?.freeLaunch ?? FREE_LAUNCH,
        isAdmin: gateOverrides?.isAdmin ?? isAdminUser(),
    });

    if (!decision.allowed) {
        return {
            success: false,
            error: decision.error,
            remainingBalance: wallet.balance,
        };
    }

    if (!decision.deduct) {
        // 무료 기간/관리자 — 차감 없이 성공.
        return {
            success: true,
            remainingBalance: wallet.balance,
        };
    }

    wallet.balance -= amount;
    wallet.totalConsumed += amount;
    wallet.history.unshift(makeTransaction('consume', -amount, purpose, metadata));

    saveWallet(wallet);
    triggerBalanceUpdate();

    return {
        success: true,
        remainingBalance: wallet.balance,
    };
}

// 서버 차감 경로의 in-flight 가드 — 진행 중이면 후속 호출을 거부해 이중 차감을 막는다.
let serverConsumeInFlight = false;

/**
 * Consume Jellies (unlock content, add profile, etc.)
 *
 * - 무료 기간/관리자: 차감 없이 성공.
 * - 로그인 사용자: `/api/wallet/consume` 가 `deduct_jellies` RPC 로 원자 차감하고,
 *   응답의 잔액으로 로컬 캐시를 갱신한다. 서버 5xx/네트워크 실패 시 로컬 폴백 없이
 *   실패를 반환한다 (이중 차감 방지).
 * - 비로그인 사용자: 로컬 지갑에서 동기 차감.
 */
export async function consumeJelly(
    amount: number,
    purpose: string,
    metadata?: Transaction['metadata']
): Promise<ConsumptionResult> {
    if (FREE_LAUNCH || isAdminUser()) {
        return {
            success: true,
            remainingBalance: getBalance(),
        };
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        return {
            success: false,
            error: '유효하지 않은 금액입니다.',
        };
    }

    if (!isAuthenticatedUser()) {
        return consumeJellyLocal(amount, purpose, metadata);
    }

    if (serverConsumeInFlight) {
        return {
            success: false,
            error: '이전 젤리 차감 요청이 아직 처리 중입니다. 잠시 후 다시 시도해 주세요.',
        };
    }

    serverConsumeInFlight = true;
    try {
        const response = await fetch('/api/wallet/consume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jellies: amount,
                purpose,
                profile_id: metadata?.profileId,
                feature: metadata?.sectionId,
            }),
        });

        let data: any = null;
        try {
            data = await response.json();
        } catch {
            data = null;
        }

        if (response.ok && data?.success) {
            // 관리자 우회 응답(new_balance: 999999)은 캐시에 반영하지 않는다.
            if (data.isAdmin) {
                return { success: true, remainingBalance: getBalance() };
            }
            const newBalance = Number(data.new_balance);
            if (Number.isFinite(newBalance) && newBalance >= 0) {
                const wallet = getWallet();
                wallet.balance = newBalance;
                wallet.totalConsumed += amount;
                wallet.history.unshift(
                    makeTransaction('consume', -amount, purpose, metadata)
                );
                saveWallet(wallet);
                triggerBalanceUpdate();
            }
            return { success: true, remainingBalance: getBalance() };
        }

        if (response.status === 402) {
            const serverBalance = Number(data?.balance);
            if (Number.isFinite(serverBalance)) {
                setCachedBalance(serverBalance);
            }
            return {
                success: false,
                error: '젤리가 부족합니다.',
                remainingBalance: getBalance(),
            };
        }

        if (response.status === 401) {
            return {
                success: false,
                error: '로그인 세션이 만료되었습니다. 다시 로그인한 뒤 시도해 주세요.',
            };
        }

        return {
            success: false,
            error: `서버에서 젤리를 차감하지 못했습니다 (HTTP ${response.status}). 잔액은 차감되지 않았으니 잠시 후 다시 시도해 주세요.`,
        };
    } catch {
        // 네트워크 실패 — 서버에서 이미 차감됐을 수도 있으므로 로컬 폴백 차감은 하지
        // 않는다 (이중 차감 방지). 실패로 알리고 사용자가 재시도하게 한다.
        return {
            success: false,
            error: '네트워크 오류로 젤리를 차감하지 못했습니다. 연결 상태를 확인한 뒤 다시 시도해 주세요.',
        };
    } finally {
        serverConsumeInFlight = false;
    }
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
    // 무료 오픈 기간에는 잔액과 무관하게 모든 기능을 연다.
    if (FREE_LAUNCH) return true;
    if (isAdminUser()) return true;
    return getBalance() >= required;
}

// ============================================
// Unlocks
// ============================================

/**
 * Get unlock records
 */
function getUnlockRecords(): UnlockRecord[] {
    const storage = getStorage();
    if (!storage) return [];
    const stored = storage.getItem(UNLOCK_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

/**
 * Save unlock records
 */
function saveUnlockRecords(records: UnlockRecord[]): void {
    const storage = getStorage();
    if (!storage) return;
    storage.setItem(UNLOCK_STORAGE_KEY, JSON.stringify(records));
}

/**
 * Check if content is unlocked
 */
export function isUnlocked(profileId: string, sectionId?: string): boolean {
    if (FREE_LAUNCH) return true;
    if (isAdminUser()) return true;
    const records = getUnlockRecords();
    const record = records.find((r) => r.profileId === profileId);

    if (!record) return false;
    if (!sectionId) return true; // Profile itself is unlocked

    return record.sections.includes(sectionId);
}

/**
 * Unlock content (profile or section)
 */
export async function unlockContent(
    profileId: string,
    sectionId?: string,
    cost: number = 1
): Promise<ConsumptionResult> {
    // Check if already unlocked
    if (isUnlocked(profileId, sectionId)) {
        return {
            success: true,
            remainingBalance: getBalance(),
        };
    }

    // Consume Jelly
    const purpose = sectionId ? `unlock_section_${sectionId}` : 'unlock_profile';
    const result = await consumeJelly(cost, purpose, {
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

// ============================================
// Credit (bonus / refund / promotion)
// ============================================

/**
 * 젤리 적립 — 환불/프로모션/보상 등. 모든 적립이 히스토리 트랜잭션으로 남는다.
 * reason 이 'refund' 로 시작하면 환불 트랜잭션으로 기록한다
 * (예: 'refund_calc_failure' — 사주 계산 실패 환불).
 */
export function addJelly(amount: number, reason: string = 'gift'): void {
    if (!Number.isFinite(amount) || amount <= 0) return;

    const wallet = getWallet();
    const isRefund = reason.startsWith('refund');

    wallet.balance += amount;
    if (isRefund) {
        wallet.totalConsumed = Math.max(0, wallet.totalConsumed - amount);
    } else {
        wallet.totalPurchased += amount;
    }
    wallet.history.unshift(
        makeTransaction(isRefund ? 'refund' : 'purchase', amount, reason)
    );

    saveWallet(wallet);
    triggerBalanceUpdate();
}

/**
 * Gift Jellies (for promotions, rewards, etc.) — addJelly 의 별칭.
 */
export function giftJellies(amount: number, reason: string = 'gift'): void {
    addJelly(amount, reason);
}

/**
 * Reset wallet (for testing/admin purposes)
 */
export function resetWallet(): void {
    const storage = getStorage();
    if (!storage) return;
    storage.removeItem(WALLET_STORAGE_KEY);
    storage.removeItem(UNLOCK_STORAGE_KEY);
    storage.removeItem(LEGACY_WALLET_STORAGE_KEY);
    triggerBalanceUpdate();
}

// ============================================
// Analytics
// ============================================

/**
 * Get wallet analytics
 */
export function getWalletAnalytics() {
    const wallet = getWallet();
    const purchases = wallet.history.filter((t: Transaction) => t.type === 'purchase');
    const consumptions = wallet.history.filter((t: Transaction) => t.type === 'consume');

    return {
        currentBalance: wallet.balance,
        totalPurchased: wallet.totalPurchased,
        totalConsumed: wallet.totalConsumed,
        purchaseCount: purchases.length,
        consumptionCount: consumptions.length,
        averagePurchase: purchases.length > 0
            ? purchases.reduce((sum: number, t: Transaction) => sum + t.jellies, 0) / purchases.length
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
