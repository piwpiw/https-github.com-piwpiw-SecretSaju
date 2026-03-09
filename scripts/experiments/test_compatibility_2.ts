
import { analyzeRelationship } from '@/lib/compatibility';
import { HighPrecisionSajuResult } from '@/core/api/saju-engine';

// Mock Helper
const mockSaju = (stem: string, branch: string): HighPrecisionSajuResult => {
    return {
        fourPillars: {
            day: { stem, branch } // Only Day Pillar matters for current logic
        } as any,
        elements: {
            scores: {},
            lacking: [],
            dominant: [],
            excessive: [],
            mainElement: stem === '갑' || stem === '을' ? '목' : '화' // Rough approx
        } as any,
        gender: 'M',
        trueSolarTime: new Date()
    } as any;
};

// Test Cases
const runTest = () => {
    console.log("=== Compatibility 2.0 Logic Test ===\n");

    // 1. Cheon-gan Hap (Heavenly Stem Combination): Gap (Wood) - Gi (Earth)
    // Should get +15 harmony score
    const sajuA = mockSaju('갑', '자');
    const sajuB = mockSaju('기', '축');
    const result1 = analyzeRelationship(sajuA, sajuB, '연인');
    console.log(`[Test 1] Gap-Gi Hap (Harmony)`);
    console.log(`Score: ${result1.score}`);
    console.log(`Chemistry: ${result1.chemistry}`);
    console.log(`Harmony Score: ${result1.details?.harmonyScore} (Expected 15 or 30 if branch also matches)`);
    // Ja-Chuk is also branch hap! So likely +30.

    // 2. Ji-ji Chung (Earthly Branch Clash): Ja (Rat) - O (Horse)
    // Should get -15 harmony score
    const sajuC = mockSaju('갑', '자');
    const sajuD = mockSaju('갑', '오');
    const result2 = analyzeRelationship(sajuC, sajuD, '연인');
    console.log(`\n[Test 2] Ja-O Chung (Clash)`);
    console.log(`Score: ${result2.score}`);
    console.log(`Chemistry: ${result2.chemistry}`);
    console.log(`Harmony Score: ${result2.details?.harmonyScore} (Expected -15)`);

    // 3. Normal
    const sajuE = mockSaju('갑', '인');
    const sajuF = mockSaju('병', '진');
    const result3 = analyzeRelationship(sajuE, sajuF, '친구');
    console.log(`\n[Test 3] Normal`);
    console.log(`Score: ${result3.score}`);
    console.log(`Message: ${result3.message}`);
};

runTest();
