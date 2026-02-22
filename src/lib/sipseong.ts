/**
 * 십성 (十星, Sipseong / Ten Gods) System
 * 
 * 사주 명리학에서 가장 중요한 관계 분석 도구
 * "나"와 "상대방"의 오행 관계로 십성 결정
 */

import { WuxingElement, getWuxingFromPillarCode, WUXING_INFO } from "./wuxing";

export type Sipseong =
    | "비견" // 比肩
    | "겁재" // 劫財
    | "식신" // 食神
    | "상관" // 傷官
    | "편재" // 偏財
    | "정재" // 正財
    | "편관" // 偏官 (칠살)
    | "정관" // 正官
    | "편인" // 偏印 (도식)
    | "정인"; // 正印

export interface SipseongInfo {
    name: Sipseong;
    hanja: string;
    category: "나" | "표현" | "재물" | "권력" | "학문";
    yinyang_match: "같음" | "다름";
    trait: string;
    positive: string[];
    negative: string[];
    emoji: string;
}

export const SIPSEONG_DEFINITIONS: Record<Sipseong, SipseongInfo> = {
    비견: {
        name: "비견",
        hanja: "比肩",
        category: "나",
        yinyang_match: "같음",
        trait: "나와 같은 존재 - 친구이자 경쟁자",
        positive: ["동료애", "협력", "공감"],
        negative: ["경쟁", "자존심 충돌", "주도권 다툼"],
        emoji: "🤝",
    },
    겁재: {
        name: "겁재",
        hanja: "劫財",
        category: "나",
        yinyang_match: "다름",
        trait: "나와 비슷하지만 다름 - 라이벌",
        positive: ["추진력", "적극성", "행동력"],
        negative: ["재물 손실", "배신", "갈등"],
        emoji: "⚔️",
    },
    식신: {
        name: "식신",
        hanja: "食神",
        category: "표현",
        yinyang_match: "같음",
        trait: "내가 만드는 것 - 여유롭게 표현",
        positive: ["창작", "여유", "즐거움", "재능"],
        negative: ["게으름", "욕심 부족", "현실 도피"],
        emoji: "🎨",
    },
    상관: {
        name: "상관",
        hanja: "傷官",
        category: "표현",
        yinyang_match: "다름",
        trait: "내가 표현하는 것 - 날카롭게 비판",
        positive: ["재능", "표현력", "창의성", "자유"],
        negative: ["비판", "반항", "권위 거부", "트러블"],
        emoji: "💥",
    },
    편재: {
        name: "편재",
        hanja: "偏財",
        category: "재물",
        yinyang_match: "같음",
        trait: "흘러가는 돈 - 투자, 사업",
        positive: ["사업", "투자", "사교", "활동성"],
        negative: ["돈 관리 어려움", "투자 실패", "바람기"],
        emoji: "💰",
    },
    정재: {
        name: "정재",
        hanja: "正財",
        category: "재물",
        yinyang_match: "다름",
        trait: "고정된 돈 - 월급, 안정",
        positive: ["안정", "성실", "계획적", "저축"],
        negative: ["리스크 회피", "소극적", "보수적"],
        emoji: "💵",
    },
    편관: {
        name: "편관",
        hanja: "偏官",
        category: "권력",
        yinyang_match: "같음",
        trait: "나를 억압하는 힘 - 상사, 압박",
        positive: ["추진력", "책임감", "리더십"],
        negative: ["압박", "스트레스", "권위적", "갈등"],
        emoji: "👊",
    },
    정관: {
        name: "정관",
        hanja: "正官",
        category: "권력",
        yinyang_match: "다름",
        trait: "나를 이끄는 힘 - 명예, 직위",
        positive: ["명예", "직위", "규칙", "신뢰"],
        negative: ["부담", "책임 과중", "융통성 부족"],
        emoji: "👑",
    },
    편인: {
        name: "편인",
        hanja: "偏印",
        category: "학문",
        yinyang_match: "같음",
        trait: "불규칙한 배움 - 특수 기술",
        positive: ["직관", "특수 기술", "독창성"],
        negative: ["고집", "외로움", "독단", "편식"],
        emoji: "🔮",
    },
    정인: {
        name: "정인",
        hanja: "正印",
        category: "학문",
        yinyang_match: "다름",
        trait: "정통 학문 - 학위, 자격증",
        positive: ["학문", "지식", "도움", "보호"],
        negative: ["의존", "수동적", "게으름"],
        emoji: "📚",
    },
};

