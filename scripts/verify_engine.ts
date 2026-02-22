
import { SajuEngine } from '../src/core/api/saju-engine';
import { calculateHighPrecisionSaju } from '../src/core/api/saju-engine';
import { analyzeElements } from '../src/core/myeongni/elements';
import { analyzeSipsong } from '../src/core/myeongni/sipsong';
import { analyzeSinsal } from '../src/core/myeongni/sinsal';
import { analyzeSibiwoonseongAll } from '../src/core/myeongni/sibiwoonseong';
import { determineGyeokguk } from '../src/core/myeongni/gyeokguk';
import { KOREA_LOCATIONS } from '../src/core/astronomy/true-solar-time';

// Test Cases
const TEST_CASES = [
    {
        name: 'Reference Date (2000-01-01)',
        birthDate: new Date('2000-01-01T00:00:00'),
        birthTime: '00:00',
        gender: 'F' as const
    },
    {
        name: 'IU (Singer)',
        birthDate: new Date('1993-05-16T00:00:00'),
        birthTime: '12:00', // Assuming noon
        gender: 'F' as const
    },
    {
        name: 'Psy (Singer)',
        birthDate: new Date('1977-12-31T00:00:00'),
        birthTime: '12:00',
        gender: 'M' as const
    }
];

async function runVerification() {
    console.log("==========================================");
    console.log("   ENTERPRISE SAJU ENGINE VERIFICATION    ");
    console.log("==========================================\n");

    console.log("Debug: KOREA_LOCATIONS.SEOUL =", KOREA_LOCATIONS?.SEOUL);

    for (const test of TEST_CASES) {
        console.log(`[Target: ${test.name}]`);
        console.log(`Input: ${test.birthDate.toISOString().split('T')[0]} ${test.birthTime}`);

        try {
            const result = await calculateHighPrecisionSaju({
                birthDate: test.birthDate,
                birthTime: test.birthTime,
                gender: test.gender,
                location: KOREA_LOCATIONS.SEOUL // Explicitly pass location
            });

            const { fourPillars, trueSolarTime } = result;

            console.log(`True Solar Time: ${trueSolarTime.toISOString()}`);
            console.log("Four Pillars (Saju):");
            console.log(`  Year : ${fourPillars.year.code} (${fourPillars.year.stem}${fourPillars.year.branch})`);
            console.log(`  Month: ${fourPillars.month.code} (${fourPillars.month.stem}${fourPillars.month.branch})`);
            console.log(`  Day  : ${fourPillars.day.code} (${fourPillars.day.stem}${fourPillars.day.branch})`);
            console.log(`  Hour : ${fourPillars.hour.code} (${fourPillars.hour.stem}${fourPillars.hour.branch})`);

            // Myeongni Analysis
            const elements = analyzeElements(fourPillars);
            console.log("\nFive Elements (O-haeng):");
            console.log(`  Scores: Mock=${elements.scores.목}, Hwa=${elements.scores.화}, To=${elements.scores.토}, Geum=${elements.scores.금}, Su=${elements.scores.수}`);
            console.log(`  Dominant: ${elements.dominant.join(', ')}`);
            console.log(`  Lacking: ${elements.lacking.join(', ')}`);

            const sipsong = analyzeSipsong(fourPillars);
            console.log("\nTen Gods (Sipsong) [Key Relationships]:");
            console.log(`  Month Branch (Society): ${sipsong.monthBranch}`);
            console.log(`  Day Branch (Spouse): ${sipsong.dayBranch}`);

            const sinsal = analyzeSinsal(fourPillars);
            console.log("\nSpecial Stars (Sinsal):");
            sinsal.forEach(s => console.log(`  - ${s.name} (${s.pillar}): ${s.description}`));

            const sibi = analyzeSibiwoonseongAll(fourPillars);
            console.log("\n12 Phases (Sibiwoonseong):");
            console.log(`  Self-Energy (Day): ${sibi.day}`);

            const gyeok = determineGyeokguk(fourPillars);
            console.log("\nStructure (Gyeokguk):");
            console.log(`  ${gyeok.name}`); // (${gyeok.description})

            console.log("\n------------------------------------------\n");

        } catch (error) {
            console.error("Error calculating Saju:", error);
            if (error instanceof Error) console.error(error.stack);
        }
    }
}

runVerification();
