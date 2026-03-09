import { describe, it, expect } from 'vitest';
import { SajuEngine } from '@/core/api/saju-engine';
import { GOLDEN_DATASET } from '../fixtures/golden-dataset';

describe('Saju Engine Golden Dataset Validation', () => {
    GOLDEN_DATASET.forEach((testCase) => {
        it(`should output correct pillars for ${testCase.id}: ${testCase.description}`, async () => {
            const input = {
                birthDate: testCase.input.birthDate,
                birthTime: testCase.input.birthTime,
                location: testCase.input.location,
                gender: testCase.input.gender,
                calendarType: testCase.input.calendarType || 'solar',
                isTimeUnknown: testCase.input.isTimeUnknown || false,
                lineageProfileId: testCase.input.lineageProfileId,
            };

            const result = await SajuEngine.calculate(input);

            try {
                // Check if expected exists
                const expected = testCase.expected.fourPillars || testCase.expected.pillars;
                if (!expected) throw new Error(`Test case ${testCase.id} is missing expected pillars`);

                const { year, month, day, hour } = result.fourPillars;

                expect(year.fullName).toBe(expected.year);
                expect(month.fullName).toBe(expected.month);
                expect(day.fullName).toBe(expected.day);
                expect(hour.fullName).toBe(expected.hour);
            } catch (e) {
                const pillars = result.fourPillars;
                const expected = testCase.expected.fourPillars || testCase.expected.pillars;
                console.error(`FAILURE in Test Case ${testCase.id}:`);
                console.error('Expected:', expected);
                console.error('Received:', {
                    year: pillars.year.fullName,
                    month: pillars.month.fullName,
                    day: pillars.day.fullName,
                    hour: pillars.hour.fullName,
                });
                throw e;
            }

            // Verify Daewun Start Age if verified in dataset
            if (testCase.expected.daewunStart !== undefined && result.daewun) {
                expect(result.daewun.startAge).toBe(testCase.expected.daewunStart);
            }

            // Verify Gyeokguk if verified in dataset
            if (testCase.expected.gyeokguk && result.gyeokguk) {
                expect(result.gyeokguk.gyeok).toBe(testCase.expected.gyeokguk);
            }
        });
    });
});