/**
 * 오행 관계로 십성 결정
 * 
 * 기준: "나"의 일간(日干) 오행 vs "상대방"의 오행
 */
export function calculateSipseong(
    myElement: WuxingElement,
    targetElement: WuxingElement,
    myYinyang: "양" | "음",
    targetYinyang: "양" | "음"
): Sipseong {
    // 동일 오행
    if (myElement === targetElement) {
        return myYinyang === targetYinyang ? "비견" : "겁재";
    }

    // 내가 생하는 오행 (나 → 상대)
    const elementOrder: WuxingElement[] = ["木", "火", "土", "金", "水"];
    const myIndex = elementOrder.indexOf(myElement);
    const targetIndex = elementOrder.indexOf(targetElement);

    // 상생 관계 확인 (시계방향)
    const nextIndex = (myIndex + 1) % 5;
    if (targetIndex === nextIndex) {
        // 내가 상대를 생함 = 식상
        return myYinyang === targetYinyang ? "식신" : "상관";
    }

    // 내가 극하는 오행 (나 → 상대)
    const keIndex = (myIndex + 2) % 5;
    if (targetIndex === keIndex) {
        // 내가 상대를 극함 = 재성
        return myYinyang === targetYinyang ? "편재" : "정재";
    }

    // 나를 극하는 오행 (상대 → 나)
    const prevIndex = (myIndex + 3) % 5;
    if (targetIndex === prevIndex) {
        // 상대가 나를 극함 = 관성
        return myYinyang === targetYinyang ? "편관" : "정관";
    }

    // 나를 생하는 오행 (상대 → 나)
    const shengIndex = (myIndex + 4) % 5;
    if (targetIndex === shengIndex) {
        // 상대가 나를 생함 = 인성
        return myYinyang === targetYinyang ? "편인" : "정인";
    }

    // fallback
    return "비견";
}

/**
 * 두 사람의 일주 코드로 십성 관계 계산
 */
export function getSipseongRelation(myPillarCode: string, targetPillarCode: string): {
    sipseong: Sipseong;
    info: SipseongInfo;
    reversed: Sipseong; // 상대방 입장에서 나를 보는 십성
} {
    const myWuxing = getWuxingFromPillarCode(myPillarCode);
    const targetWuxing = getWuxingFromPillarCode(targetPillarCode);

    // 음양 정보 가져오기 (천간 기준)
    const myYinyang = getYinyang(myPillarCode);
    const targetYinyang = getYinyang(targetPillarCode);

    const sipseong = calculateSipseong(
        myWuxing.dominant,
        targetWuxing.dominant,
        myYinyang,
        targetYinyang
    );

    const reversed = calculateSipseong(
        targetWuxing.dominant,
        myWuxing.dominant,
        targetYinyang,
        myYinyang
    );

    return {
        sipseong,
        info: SIPSEONG_DEFINITIONS[sipseong],
        reversed,
    };
}

/**
 * 일주 코드에서 음양 추출
 */
function getYinyang(pillarCode: string): "양" | "음" {
    // 천간 첫 글자로 음양 판별
    const yangChars = ["GAP", "BYEONG", "MU", "GYEONG", "IM"];
    const firstPart = pillarCode.split("_")[0];
    return yangChars.includes(firstPart) ? "양" : "음";
}

/**
 * 십성별 상황(직장/연애/친구) 해석
 */
