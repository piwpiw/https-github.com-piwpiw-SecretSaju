'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeType, THEMES } from '@/lib/app/themes';

interface ThemeContextType {
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * "#0f172a" → "15 23 42" 로 바꿔 CSS 변수에 넣는다.
 * Tailwind 의 `rgb(var(--x) / <alpha-value>)` 는 채널 숫자만 받는다.
 * 해석할 수 없는 값(rgba() 문자열 등)이면 건드리지 않는다.
 */
function setChannels(root: HTMLElement, name: string, value: string) {
    const hex = value.trim();
    const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex);
    if (!match) return;

    const digits = match[1].length === 3
        ? match[1].split('').map((c) => c + c).join('')
        : match[1];

    const r = parseInt(digits.slice(0, 2), 16);
    const g = parseInt(digits.slice(2, 4), 16);
    const b = parseInt(digits.slice(4, 6), 16);
    root.style.setProperty(name, `${r} ${g} ${b}`);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<ThemeType>('dark');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as ThemeType;
        if (savedTheme && THEMES[savedTheme]) {
            setThemeState(savedTheme);
        }
    }, []);

    const setTheme = (newTheme: ThemeType) => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    useEffect(() => {
        const tokens = THEMES[theme];
        const root = document.documentElement;

        root.style.setProperty('--primary', tokens.colors.primary);
        root.style.setProperty('--secondary', tokens.colors.secondary);
        root.style.setProperty('--background', tokens.colors.background);
        root.style.setProperty('--surface', tokens.colors.surface);
        root.style.setProperty('--text-foreground', tokens.colors.text);
        root.style.setProperty('--text-muted', tokens.colors.textSecondary);
        root.style.setProperty('--border-color', tokens.colors.border);

        // Tailwind 가 쓰는 채널 형태도 같이 갱신한다. 이걸 안 두면
        // `rgb(var(--x) / <alpha-value>)` 가 hex 를 받아 잘못된 CSS 가 되고,
        // text-primary·text-foreground·bg-surface 같은 클래스가 전부 죽는다.
        setChannels(root, '--primary-rgb', tokens.colors.primary);
        setChannels(root, '--secondary-rgb', tokens.colors.secondary);
        setChannels(root, '--background-rgb', tokens.colors.background);
        setChannels(root, '--text-foreground-rgb', tokens.colors.text);
        setChannels(root, '--text-muted-rgb', tokens.colors.textSecondary);
        root.style.setProperty('--font-display', tokens.fonts.display);
        root.style.setProperty('--font-sans', tokens.fonts.sans);
        root.style.setProperty('--font-size-base', tokens.fonts.sizeBase);
        root.style.setProperty('--radius', tokens.borderRadius);

        if (tokens.colors.accent) {
            root.style.setProperty('--accent', tokens.colors.accent);
        }

        root.className = theme === 'dark' ? 'dark' : '';
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            <div
                className="min-h-screen transition-colors duration-300"
                style={{
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-foreground)',
                    fontSize: 'var(--font-size-base)',
                    fontFamily: 'var(--font-sans)',
                }}
            >
                {children}
            </div>
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
