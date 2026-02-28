export type ThemeType = 'dark' | 'light' | 'readable';

export interface ThemeTokens {
    name: string;
    label: string; // Korean label for UI
    colors: {
        primary: string;
        secondary: string;
        background: string;
        surface: string;
        text: string;
        textSecondary: string;
        border: string;
        accent?: string;
    };
    fonts: {
        display: string;
        sans: string;
        sizeBase: string;
    };
    borderRadius: string;
}

export const THEMES: Record<ThemeType, ThemeTokens> = {
    dark: {
        name: 'Dark',
        label: '다크 모드',
        colors: {
            primary: '#6366f1',    // Indigo
            secondary: '#a855f7',  // Purple
            background: '#0f0f1a',
            surface: 'rgba(255, 255, 255, 0.03)',
            text: '#f1f5f9',
            textSecondary: '#94a3b8',
            border: 'rgba(255, 255, 255, 0.1)',
        },
        fonts: {
            display: '"Pretendard Variable", Pretendard, sans-serif',
            sans: '"Pretendard Variable", Pretendard, sans-serif',
            sizeBase: '16px',
        },
        borderRadius: '0.75rem',
    },
    light: {
        name: 'Light',
        label: '화이트 모드',
        colors: {
            primary: '#4f46e5',
            secondary: '#7c3aed',
            background: '#f8fafc',
            surface: '#ffffff',
            text: '#0f172a',
            textSecondary: '#64748b',
            border: 'rgba(0, 0, 0, 0.08)',
        },
        fonts: {
            display: '"Pretendard Variable", Pretendard, sans-serif',
            sans: '"Pretendard Variable", Pretendard, sans-serif',
            sizeBase: '16px',
        },
        borderRadius: '0.75rem',
    },
    readable: {
        name: 'Readable',
        label: '가독성 모드',
        colors: {
            primary: '#2563eb',
            secondary: '#3b82f6',
            background: '#fffdf7',
            surface: '#ffffff',
            text: '#1a1a1a',
            textSecondary: '#4a4a4a',
            border: 'rgba(0, 0, 0, 0.12)',
        },
        fonts: {
            display: '"Pretendard Variable", Pretendard, sans-serif',
            sans: '"Pretendard Variable", Pretendard, sans-serif',
            sizeBase: '18px',
        },
        borderRadius: '0.5rem',
    },
};