export function getSipseongContext(
    sipseong: Sipseong,
    context: "직장" | "연애" | "친구"
): { score: number; dynamic: string; advice: string } {
    const contextMap: Record<
        Sipseong,
        Record<"직장" | "연애" | "친구", { score: number; dynamic: string; advice: string }>
    > = {
        비견: {
            직장: {
                score: 70,
                dynamic: "동료로는 최고, 하지만 주도권 싸움 주의",
                advice: "역할 분담 명확히",
            },
            연애: {
                score: 50,
                dynamic: "친구같은 연인, 근데 로맨스 부족",
                advice: "친구 이상 연인 미만 탈출 필요",
            },
            친구: {
                score: 90,
                dynamic: "서로 이해 잘 됨, 평생 친구감",
                advice: "경쟁보다 협력",
            },
        },
        겁재: {
            직장: {
                score: 40,
                dynamic: "경쟁자, 서로 견제함",
                advice: "거리 유지하거나 팀 분리",
            },
            연애: {
                score: 30,
                dynamic: "격렬하지만 불안정, ��신 가능성",
                advice: "신뢰 쌓기 필수",
            },
            친구: {
                score: 60,
                dynamic: "자극적이지만 소모적",
                advice: "적당한 거리 유지",
            },
        },
        식신: {
            직장: {
                score: 85,
                dynamic: "내가 성과 만들면 상대가 빛내줌",
                advice: "프로젝트 함께하면 시너지",
            },
            연애: {
                score: 75,
                dynamic: "여유롭고 즐거운 연애",
                advice: "솔직하게 표현하면 좋음",
            },
            친구: {
                score: 90,
                dynamic: "같이 놀기 좋은 친구",
                advice: "긍정 에너지 교환",
            },
        },
        상관: {
            직장: {
                score: 60,
                dynamic: "창의적이지만 규칙 충돌 가능",
                advice: "자유로운 환경에서 협업",
            },
            연애: {
                score: 70,
                dynamic: "열정적이지만 감정 기복 심함",
                advice: "표현은 부드럽게",
            },
            친구: {
                score: 80,
                dynamic: "재밌지만 가끔 과격",
                advice: "서로 존중하면 베프",
            },
        },
        편재: {
            직장: {
                score: 75,
                dynamic: "사업 파트너로 좋음",
                advice: "돈 관련 명확히 정리",
            },
            연애: {
                score: 65,
                dynamic: "매력적이지만 바람기 주의",
                advice: "소유욕 버리고 여유 가지기",
            },
            친구: {
                score: 85,
                dynamic: "사교적이고 활발한 관계",
                advice: "같이 활동하면 좋음",
            },
        },
        정재: {
            직장: {
                score: 80,
                dynamic: "안정적인 파트너십",
                advice: "장기 프로젝트 함께",
            },
            연애: {
                score: 90,
                dynamic: "결혼 상대감, 안정적",
                advice: "평생 함께 갈 사람",
            },
            친구: {
                score: 70,
                dynamic: "믿을 수 있는 친구",
                advice: "성실하게 관계 유지",
            },
        },
        편관: {
            직장: {
                score: 50,
                dynamic: "압박하는 상사 느낌",
                advice: "실력으로 인정받기",
            },
            연애: {
                score: 60,
                dynamic: "카리스마 있지만 통제 성향",
                advice: "밸런스 중요",
            },
            친구: {
                score: 55,
                dynamic: "긴장감 있는 관계",
                advice: "적당한 거리 필요",
            },
        },
        정관: {
            직장: {
                score: 85,
                dynamic: "존경하는 상사/멘토 스타일",
                advice: "배울 점 많음",
            },
            연애: {
                score: 80,
                dynamic: "이상적인 배우자감",
                advice: "책임감 있는 관계",
            },
            친구: {
                score: 75,
                dynamic: "모범적인 친구",
                advice: "서로 성장 도움",
            },
        },
        편인: {
            직장: {
                score: 65,
                dynamic: "독특한 아이디어 나눔",
                advice: "창의적 프로젝트 협업",
            },
            연애: {
                score: 55,
                dynamic: "신비롭지만 거리감 있음",
                advice: "소통 노력 필요",
            },
            친구: {
                score: 70,
                dynamic: "특별한 취미 공유",
                advice: "독립성 존중",
            },
        },
        정인: {
            직장: {
                score: 90,
                dynamic: "도움 주는 멘토/선배",
                advice: "배우는 자세 유지",
            },
            연애: {
                score: 70,
                dynamic: "보호해주는 느낌, 근데 의존 주의",
                advice: "균형 잡힌 관계",
            },
            친구: {
                score: 85,
                dynamic: "따뜻하고 지지해주는 친구",
                advice: "감사한 마음 표현",
            },
        },
    };

    return contextMap[sipseong][context];
}
