// US-1.1: Weather API logic

export type DustGrade = "좋음" | "보통" | "나쁨" | "매우나쁨";

/**
 * 환경부 예보 등급 기준 (µg/m³).
 * PM10 과 PM2.5 를 각각 등급으로 바꾼 뒤 나쁜 쪽을 쓴다.
 */
function gradeDust(pm10: number, pm25: number): DustGrade {
    const pm10Grade = pm10 <= 30 ? 0 : pm10 <= 80 ? 1 : pm10 <= 150 ? 2 : 3;
    const pm25Grade = pm25 <= 15 ? 0 : pm25 <= 35 ? 1 : pm25 <= 75 ? 2 : 3;
    return (["좋음", "보통", "나쁨", "매우나쁨"] as const)[Math.max(pm10Grade, pm25Grade)];
}

async function fetchJsonWithTimeout(url: string, timeoutMs: number): Promise<any | null> {
    // Short timeout so a hanging request doesn't stall the widget.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    } finally {
        clearTimeout(timeout);
    }
}

export async function getWeatherData(city: string = "Seoul", lat: number = 37.5665, lon: number = 126.9780) {
    try {
        // Using Open-Meteo (Free, no key required). 기온과 미세먼지는 별개
        // 엔드포인트라 병렬로 요청한다. 미세먼지는 실패해도 위젯을 죽이지
        // 않도록 null 로 둔다 — 예전에는 여기서 난수 목 데이터를 만들었고,
        // 그마저 배열 4칸 중 앞 2칸(좋음/보통)만 뽑고 있었다.
        const [data, air] = await Promise.all([
            fetchJsonWithTimeout(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day&timezone=Asia%2FSeoul`,
                4000
            ),
            fetchJsonWithTimeout(
                `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5&timezone=Asia%2FSeoul`,
                4000
            ),
        ]);

        // Guard against malformed responses.
        const rawTemp = data?.current?.temperature_2m;
        if (typeof rawTemp !== "number" || Number.isNaN(rawTemp)) return null;
        const temp = Math.round(rawTemp);

        const pm10 = air?.current?.pm10;
        const pm25 = air?.current?.pm2_5;
        const dust: DustGrade | null =
            typeof pm10 === "number" && typeof pm25 === "number" && !Number.isNaN(pm10) && !Number.isNaN(pm25)
                ? gradeDust(pm10, pm25)
                : null;

        return {
            city,
            temp,
            dust,
            lastUpdated: new Date().toISOString()
        };
    } catch {
        // A failed weather fetch is an expected, non-critical condition.
        return null;
    }
}
