/**
 * tarot-reading.test.ts — 타로 리딩 조합 전수 검사
 *
 * 78장 × 정/역 2 × 포지션 3 × 주제 4 = 1,872 조합이 사용자에게 나가는
 * 문장의 전체 공간이다. 표본이 아니라 전수를 검사한다 — 어떤 카드를
 * 뽑아도 빈 문장·영어 누출·템플릿 사고("undefined")가 없음을 기계로 보장.
 */
import { describe, it, expect } from 'vitest';
import {
    TAROT_TOPICS,
    TarotTopic,
    buildTarotDeckCards,
    buildTopicReading,
    describeSpreadPattern,
    DrawnTarotCard,
} from '@/data/tarotDeck';

const DECK = buildTarotDeckCards();
const POSITIONS = [0, 1, 2] as const;
const ORIENTATIONS = [false, true] as const;

function drawn(card: (typeof DECK)[number], isReversed: boolean): DrawnTarotCard {
    return { ...card, isReversed };
}

describe('buildTopicReading — 1,872 조합 전수', () => {
    it('덱은 78장, 주제는 4개다 (조합 공간의 전제)', () => {
        expect(DECK.length).toBe(78);
        expect(TAROT_TOPICS.length).toBe(4);
        expect(new Set(TAROT_TOPICS.map((t) => t.key)).size).toBe(4);
    });

    it('모든 조합이 비어 있지 않고 템플릿 사고가 없다', () => {
        const violations: string[] = [];
        for (const card of DECK) {
            for (const isReversed of ORIENTATIONS) {
                for (const position of POSITIONS) {
                    for (const topic of TAROT_TOPICS) {
                        const text = buildTopicReading(drawn(card, isReversed), position, topic.key);
                        const tag = `${card.code}/${isReversed ? '역' : '정'}/${position}/${topic.key}`;
                        if (!text.trim()) violations.push(`${tag}: 빈 문장`);
                        if (/undefined|null|NaN|\[object Object\]/.test(text)) violations.push(`${tag}: 템플릿 누출`);
                        if (/ {2,}/.test(text)) violations.push(`${tag}: 이중 공백`);
                        if (text.length < 40) violations.push(`${tag}: 너무 짧음(${text.length})`);
                    }
                }
            }
        }
        expect(violations, violations.slice(0, 5).join('\n')).toEqual([]);
    });

    it('같은 카드라도 24개 변형(정/역×포지션×주제)이 전부 서로 다르다', () => {
        for (const card of [DECK[0], DECK[21], DECK[22], DECK[77]]) {
            const variants = new Set<string>();
            for (const isReversed of ORIENTATIONS) {
                for (const position of POSITIONS) {
                    for (const topic of TAROT_TOPICS) {
                        variants.add(buildTopicReading(drawn(card, isReversed), position, topic.key));
                    }
                }
            }
            expect(variants.size, `${card.code} 변형 수`).toBe(24);
        }
    });

    it('주제 프레임과 포지션 꼬리가 실제로 문장에 반영된다', () => {
        const card = drawn(DECK[30], false);
        const love = buildTopicReading(card, 1, 'love');
        const money = buildTopicReading(card, 1, 'money');
        expect(love).toContain('관계의 흐름');
        expect(money).toContain('돈과 재물의 흐름');
        const past = buildTopicReading(card, 0, 'today');
        const future = buildTopicReading(card, 2, 'today');
        expect(past).toContain('지나온 자리');
        expect(future).toContain('향하게 되는 방향');
    });

    it('알 수 없는 주제 키는 기본 주제로 안전하게 처리된다', () => {
        const text = buildTopicReading(drawn(DECK[0], false), 0, 'unknown' as TarotTopic);
        expect(text).toContain('오늘 하루의 흐름');
    });
});

describe('describeSpreadPattern — 구성 관찰', () => {
    const bySuit = (suit: string) => DECK.filter((card) => card.suit === suit);
    const majors = DECK.filter((card) => card.arcana === 'major');

    it('수트 2장 이상이면 지배 수트를 알려준다', () => {
        const wands = bySuit('wands');
        const notes = describeSpreadPattern([drawn(wands[0], false), drawn(wands[1], false), drawn(majors[0], false)]);
        expect(notes.some((note) => note.includes('완즈') && note.includes('2장'))).toBe(true);
    });

    it('메이저 2장 이상·역방향 2장 이상 신호를 각각 알려준다', () => {
        const notes = describeSpreadPattern([drawn(majors[0], true), drawn(majors[1], true), drawn(bySuit('cups')[0], false)]);
        expect(notes.some((note) => note.includes('메이저 아르카나가 2장'))).toBe(true);
        expect(notes.some((note) => note.includes('역방향이 2장'))).toBe(true);
    });

    it('쏠림이 없으면 균형 안내 한 문장을 준다 (빈 배열 금지)', () => {
        const notes = describeSpreadPattern([
            drawn(bySuit('wands')[0], false),
            drawn(bySuit('cups')[0], false),
            drawn(bySuit('swords')[0], true),
        ]);
        expect(notes.length).toBeGreaterThan(0);
        expect(notes.some((note) => note.includes('같은 무게'))).toBe(true);
    });

    it('빈 입력은 빈 배열 (그리기 전 상태)', () => {
        expect(describeSpreadPattern([])).toEqual([]);
    });
});
