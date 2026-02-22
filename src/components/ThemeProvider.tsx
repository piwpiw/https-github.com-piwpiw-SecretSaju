'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeType, THEMES } from '@/lib/themes';

interface ThemeContextType {
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<ThemeType>('mystic');

    // Load theme from localStorage on mount
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

        // Standard CSS Variables
        root.style.setProperty('--primary', tokens.colors.primary);
        root.style.setProperty('--secondary', tokens.colors.secondary);
        root.style.setProperty('--background', tokens.colors.background);
        root.style.setProperty('--surface', tokens.colors.surface);
        root.style.setProperty('--text-foreground', tokens.colors.text);
        root.style.setProperty('--font-display', tokens.fonts.display);
        root.style.setProperty('--font-sans', tokens.fonts.sans);
        root.style.setProperty('--radius', tokens.borderRadius);

        if (tokens.colors.accent) {
            root.style.setProperty('--accent', tokens.colors.accent);
        }

        // Theme-specific class for Tailwind variants
        root.className = `theme-${theme}`;
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            <div className={`theme-${theme} min-h-screen bg-[var(--background)] text-[var(--text-foreground)] font-sans`}>
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
