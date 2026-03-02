import { calculateSajuFromBirthdate } from '../src/lib/saju';

async function test() {
    const inputs = [
        { name: 'User 1', date: '1982-02-20', time: '12:00', gender: 'M' as const },
        { name: 'User 2', date: '1990-01-01', time: '12:00', gender: 'F' as const },
        { name: 'User 3', date: '2010-05-05', time: '18:30', gender: 'M' as const },
    ];

    for (const input of inputs) {
        try {
            console.log(`Testing ${input.name} (${input.date})...`);
            const res = await calculateSajuFromBirthdate(input.date, input.time, 'solar', input.gender, false);
            console.log(`  Pillar: ${res.pillarNameKo} (${res.code})`);
            console.log(`  Scores: ${res.elementScores}`);
        } catch (e) {
            console.error(`  FAILED:`, e);
        }
    }
}

test();
