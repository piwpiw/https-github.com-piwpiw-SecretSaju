/**
 * 타로 덱 불변식.
 *
 * 이 덱은 트럼프(A~K 13장) 구조로 만들어져 있었다. 타로 코트 카드는 네 장이라
 * (시종·기사·여왕·왕) 수트마다 14장이어야 하는데 기사(Knight)가 빠져
 * 수트마다 13장, 전체 74장이었다. 4장이 사라진 걸 아무도 몰랐다.
 *
 * 장수와 구조는 눈으로 세지 않는다.
 */

import { describe, it, expect } from 'vitest';
import { buildTarotDeckCards, resolveTarotImageUrl } from '@/data/tarotDeck';

const deck = buildTarotDeckCards();
const majors = deck.filter((c) => c.arcana === 'major');
const minors = deck.filter((c) => c.arcana === 'minor');

describe('덱 구성', () => {
    it('78장이다 (메이저 22 + 마이너 56)', () => {
        expect(deck).toHaveLength(78);
        expect(majors).toHaveLength(22);
        expect(minors).toHaveLength(56);
    });

    it('수트 4개가 각각 14장이다', () => {
        const bySuit = new Map<string, number>();
        for (const card of minors) {
            const suit = card.suit ?? '(없음)';
            bySuit.set(suit, (bySuit.get(suit) ?? 0) + 1);
        }
        expect(Array.from(bySuit.keys()).sort()).toEqual(['cups', 'pentacles', 'swords', 'wands']);
        for (const count of Array.from(bySuit.values())) expect(count).toBe(14);
    });

    it('수트마다 코트 카드 네 장이 다 있다', () => {
        for (const suit of ['wands', 'cups', 'swords', 'pentacles']) {
            const courts = minors
                .filter((c) => c.suit === suit && ['P', 'N', 'Q', 'K'].includes(c.rank ?? ''))
                .map((c) => c.rank)
                .sort();
            expect(courts, `${suit} 코트`).toEqual(['K', 'N', 'P', 'Q']);
        }
    });

    it('메이저 번호가 0부터 21까지 빠짐없이 있다', () => {
        expect(majors.map((c) => c.number ?? -1).sort((a, b) => a - b))
            .toEqual(Array.from({ length: 22 }, (_, i) => i));
    });

    it('코드와 순번이 중복되지 않는다', () => {
        expect(new Set(deck.map((c) => c.code)).size).toBe(78);
        expect(new Set(deck.map((c) => c.sequence)).size).toBe(78);
    });
});

describe('카드 의미', () => {
    it('78장의 정방향 문구가 모두 다르다', () => {
        // 예전에는 마이너 전부가 같은 문장이었다. 어떤 카드를 뽑아도 결과가 같았다.
        expect(new Set(deck.map((c) => c.meaning_upright)).size).toBe(78);
    });

    it('78장의 역방향 문구가 모두 다르다', () => {
        expect(new Set(deck.map((c) => c.meaning_reversed)).size).toBe(78);
    });

    it('한 카드의 정방향과 역방향이 서로 다르다', () => {
        for (const card of deck) {
            expect(card.meaning_upright, card.code).not.toBe(card.meaning_reversed);
        }
    });

    it('필수 항목이 비어 있지 않다', () => {
        for (const card of deck) {
            for (const key of ['code', 'name_kr', 'name_en', 'meaning_upright', 'meaning_reversed', 'image_key'] as const) {
                const value = card[key];
                expect(typeof value, `${card.code}.${key}`).toBe('string');
                expect((value as string).length, `${card.code}.${key}`).toBeGreaterThan(0);
                expect(value as string, `${card.code}.${key}`).not.toMatch(/undefined|NaN|\[object/);
            }
        }
    });
});

describe('한국어 표기', () => {
    it('카드 이름에 한자가 없다', () => {
        // 바보 카드만 '愚者' 로 남아 있었다
        for (const card of deck) {
            expect(card.name_kr, card.code).not.toMatch(/[一-鿿]/);
        }
    });

    it('은/는 조사가 받침에 맞는다', () => {
        // 메이저 설명이 `${이름}은` 으로 고정돼 "마법사은", "악마은" 이 나왔다
        for (const card of majors) {
            const matched = card.meaning_upright.match(/^(.+?)(은|는) /);
            if (!matched) continue;

            const lastChar = matched[1].trim().slice(-1).charCodeAt(0);
            if (lastChar < 0xac00 || lastChar > 0xd7a3) continue;

            const hasFinalConsonant = (lastChar - 0xac00) % 28 !== 0;
            expect(matched[2], `${card.name_kr} — 받침 ${hasFinalConsonant ? '있음' : '없음'}`)
                .toBe(hasFinalConsonant ? '은' : '는');
        }
    });

    it('을/를 조사가 받침에 맞는다', () => {
        for (const card of minors) {
            const matched = card.meaning_reversed.match(/(\S+?)(을|를) 먼저/);
            if (!matched) continue;

            const lastChar = matched[1].slice(-1).charCodeAt(0);
            if (lastChar < 0xac00 || lastChar > 0xd7a3) continue;

            const hasFinalConsonant = (lastChar - 0xac00) % 28 !== 0;
            expect(matched[2], `${card.code}`).toBe(hasFinalConsonant ? '을' : '를');
        }
    });
});

describe('이미지 경로', () => {
    it('78장 모두 같은 규칙의 경로를 만든다', () => {
        for (const card of deck) {
            expect(resolveTarotImageUrl(card), card.code)
                .toMatch(/^\/tarot-decks\/[a-z_]+\/[A-Z]{2}\d{2}(-[A-Z0-9]{1,2})?\.png$/);
        }
        expect(new Set(deck.map((c) => resolveTarotImageUrl(c))).size).toBe(78);
    });
});
