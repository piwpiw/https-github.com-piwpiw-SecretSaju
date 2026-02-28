'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeType, THEMES } from '@/lib/themes';

interface ThemeContextType {
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

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
        root.style.setProperty('--text-secondary', tokens.colors.textSecondary);
        root.style.setProperty('--border-color', tokens.colors.border);
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
