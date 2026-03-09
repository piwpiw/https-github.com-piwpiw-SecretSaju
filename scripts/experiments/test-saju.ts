import { calculateSajuFromBirthdate } from '@/lib/saju';

async function test() {
    try {
        const res = await calculateSajuFromBirthdate('1990-01-01', '12:00', 'solar', 'M', false);
        console.log('Success:', res.fourPillars.day.fullName);
    } catch (e) {
        console.error('Error:', e);
    }
}

test();
