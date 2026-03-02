import { getDayPillar, Stem, Branch, getGanJiFromIndex } from '../core/calendar/ganji';
import { SajuProfile } from './storage';
import { calculateHighPrecisionSaju } from '../core/api/saju-engine';
import { Element } from '../core/myeongni/elements';

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
    hourlyScores: number[];
    hourlyTips: string[];
}

const SipsongMap: Record<string, string> = {
    '비견': '에너지가 본인에게 집중되며 주체적인 결정을 내리기 좋은 날입니다.',
    '겁재': '의지가 강해지나 자칫 주변과의 경쟁이나 갈등이 생길 수 있으니 유연함이 필요합니다.',
    '식신': '표현력이 좋아지고 창의적인 아이디어가 샘솟으며 의식주가 풍족해지는 기운입니다.',
    '상관': '재능을 발휘하기 좋고 변화를 시도하기 좋으나, 말실수나 상관 견관에 유의하십시오.',
    '편재': '예상치 못한 큰 기회나 활동 범위가 넓어지며 역동적인 에너지가 들어옵니다.',
    '정재': '안정적이고 실속 있는 결과를 얻기 좋으며, 성실함이 보상을 받는 흐름입니다.',
    '편관': '압박감이 클 수 있으나 강한 리더십과 카리스마로 어려운 일을 해결할 수 있습니다.',
    '정관': '명예와 신용이 상승하며 원칙을 지킬 때 주변의 인정과 도움을 받는 운세입니다.',
    '편인': '직관과 영감이 예리해지며 깊은 통찰력을 발휘해 핵심을 꿰뚫기 좋습니다.',
    '정인': '귀인의 도움을 받거나 학문 및 문서 관련 성취가 높고 마음이 평온해지는 날입니다.'
};

const STEM_ELEMENTS: Record<Stem, Element> = {
    '갑': '목', '을': '목', '병': '화', '정': '화', '무': '토',
    '기': '토', '경': '금', '신': '금', '임': '수', '계': '수'
};

const ELEMENT_GENERATION: Record<Element, Element> = {
    '목': '화', '화': '토', '토': '금', '금': '수', '수': '목'
};

const ELEMENT_CONTROL: Record<Element, Element> = {
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
    // Must be Mother (In-seong)
    return samePolarity ? '편인' : '정인';
}

