/**
 * 야자시(夜子時) / 조자시(朝子時) 처리.
 *
 * 자시는 두 날에 걸쳐 있다. 자정 앞쪽 절반이 야자시, 뒤쪽 절반이 조자시다.
 * 이 화면이 쓰는 유파는 **날짜 경계를 자정에 둔다**. 그래서 야자시에 태어나면
 * 일주는 그날 것을 쓰고, 시주만 다음 날 자시로 본다.
 *
 * 예전 구현의 결함:
 * 자시 여부를 `hour === 23` 으로만 판정했다. 그런데 시지 경계는 기준 시계에
 * 따라 다르다. 진태양시로 환산한 시각은 23:00 부터 자시지만, 보정 없는 KST
 * 시계는 23:30 부터를 자시로 잡는 관례를 쓴다(서울은 표준경도보다 서쪽이라
 * 남중이 30분쯤 늦다). KST 기준일 때 23:00~23:29 는 아직 **해시**인데도
 * 야자시로 판정되어, 시주의 천간을 다음 날 일간에서 뽑았다.
 *
 * 예) 갑(甲)일 23:15 출생, KST 기준
 *   지지는 해(亥) — 시지 계산은 23:30 경계를 쓰므로 정상
 *   천간은 다음 날 을(乙)에서 뽑아 정해(丁亥)
 *   올바른 답은 그날 갑(甲)에서 뽑은 을해(乙亥)
 *
 * 이제 경계를 인자로 받아, 시지를 자르는 기준과 야자시 판정 기준이 항상
 * 같은 값을 쓴다.
 */

import {
    getDayPillar,
    getHourPillar,
    getJaSiStartMinutes,
    type GanJi,
    type HourBoundaryMode,
} from './ganji';

/**
 * 시간 타입
 *
 * - `yajasi`  : 자정 이전의 자시 (23:00 또는 23:30 ~ 23:59)
 * - `jojasi`  : 자정 이후의 자시 (00:00 ~ 00:59 또는 01:29)
 * - `normal`  : 자시가 아닌 시각
 */
export type JasiType = 'yajasi' | 'jojasi' | 'normal';

/**
 * 자시 여부와 그 종류를 판정한다.
 *
 * 시지 계산과 똑같은 방식으로 자른다. 자시 시작점에서 120분 안이면 자시이고,
 * 그 안에서 자정 이전이면 야자시, 이후면 조자시다.
 */
export function getJasiTypeAt(
    baseTime: Date,
    boundary: HourBoundaryMode = 'kst-civil'
): JasiType {
    const jaStart = getJaSiStartMinutes(boundary);
    const minutesOfDay = baseTime.getHours() * 60 + baseTime.getMinutes();

    // 자시 시작점을 0으로 옮겼을 때 120분(두 시간) 안에 들어오는지
    const shifted = (minutesOfDay - jaStart + 1440) % 1440;
    if (shifted >= 120) return 'normal';

    return minutesOfDay >= jaStart ? 'yajasi' : 'jojasi';
}

/**
 * 야자시/조자시 처리 결과
 */
export interface JasiHandlingResult {
    /** 사용할 일주 */
    dayPillar: GanJi;
    /** 사용할 시주 */
    hourPillar: GanJi;
    /** 처리 타입 */
    type: JasiType;
    /** 원본 날짜 */
    originalDate: Date;
    /** 일주 계산에 사용된 날짜 */
    dayCalculationDate: Date;
    /** 시주 계산에 사용된 날짜 */
    hourCalculationDate: Date;
    /** 시주의 천간을 뽑을 때 사용한 일간 인덱스 */
    hourStemStemIndexUsed: number;
}

/**
 * 야자시/조자시 처리
 *
 * @param date      기준 시각 (로컬 필드에 KST 벽시계 값이 담겨 있다)
 * @param useYaJaSi 야자시 적용 여부. false 면 자시를 그날 일간으로 통일한다
 * @param boundary  시지를 자를 기준. 시지 계산과 같은 값을 넘겨야 한다
 */
