/**
 * vitest.logic.config.ts
 * React/DOM 없이 순수 사주/비즈니스 로직만 테스트하는 설정
 * `npx vitest run --config vitest.logic.config.ts` 로 실행
 */
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        maxWorkers: 2,
        include: [
            'tests/saju-engine.test.ts',
            'tests/ai-routing.test.ts',
            'tests/payment-flow.test.ts',
            'tests/auth-wallet.test.ts',
        ],
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
