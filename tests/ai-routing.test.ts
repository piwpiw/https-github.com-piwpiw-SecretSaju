import { describe, it, expect } from 'vitest';
import { routeAIPersona } from '../src/core/ai-routing';

describe('AI Routing (MPPS)', () => {
    describe('routeAIPersona model selection', () => {
        it('Returns a knowing model name', () => {
            const result = routeAIPersona({
                userName: '테스트',
                ageGroup: '20s',
                tendency: 'Balanced',
                queryType: 'result',
            });
            expect(result.model).toBeTruthy();
            expect(typeof result.model).toBe('string');
        });

        it('Returns systemPrompt and userPrompt strings', () => {
            const result = routeAIPersona({
                userName: '테스트',
                ageGroup: '30s',
                tendency: 'Tree',
                queryType: 'result',
            });
            expect(typeof result.systemPrompt).toBe('string');
            expect(result.systemPrompt.length).toBeGreaterThan(0);
            expect(typeof result.userPrompt).toBe('string');
        });

        it('Returns isEnsemble is boolean', () => {
            const result = routeAIPersona({
                userName: '테스트',
                ageGroup: '40s',
                tendency: 'Water',
                queryType: 'result',
            });
            expect(typeof result.isEnsemble).toBe('boolean');
        });

        it('Different age groups produce different system prompts', () => {
            const teen = routeAIPersona({ userName: 'A', ageGroup: '10s', tendency: 'Fire', queryType: 'result' });
            const forties = routeAIPersona({ userName: 'A', ageGroup: '40s', tendency: 'Fire', queryType: 'result' });
            expect(teen.systemPrompt).not.toBe(forties.systemPrompt);
        });
    });

    describe('Edge cases', () => {
        it('Handles missing optional rawSajuData gracefully', () => {
            expect(() => routeAIPersona({
                userName: '테스트',
                ageGroup: '20s',
                tendency: 'Balanced',
                queryType: 'result',
                rawSajuData: undefined,
            })).not.toThrow();
        });

        it('Handles all queryType variants without throwing', () => {
            const queryTypes = ['result', 'daily', 'compatibility', 'chat'] as const;
            for (const qt of queryTypes) {
                expect(() => routeAIPersona({
                    userName: '테스트',
                    ageGroup: '20s',
                    tendency: 'Balanced',
                    queryType: qt,
                })).not.toThrow();
            }
        });
    });
});
