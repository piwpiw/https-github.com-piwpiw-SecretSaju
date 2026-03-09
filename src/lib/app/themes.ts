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
            primary: '#818cfe',    // Brighter Indigo for dark
            secondary: '#c084fc',  // Brighter Purple for dark
            background: '#0a0a0f', // Deeper black
            surface: 'rgba(255, 255, 255, 0.05)',
            text: '#ffffff',
            textSecondary: '#a1a1aa',
            border: 'rgba(255, 255, 255, 0.12)',
            accent: '#fbbf24',     // Gold accent for mystic feel
        },
        fonts: {
            display: '"Pretendard Variable", Pretendard, sans-serif',
            sans: '"Pretendard Variable", Pretendard, sans-serif',
            sizeBase: '16px',
        },
        borderRadius: '1rem',
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
            primary: '#1d4ed8',
            secondary: '#2563eb',
            background: '#ffffff',
            surface: '#f3f4f6',
            text: '#000000',       // Absolute black for contrast
            textSecondary: '#374151',
            border: '#d1d5db',
        },
        fonts: {
            display: '"Pretendard Variable", Pretendard, sans-serif',
            sans: '"Pretendard Variable", Pretendard, sans-serif',
            sizeBase: '18px',      // Larger font for readability
        },
        borderRadius: '0.5rem',
    },
};
