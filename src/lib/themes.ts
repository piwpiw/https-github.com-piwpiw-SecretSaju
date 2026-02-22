export type ThemeType = 'mystic' | 'minimal' | 'cyber';

export interface ThemeTokens {
    name: string;
    colors: {
        primary: string;
        secondary: string;
        background: string;
        surface: string;
        text: string;
        accent?: string;
    };
    fonts: {
        display: string;
        sans: string;
    };
    borderRadius: string;
}

export const THEMES: Record<ThemeType, ThemeTokens> = {
    mystic: {
        name: 'Mystic Celestial',
        colors: {
            primary: '#f2b90d', // Gold
            secondary: '#ffe066',
            background: '#0a1128', // Deep Navy
            surface: 'rgba(19, 28, 56, 0.4)',
            text: '#ffffff',
        },
        fonts: {
            display: "'Newsreader', serif",
            sans: "'Noto Sans KR', sans-serif",
        },
        borderRadius: '1rem',
    },
    minimal: {
        name: 'Minimal Sage',
        colors: {
            primary: '#20df40', // Green
            secondary: '#50955c',
            background: '#f6f8f6',
            surface: '#ffffff',
            text: '#112114',
        },
        fonts: {
            display: "'Inter', sans-serif",
            sans: "'Noto Sans KR', sans-serif",
        },
        borderRadius: '1.5rem',
    },
    cyber: {
        name: 'Cyber Chic',
        colors: {
            primary: '#7f0df2', // Purple
            secondary: '#00f0ff', // Cyan
            background: '#050505',
            surface: 'rgba(255, 255, 255, 0.03)',
            text: '#ffffff',
            accent: '#00f0ff',
        },
        fonts: {
            display: "'Space Grotesk', sans-serif",
            sans: "'Noto Sans KR', sans-serif",
        },
        borderRadius: '0.25rem',
    },
};
