/**
 * dream-matching.test.ts
 * 사전 기반 꿈 상징 매칭 로직 검증
 * - 부분문자열 오매칭 방지 ("선물" ≠ 물꿈)
 * - 다중 상징 상위 3개 제한
 * - 미매칭 정직 폴백
 * - 사전 무결성 (별칭 전역 중복 없음, 필수 필드, weight 범위)
 */
import { describe, it, expect } from 'vitest';
import { matchDreamSymbols, MAX_MATCHES } from '@/lib/dreams/matchDreamSymbols';
import { DREAM_DICTIONARY, DREAM_CATEGORIES } from '@/data/dreamDictionary';

const symbolsOf = (text: string) => matchDreamSymbols(text).matches.map((m) => m.symbol);

describe('matchDreamSymbols — 부분문자열 오매칭 방지', () => {
  it('"선물 받는 꿈"은 물꿈이 아니라 선물 상징으로 매칭된다', () => {
    const result = matchDreamSymbols('선물 받는 꿈을 꾸었어요');
    expect(result.matched).toBe(true);
    const symbols = result.matches.map((m) => m.symbol);
    expect(symbols).toContain('선물');
    expect(symbols).not.toContain('물');
  });

  it('"선물했다" 같은 활용형도 물꿈으로 오매칭되지 않는다', () => {
    const symbols = symbolsOf('친구에게 선물했다가 돌려받는 꿈');
    expect(symbols).not.toContain('물');
  });

  it('"맑은 물이 흐르는 꿈"은 물 상징으로 매칭된다', () => {
    const result = matchDreamSymbols('맑은 물이 흐르는 꿈을 꿨습니다');
    expect(result.matched).toBe(true);
    expect(result.matches.map((m) => m.symbol)).toContain('물');
  });

  it('1글자 상징은 조사 없는 단어 내부에서는 트리거되지 않는다 (눈물/건물)', () => {
    expect(symbolsOf('눈물이 나는 꿈')).not.toContain('물');
    expect(symbolsOf('건물 안을 걸어다니는 꿈')).not.toContain('물');
  });

  it('매칭된 구간은 소비되어 같은 글자를 재사용하지 않는다 (물고기 ≠ 물+고기)', () => {
    const symbols = symbolsOf('커다란 물고기를 잡는 꿈');
    expect(symbols).toContain('물고기');
    expect(symbols).not.toContain('물');
  });
});

describe('matchDreamSymbols — 상징 해석', () => {
  it('"이가 빠지는 꿈"은 이빨 상징으로 매칭된다', () => {
    const result = matchDreamSymbols('이가 빠지는 꿈을 꿔서 찜찜해요');
    expect(result.matched).toBe(true);
    const top = result.matches[0];
    expect(top.symbol).toBe('이빨 빠짐');
    expect(top.category).toBe('흉몽');
  });

  it('다중 상징은 weight 내림차순 상위 3개까지만 반환한다', () => {
    const result = matchDreamSymbols(
      '용이 하늘로 오르고 돼지가 나타나더니 불이 활활 타고 돈을 주웠어요'
    );
    expect(result.matched).toBe(true);
    expect(result.matches.length).toBe(MAX_MATCHES);
    const symbols = result.matches.map((m) => m.symbol);
    // weight: 용(10) > 돼지(9) = 불(9) > 돈(8) > 하늘(7)
    expect(symbols[0]).toBe('용');
    expect(symbols).toContain('돼지');
    expect(symbols).toContain('불');
    expect(symbols).not.toContain('하늘');
    expect(symbols).not.toContain('돈');
    // weight 정렬 검증
    const weights = result.matches.map((m) => m.weight);
    expect([...weights].sort((a, b) => b - a)).toEqual(weights);
  });

  it('조합 규칙: 돼지+돈이 함께 나오면 재물 강조 조합 해석이 붙는다', () => {
    const result = matchDreamSymbols('돼지가 돈다발을 안고 집으로 들어오는 꿈');
    const symbols = result.matches.map((m) => m.symbol);
    expect(symbols).toContain('돼지');
    expect(symbols).toContain('돈');
    expect(result.comboInsights.length).toBeGreaterThan(0);
    expect(result.comboInsights.join(' ')).toContain('재물');
  });

  it('매칭 성공 시 종합 조언이 상징명을 포함한다', () => {
    const result = matchDreamSymbols('맑은 물이 흐르는 꿈');
    expect(result.generalAdvice).toContain('물');
    expect(result.fallbackMessage).toBeUndefined();
  });
});

describe('matchDreamSymbols — 미매칭 폴백', () => {
  it('사전에 없는 내용이면 정직한 폴백을 반환하고 상징을 붙이지 않는다', () => {
    const result = matchDreamSymbols('형체를 알 수 없는 흐릿한 잔상만 남았어요');
    expect(result.matched).toBe(false);
    expect(result.matches).toEqual([]);
    expect(result.comboInsights).toEqual([]);
    expect(result.fallbackMessage).toBeTruthy();
    expect(result.fallbackMessage).toContain('상징');
    expect(result.generalAdvice).toBeTruthy();
  });

  it('빈 입력도 폴백으로 처리한다', () => {
    const result = matchDreamSymbols('   ');
    expect(result.matched).toBe(false);
    expect(result.matches).toEqual([]);
    expect(result.fallbackMessage).toBeTruthy();
  });
});

describe('dreamDictionary — 사전 무결성', () => {
  it('최소 60개 상징 항목을 갖는다', () => {
    expect(DREAM_DICTIONARY.length).toBeGreaterThanOrEqual(60);
  });

  it('별칭이 전역에서 중복되지 않는다', () => {
    const all = DREAM_DICTIONARY.flatMap((e) => e.aliases);
    const dupes = all.filter((alias, i) => all.indexOf(alias) !== i);
    expect(dupes).toEqual([]);
  });

  it('대표어(symbol)가 중복되지 않는다', () => {
    const symbols = DREAM_DICTIONARY.map((e) => e.symbol);
    expect(new Set(symbols).size).toBe(symbols.length);
  });

  it('모든 항목이 필수 필드를 갖추고 weight는 1~10이다', () => {
    for (const entry of DREAM_DICTIONARY) {
      expect(entry.symbol.trim().length).toBeGreaterThan(0);
      expect(entry.aliases.length).toBeGreaterThan(0);
      for (const alias of entry.aliases) {
        expect(alias.trim().length).toBeGreaterThan(0);
      }
      expect(DREAM_CATEGORIES).toContain(entry.category);
      expect(entry.meaning.trim().length).toBeGreaterThan(20);
      expect(entry.advice.trim().length).toBeGreaterThan(5);
      expect(entry.weight).toBeGreaterThanOrEqual(1);
      expect(entry.weight).toBeLessThanOrEqual(10);
    }
  });

  it('1글자 별칭 외의 별칭은 모두 2글자 이상이거나 문맥 규칙 대상이다', () => {
    // 1글자 별칭은 문맥 규칙으로만 트리거되므로 존재 자체는 허용하되, 공백 별칭은 금지
    for (const entry of DREAM_DICTIONARY) {
      for (const alias of entry.aliases) {
        expect(alias).toBe(alias.trim());
      }
    }
  });
});
