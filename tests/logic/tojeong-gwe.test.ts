/**
 * 토정비결 정통 144괘 산출 검증
 * - 괘 번호 범위 (상 1~8 / 중 1~6 / 하 1~3)
 * - 결정성 (같은 입력 → 같은 괘)
 * - 144괘 데이터 완전성 (모든 조합 존재, 제목/요약 중복 없음)
 * - 경계 (나머지 0 → 최댓값 치환)
 */
import { describe, it, expect } from "vitest";
import {
  buildTojeongReport,
  calculateTojeongGwe,
  deriveGweNumbers,
  getDayGanjiIndex,
  getIljinSu,
  getTaeseSu,
  getWolgeonSu,
} from "@/lib/saju/tojeongEngine";
import { TOJEONG_GWESA, getTojeongGwesa } from "@/data/tojeongGwesa";

const PROBES = [
  { birthYear: 1990, birthMonth: 3, birthDay: 15, calendarType: "solar" as const, targetYear: 2026 },
  { birthYear: 1985, birthMonth: 11, birthDay: 2, calendarType: "lunar" as const, targetYear: 2026 },
  { birthYear: 2000, birthMonth: 2, birthDay: 29, calendarType: "solar" as const, targetYear: 2025 },
];

describe("deriveGweNumbers — 순수 유도식", () => {
  it("넓은 입력 범위에서 상 1~8 / 중 1~6 / 하 1~3 을 벗어나지 않는다", () => {
    for (let age = 1; age <= 100; age += 7) {
      for (let taese = 2; taese <= 22; taese += 3) {
        for (const monthSizeValue of [29, 30]) {
          for (let wolgeon = 2; wolgeon <= 22; wolgeon += 4) {
            for (let day = 1; day <= 30; day += 5) {
              for (let iljin = 2; iljin <= 22; iljin += 5) {
                const r = deriveGweNumbers({
                  age,
                  monthSizeValue,
                  dayNumber: day,
                  taeseSu: taese,
                  wolgeonSu: wolgeon,
                  iljinSu: iljin,
                });
                expect(r.upper).toBeGreaterThanOrEqual(1);
                expect(r.upper).toBeLessThanOrEqual(8);
                expect(r.middle).toBeGreaterThanOrEqual(1);
                expect(r.middle).toBeLessThanOrEqual(6);
                expect(r.lower).toBeGreaterThanOrEqual(1);
                expect(r.lower).toBeLessThanOrEqual(3);
                expect(r.code).toBe(`${r.upper}${r.middle}${r.lower}`);
                expect(getTojeongGwesa(r.code)).not.toBeNull();
              }
            }
          }
        }
      }
    }
  });

  it("경계: 나머지 0 이면 최댓값(상8/중6/하3)이 된다", () => {
    // (age + taese) % 8 === 0
    const upperMax = deriveGweNumbers({
      age: 6, taeseSu: 10, monthSizeValue: 30, wolgeonSu: 5, dayNumber: 1, iljinSu: 4,
    });
    expect((6 + 10) % 8).toBe(0);
    expect(upperMax.upper).toBe(8);

    // (monthSizeValue + wolgeon) % 6 === 0
    const middleMax = deriveGweNumbers({
      age: 1, taeseSu: 2, monthSizeValue: 30, wolgeonSu: 6, dayNumber: 1, iljinSu: 4,
    });
    expect((30 + 6) % 6).toBe(0);
    expect(middleMax.middle).toBe(6);

    // (dayNumber + iljin) % 3 === 0
    const lowerMax = deriveGweNumbers({
      age: 1, taeseSu: 2, monthSizeValue: 29, wolgeonSu: 5, dayNumber: 10, iljinSu: 5,
    });
    expect((10 + 5) % 3).toBe(0);
    expect(lowerMax.lower).toBe(3);
  });

  it("나머지가 0이 아니면 나머지 그대로 쓴다", () => {
    const r = deriveGweNumbers({
      age: 3, taeseSu: 6, monthSizeValue: 29, wolgeonSu: 8, dayNumber: 2, iljinSu: 5,
    });
    expect(r.upper).toBe((3 + 6) % 8); // 1
    expect(r.middle).toBe((29 + 8) % 6); // 1
    expect(r.lower).toBe((2 + 5) % 3); // 1
    expect(r.code).toBe("111");
  });
});

