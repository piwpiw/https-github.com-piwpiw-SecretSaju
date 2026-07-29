/**
 * 60갑자 인덱스 → 천간·지지 오행 회귀 테스트
 *
 * 왜 이 테스트가 있는가:
 * `getDayBranchElement` 가 지지 인덱스를 `Math.floor(index / 5) % 12` 로 구하고
 * 있었다. 60갑자에서 지지는 12개 주기로 순환하므로 `index % 12` 가 맞고,
 * 실제로 같은 파일의 `PILLAR_NAMES_KO` 는 `% 12` 를 쓰고 있었다. 두 값이 서로
 * 어긋난 채로 **60개 중 52개가 다른 지지**를 가리켰고, `/admin/compatibility`
 * 가 그 값으로 오행을 계산하고 있었다.
 *
 * 예외 없이 그럴듯한 값이 나오는 종류라 눈으로는 못 잡는다. 이름표(PILLAR_NAMES_KO)와
 * 오행 계산이 항상 같은 지지를 가리키는지 60개 전부 대조한다.
 */
import { describe, it, expect } from "vitest";
import {
  PILLAR_NAMES_KO,
  getDayStemElement,
  getDayBranchElement,
} from "@/lib/saju";

/** 천간 10개의 오행 (갑을=목, 병정=화, 무기=토, 경신=금, 임계=수) */
const STEM_ELEMENT: Record<string, string> = {
  갑: "목", 을: "목", 병: "화", 정: "화", 무: "토",
  기: "토", 경: "금", 신: "금", 임: "수", 계: "수",
};

/** 지지 12개의 오행 */
const BRANCH_ELEMENT: Record<string, string> = {
  자: "수", 축: "토", 인: "목", 묘: "목", 진: "토", 사: "화",
  오: "화", 미: "토", 신: "금", 유: "금", 술: "토", 해: "수",
};

describe("60갑자 인덱스 → 오행", () => {
  it("이름표와 오행 계산이 같은 지지를 가리킨다 (60개 전부)", () => {
    const mismatches: string[] = [];

    for (let index = 0; index < 60; index += 1) {
      const name = PILLAR_NAMES_KO[index];
      const branchChar = name.slice(1); // 이름표의 두 번째 글자가 지지
      const expected = BRANCH_ELEMENT[branchChar];
      const actual = getDayBranchElement(index);
      if (actual !== expected) {
        mismatches.push(`${index}(${name}): 기대 ${expected}, 실제 ${actual}`);
      }
    }

    expect(mismatches).toEqual([]);
  });

  it("이름표와 천간 오행도 일치한다", () => {
    const mismatches: string[] = [];

    for (let index = 0; index < 60; index += 1) {
      const name = PILLAR_NAMES_KO[index];
      const stemChar = name.slice(0, 1);
      const expected = STEM_ELEMENT[stemChar];
      const actual = getDayStemElement(index);
      if (actual !== expected) {
        mismatches.push(`${index}(${name}): 기대 ${expected}, 실제 ${actual}`);
      }
    }

    expect(mismatches).toEqual([]);
  });

  it("경계 인덱스에서도 정상 동작한다", () => {
    expect(PILLAR_NAMES_KO[0]).toBe("갑자");
    expect(PILLAR_NAMES_KO[59]).toBe("계해");
    expect(getDayBranchElement(0)).toBe("수"); // 자 = 수
    expect(getDayBranchElement(59)).toBe("수"); // 해 = 수
  });
});
