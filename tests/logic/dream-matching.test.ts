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

describe('복합어 오매칭 방지 (dda1c0d 리뷰 수정)', () => {
    it('"돈가스" 는 돈꿈이 아니다 (조사 뒤 한글 연속 차단)', () => {
        expect(matchDreamSymbols('돈가스를 맛있게 먹었다').matches.map(m => m.symbol)).not.toContain('돈');
    });
    it('"별의별" 은 별꿈이 아니다', () => {
        expect(matchDreamSymbols('별의별 생각이 다 들었다').matches.map(m => m.symbol)).not.toContain('별');
    });
    it('"이사님" 은 집꿈이 아니고 "이사하는" 은 집꿈이다', () => {
        expect(matchDreamSymbols('이사님과 회의하는 꿈').matches.map(m => m.symbol)).not.toContain('집');
        expect(matchDreamSymbols('이사하는 꿈을 꿨다').matches.map(m => m.symbol)).toContain('집');
    });
    it('르 불규칙 "날아올랐다" 도 비행으로 잡는다', () => {
        expect(matchDreamSymbols('하늘로 날아올랐다').matches.map(m => m.symbol)).toContain('비행');
    });
});

describe('신규 상징 매칭 (사전 확장 78→120+)', () => {
  it('곰이 들어오는 꿈은 곰(태몽) 상징으로 매칭된다', () => {
    const result = matchDreamSymbols('큰 곰이 품으로 들어오는 꿈');
    const top = result.matches.find((m) => m.symbol === '곰');
    expect(top).toBeDefined();
    expect(top?.category).toBe('태몽');
  });

  it('두꺼비가 들어오는 꿈은 두꺼비(재물) 상징으로 매칭된다', () => {
    expect(symbolsOf('두꺼비가 마당으로 들어오는 꿈')).toContain('두꺼비');
  });

  it('지갑 분실은 어간형(잃어버리)과 과거형(잃어버렸) 모두 매칭된다', () => {
    expect(symbolsOf('지갑을 잃어버리는 꿈을 꿨어요')).toContain('지갑');
    expect(symbolsOf('지갑을 잃어버렸다가 되찾는 꿈')).toContain('지갑');
  });

  it('1글자 별칭 "칼"은 조사 문맥에서 매칭된다', () => {
    expect(symbolsOf('칼이 반짝이는 꿈')).toContain('칼');
  });

  it('"배를 타고" 는 배(선박) 상징으로 매칭된다', () => {
    expect(symbolsOf('배를 타고 바다를 건너는 꿈')).toContain('배(선박)');
  });

  it('태풍이 몰아치면 폭풍 상징으로 매칭된다', () => {
    expect(symbolsOf('태풍이 몰아쳐서 무서웠던 꿈')).toContain('폭풍');
  });

  it('거울이 깨지는 꿈은 거울 상징으로 매칭된다', () => {
    expect(symbolsOf('거울이 깨지는 꿈을 꿨다')).toContain('거울');
  });

  it('전남친이 나오면 옛 연인 상징으로 매칭된다', () => {
    expect(symbolsOf('전남친이 나와서 이야기하는 꿈')).toContain('옛 연인');
  });

  it('쌀이 가득한 꿈은 쌀밥(재물) 상징으로 매칭된다', () => {
    expect(symbolsOf('창고에 쌀이 가득 쌓여 있는 꿈')).toContain('쌀밥');
  });

  it('차에 치이는 꿈은 교통사고 상징으로 매칭된다', () => {
    expect(symbolsOf('길을 걷다가 차에 치이는 꿈')).toContain('교통사고');
  });

  it('병원에 입원하는 꿈은 병원 상징으로 매칭된다', () => {
    expect(symbolsOf('병원에 입원해서 치료받는 꿈')).toContain('병원');
  });

  it('샤워하는 꿈은 목욕 상징으로 매칭된다 (도구격 "물로"의 물도 정당 매칭)', () => {
    // '로' 조사 허용 이후 "물로" 의 물은 정당한 매칭이다 — 물로 씻는 꿈에
    // 물 상징이 붙는 것은 의미상 옳다. 핵심 단언은 목욕 매칭 유지.
    const symbols = symbolsOf('따뜻한 물로 샤워하는 꿈');
    expect(symbols).toContain('목욕');
    expect(symbols).toContain('물');
  });
});

describe('다의어 함정 방지 (사전 확장)', () => {
  it('"배가 고파서"의 배는 선박도 과일도 아니다', () => {
    const symbols = symbolsOf('배가 고파서 잠에서 깬 꿈');
    expect(symbols).not.toContain('배(선박)');
    expect(symbols).not.toContain('과일');
  });

  it('"배가 아파서 병원에 가는 꿈"은 병원만 매칭되고 선박은 아니다', () => {
    const symbols = symbolsOf('배가 아파서 병원에 가는 꿈');
    expect(symbols).toContain('병원');
    expect(symbols).not.toContain('배(선박)');
  });

  it('"칼국수"의 칼은 칼 상징이 아니다', () => {
    expect(symbolsOf('칼국수를 끓여 먹는 꿈')).not.toContain('칼');
  });

  it('"곰팡이"의 곰은 곰 상징이 아니다', () => {
    expect(symbolsOf('벽에 곰팡이가 피어 있는 꿈')).not.toContain('곰');
  });

  it('"섬세한"의 섬은 섬 상징이 아니다', () => {
    expect(symbolsOf('섬세하게 그림을 그리는 꿈')).not.toContain('섬');
  });

  it('"눈을 감았다"의 눈은 함박눈이 아니다', () => {
    expect(symbolsOf('눈을 감았다 뜨는 꿈')).not.toContain('함박눈');
  });

  it('"책상"의 책은 책 상징이 아니고 "책을 읽"는 매칭된다', () => {
    expect(symbolsOf('책상 앞에 앉아만 있는 꿈')).not.toContain('책');
    expect(symbolsOf('두꺼운 책을 읽는 꿈')).toContain('책');
  });
});

