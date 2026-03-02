import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load env
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase env variables');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const PILLAR_CODES = [
    "GAP_JA", "EUL_CHUK", "BYEONG_IN", "JEONG_MYO", "MU_JIN", "GI_SA", "GYEONG_O", "SIN_MI", "IM_SIN", "GYE_YU",
    "GAP_SUL", "EUL_HAE", "BYEONG_JA", "JEONG_CHUK", "MU_IN", "GI_MYO", "GYEONG_JIN", "SIN_SA", "IM_O", "GYE_MI",
    "GAP_SIN", "EUL_YU", "BYEONG_SUL", "JEONG_HAE", "MU_JA", "GI_CHUK", "GYEONG_IN", "SIN_MYO", "IM_JIN", "GYE_SA",
    "GAP_O", "EUL_MI", "BYEONG_SIN", "JEONG_YU", "MU_SUL", "GI_HAE", "GYEONG_JA", "SIN_CHUK", "IM_IN", "GYE_MYO",
    "GAP_JIN", "EUL_SA", "BYEONG_O", "JEONG_MI", "MU_SIN", "GI_YU", "GYEONG_SUL", "SIN_HAE", "IM_JA", "GYE_CHUK",
    "GAP_IN", "EUL_MYO", "BYEONG_JIN", "JEONG_SA", "MU_O", "GI_MI", "GYEONG_SIN", "SIN_YU", "IM_SUL", "GYE_HAE",
];

const FOOD_POOL = [
    { name: "연어", reason: "스트레스 해소·두뇌 활성화", emoji: "🐟" },
    { name: "다크 초콜릿", reason: "기분 전환·집중력", emoji: "🍫" },
    { name: "바나나", reason: "에너지·신경 안정", emoji: "🍌" },
    { name: "아보카도", reason: "포만감·건강한 지방", emoji: "🥑" },
    { name: "그릭 요거트", reason: "장 건강·프로바이오틱스", emoji: "🥛" },
    { name: "견과류", reason: "오메가3·집중력", emoji: "🥜" },
    { name: "귀리", reason: "지속 에너지·혈당 안정", emoji: "🌾" },
    { name: "녹차", reason: "카페인·L-테아닌 균형", emoji: "🍵" },
    { name: "달걀", reason: "단백질·비타민D", emoji: "🥚" },
    { name: "고구마", reason: "베타카로틴·포만감", emoji: "🍠" },
    { name: "블루베리", reason: "항산화·기억력", emoji: "🫐" },
    { name: "두부", reason: "식물성 단백질·칼슘", emoji: "🧈" }
];

async function seed() {
    console.log('🚀 Starting Database Seeding...');

    // 1. Animal Archetypes
    const charactersPath = path.join(__dirname, '../data/characters.json');
    let characters = [];
    if (fs.existsSync(charactersPath)) {
        characters = JSON.parse(fs.readFileSync(charactersPath, 'utf-8'));
    }

    const archetypeInserts = PILLAR_CODES.map(code => {
        const char = characters.find(c => c.code === code) || {};
        return {
            code,
            animal_name: char.animal_type || 'Unknown Animal',
            persona: char.persona || {},
            wealth_analysis: char.wealth_analysis || {},
            love_analysis: char.love_analysis || {},
            hidden_truth: char.hidden_truth || {},
            visual_guide: char.visual_guide || {},
            updated_at: new Date()
        };
    });

    console.log(`📦 Upserting ${archetypeInserts.length} animal archetypes...`);
    const { error: archErr } = await supabase.from('animal_archetypes').upsert(archetypeInserts);
    if (archErr) console.error('Archetype Seed Error:', archErr);

    // 2. Food Recommendations
    const foodInserts = [];
    PILLAR_CODES.forEach((code, idx) => {
        const foodIdx = idx % FOOD_POOL.length;
        const food = FOOD_POOL[foodIdx];
        foodInserts.push({
            code,
            name: food.name,
            reason: food.reason,
            emoji: food.emoji,
            target_age_group: 'all'
        });
    });

    console.log(`🥗 Upserting ${foodInserts.length} food recommendations...`);
    await supabase.from('food_recommendations').upsert(foodInserts);

    // 3. Campaigns (Sample)
    const campaigns = [
        {
            source: 'DinnerQueen',
            title: '[서울/전지역] 디너퀸 인기 맛집 체험단',
            landing_url: 'https://dinnerqueen.net/taste',
            image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400',
            description: '디너퀸이 엄선한 최고의 맛집 체험단',
            reward_info: '5만원 이용권',
            category: '맛집',
            is_active: true
        },
        {
            source: 'Revu',
            title: '[전국] 레뷰 블로그 체험단 모집',
            landing_url: 'https://revu.net',
            image_url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=400',
            description: '소셜 미디어 영향력을 발휘하세요',
            reward_info: '제품 협찬',
            category: '라이프',
            is_active: true
        }
    ];

    console.log(`📢 Upserting ${campaigns.length} campaigns...`);
    await supabase.from('campaigns').upsert(campaigns);

    // 4. Daily Fortunes (Sample for today)
    const today = new Date().toISOString().split('T')[0];
    const fortuneInserts = PILLAR_CODES.map(code => ({
        pillar_code: code,
        fortune_date: today,
        message: '매사에 신중을 기하면 좋은 결과가 있을 것입니다.',
        lucky_color: 'Blue',
        lucky_number: 7,
        score: 85
    }));

    console.log(`🔮 Upserting ${fortuneInserts.length} daily fortunes for today...`);
    await supabase.from('daily_fortunes').upsert(fortuneInserts);

    console.log('✅ Seeding Complete!');
}

seed().catch(console.error);