describe("수리(태세수·월건수·일진수) — 현대 재구성 유도식", () => {
  it("태세수는 연간지의 천간(1~10)+지지(1~12) 순번 합으로 2~22 범위다", () => {
    for (let year = 1900; year <= 2100; year += 1) {
      const v = getTaeseSu(year);
      expect(v).toBeGreaterThanOrEqual(2);
      expect(v).toBeLessThanOrEqual(22);
    }
    // 2026 = 병오(丙午): 병=3, 오=7 → 10
    expect(getTaeseSu(2026)).toBe(10);
    // 1984 = 갑자(甲子): 갑=1, 자=1 → 2
    expect(getTaeseSu(1984)).toBe(2);
    // 60년 주기
    expect(getTaeseSu(2026)).toBe(getTaeseSu(2026 + 60));
  });

  it("월건수는 2~22 범위이고 같은 (연도, 월) 입력에 항상 같다", () => {
    for (let m = 1; m <= 12; m += 1) {
      const v = getWolgeonSu(2026, m);
      expect(v).toBeGreaterThanOrEqual(2);
      expect(v).toBeLessThanOrEqual(22);
      expect(getWolgeonSu(2026, m)).toBe(v);
    }
  });

  it("일진 인덱스는 기준일(2000-01-01=무오=54)과 이어지는 날짜에서 일관된다", () => {
    expect(getDayGanjiIndex(new Date(2000, 0, 1))).toBe(54);
    expect(getDayGanjiIndex(new Date(2000, 0, 2))).toBe(55);
    expect(getDayGanjiIndex(new Date(2000, 0, 1 + 60))).toBe(54);
    const v = getIljinSu(new Date(2026, 0, 1));
    expect(v).toBeGreaterThanOrEqual(2);
    expect(v).toBeLessThanOrEqual(22);
  });
});

describe("144괘 데이터 완전성", () => {
  it("모든 조합(8×6×3=144)이 존재한다", () => {
    expect(TOJEONG_GWESA.length).toBe(144);
    for (let u = 1; u <= 8; u += 1) {
      for (let m = 1; m <= 6; m += 1) {
        for (let l = 1; l <= 3; l += 1) {
          const code = `${u}${m}${l}`;
          const entry = getTojeongGwesa(code);
          expect(entry, `괘 ${code} 누락`).not.toBeNull();
          expect(entry?.code).toBe(code);
        }
      }
    }
  });

  it("제목과 요약에 중복이 없다", () => {
    const titles = new Set(TOJEONG_GWESA.map((e) => e.title));
    const summaries = new Set(TOJEONG_GWESA.map((e) => e.summary));
    expect(titles.size).toBe(144);
    expect(summaries.size).toBe(144);
  });

  it("모든 항목이 유효한 fortune 값과 비어 있지 않은 텍스트를 가진다", () => {
    const fortunes = new Set<string>();
    for (const entry of TOJEONG_GWESA) {
      expect(["great", "good", "mixed", "caution"]).toContain(entry.fortune);
      fortunes.add(entry.fortune);
      expect(entry.title.length).toBeGreaterThanOrEqual(8);
      expect(entry.summary.length).toBeGreaterThanOrEqual(40);
      expect(entry.monthlyHint.length).toBeGreaterThanOrEqual(10);
      // 제목 형식: "한자성어 · 한글 풀이"
      expect(entry.title).toContain(" · ");
    }
    // 4단계 길흉이 모두 실제로 쓰인다
    expect(fortunes.size).toBe(4);
  });

  it("존재하지 않는 코드는 null 을 반환한다", () => {
    expect(getTojeongGwesa("000")).toBeNull();
    expect(getTojeongGwesa("871")).toBeNull();
    expect(getTojeongGwesa("164")).toBeNull();
  });
});

