// @vitest-environment node
/**
 * 토정비결 144괘 콘텐츠 완전성(커버리지) 잠금 테스트
 *
 * tojeong-gwe.test.ts 가 "산출 로직"을 검증한다면, 이 파일은 "콘텐츠 데이터"를
 * 전수 검증한다. 샘플 몇 개가 아니라 엔진이 만들 수 있는 144개 코드 전체를
 * 프로그램적으로 열거해, 데이터 한 줄이 지워지거나 오타 코드가 생기면
 * 즉시 실패하도록 잠근다.
 *
 * 검증 항목:
 *  1. 엔진이 만들 수 있는 모든 코드(상1~8 × 중1~6 × 하1~3 = 144)가 조회된다
 *  2. 배열 자체도 정확히 144개이며 코드 중복·범위 밖 코드가 없다
 *  3. 제목/요약/월별힌트가 비어 있지 않고, 요약(본문)은 40자 이상이다
 *  4. 사용자 노출 텍스트에 "undefined"/"null" 문자열·이중 공백·영문자가 없다
 *     (한자는 허용 — 괘사 표제의 특성상 라틴 문자만 금지)
 *  5. 본문(요약)·제목·월별힌트가 144개 전부 서로 다르다 (완전 중복 금지)
 *  6. 근접 중복(요약 앞 20자 동일)도 없다 — 복사-붙여넣기식 변형 유입 방지
 *  7. 없는 코드는 null 을 반환한다 (조회 실패가 undefined 로 새지 않음)
 */
import { describe, it, expect } from "vitest";
import { TOJEONG_GWESA, getTojeongGwesa } from "@/data/tojeongGwesa";
import { deriveGweNumbers } from "@/lib/saju/tojeongEngine";

/** 엔진 산출 범위(상1~8/중1~6/하1~3)를 프로그램적으로 전수 열거 */
function allPossibleCodes(): string[] {
  const codes: string[] = [];
  for (let upper = 1; upper <= 8; upper += 1) {
    for (let middle = 1; middle <= 6; middle += 1) {
      for (let lower = 1; lower <= 3; lower += 1) {
        codes.push(`${upper}${middle}${lower}`);
      }
    }
  }
  return codes;
}

describe("144괘 코드 커버리지 — 엔진이 만들 수 있는 모든 코드가 조회된다", () => {
  const codes = allPossibleCodes();

  it("가능한 코드는 정확히 144개다", () => {
    expect(codes).toHaveLength(144);
  });

  it("144개 코드 전부 getTojeongGwesa 로 조회되고 코드 필드가 일치한다", () => {
    for (const code of codes) {
      const entry = getTojeongGwesa(code);
      expect(entry, `코드 ${code} 조회 실패 (lookup miss)`).not.toBeNull();
      expect(entry!.code).toBe(code);
    }
  });

  it("deriveGweNumbers 가 내놓는 코드도 항상 데이터에 존재한다 (엔진↔데이터 정합)", () => {
    // 유도식의 입력을 훑어 실제 산출 경로로도 조회 실패가 없음을 확인
    for (let age = 1; age <= 96; age += 5) {
      for (const monthSizeValue of [29, 30]) {
        for (let day = 1; day <= 30; day += 7) {
          for (let su = 2; su <= 22; su += 4) {
            const r = deriveGweNumbers({
              age,
              monthSizeValue,
              dayNumber: day,
              taeseSu: su,
              wolgeonSu: su,
              iljinSu: su,
            });
            expect(getTojeongGwesa(r.code), `산출 코드 ${r.code} 가 데이터에 없음`).not.toBeNull();
          }
        }
      }
    }
  });

  it("배열은 정확히 144개이고 코드 중복·범위 밖 코드가 없다", () => {
    expect(TOJEONG_GWESA).toHaveLength(144);
    const seen = new Set<string>();
    const valid = new Set(codes);
    for (const entry of TOJEONG_GWESA) {
      expect(seen.has(entry.code), `코드 키 중복: ${entry.code}`).toBe(false);
      seen.add(entry.code);
      expect(valid.has(entry.code), `범위 밖 코드: ${entry.code}`).toBe(true);
    }
  });

  it("존재하지 않는 코드는 null 을 반환한다 (undefined 누수 방지)", () => {
    for (const bad of ["000", "170", "864", "999", "", "11", "1111"]) {
      expect(getTojeongGwesa(bad)).toBeNull();
    }
  });
});

