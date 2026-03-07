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
            'src/__tests__/validation/golden.test.ts',
        ],
        exclude: [
            'node_modules/**',
            'docs/**',
            'scripts/**',
            '.next/**',
            'tmp/**',
            'logs/**',
            'coverage/**',
            'dist/**',
        ],
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
