// US-1.1: Weather API logic
export async function getWeatherData(city: string = "Seoul", lat: number = 37.5665, lon: number = 126.9780) {
    try {
        // Using Open-Meteo (Free, no key required)
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day&timezone=Asia%2FSeoul`);
        const data = await res.json();
        const temp = Math.round(data.current.temperature_2m);

        // Mock dust data for Seoul
        const dustLevel = ["좋음", "보통", "나쁨", "매우나쁨"][Math.floor(Math.random() * 2)];

        return {
            city,
            temp,
            dust: dustLevel,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error("Weather fetch failed", error);
        return null;
    }
}
