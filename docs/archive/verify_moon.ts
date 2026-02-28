
import { calculateHighPrecisionSaju } from '../../src/core/api/saju-engine';

async function verify() {
    const birthDate = new Date(1983, 3, 30); // month 3 is April
    const input = {
        birthDate,
        birthTime: "14:30",
        gender: 'F' as const,
        calendarType: 'solar' as const
    };

    const result = await calculateHighPrecisionSaju(input);

    console.log("--- Pillars ---");
    console.log(`Year: ${result.fourPillars.year.stem}${result.fourPillars.year.branch}`);
    console.log(`Month: ${result.fourPillars.month.stem}${result.fourPillars.month.branch}`);
    console.log(`Day: ${result.fourPillars.day.stem}${result.fourPillars.day.branch}`);
    console.log(`Hour: ${result.fourPillars.hour.stem}${result.fourPillars.hour.branch}`);

    console.log("--- Element Counts (Basic) ---");
    console.log(result.elements.counts);

    console.log("--- Element Scores (Extended/Weighted) ---");
    console.log(result.elements.scores);
}

verify().catch(console.error);
