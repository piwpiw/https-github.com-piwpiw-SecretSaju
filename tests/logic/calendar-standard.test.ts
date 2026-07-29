/**
 * 만세력 표준 적합성 회귀 테스트
 *
 * 사주의 네 기둥은 전부 "언제 해가 바뀌는가"에 걸려 있다. 여기서 어긋나면
 * 예외도 안 나고 그럴듯한 사주가 하나 나온다. 사람이 눈으로 잡을 수 없는
 * 종류라 외부 기준과 대조해 둔다.
 *
 * 1) 일주: 60갑자 일진은 율리우스 적일(JDN)과 고정 관계다.
 *      ganjiIndex = (JDN + 49) mod 60,  0 = 갑자
 *    JDN 은 그레고리력 → 적일 표준 변환식(Fliegel & Van Flandern)으로
 *    코드와 무관하게 직접 계산해 1900~2100 전 구간을 대조한다.
 *
 * 2) 절기 시각: 천문 계산은 세계시(UT), 엔진 입력 `baseDateKST` 는 KST
 *    벽시계다. 예전에는 이 둘을 그대로 비교해서 2024년 입춘(KST 17:27)이
 *    08:12 로 취급됐고, 그 9시간 사이에 태어난 사람의 연주가 한 해 밀렸다.
 */
import { describe, it, expect } from 'vitest';
import { getYearPillar, getMonthPillar, getDayPillar, getHourPillar } from '@/core/calendar/ganji';
import { getAnnualSolarTerms } from '@/core/astronomy/solar-terms';

/** Fliegel & Van Flandern 그레고리력 → 율리우스 적일 */
function julianDayNumber(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day + Math.floor((153 * m + 2) / 5) + 365 * y
    + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
  );
}

const STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

function ganjiFromJdn(year: number, month: number, day: number): string {
  const index = ((julianDayNumber(year, month, day) + 49) % 60 + 60) % 60;
  return STEMS[index % 10] + BRANCHES[index % 12];
}

/** 절기 Date 는 KST 벽시계를 로컬 필드에 담고 있다. 같은 관례로 읽는다. */
function wallClock(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} `
    + `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function lichunOf(year: number): Date {
  const term = getAnnualSolarTerms(year).find(t => t.name === '입춘');
  if (!term) throw new Error(`${year}년 입춘을 찾지 못했다`);
  return term.date;
}

describe('일주 — 율리우스 적일 기준 대조', () => {
  it('널리 인용되는 날짜의 일진이 맞는다', () => {
    // 두 날짜 모두 만세력에서 흔히 확인되는 기준점이다.
    expect(getDayPillar(new Date(1949, 9, 1)).fullName).toBe('갑자'); // 1949-10-01
    expect(getDayPillar(new Date(2024, 0, 1)).fullName).toBe('갑자'); // 2024-01-01
  });

  it('1900~2100 전 구간이 JDN 계산과 일치한다', () => {
    const mismatches: string[] = [];
    const end = Date.UTC(2100, 11, 31);

    for (let t = Date.UTC(1900, 0, 1); t <= end; t += 86_400_000) {
      const utc = new Date(t);
      const year = utc.getUTCFullYear();
      const month = utc.getUTCMonth() + 1;
      const day = utc.getUTCDate();

      const expected = ganjiFromJdn(year, month, day);
      const actual = getDayPillar(new Date(year, month - 1, day)).fullName;
      if (actual !== expected) {
        mismatches.push(`${year}-${month}-${day}: 기대 ${expected}, 실제 ${actual}`);
        if (mismatches.length > 5) break;
      }
    }

    expect(mismatches).toEqual([]);
  });
});

describe('연주 — 입춘 경계', () => {
  it('간지 연도 공식이 알려진 해와 맞는다', () => {
    // 입춘 이후로 확실히 지난 날짜를 골라 경계 영향을 뺀다.
    expect(getYearPillar(new Date(1984, 5, 1)).fullName).toBe('갑자');
    expect(getYearPillar(new Date(2000, 5, 1)).fullName).toBe('경진');
    expect(getYearPillar(new Date(2024, 5, 1)).fullName).toBe('갑진');
    expect(getYearPillar(new Date(2044, 5, 1)).fullName).toBe('갑자');
  });

  it('입춘 시각이 KST 벽시계다 (UT 로 9시간 밀리지 않는다)', () => {
    // 한국천문연구원 역서: 2024년 입춘 2월 4일 17:27 KST.
    // 시간대 보정이 빠지면 08:12 로 나왔다.
    expect(wallClock(lichunOf(2024))).toMatch(/^2024-02-04 1[67]:/);
    expect(wallClock(lichunOf(2025))).toMatch(/^2025-02-03 2[23]:/);
  });

  it('입춘 직전과 직후에 연주가 바뀐다', () => {
    for (const year of [2023, 2024, 2025, 2026]) {
      const lichun = lichunOf(year);
      const before = new Date(lichun.getTime() - 60 * 60 * 1000);
      const after = new Date(lichun.getTime() + 60 * 60 * 1000);

      expect(getYearPillar(before).fullName).not.toBe(getYearPillar(after).fullName);
      // 입춘 이후가 그해의 간지여야 한다 (전년도가 아니라).
      expect(getYearPillar(after).ganjiIndex).toBe(((year - 4) % 60 + 60) % 60);
    }
  });
});

