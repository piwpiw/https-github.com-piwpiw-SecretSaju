import { getDayPillar, Stem, Branch } from '../core/calendar/ganji';
import { SajuProfile } from './storage';
import { calculateHighPrecisionSaju } from '../core/api/saju-engine';

export interface DailyFortuneResult {
    date: string;
    score: number;
    weather: 'sunny' | 'cloudy' | 'rain';
    summary: string;
    love: string;
    wealth: string;
    health: string;
    luckyItems: string[];
    premiumInsight: string;
}

const SipsongMap: Record<string, string> = {
    '비견': '주체성이 강화되고 자신감이 넘치는 날입니다.',
    '겁재': '주변과의 경쟁이나 협력 속에서 에너지를 쓰는 날입니다.',
    '식신': '표현력이 좋아지고 창의적인 아이디어가 샘솟는 기운입니다.',
    '상관': '재능을 발휘하기 좋으나 말실수에 주의해야 하는 날입니다.',
    '편재': '예상치 못한 기회나 활동 범위가 넓어지는 에너지가 들어옵니다.',
    '정재': '안정적이고 실속 있는 결과를 얻기 좋은 흐름입니다.',
    '편관': '압박감이 있을 수 있으나 강한 추진력이 생기는 날입니다.',
    '정관': '명예가 따르고 원칙을 지키면 인정받는 운세입니다.',
    '편인': '직관력이 예리해지고 깊은 생각에 잠기기 좋은 때입니다.',
    '정인': '도움을 주는 귀인을 만나거나 학문적 성취가 좋은 날입니다.'
};

const STEM_ELEMENTS: Record<Stem, string> = {
    '갑': '목', '을': '목', '병': '화', '정': '화', '무': '토',
    '기': '토', '경': '금', '신': '금', '임': '수', '계': '수'
};

const ELEMENT_GENERATION: Record<string, string> = {
    '목': '화', '화': '토', '토': '금', '금': '수', '수': '목'
};

const ELEMENT_CONTROL: Record<string, string> = {
    '목': '토', '화': '금', '토': '수', '금': '목', '수': '화'
};

const YANG_STEMS = new Set(['갑', '병', '무', '경', '임']);

function calculateOneSipsong(selfStem: Stem, target: Stem): string {
    const selfElement = STEM_ELEMENTS[selfStem];
    const targetElement = STEM_ELEMENTS[target];
    const selfYang = YANG_STEMS.has(selfStem);
    const targetYang = YANG_STEMS.has(target);
    const samePolarity = selfYang === targetYang;

    if (selfElement === targetElement) return samePolarity ? '비견' : '겁재';
    if (ELEMENT_GENERATION[selfElement] === targetElement) return samePolarity ? '식신' : '상관';
    if (ELEMENT_CONTROL[selfElement] === targetElement) return samePolarity ? '편재' : '정재';
    if (ELEMENT_CONTROL[targetElement] === selfElement) return samePolarity ? '편관' : '정관';
    return samePolarity ? '편인' : '정인';
}

export async function generateDailyFortune(profile: SajuProfile, locale: 'ko' | 'en' = 'ko'): Promise<DailyFortuneResult> {
    const today = new Date();
    const todayPillar = getDayPillar(today);

    const saju = await calculateHighPrecisionSaju({
        birthDate: new Date(profile.birthdate),
        birthTime: profile.birthTime || '12:00',
        gender: profile.gender === 'male' ? 'M' : 'F',
        calendarType: profile.calendarType
    });

    const selfStem = saju.fourPillars.day.stem;
    const todayStem = todayPillar.stem;
    const sipsong = calculateOneSipsong(selfStem, todayStem);

    // Dynamic generation logic
    let score = 70;
    let weather: DailyFortuneResult['weather'] = 'sunny';

    if (['정재', '정관', '정인', '식신'].includes(sipsong)) {
        score = 85 + Math.floor(Math.random() * 10);
        weather = 'sunny';
    } else if (['편재', '편관', '비견'].includes(sipsong)) {
        score = 75 + Math.floor(Math.random() * 10);
        weather = 'sunny';
    } else {
        score = 65 + Math.floor(Math.random() * 10);
        weather = 'cloudy';
    }

    const dateStr = today.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        year: locale === 'en' ? 'numeric' : undefined
    });

    const luckyItemsPoolKo = ["청색 계열", "흰색 상의", "숫자 7", "우드향 향수", "따뜻한 아메리카노", "가벼운 산책", "메탈 액세서리", "노란색 소품", "숫자 1", "클래식 음악"];
    const luckyItemsPoolEn = ["Blue items", "White top", "Number 7", "Woody perfume", "Hot Americano", "Light walk", "Metal accessories", "Yellow items", "Number 1", "Classic music"];
    const pool = locale === 'ko' ? luckyItemsPoolKo : luckyItemsPoolEn;

    const luckyItems = [
        pool[Math.floor(Math.random() * pool.length)],
        pool[Math.floor(Math.random() * pool.length)],
        locale === 'ko' ? `숫자 ${Math.floor(Math.random() * 9) + 1}` : `Number ${Math.floor(Math.random() * 9) + 1}`
    ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 3);

    const summariesEn: Record<string, string> = {
        '비견': 'A day of strong independence and confidence.',
        '겁재': 'Energy spent in competition or cooperation with others.',
        '식신': 'Great for expression and creative ideas.',
        '상관': 'Good for showing talent, but watch your words.',
        '편재': 'Unexpected opportunities and expanding horizons.',
        '정재': 'A steady day for practical results.',
        '편인': 'Intuition is sharp; good for deep thinking.',
        '정인': 'Meeting a mentor or academic success.',
        '편관': 'Some pressure, but strong momentum.',
        '정관': 'Honor follows if you stick to principles.'
    };

    const summary = locale === 'ko' ? (SipsongMap[sipsong] || "평온한 하루가 예상됩니다.") : (summariesEn[sipsong] || "A peaceful day ahead.");
    const love = locale === 'ko'
        ? (sipsong === '정재' || sipsong === '편재' ? "상대방의 매력을 다시금 발견하는 운세입니다." : "서로에 대한 존중이 필요한 날입니다.")
        : (sipsong === '정재' || sipsong === '편재' ? "You'll rediscover your partner's charm." : "Mutual respect is key today.");

    const wealth = locale === 'ko'
        ? (sipsong === '정재' || sipsong === '편재' || sipsong === '식신' ? "노력한 만큼의 정직한 결실이 맺히는 흐름입니다." : "충동적인 지출을 관리하는 것이 좋겠습니다.")
        : (sipsong === '정재' || sipsong === '편재' || sipsong === '식신' ? "Honest results match your efforts." : "Manage impulsive spending today.");

    const health = locale === 'ko' ? "충분한 휴식과 수분 섭취가 에너지를 보충해줍니다." : "Rest and hydration will boost your energy.";

    const premiumInsight = locale === 'ko'
        ? `당신의 ${selfStem} 일간과 오늘의 ${todayStem} 기운이 만나 '${sipsong}'의 작용이 일어납니다. 특히 대인관계에서 이 점을 활용하면 유리한 흐름을 탈 수 있습니다.`
        : `Your ${selfStem} Day Master meets today's ${todayStem} energy, activating '${sipsong}'. Utilizing this in relationships will bring favorable results.`;

    return {
        date: dateStr,
        score,
        weather,
        summary,
        love,
        wealth,
        health,
        luckyItems,
        premiumInsight
    };
}
