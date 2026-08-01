/**
 * jelly-wallet 엔진 단위 테스트
 *
 * - 레거시(churu) 지갑 마이그레이션 멱등성
 * - 웰컴 보너스 1회성
 * - 로컬 차감 / 잔액 부족 / 음수 금액 거부
 * - FREE_LAUNCH 게이트 (순수 함수 evaluateConsumeGate 로 false 분기까지 고정)
 *
 * vitest node 환경이므로 localStorage 대신 in-memory 스토리지를 주입한다.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
    __setWalletStorageForTests,
    addJelly,
    consumeJellyLocal,
    evaluateConsumeGate,
    getBalance,
    getHistory,
    getWallet,
    LEGACY_MIGRATION_PURPOSE,
    WELCOME_BONUS_PURPOSE,
    type WalletStorage,
} from '@/lib/payment/jelly-wallet';
import { WELCOME_JELLY } from '@/config/constants';

const WALLET_KEY = 'secret_paws_jelly_wallet';
const LEGACY_KEY = 'secret_paws_wallet';

class MemoryStorage implements WalletStorage {
    private map = new Map<string, string>();

    getItem(key: string): string | null {
        return this.map.has(key) ? this.map.get(key)! : null;
    }
    setItem(key: string, value: string): void {
        this.map.set(key, String(value));
    }
    removeItem(key: string): void {
        this.map.delete(key);
    }
    has(key: string): boolean {
        return this.map.has(key);
    }
}

// 비로그인 로컬 사용자 기준으로 게이트를 고정한다 (FREE_LAUNCH 상수와 무관하게).
const PAID_GATE = { freeLaunch: false, isAdmin: false } as const;

let storage: MemoryStorage;

beforeEach(() => {
    storage = new MemoryStorage();
    __setWalletStorageForTests(storage);
});

afterEach(() => {
    __setWalletStorageForTests(null);
});

describe('웰컴 보너스', () => {
    it('신규 지갑 생성 시 WELCOME_JELLY 만큼 welcome_bonus 트랜잭션으로 적립된다', () => {
        const wallet = getWallet();

        expect(wallet.balance).toBe(WELCOME_JELLY);
        expect(wallet.totalPurchased).toBe(WELCOME_JELLY);

        const welcomeTxs = wallet.history.filter((t) => t.purpose === WELCOME_BONUS_PURPOSE);
        expect(welcomeTxs).toHaveLength(1);
        expect(welcomeTxs[0].type).toBe('purchase');
        expect(welcomeTxs[0].amount).toBe(WELCOME_JELLY);
    });

    it('두 번 초기화해도 웰컴 보너스는 1회만 적립된다', () => {
        getWallet();
        getWallet();
        getBalance();

        const wallet = getWallet();
        expect(wallet.balance).toBe(WELCOME_JELLY);
        expect(
            wallet.history.filter((t) => t.purpose === WELCOME_BONUS_PURPOSE)
        ).toHaveLength(1);
    });

    it('기존 지갑이 저장돼 있으면 웰컴 보너스를 추가로 지급하지 않는다', () => {
        storage.setItem(
            WALLET_KEY,
            JSON.stringify({
                balance: 10,
                totalPurchased: 10,
                totalConsumed: 0,
                history: [],
                lastUpdated: Date.now(),
            })
        );

        const wallet = getWallet();
        expect(wallet.balance).toBe(10);
        expect(
            wallet.history.filter((t) => t.purpose === WELCOME_BONUS_PURPOSE)
        ).toHaveLength(0);
    });
});

describe('레거시 churu 지갑 마이그레이션', () => {
    it('레거시 잔액을 legacy_churu_migration 트랜잭션으로 합산 적립하고 레거시 키를 삭제한다', () => {
        storage.setItem(LEGACY_KEY, JSON.stringify({ churu: 7, nyang: 2 }));

        const wallet = getWallet();

        // 신규 지갑이므로 웰컴 보너스 + 레거시 이관이 함께 반영된다.
        expect(wallet.balance).toBe(WELCOME_JELLY + 7);

        const migrationTxs = wallet.history.filter(
            (t) => t.purpose === LEGACY_MIGRATION_PURPOSE
        );
        expect(migrationTxs).toHaveLength(1);
        expect(migrationTxs[0].type).toBe('purchase');
        expect(migrationTxs[0].amount).toBe(7);

        expect(storage.has(LEGACY_KEY)).toBe(false);
    });

    it('기존 젤리 지갑이 있으면 레거시 이관만 수행한다 (웰컴 보너스 없음)', () => {
        storage.setItem(
            WALLET_KEY,
            JSON.stringify({
                balance: 5,
                totalPurchased: 5,
                totalConsumed: 0,
                history: [],
                lastUpdated: Date.now(),
            })
        );
        storage.setItem(LEGACY_KEY, JSON.stringify({ churu: 4, nyang: 0 }));

        const wallet = getWallet();
        expect(wallet.balance).toBe(9);
        expect(
            wallet.history.filter((t) => t.purpose === WELCOME_BONUS_PURPOSE)
        ).toHaveLength(0);
    });

    it('멱등성: 마이그레이션 기록이 있으면 레거시 키가 다시 나타나도 재적립하지 않는다', () => {
        storage.setItem(LEGACY_KEY, JSON.stringify({ churu: 7, nyang: 0 }));
        const first = getWallet();
        expect(first.balance).toBe(WELCOME_JELLY + 7);

        // 레거시 키가 (다른 탭의 낡은 코드 등으로) 되살아난 상황을 재현.
        storage.setItem(LEGACY_KEY, JSON.stringify({ churu: 7, nyang: 0 }));
        const second = getWallet();

        expect(second.balance).toBe(WELCOME_JELLY + 7);
        expect(
            second.history.filter((t) => t.purpose === LEGACY_MIGRATION_PURPOSE)
        ).toHaveLength(1);
        // 재적립 없이 키만 제거된다.
        expect(storage.has(LEGACY_KEY)).toBe(false);
    });

    it('레거시 값이 손상되었거나 0 이하면 적립 없이 키만 삭제한다', () => {
        storage.setItem(LEGACY_KEY, 'not-json');

        const wallet = getWallet();
        expect(wallet.balance).toBe(WELCOME_JELLY);
        expect(
            wallet.history.filter((t) => t.purpose === LEGACY_MIGRATION_PURPOSE)
        ).toHaveLength(0);
        expect(storage.has(LEGACY_KEY)).toBe(false);
    });
});

describe('로컬 차감 (consumeJellyLocal, 유료 게이트 고정)', () => {
    it('잔액이 충분하면 차감하고 consume 트랜잭션을 남긴다', () => {
        const result = consumeJellyLocal(2, 'test_consume', undefined, PAID_GATE);

        expect(result.success).toBe(true);
        expect(result.remainingBalance).toBe(WELCOME_JELLY - 2);
        expect(getBalance()).toBe(WELCOME_JELLY - 2);

        const wallet = getWallet();
        expect(wallet.totalConsumed).toBe(2);
        const consumeTx = wallet.history.find((t) => t.purpose === 'test_consume');
        expect(consumeTx?.type).toBe('consume');
        expect(consumeTx?.amount).toBe(-2);
    });

    it('잔액 부족이면 실패하고 잔액이 변하지 않는다', () => {
        const result = consumeJellyLocal(WELCOME_JELLY + 1, 'too_expensive', undefined, PAID_GATE);

        expect(result.success).toBe(false);
        expect(result.error).toBe('젤리가 부족합니다.');
        expect(getBalance()).toBe(WELCOME_JELLY);
    });

    it('0 이하/비유한 금액은 거부한다', () => {
        for (const amount of [0, -1, -100, NaN, Infinity]) {
            const result = consumeJellyLocal(amount, 'invalid_amount', undefined, PAID_GATE);
            expect(result.success).toBe(false);
            expect(result.error).toBe('유효하지 않은 금액입니다.');
        }
        expect(getBalance()).toBe(WELCOME_JELLY);
    });

    it('연속 차감은 남은 잔액 기준으로 판정된다 (이중 차감 방지)', () => {
        expect(consumeJellyLocal(WELCOME_JELLY, 'first', undefined, PAID_GATE).success).toBe(true);
        expect(consumeJellyLocal(1, 'second', undefined, PAID_GATE).success).toBe(false);
        expect(getBalance()).toBe(0);
    });
});

describe('FREE_LAUNCH / 관리자 게이트 (evaluateConsumeGate)', () => {
    it('무료 기간에는 잔액과 무관하게 차감 없이 허용한다', () => {
        const decision = evaluateConsumeGate({
            amount: 40,
            balance: 0,
            freeLaunch: true,
            isAdmin: false,
        });
        expect(decision).toEqual({ allowed: true, deduct: false });
    });

    it('관리자는 차감 없이 허용한다', () => {
        const decision = evaluateConsumeGate({
            amount: 40,
            balance: 0,
            freeLaunch: false,
            isAdmin: true,
        });
        expect(decision).toEqual({ allowed: true, deduct: false });
    });

    it('FREE_LAUNCH=false: 잔액이 충분하면 차감을 지시하고, 부족하면 거부한다', () => {
        expect(
            evaluateConsumeGate({ amount: 3, balance: 5, freeLaunch: false, isAdmin: false })
        ).toEqual({ allowed: true, deduct: true });

        const denied = evaluateConsumeGate({
            amount: 3,
            balance: 2,
            freeLaunch: false,
            isAdmin: false,
        });
        expect(denied.allowed).toBe(false);
        if (!denied.allowed) {
            expect(denied.error).toBe('젤리가 부족합니다.');
        }
    });

    it('FREE_LAUNCH=false: 0 이하 금액은 거부한다', () => {
        const denied = evaluateConsumeGate({
            amount: -3,
            balance: 100,
            freeLaunch: false,
            isAdmin: false,
        });
        expect(denied.allowed).toBe(false);
    });

    it('consumeJellyLocal 은 무료 기간 게이트에서 차감 없이 성공한다', () => {
        const result = consumeJellyLocal(999, 'free_launch_consume', undefined, {
            freeLaunch: true,
            isAdmin: false,
        });
        expect(result.success).toBe(true);
        expect(getBalance()).toBe(WELCOME_JELLY);
        // 차감이 없으므로 consume 트랜잭션도 남지 않는다.
        expect(getHistory().some((t) => t.purpose === 'free_launch_consume')).toBe(false);
    });
});

describe('적립 (addJelly)', () => {
    it("환불 적립은 'refund' 타입 트랜잭션으로 남는다", () => {
        consumeJellyLocal(3, 'saju_premium_analysis', undefined, PAID_GATE);
        expect(getBalance()).toBe(WELCOME_JELLY - 3);

        addJelly(3, 'refund_calc_failure');

        const wallet = getWallet();
        expect(wallet.balance).toBe(WELCOME_JELLY);
        expect(wallet.totalConsumed).toBe(0);
        const refundTx = wallet.history.find((t) => t.purpose === 'refund_calc_failure');
        expect(refundTx?.type).toBe('refund');
        expect(refundTx?.amount).toBe(3);
    });

    it('일반 적립은 purchase 타입으로 기록되고, 0 이하 금액은 무시한다', () => {
        addJelly(5, 'promo_gift');
        expect(getBalance()).toBe(WELCOME_JELLY + 5);
        expect(getWallet().totalPurchased).toBe(WELCOME_JELLY + 5);

        addJelly(0, 'noop');
        addJelly(-10, 'noop');
        expect(getBalance()).toBe(WELCOME_JELLY + 5);
    });
});
