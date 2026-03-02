// US-3: Daily Psychology Curation Data
export interface PsychologyItem {
    id: string;
    title: string;
    emoji: string;
    tags: string[];
    availableDates?: string[];
    path: string;
}

export const DAILY_PSYCHOLOGY: PsychologyItem[] = [
    { id: "inner-child", title: "내 안의 상처받은 아이 (Inner Child) 만나기", emoji: "🧸", tags: ["#내면", "#무의식", "#치유"], path: "/psychology/inner-child" },
    { id: "defense-mech", title: "스트레스 상황 속 나의 방어기제 스캔", emoji: "🛡️", tags: ["#스트레스", "#성격", "#생존"], path: "/psychology/defense" },
    { id: "shadow-self", title: "그림자 자아: 내가 억누른 가장 어두운 욕망", emoji: "🎭", tags: ["#융", "#그림자", "#본능"], path: "/psychology/shadow" },
    { id: "money-block", title: "돈의 흐름을 막는 무의식적 머니블록(Money Block)", emoji: "💸", tags: ["#재물", "#심리벽", "#부"], path: "/psychology/money-block" },
    { id: "gaslighting", title: "독성 관계와 가스라이팅 취약도 딥스캔", emoji: "🕸️", tags: ["#인간관계", "#위험탐지"], path: "/psychology/gaslighting" },
    { id: "burnout-calc", title: "뇌 과부하 및 번아웃 위험도 측정", emoji: "🌡️", tags: ["#에너지", "#멘탈케어"], path: "/psychology/burnout" },
    { id: "attachment", title: "성인 애착 유형: 내 연애가 자꾸 꼬이는 이유", emoji: "💕", tags: ["#연애", "#애착", "#관계"], path: "/psychology/attachment" },
    { id: "charm-find", title: "페르소나 맵: 타인이 나를 보는 매력 주파수", emoji: "🪞", tags: ["#매력", "#페르소나", "#객관화"], path: "/psychology/charm" },
    { id: "biz-booster", title: "커리어 생존력과 오피스 사파리 생존 타입", emoji: "💼", tags: ["#커리어", "#생존", "#오피스"], path: "/psychology/business" },
    { id: "aura-today", title: "실시간 감정 파동과 현재 나의 오라(Aura) 컬러", emoji: "✨", tags: ["#에너지", "#데일리", "#기분"], path: "/psychology/aura" }
];

export function getPsychologyForToday() {
    const today = new Date().toISOString().slice(5, 10); // MM-DD
    return DAILY_PSYCHOLOGY.filter(item =>
        !item.availableDates || item.availableDates.includes(today)
    );
}