export function handleJasiLogic(
    date: Date,
    useYaJaSi: boolean = true,
    boundary: HourBoundaryMode = 'kst-civil'
): JasiHandlingResult {
    const type = getJasiTypeAt(date, boundary);
    const dayPillar = getDayPillar(date);

    const base = (
        hourCalculationDate: Date,
        stemIndex: number,
        resultType: JasiType
    ): JasiHandlingResult => ({
        dayPillar,
        hourPillar: getHourPillar(hourCalculationDate, stemIndex, boundary),
        type: resultType,
        originalDate: date,
        dayCalculationDate: date,
        hourCalculationDate,
        hourStemStemIndexUsed: stemIndex,
    });

    // 자시가 아니면 그날 일간으로 그대로 계산한다
    if (type === 'normal') {
        return base(date, dayPillar.stemIndex, 'normal');
    }

    // 조자시(자정 이후)는 이미 그날에 속한다. 일주·시주 모두 그날 기준
    if (type === 'jojasi') {
        return base(date, dayPillar.stemIndex, 'jojasi');
    }

    // 야자시 미적용: 자시를 그날 일간으로 통일한다.
    // (날짜 경계가 자정이므로 23:xx 도 아직 그날이다)
    if (!useYaJaSi) {
        return base(date, dayPillar.stemIndex, 'normal');
    }

    // 야자시 적용: 일주는 그날, 시주의 천간은 다음 날 일간에서 뽑는다
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(0, 30, 0, 0); // 다음 날 자시 안쪽. 경계와 무관하게 자시로 잘린다
    const nextDayPillar = getDayPillar(nextDay);

    return base(nextDay, nextDayPillar.stemIndex, 'yajasi');
}

/**
 * 야자시 적용 여부 설명
 */
export const YAJASI_EXPLANATION = {
    ko: {
        title: '야자시(夜子時) 적용',
        description: `자정 직전(자시 시작 ~ 23:59)에 태어난 경우의 계산 방식입니다.

• 야자시 적용 (권장):
  - 일주(日柱)는 그날 기준
  - 시주(時柱)의 천간은 다음 날 일간에서 뽑음
  - 실무에서 널리 쓰이는 방식

• 야자시 미적용:
  - 일주와 시주 모두 그날 기준
  - 자시를 하나로 보고 그날 일간으로 통일`,
        recommendation: '대부분의 경우 "야자시 적용"이 정확합니다.',
    },
    en: {
        title: 'Ya-Ja-Si (Night Ja-Si) Application',
        description: `Method for births in the Ja hour before midnight.

• With Ya-Ja-Si (Recommended):
  - Day Pillar: current day
  - Hour Pillar stem: taken from the next day's day stem
  - Widely used in practice

• Without Ya-Ja-Si:
  - Both Day and Hour Pillars use the current day
  - The Ja hour is treated as one block on the current day's stem`,
        recommendation: 'In most cases, "With Ya-Ja-Si" is more accurate.',
    },
};

/**
 * 자시 여부 확인
 *
 * @param baseTime 기준 시각
 * @param boundary 시지 경계 기준
 */
export function isJaSi(
    baseTime: Date,
    boundary: HourBoundaryMode = 'kst-civil'
): boolean {
    return getJasiTypeAt(baseTime, boundary) !== 'normal';
}

/**
 * 자시 출생자에게 보여 줄 안내 메시지
 *
 * @param baseTime 기준 시각
 * @param lang     언어
 * @param boundary 시지 경계 기준
 */
export function getJasiGuideMessage(
    baseTime: Date,
    lang: 'ko' | 'en' = 'ko',
    boundary: HourBoundaryMode = 'kst-civil'
): string | null {
    const type = getJasiTypeAt(baseTime, boundary);

    if (type === 'yajasi') {
        return lang === 'ko'
            ? '자정 직전 자시에 태어나셨습니다. 야자시(夜子時) 적용 여부를 선택해 주세요.'
            : 'Born in the Ja hour just before midnight. Please choose whether to apply Ya-Ja-Si.';
    }

    if (type === 'jojasi') {
        return lang === 'ko'
            ? '자정 직후 자시에 태어나셨습니다. 조자시(朝子時)로 처리됩니다.'
            : 'Born in the Ja hour just after midnight. Treated as Jo-Ja-Si.';
    }

    return null;
}