describe('월주 — 절입 경계', () => {
  it('입춘 이후 첫 달은 인월이다', () => {
    for (const year of [2023, 2024, 2025, 2026]) {
      const after = new Date(lichunOf(year).getTime() + 60 * 60 * 1000);
      const month = getMonthPillar(after, getYearPillar(after).stemIndex);
      expect(month.branch).toBe('인');
    }
  });

  it('오호둔 — 연간에 따라 인월의 천간이 정해진다', () => {
    // 갑·기년 병인, 을·경년 무인, 병·신년 경인, 정·임년 임인, 무·계년 갑인
    const expected: Record<number, string> = { 0: '병인', 1: '무인', 2: '경인', 3: '임인', 4: '갑인' };
    for (const year of [2022, 2023, 2024, 2025, 2026]) {
      const after = new Date(lichunOf(year).getTime() + 60 * 60 * 1000);
      const yearStem = getYearPillar(after).stemIndex;
      const month = getMonthPillar(after, yearStem);
      expect(month.fullName).toBe(expected[yearStem % 5]);
    }
  });
});

describe('시주 — 시지 경계', () => {
  /** 시각(시:분)만 바꿔 시지를 뽑는다. 일간은 갑(0)으로 고정. */
  const branchAt = (hour: number, minute: number, boundary: 'true-solar' | 'kst-civil') =>
    getHourPillar(new Date(2024, 5, 1, hour, minute), 0, boundary).branch;

  it('진태양시 기준 자시는 23:00-00:59다', () => {
    expect(branchAt(22, 59, 'true-solar')).toBe('해');
    expect(branchAt(23, 0, 'true-solar')).toBe('자');
    expect(branchAt(0, 59, 'true-solar')).toBe('자');
    expect(branchAt(1, 0, 'true-solar')).toBe('축');
    expect(branchAt(12, 0, 'true-solar')).toBe('오');
  });

  it('보정 없는 KST 시계 기준 자시는 23:30-01:29다', () => {
    expect(branchAt(23, 29, 'kst-civil')).toBe('해');
    expect(branchAt(23, 30, 'kst-civil')).toBe('자');
    expect(branchAt(1, 29, 'kst-civil')).toBe('자');
    expect(branchAt(1, 30, 'kst-civil')).toBe('축');
  });

  it('두 기준의 차이는 정확히 30분이다 (이중 보정 방지)', () => {
    // 진태양시 기준 t 의 시지 == KST 기준 t+30분의 시지.
    // 어긋나면 어느 한쪽에 보정이 한 번 더 들어간 것이다.
    for (let minutesOfDay = 0; minutesOfDay < 1440; minutesOfDay += 1) {
      const h = Math.floor(minutesOfDay / 60);
      const m = minutesOfDay % 60;
      const shifted = (minutesOfDay + 30) % 1440;
      expect(branchAt(h, m, 'true-solar')).toBe(
        branchAt(Math.floor(shifted / 60), shifted % 60, 'kst-civil')
      );
    }
  });

  it('오자둔 — 일간에 따라 자시의 천간이 정해진다', () => {
    // 갑·기일 갑자시, 을·경일 병자시, 병·신일 무자시, 정·임일 경자시, 무·계일 임자시
    const expected = ['갑자', '병자', '무자', '경자', '임자'];
    for (let dayStem = 0; dayStem < 10; dayStem += 1) {
      const hour = getHourPillar(new Date(2024, 5, 1, 23, 0), dayStem, 'true-solar');
      expect(hour.fullName).toBe(expected[dayStem % 5]);
    }
  });

  it('하루 12시진이 자시부터 순서대로 한 바퀴 돈다', () => {
    const branches = Array.from({ length: 12 }, (_, i) => {
      const minutesOfDay = (23 * 60 + i * 120) % 1440;
      return getHourPillar(
        new Date(2024, 5, 1, Math.floor(minutesOfDay / 60), minutesOfDay % 60), 0, 'true-solar'
      ).branchIndex;
    });
    expect(branches).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });
});