describe("144괘 본문 품질 — 빈 값·짧은 본문·오염 문자열 금지", () => {
  it("제목/요약/월별힌트가 비어 있지 않고 요약은 40자 이상이다", () => {
    for (const entry of TOJEONG_GWESA) {
      expect(entry.title.trim().length, `${entry.code} 제목 비어 있음`).toBeGreaterThan(0);
      expect(entry.monthlyHint.trim().length, `${entry.code} 월별힌트 비어 있음`).toBeGreaterThan(0);
      expect(entry.summary.trim().length, `${entry.code} 요약이 40자 미만`).toBeGreaterThanOrEqual(40);
    }
  });

  it('사용자 노출 텍스트에 "undefined"/"null" 문자열이 없다', () => {
    for (const entry of TOJEONG_GWESA) {
      for (const [field, text] of [
        ["title", entry.title],
        ["summary", entry.summary],
        ["monthlyHint", entry.monthlyHint],
      ] as const) {
        expect(/undefined|null/.test(text), `${entry.code} ${field} 에 undefined/null 문자열`).toBe(false);
      }
    }
  });

  it("이중 공백이 없다 (템플릿 결합 실수 감지)", () => {
    for (const entry of TOJEONG_GWESA) {
      for (const text of [entry.title, entry.summary, entry.monthlyHint]) {
        expect(/ {2}/.test(text), `${entry.code} 이중 공백: ${text}`).toBe(false);
      }
    }
  });

  it("영문자(라틴 문자)가 사용자 노출 텍스트에 새지 않았다 — 한자는 허용", () => {
    for (const entry of TOJEONG_GWESA) {
      for (const text of [entry.title, entry.summary, entry.monthlyHint]) {
        expect(/[A-Za-z]/.test(text), `${entry.code} 영문자 누출: ${text}`).toBe(false);
      }
    }
  });

  it("fortune 은 정의된 4단계 값만 갖는다", () => {
    const allowed = new Set(["great", "good", "mixed", "caution"]);
    for (const entry of TOJEONG_GWESA) {
      expect(allowed.has(entry.fortune), `${entry.code} fortune 값 이상: ${entry.fortune}`).toBe(true);
    }
  });
});

describe("144괘 중복 검출 — 복붙 콘텐츠 유입 방지", () => {
  it("요약(본문) 144개가 전부 서로 다르다", () => {
    const bodies = new Set(TOJEONG_GWESA.map((e) => e.summary));
    expect(bodies.size).toBe(144);
  });

  it("제목 144개가 전부 서로 다르다", () => {
    const titles = new Set(TOJEONG_GWESA.map((e) => e.title));
    expect(titles.size).toBe(144);
  });

  it("월별힌트 144개가 전부 서로 다르다", () => {
    const hints = new Set(TOJEONG_GWESA.map((e) => e.monthlyHint));
    expect(hints.size).toBe(144);
  });

  it("근접 중복도 없다 — 요약 앞 20자가 같은 쌍이 없다", () => {
    const byPrefix = new Map<string, string[]>();
    for (const entry of TOJEONG_GWESA) {
      const prefix = entry.summary.slice(0, 20);
      byPrefix.set(prefix, [...(byPrefix.get(prefix) ?? []), entry.code]);
    }
    for (const [prefix, codesWithPrefix] of byPrefix) {
      expect(
        codesWithPrefix.length,
        `요약 앞 20자 동일 (근접 중복): "${prefix}" → ${codesWithPrefix.join(", ")}`
      ).toBe(1);
    }
  });
});