export async function generateDailyFortune(profile: SajuProfile, locale: 'ko' | 'en' = 'ko', targetDate: Date = new Date()): Promise<DailyFortuneResult> {
    const todayPillar = getDayPillar(targetDate);

    const saju = await calculateHighPrecisionSaju({
        birthDate: new Date(profile.birthdate),
        birthTime: profile.birthTime || '12:00',
        gender: profile.gender === 'male' ? 'M' : 'F',
        calendarType: profile.calendarType
    });

    const selfStem = saju.fourPillars.day.stem;
    const todayStem = todayPillar.stem;
    const todayBranch = todayPillar.branch;
    const sipsong = calculateOneSipsong(selfStem, todayStem);

    // 1. Calculate Score based on Yongshin / Heeshin
    // Base score 70
    let score = 70;
    const todayElement = STEM_ELEMENTS[todayStem];
    const yongshin = saju.yongshin.primary.element;
    const heeshin = saju.yongshin.secondary.element;
    const kisin = saju.yongshin.unfavorable.element;

    if (todayElement === yongshin) score += 20;
    else if (todayElement === heeshin) score += 10;
    else if (todayElement === kisin) score -= 15;
    
    // 2. Adjust for Shinsal of the day (Simple check)
    // Noble Star (Chun-eul Gwi-in) check
    const gwiInMap: Record<string, string[]> = {
        '갑': ['축', '미'], '무': ['축', '미'], '경': ['축', '미'],
        '을': ['자', '신'], '기': ['자', '신'],
        '병': ['유', '해'], '정': ['유', '해'],
        '신': ['인', '오'],
        '임': ['사', '묘'], '계': ['사', '묘']
    };
    const userGwiIn = gwiInMap[selfStem] || [];
    if (userGwiIn.includes(todayBranch)) {
        score += 10;
    }

    // 3. Round and clamp score
    score = Math.min(99, Math.max(40, score));

    // 4. Weather determination
    let weather: DailyFortuneResult['weather'] = 'sunny';
    if (score >= 85) weather = 'sunny';
    else if (score >= 65) weather = 'cloudy';
    else weather = 'rain';

    const dateStr = targetDate.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        year: locale === 'en' ? 'numeric' : undefined
    });

    const luckyItemsPoolKo = ["청색 계열", "흰색 상의", "숫자 7", "우드향 향수", "따뜻한 아메리카노", "가벼운 산책", "메탈 액세서리", "노란색 소품", "숫자 1", "클래식 음악", "은색 장신구", "붉은 포인트", "아로마 향", "녹차"];
    const luckyItemsPoolEn = ["Blue items", "White top", "Number 7", "Woody perfume", "Hot Americano", "Light walk", "Metal accessories", "Yellow items", "Number 1", "Classic music", "Silver jewelry", "Red accents", "Aroma scent", "Green tea"];
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
    
    // Specialized descriptions based on sipsong + yongshin
    let love = locale === 'ko' ? "서로에 대한 존중이 필요한 날입니다." : "Mutual respect is key today.";
    if (['정재', '편재', '식신'].includes(sipsong) && todayElement === yongshin) {
        love = locale === 'ko' ? "상대방의 매력을 다시금 발견하고 깊은 교감을 나누는 길한 운세입니다." : "A great day to rediscover your partner's charm and deepen connections.";
    }

    let wealth = locale === 'ko' ? "충동적인 지출을 관리하는 것이 좋겠습니다." : "Manage impulsive spending today.";
    if (['정재', '편재', '정인'].includes(sipsong) && (todayElement === yongshin || todayElement === heeshin)) {
        wealth = locale === 'ko' ? "그동안의 노력이 정직한 결실로 돌아오거나 좋은 제안을 받을 수 있는 흐름입니다." : "Your efforts are returning as practical results or favorable offers.";
    }

    const health = locale === 'ko' ? "충분한 휴식과 수분 섭취가 에너지를 보충해줍니다." : "Rest and hydration will boost your energy.";

    const premiumInsight = locale === 'ko'
        ? `오늘의 기운은 귀하의 용신인 '${yongshin}' 오행과 '${sipsong}'의 성분이 조화를 이룹니다. 특히 '${todayStem}(${todayElement})'의 에너지를 적극 활용하여 중요한 결정을 내리기에 적합한 시기입니다.`
        : `Today's energy harmonizes with your favorable element '${yongshin}' and the '${sipsong}' component. It is an auspicious time to make critical decisions using the '${todayStem}(${todayElement})' energy.`;

    const hourlyTipsKo = ["조용한 명상으로 우주의 기운과 정렬하세요.", "주변과의 원만한 대화가 행운을 부릅니다.", "창의적인 영감이 샘솟는 황금 시간대입니다.", "중요한 의사결정은 잠시 미루는 것이 좋습니다.", "적극적인 활동으로 성취를 가시화하세요.", "뜻밖의 귀인을 만날 수 있는 길한 시간입니다."];
    const hourlyTipsEn = ["Align with the cosmic flow through quiet meditation.", "Smooth communication brings good luck.", "Golden time for creative inspiration.", "Delay critical decisions if possible.", "Visualize success through active movement.", "Favorable time to meet a supportive person."];
    const tips = locale === 'ko' ? hourlyTipsKo : hourlyTipsEn;

    const hourlyScores = Array.from({ length: 6 }, () => Math.max(40, Math.min(99, score + (Math.floor(Math.random() * 20) - 10))));
    const hourlyTips = tips.sort(() => Math.random() - 0.5);

    return {
        date: dateStr,
        score,
        weather,
        summary,
        love,
        wealth,
        health,
        luckyItems,
        premiumInsight,
        hourlyScores,
        hourlyTips
    };
}
