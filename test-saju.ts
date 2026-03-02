import { calculateSaju } from './src/lib/saju';

async function main() {
    try {
        const result = await calculateSaju(new Date(1982, 1, 20, 12, 0), 'M', '12:00', 'solar', false);
        console.log(JSON.stringify(result, null, 2));
    } catch (err) {
        console.error('ERROR:', err);
    }
}
main();
