"use client";

import { useEffect, useState } from "react";
import { CloudSun, CloudRain, Sun, Cloud, ThermometerSun, Wind } from "lucide-react";
import { getWeatherData } from "@/lib/weather";

export default function WeatherWidget() {
    const [weather, setWeather] = useState<{ temp: number; dust: string; city: string } | null>(null);

    useEffect(() => {
        const fetchWeather = async (lat?: number, lon?: number) => {
            const data = await getWeatherData("Seoul", lat, lon);
            if (data) setWeather(data as any);
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
                () => fetchWeather()
            );
        } else {
            fetchWeather();
        }

        const interval = setInterval(() => fetchWeather(), 1000 * 60 * 30);
        return () => clearInterval(interval);
    }, []);

    const getWeatherIcon = (temp: number) => {
        if (temp > 25) return <Sun className="w-4 h-4 text-orange-400 animate-spin-slow" />;
        if (temp > 10) return <CloudSun className="w-4 h-4 text-sky-400" />;
        return <Cloud className="w-4 h-4 text-slate-400" />;
    };

    if (!weather) return null;

    return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 transition-all hover:bg-slate-200 dark:hover:bg-slate-700 cursor-default shadow-sm border border-slate-200/50 dark:border-slate-700/50">
            {getWeatherIcon(weather.temp)}
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{weather.temp}℃</span>
            <span className={cn(
                "text-[10px] font-black ml-1 px-1.5 py-0.5 rounded-md uppercase tracking-tighter",
                weather.dust === "좋음" ? "text-green-500 bg-green-500/10" : "text-amber-500 bg-amber-500/10"
            )}>
                {weather.dust}
            </span>
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}