describe('신규 조합 규칙 (사전 확장)', () => {
  it('폭풍+배(선박) 조합이 항해 시련 해석을 붙인다', () => {
    const result = matchDreamSymbols('태풍이 몰아치는 밤에 배를 타고 버티는 꿈');
    const symbols = result.matches.map((m) => m.symbol);
    expect(symbols).toContain('폭풍');
    expect(symbols).toContain('배(선박)');
    expect(result.comboInsights.length).toBeGreaterThan(0);
    expect(result.comboInsights.join(' ')).toContain('시련');
  });

  it('옛 연인+키스 조합이 관계 점검 해석을 붙인다', () => {
    const result = matchDreamSymbols('전남친과 키스하는 꿈을 꿨어요');
    const symbols = result.matches.map((m) => m.symbol);
    expect(symbols).toContain('옛 연인');
    expect(symbols).toContain('키스');
    expect(result.comboInsights.length).toBeGreaterThan(0);
  });
});

describe('사전 무결성 (확장판)', () => {
  it('상징 수가 120개 이상이다', () => {
    expect(DREAM_DICTIONARY.length).toBeGreaterThanOrEqual(120);
  });

  it('모든 카테고리에 최소 1개 이상의 상징이 존재한다', () => {
    for (const category of DREAM_CATEGORIES) {
      expect(
        DREAM_DICTIONARY.some((entry) => entry.category === category)
      ).toBe(true);
    }
  });
});

describe('도구격·한정 조사 허용 (로/만)', () => {
    it('"물로 씻는 꿈" 은 물꿈이다', () => {
        expect(matchDreamSymbols('물로 씻는 꿈').matches.map(m => m.symbol)).toContain('물');
    });
    it('"칼로리 계산" 은 칼꿈이 아니다 (조사 뒤 한글 연속 차단)', () => {
        expect(matchDreamSymbols('칼로리 계산을 하는 꿈').matches.map(m => m.symbol)).not.toContain('칼');
    });
});

describe('사전 무결성 — 별칭 포함 관계는 긴 쪽 우선으로 해소된다', () => {
    it('다른 상징 별칭에 포함되는 별칭 전수: 긴 별칭 입력 시 긴 쪽 상징이 매칭된다', () => {
        // "긴 별칭 우선 + 구간 소비" 불변식을 사전 전체에 대해 실행으로 고정한다.
        // (예: '물' ⊂ '강물이 흐르' — 강(江) 상징이 이겨야 한다)
        const pairs: Array<{ shortSym: string; longSym: string; longAlias: string }> = [];
        for (const a of DREAM_DICTIONARY) {
            for (const b of DREAM_DICTIONARY) {
                if (a.symbol === b.symbol) continue;
                for (const shortAlias of a.aliases) {
                    for (const longAlias of b.aliases) {
                        if (longAlias !== shortAlias && longAlias.includes(shortAlias)) {
                            pairs.push({ shortSym: a.symbol, longSym: b.symbol, longAlias });
                        }
                    }
                }
            }
        }
        expect(pairs.length).toBeGreaterThan(0);
        for (const p of pairs) {
            const symbols = matchDreamSymbols(`${p.longAlias}는 꿈`).matches.map(m => m.symbol);
            expect(symbols, `"${p.longAlias}" → ${p.longSym} (${p.shortSym} 가 가로채면 안 됨)`).toContain(p.longSym);
        }
    });
});

describe('조합 해석 — 표시 상위 3개 밖의 상징도 조합에 참여한다', () => {
    it('고가중치 상징 3개에 밀려도 조합 멤버가 전체 매칭에 있으면 발화한다', () => {
        // 돼지+돈 조합 멤버가 top-3 에서 밀리도록 고가중치 상징들을 함께 넣는다
        const r = matchDreamSymbols('용이 하늘로 오르고 호랑이가 나타나고 돼지가 돈을 물고 왔다');
        expect(r.matches.length).toBe(3);
        const shown = r.matches.map(m => m.symbol);
        const comboFired = r.comboInsights.some(t => t.includes('돼지와 돈'));
        // 전제: 돼지·돈 중 최소 하나는 top-3 밖 (아니면 이 테스트는 게이트를 검증하지 못한다)
        expect(shown.includes('돼지') && shown.includes('돈')).toBe(false);
        expect(comboFired).toBe(true);
    });
});
