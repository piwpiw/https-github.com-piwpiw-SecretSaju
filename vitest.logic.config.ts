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
            'tests/logic/saju-engine.test.ts',
            'tests/logic/gangyak-scoring.test.ts',
            'tests/logic/pillar-element.test.ts',
            'tests/logic/calendar-standard.test.ts',
            'tests/logic/engine-invariants.test.ts',
            'tests/logic/tarot-deck.test.ts',
            'tests/logic/dream-matching.test.ts',
            'tests/logic/solar-terms-almanac.test.ts',
            'tests/logic/defect-regressions.test.ts',
            'tests/logic/compatibility-full.test.ts',
            'tests/logic/daewun.test.ts',
            'tests/logic/tojeong-gwe.test.ts',
            'tests/logic/ai-routing.test.ts',
            'tests/logic/auth-callback-message.test.ts',
            'tests/logic/payment-flow.test.ts',
            'tests/logic/payment-verify-message.test.ts',
            'tests/routes/payment-verify-route.test.ts',
            'tests/logic/auth-wallet.test.ts',
            'tests/logic/jelly-wallet.test.ts',
            'tests/routes/mcp-callback-route.test.ts',
            'tests/routes/persona-route.test.ts',
            'tests/logic/referral-attribution.test.ts',
            'tests/routes/referral-invite-route.test.ts',
            'tests/logic/pwa-policy.test.ts',
            'tests/logic/launch-readiness.test.ts',
            'tests/logic/base-url-resolution.test.ts',
        ],
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
