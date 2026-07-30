/**
 * 분점·지점의 독립 기준값 (Meeus, Astronomical Algorithms 27장).
 *
 * 왜 이 파일이 있나:
 * `solar-terms.ts` 의 태양 황경은 Meeus 25장의 **저차** 급수다. 달·행성 섭동이
 * 빠져 있어 절기 시각이 실제와 최대 12분가량 어긋난다. 그 오차를 측정하려면
 * 서로 다른 경로로 계산한 기준값이 필요하다.
 *
 * 27장은 분점·지점 시각을 완전히 다른 방식으로 구한다. 평균 시각 다항식 하나와
 * 섭동 주기항 24개다. 이 값은 2024년 한국천문연구원 역서와 네 절기 모두
 * 분 단위로 일치한다 (춘분 12:06, 하지 05:51, 추분 21:44, 동지 18:21 KST).
 *
 * 한계를 분명히 해 둔다. 27장은 **중기(中氣) 네 개**만 다룬다. 월주 경계를
 * 정하는 것은 절(節) 열두 개(입춘·경칩·청명…)라서, 이 파일로 월주를 직접
 * 개선할 수는 없다. 저차 급수의 오차 크기를 측정하고 회귀를 막는 용도다.
 *
 * 참고: Meeus 표 27.B (서기 1000~3000년)
 */

const DEG_TO_RAD = Math.PI / 180;

/** 분점·지점 종류 */
export type CardinalPoint = 'march-equinox' | 'june-solstice' | 'september-equinox' | 'december-solstice';

/** 각 분점·지점의 태양 황경 */
export const CARDINAL_LONGITUDE: Record<CardinalPoint, number> = {
    'march-equinox': 0,
    'june-solstice': 90,
    'september-equinox': 180,
    'december-solstice': 270,
};

/** 한국 절기 이름 대응 */
export const CARDINAL_KOREAN_NAME: Record<CardinalPoint, string> = {
    'march-equinox': '춘분',
    'june-solstice': '하지',
    'september-equinox': '추분',
    'december-solstice': '동지',
};

/**
 * 평균 분점·지점 시각 다항식 (JDE, 지구시 기준).
 * Y = (연도 - 2000) / 1000
 */
const MEAN_JDE: Record<CardinalPoint, (Y: number) => number> = {
    'march-equinox': (Y) =>
        2451623.80984 + 365242.37404 * Y + 0.05169 * Y ** 2 - 0.00411 * Y ** 3 - 0.00057 * Y ** 4,
    'june-solstice': (Y) =>
        2451716.56767 + 365241.62603 * Y + 0.00325 * Y ** 2 + 0.00888 * Y ** 3 - 0.00030 * Y ** 4,
    'september-equinox': (Y) =>
        2451810.21715 + 365242.01767 * Y - 0.11575 * Y ** 2 + 0.00337 * Y ** 3 + 0.00078 * Y ** 4,
    'december-solstice': (Y) =>
        2451900.05952 + 365242.74049 * Y - 0.06223 * Y ** 2 + 0.00823 * Y ** 3 + 0.00032 * Y ** 4,
};

/**
 * 섭동 주기항 24개 [진폭, 위상(도), 각속도(도/세기)].
 * 달·금성·목성 등이 지구 궤도를 흔드는 효과를 시간 보정으로 모은 것이다.
 */
const PERIODIC_TERMS: ReadonlyArray<readonly [number, number, number]> = [
    [485, 324.96, 1934.136], [203, 337.23, 32964.467], [199, 342.08, 20.186],
    [182, 27.85, 445267.112], [156, 73.14, 45036.886], [136, 171.52, 22518.443],
    [77, 222.54, 65928.934], [74, 296.72, 3034.906], [70, 243.58, 9037.513],
    [58, 119.81, 33718.147], [52, 297.17, 150.678], [50, 21.02, 2281.226],
    [45, 247.54, 29929.562], [44, 325.15, 31555.956], [29, 60.93, 4443.417],
    [18, 155.12, 67555.328], [17, 288.79, 4562.452], [16, 198.04, 62894.029],
    [14, 199.76, 31436.921], [12, 95.39, 14577.848], [12, 287.11, 31931.756],
    [12, 320.81, 34777.259], [9, 227.73, 1222.114], [8, 15.45, 16859.074],
];

/**
 * 분점·지점의 지구시(TT) 기준 율리우스 적일.
 *
 * @param point 분점·지점 종류
 * @param year  그레고리력 연도 (1000~3000)
 */
export function getCardinalJDE(point: CardinalPoint, year: number): number {
    const Y = (year - 2000) / 1000;
    const meanJDE = MEAN_JDE[point](Y);

    const T = (meanJDE - 2451545.0) / 36525;
    const W = (35999.373 * T - 2.47) * DEG_TO_RAD;
    const dayMotion = 1 + 0.0334 * Math.cos(W) + 0.0007 * Math.cos(2 * W);

    let sum = 0;
    for (const [amplitude, phase, rate] of PERIODIC_TERMS) {
        sum += amplitude * Math.cos((phase + rate * T) * DEG_TO_RAD);
    }

    return meanJDE + (0.00001 * sum) / dayMotion;
}

/**
 * TT - UT (ΔT), 초 단위. Espenak & Meeus 다항식.
 *
 * 천문 급수는 지구시(TT)를 인자로 받지만 우리가 다루는 시각은 세계시(UT)다.
 * 2024년 기준 두 축의 차이는 약 69초다. 기준값을 벽시계와 비교할 때 필요하다.
 */
export function getDeltaTSeconds(year: number): number {
    let t: number;

    if (year >= 2005 && year < 2050) {
        t = year - 2000;
        return 62.92 + 0.32217 * t + 0.005589 * t * t;
    }
    if (year >= 1986 && year < 2005) {
        t = year - 2000;
        return 63.86 + 0.3345 * t - 0.060374 * t * t + 0.0017275 * t ** 3
            + 0.000651814 * t ** 4 + 0.00002373599 * t ** 5;
    }
    if (year >= 1961 && year < 1986) {
        t = year - 1975;
        return 45.45 + 1.067 * t - (t * t) / 260 - (t ** 3) / 718;
    }
    if (year >= 1941 && year < 1961) {
        t = year - 1950;
        return 29.07 + 0.407 * t - (t * t) / 233 + (t ** 3) / 2547;
    }
    if (year >= 1920 && year < 1941) {
        t = year - 1920;
        return 21.20 + 0.84493 * t - 0.076100 * t * t + 0.0020936 * t ** 3;
    }
    if (year >= 1900 && year < 1920) {
        t = year - 1900;
        return -2.79 + 1.494119 * t - 0.0598939 * t * t + 0.0061966 * t ** 3 - 0.000197 * t ** 4;
    }
    if (year >= 2050 && year <= 2150) {
        return -20 + 32 * ((year - 1820) / 100) ** 2 - 0.5628 * (2150 - year);
    }

    const u = (year - 1820) / 100;
    return -20 + 32 * u * u;
}