describe("calculateTojeongGwe — 통합 산출", () => {
  it("프로브 3건: 범위·데이터 연결·산출값 스냅샷", () => {
    for (const probe of PROBES) {
      const gwe = calculateTojeongGwe(probe);
      expect(gwe, `probe ${JSON.stringify(probe)}`).not.toBeNull();
      if (!gwe) continue;
      expect(gwe.upper).toBeGreaterThanOrEqual(1);
      expect(gwe.upper).toBeLessThanOrEqual(8);
      expect(gwe.middle).toBeGreaterThanOrEqual(1);
      expect(gwe.middle).toBeLessThanOrEqual(6);
      expect(gwe.lower).toBeGreaterThanOrEqual(1);
      expect(gwe.lower).toBeLessThanOrEqual(3);
      expect(gwe.code).toBe(`${gwe.upper}${gwe.middle}${gwe.lower}`);
      expect(gwe.title.length).toBeGreaterThan(0);
      expect(gwe.summary.length).toBeGreaterThan(0);
      expect([29, 30]).toContain(gwe.inputs.monthSizeValue);
      // 프로브 출력 (검증 리포트용)
      // eslint-disable-next-line no-console
      console.log(
        `[probe] ${probe.birthYear}-${probe.birthMonth}-${probe.birthDay}(${probe.calendarType}) → ${probe.targetYear}년 제 ${gwe.code}괘 "${gwe.title}" (${gwe.fortune}, basis=${gwe.basis})`
      );
    }
  });

  it("결정성: 같은 입력이면 몇 번을 호출해도 같은 괘가 나온다", () => {
    for (const probe of PROBES) {
      const first = calculateTojeongGwe(probe);
      for (let i = 0; i < 5; i += 1) {
        const again = calculateTojeongGwe(probe);
        expect(again?.code).toBe(first?.code);
        expect(again?.inputs).toEqual(first?.inputs);
      }
    }
  });

  it("Intl 음력 변환 가능 환경에서는 basis 가 lunar 다 (Node 22 기준)", () => {
    const gwe = calculateTojeongGwe(PROBES[0]);
    expect(gwe?.basis).toBe("lunar");
    // 1990-03-15 양력 = 음력 1990-02-19 (검증된 변환값)
    expect(gwe?.inputs.lunarMonth).toBe(2);
    expect(gwe?.inputs.lunarDay).toBe(19);
  });

  it("잘못된 입력(NaN)에는 null 을 반환한다", () => {
    expect(
      calculateTojeongGwe({ birthYear: NaN, birthMonth: 3, birthDay: 15, targetYear: 2026 })
    ).toBeNull();
  });

  it("여러 생일·연도 조합에서도 항상 유효한 괘 코드가 나온다", () => {
    for (let y = 1950; y <= 2010; y += 13) {
      for (const [m, d] of [[1, 1], [6, 15], [12, 31]] as const) {
        for (const target of [2025, 2026, 2027]) {
          const gwe = calculateTojeongGwe({
            birthYear: y, birthMonth: m, birthDay: d, calendarType: "solar", targetYear: target,
          });
          expect(gwe).not.toBeNull();
          expect(getTojeongGwesa(gwe!.code)).not.toBeNull();
        }
      }
    }
  });
});

describe("buildTojeongReport 통합 (하위 호환)", () => {
  const baseParams = {
    profileName: "테스트",
    birthYear: 1990,
    birthMonth: 3,
    birthDay: 15,
    birthBranchIndex: 6,
    birthPillarIndex: 20,
    yearPillarIndex: 42,
    year: 2026,
    birthDayOfYear: 74,
    isFemale: false,
  };

  it("calendarType 전달 시 리포트 최상단에 gwe 가 포함된다", () => {
    const report = buildTojeongReport({ ...baseParams, calendarType: "solar" });
    expect(report.gwe).toBeDefined();
    expect(report.gwe?.code).toMatch(/^[1-8][1-6][1-3]$/);
    // 근거 로그에 괘 산출 근거가 추가된다
    expect(report.sources.some((s) => s.name === "괘 산출")).toBe(true);
    expect(report.sources.some((s) => s.name === "괘 기준")).toBe(true);
  });

  it("calendarType 없이 호출해도(기존 호출부) 기존 필드가 그대로 유지된다", () => {
    const report = buildTojeongReport(baseParams);
    expect(report.mainScore).toBeGreaterThanOrEqual(30);
    expect(report.mainScore).toBeLessThanOrEqual(99);
    expect(report.categories.length).toBe(5);
    expect(report.monthly.length).toBe(12);
    expect(report.sources.length).toBeGreaterThanOrEqual(4);
  });

  it("gwe 산출은 결정적이다 (같은 입력 → 같은 코드)", () => {
    const a = buildTojeongReport({ ...baseParams, calendarType: "solar" });
    const b = buildTojeongReport({ ...baseParams, calendarType: "solar" });
    expect(a.gwe?.code).toBe(b.gwe?.code);
  });
});
