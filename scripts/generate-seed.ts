import fs from 'fs';
import path from 'path';
import { PILLAR_CODES, getPillarNameKo } from '../src/lib/saju';
import { getFoodRecommendationsByCode } from '../src/data/foodRecommendations';

// We'll also mock animal archetypes a bit, just enough to populate the table for the 60 pillars.
// In reality, this would be filled by more detailed data.

console.log("Generating seed.sql...");

let sql = `-- Auto-generated seed file for Content DB
-- Generated at: ${new Date().toISOString()}

BEGIN;

-- 1. Insert Animal Archetypes
INSERT INTO public.animal_archetypes (code, animal_name, persona) VALUES
`;

const archetypes = PILLAR_CODES.map((code, idx) => {
    // Generate some basic archetype data
    const nameStr = getPillarNameKo(idx); // e.g. "갑자"
    return `  ('${code}', '${nameStr} 동물', '{"title": "${nameStr} 아키타입", "summary": "기본 생성된 ${nameStr} 데이터"}')`;
}).join(',\n');

sql += archetypes + ';\n\n';

sql += `-- 2. Insert Food Recommendations\n`;
sql += `INSERT INTO public.food_recommendations (code, name, reason, emoji, target_age_group) VALUES\n`;

const foodValues = [];
for (const code of PILLAR_CODES) {
    const foods10s = getFoodRecommendationsByCode(code, "10s");
    const foods20s = getFoodRecommendationsByCode(code, "20s");
    const foods30s = getFoodRecommendationsByCode(code, "30s");
    const foodsAll = getFoodRecommendationsByCode(code); // default

    // Insert for 'all'
    for (const food of foodsAll) {
        foodValues.push(`  ('${code}', '${food.name}', '${food.reason}', '${food.emoji}', 'all')`);
    }
}

sql += foodValues.join(',\n') + ';\n\n';

sql += 'COMMIT;\n';

const outputPath = path.join(__dirname, '..', 'supabase', 'seed.sql');
fs.writeFileSync(outputPath, sql, 'utf8');

console.log('Successfully generated supabase/seed.sql');
