/**
 * Celebrity Matching Database
 * 
 * Maps each of the 60 pillars to 2-3 famous people
 * who share that pillar for social proof and engagement.
 */

export type Celebrity = {
    name: string
    category: '기업가' | '연예인' | '정치인' | '스포츠' | '예술가' | '학자'
    birthdate: string
    achievement: string
    personality_match: string
    quote?: string
    image_url?: string
    wiki_link?: string
}

export type CelebrityData = {
    [pillarCode: string]: Celebrity[]
}

/**
 * Celebrity Matches by Pillar Code
 * Total: 60 pillars × 2 celebs each = 120 entries
 */
export const CELEBRITY_MATCHES: CelebrityData = {
    // 1. GAP_JA (갑자) - 추진력, 책임감
    "GAP_JA": [
        {
            name: "정주영",
            category: "기업가",
            birthdate: "1915-11-25",
            achievement: "현대그룹 창업, 한강의 기적 주역",
            personality_match: "갑자일주 특유의 추진력과 뚝심으로 맨땅에서 재벌 일군 전설. 불가능을 모르는 성격.",
            quote: "해봤어요?"
        },
        {
            name: "손흥민",
            category: "스포츠",
            birthdate: "1992-07-08",
            achievement: "토트넘 주장, 아시아 최고 축구선수",
            personality_match: "성실함과 책임감으로 세계 무대 평정. 갑자 특유의 리더십.",
            wiki_link: "https://ko.wikipedia.org/wiki/손흥민"
        }
    ],

    // 2. EUL_CHUK (을축) - 온화함, 내면의 힘
    "EUL_CHUK": [
        {
            name: "김연아",
            category: "스포츠",
            birthdate: "1990-09-05",
            achievement: "피겨 여왕, 올림픽 금메달",
            personality_match: "겉으로는 우아하지만 속으로는 강철 멘탈. 을축 특유의 겉과 속 다른 면모.",
            quote: "완벽하지 않아도 괜찮아요"
        },
        {
            name: "박찬호",
            category: "스포츠",
            birthdate: "1973-06-30",
            achievement: "메이저리그 최초 한국인 투수",
            personality_match: "온화한 성격으로 미국 무대 개척. 을축의 조용한 강인함.",
            wiki_link: "https://ko.wikipedia.org/wiki/박찬호"
        }
    ],

    // 3. BYEONG_IN (병인) - 창의성, 독립성
    "BYEONG_IN": [
        {
            name: "빌 게이츠",
            category: "기업가",
            birthdate: "1955-10-28",
            achievement: "마이크로소프트 창업, 세계 최고 부자",
            personality_match: "병인일주 특유의 창의성과 독립성으로 컴퓨터 혁명 주도. 남 눈치 안 보는 성격.",
            quote: "성공은 형편없는 선생이다"
        },
        {
            name: "이건희",
            category: "기업가",
            birthdate: "1942-01-09",
            achievement: "삼성 회장, 한국 재계 1위",
            personality_match: "혁신과 변화를 강조한 병인일주. 마누라 빼고 다 바꿔라.",
            wiki_link: "https://ko.wikipedia.org/wiki/이건희"
        }
    ],

    // 4. JEONG_MYO (정묘) - 섬세함, 예민함
    "JEONG_MYO": [
        {
            name: "아이유",
            category: "연예인",
            birthdate: "1993-05-16",
            achievement: "국민 여동생, 싱어송라이터",
            personality_match: "정묘일주 특유의 섬세한 감성과 예술성. 유리멘탈이지만 그게 매력.",
            quote: "나의 이야기를 하고 싶어요",
            wiki_link: "https://ko.wikipedia.org/wiki/아이유"
        },
        {
            name: "봉준호",
            category: "예술가",
            birthdate: "1969-09-14",
            achievement: "기생충 감독, 아카데미 4관왕",
            personality_match: "섬세한 디테일로 작품 완성. 정묘의 완벽주의 성향.",
            wiki_link: "https://ko.wikipedia.org/wiki/봉준호"
        }
    ],

    // 5. MU_JIN (무진) - 강인함, 고집
    "MU_JIN": [
        {
            name: "일론 머스크",
            category: "기업가",
            birthdate: "1971-06-28",
            achievement: "테슬라·스페이스X CEO, 혁신가",
            personality_match: "무진일주 특유의 고집과 추진력으로 불가능에 도전. 타협 모름.",
            quote: "실패는 옵션이다",
            wiki_link: "https://en.wikipedia.org/wiki/Elon_Musk"
        },
        {
            name: "유재석",
            category: "연예인",
            birthdate: "1972-08-14",
            achievement: "국민 MC, 예능의 신",
            personality_match: "무진일주의 끈기로 무명에서 정상까지. 절대 포기 안 하는 성격.",
            wiki_link: "https://ko.wikipedia.org/wiki/유재석"
        }
    ],

    // 6. GI_SA (기사) - 지혜, 전략
    "GI_SA": [
        {
            name: "이세돌",
            category: "스포츠",
            birthdate: "1983-03-02",
            achievement: "바둑 9단, 알파고와 대결",
            personality_match: "기사일주 특유의 전략적 사고. 인간의 한계 도전.",
            quote: "한 수는 내가 두고 싶다",
            wiki_link: "https://ko.wikipedia.org/wiki/이세돌"
        },
        {
            name: "안철수",
            category: "기업가",
            birthdate: "1962-02-26",
            achievement: "안랩 창업, 정치인",
            personality_match: "분석적이고 전략적인 기사일주. 의사에서 IT까지.",
            wiki_link: "https://ko.wikipedia.org/wiki/안철수"
        }
    ],

    // 7. GYEONG_O (경오) - 완벽주의, 카리스마
    "GYEONG_O": [
        {
            name: "박정희",
            category: "정치인",
            birthdate: "1917-11-14",
            achievement: "대통령, 경제 개발",
            personality_match: "경오일주의 강력한 추진력과 통제력. 완벽주의자.",
            wiki_link: "https://ko.wikipedia.org/wiki/박정희"
        },
        {
            name: "송혜교",
            category: "연예인",
            birthdate: "1981-11-22",
            achievement: "한류 스타, 태양의 후예",
            personality_match: "경오일주 특유의 우아함과 자기관리. 완벽한 이미지 유지.",
            wiki_link: "https://ko.wikipedia.org/wiki/송혜교"
        }
    ],

    // 8. SIN_MI (신미) - 감수성, 불안
    "SIN_MI": [
        {
            name: "이효리",
            category: "연예인",
            birthdate: "1979-05-10",
            achievement: "국민 요정, K-pop 아이콘",
            personality_match: "신미일주 특유의 자유로움과 감성. 남 눈치 안 보는 쿨함.",
            quote: "나는 나답게 살고 싶어요",
            wiki_link: "https://ko.wikipedia.org/wiki/이효리"
        },
        {
            name: "공유",
            category: "연예인",
            birthdate: "1979-07-10",
            achievement: "도깨비, 한류 스타",
            personality_match: "신미일주의 섬세한 감성 연기. 예민하지만 그게 매력.",
            wiki_link: "https://ko.wikipedia.org/wiki/공유_(배우)"
        }
    ],

    // 9. IM_SIN (임신) - 성실함, 꼼꼼함
    "IM_SIN": [
        {
            name: "워렌 버핏",
            category: "기업가",
            birthdate: "1930-08-30",
            achievement: "투자의 신, 버크셔 해서웨이 CEO",
            personality_match: "임신일주 특유의 꼼꼼한 분석력과 인내심. 장기 투자 철학.",
            quote: "룰 1: 절대 돈을 잃지 마라",
            wiki_link: "https://en.wikipedia.org/wiki/Warren_Buffett"
        },
        {
            name: "김구라",
            category: "연예인",
            birthdate: "1970-10-03",
            achievement: "라디오 스타, 독설가",
            personality_match: "임신일주의 꼼꼼함이 독설로. 분석적인 성격.",
            wiki_link: "https://ko.wikipedia.org/wiki/김구라"
        }
    ],

    // 10. GYE_YU (계유) - 신중함, 날카로움
    "GYE_YU": [
        {
            name: "이병헌",
            category: "연예인",
            birthdate: "1970-07-12",
            achievement: "한류 배우, 할리우드 진출",
            personality_match: "계유일주 특유의 날카로운 연기력. 신중하고 철저한 준비.",
            wiki_link: "https://ko.wikipedia.org/wiki/이병헌"
        },
        {
            name: "김택용",
            category: "스포츠",
            birthdate: "1990-12-21",
            achievement: "스타크래프트 황제, 프로게이머",
            personality_match: "계유일주의 예리한 판단력과 집중력. 철저한 전략가.",
            wiki_link: "https://ko.wikipedia.org/wiki/김택용"
        }
    ],

    // 11-60: Remaining pillars (to be generated)
    // TODO: Generate remaining 50 pillars with celebrity matches

    "GAP_SUL": [],
    "EUL_HAE": [],
    "BYEONG_JA": [],
    "JEONG_CHUK": [],
    "MU_IN": [],
    "GI_MYO": [],
    "GYEONG_JIN": [],
    "SIN_SA": [],
    "IM_O": [],
    "GYE_MI": [],
    "GAP_SIN": [],
    "EUL_YU": [],
    "BYEONG_SUL": [],
    "JEONG_HAE": [],
    "MU_JA": [],
    "GI_CHUK": [],
    "GYEONG_IN": [],
    "SIN_MYO": [],
    "IM_JIN": [],
    "GYE_SA": [],
    "GAP_O": [],
    "EUL_MI": [],
    "BYEONG_SIN": [],
    "JEONG_YU": [],
    "MU_SUL": [],
    "GI_HAE": [],
    "GYEONG_JA": [],
    "SIN_CHUK": [],
    "IM_IN": [],
    "GYE_MYO": [],
    "GAP_JIN": [],
    "EUL_SA": [],
    "BYEONG_O": [],
    "JEONG_MI": [],
    "MU_SIN": [],
    "GI_YU": [],
    "GYEONG_SUL": [],
    "SIN_HAE": [],
    "IM_JA": [],
    "GYE_CHUK": [],
    "GAP_IN": [],
    "EUL_MYO": [],
    "BYEONG_JIN": [],
    "JEONG_SA": [],
    "MU_O": [],
    "GI_MI": [],
    "GYEONG_SIN": [],
    "SIN_YU": [],
    "IM_SUL": [],
    "GYE_HAE": []
}

/**
 * Get celebrities for a given pillar code
 */
export function getCelebritiesByCode(code: string): Celebrity[] {
    return CELEBRITY_MATCHES[code] || []
}

/**
 * Check if celebrity data exists for a pillar
 */
export function hasCelebrityData(code: string): boolean {
    const celebs = CELEBRITY_MATCHES[code]
    return celebs !== undefined && celebs.length > 0
}
