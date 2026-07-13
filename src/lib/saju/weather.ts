// US-1.1: Weather API logic
export async function getWeatherData(city: string = "Seoul", lat: number = 37.5665, lon: number = 126.9780) {
    try {
        // Using Open-Meteo (Free, no key required)
        // Short timeout so a hanging request doesn't stall the widget.
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        let data: any;
        try {
            const res = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day&timezone=Asia%2FSeoul`,
                { signal: controller.signal }
            );
            if (!res.ok) return null;
            data = await res.json();
        } finally {
            clearTimeout(timeout);
        }

        // Guard against malformed responses.
        const rawTemp = data?.current?.temperature_2m;
        if (typeof rawTemp !== "number" || Number.isNaN(rawTemp)) return null;
        const temp = Math.round(rawTemp);

        // Mock dust data for Seoul
        const dustLevel = ["좋음", "보통", "나쁨", "매우나쁨"][Math.floor(Math.random() * 2)];

        return {
            city,
            temp,
            dust: dustLevel,
            lastUpdated: new Date().toISOString()
        };
    } catch {
        // A failed weather fetch is an expected, non-critical condition.
        return null;
    }
}
