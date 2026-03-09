import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        maxWorkers: 2,
        setupFiles: ['./vitest.setup.ts'],
        include: [
            'tests/**/*.test.ts',
            'tests/**/*.test.tsx',
        ],
        exclude: [
            'node_modules/**',
            'docs/**',
            'scripts/**',
            '.next/**',
            '_temp/**',
            'coverage/**',
            'dist/**',
            'tests/validation/golden.test.ts',
        ],
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
        },
    },
});
