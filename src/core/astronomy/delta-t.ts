/**
 * ΔT — 지구시(TT)와 세계시(UT)의 차이.
 *
 * 천문 급수는 지구시를 인자로 받는다. 지구 자전은 조석 마찰로 조금씩 느려지고
 * 불규칙하게 흔들리기 때문에, 우리가 쓰는 세계시와 어긋난다. 2024년 기준 약 69초.
 *
 * 절기 시각을 벽시계로 돌려주려면 이 값만큼 되돌려야 한다. 69초는 작아 보이지만
 * 절입 경계에 태어난 사람에게는 월주가 갈리는 크기다.
 *
 * 출처: Espenak & Meeus, "Polynomial Expressions for Delta T"
 */

/**
 * 주어진 연도의 ΔT (초).
 *
 * @param year 그레고리력 연도 (소수 가능)
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

/** 율리우스 적일에서 대략적인 연도를 뽑는다. ΔT 는 천천히 변해 이 정도면 충분하다 */
export function approximateYearFromJulianDay(jd: number): number {
    return 2000 + (jd - 2451545.0) / 365.25;
}
