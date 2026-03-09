export interface TermGuide {
  term: string;
  hanja?: string;
  plain: string;
  strengths: string[];
  cautions: string[];
  actionTip: string;
}

const TEN_GOD_SUMMARY_EN: Record<string, string> = {
  비견: "Cooperative but competitive energy with peers.",
  겁재: "Fast competitive momentum; avoid impulsive moves.",
  식신: "Strong expression and productive creative flow.",
  상관: "Sharp critique and differentiation; validate before acting.",
  편재: "External opportunities increase; keep allocation disciplined.",
  정재: "Stable and practical flow with steady returns.",
  편관: "Pressure-driven leadership; manage tone and stress.",
  정관: "Order, responsibility, and trust-based progress.",
  편인: "Intuition and unconventional insight rise quickly.",
  정인: "Learning, protection, and recovery-oriented stability.",
};

const TEN_GODS_GUIDE: Record<string, TermGuide> = {
  비견: {
    term: "비견",
    hanja: "比肩",
    plain: "나와 비슷한 결의 사람·상황과 맞닿는 기운",
    strengths: ["협업 감각", "독립성", "실행력"],
    cautions: ["주도권 충돌", "고집 경쟁", "양보 부족"],
    actionTip: "역할 경계를 먼저 정하면 관계와 성과가 함께 좋아집니다.",
  },
  겁재: {
    term: "겁재",
    hanja: "劫財",
    plain: "경쟁과 속도, 승부욕이 강해지는 기운",
    strengths: ["추진력", "순발력", "생존 감각"],
    cautions: ["충동 소비", "감정적 반응", "마찰"],
    actionTip: "중요 결정은 10분 유예 규칙을 두고 진행하세요.",
  },
  식신: {
    term: "식신",
    hanja: "食神",
    plain: "표현과 생산성이 살아나는 기운",
    strengths: ["창의성", "콘텐츠 생산", "생활력"],
    cautions: ["루틴 과부하", "마감 지연", "체력 소모"],
    actionTip: "오늘은 결과물 1개 완성을 목표로 압축하세요.",
  },
  상관: {
    term: "상관",
    hanja: "傷官",
    plain: "비판적 통찰과 차별화 아이디어가 올라오는 기운",
    strengths: ["분석력", "개선안 제시", "기획 감각"],
    cautions: ["직설 화법", "권위 충돌", "예민함"],
    actionTip: "문제 제기와 함께 대안 1개를 반드시 같이 제시하세요.",
  },
  편재: {
    term: "편재",
    hanja: "偏財",
    plain: "외부 기회·네트워크·확장성이 커지는 기운",
    strengths: ["영업력", "관계 확장", "기회 포착"],
    cautions: ["산만함", "무리한 확장", "수익 변동성"],
    actionTip: "새 기회는 1건만 채택하고 나머지는 후보군으로 남기세요.",
  },
  정재: {
    term: "정재",
    hanja: "正財",
    plain: "안정성과 실속, 관리력이 강조되는 기운",
    strengths: ["지속성", "재무 관리", "신뢰"],
    cautions: ["보수성", "기회 회피", "느린 전환"],
    actionTip: "고정 지출·고정 루틴 점검에 집중하면 성과가 큽니다.",
  },
  편관: {
    term: "편관",
    hanja: "偏官",
    plain: "압박 속에서 결단과 책임이 커지는 기운",
    strengths: ["위기 대응", "리더십", "결단력"],
    cautions: ["긴장 누적", "강압적 태도", "피로 누적"],
    actionTip: "강하게 밀기 전, 목적·기준·마감 3가지를 먼저 공유하세요.",
  },
  정관: {
    term: "정관",
    hanja: "正官",
    plain: "질서·규범·평판을 중시하는 기운",
    strengths: ["신뢰 형성", "원칙 준수", "품질 유지"],
    cautions: ["융통성 부족", "과도한 완벽주의", "스트레스"],
    actionTip: "원칙은 유지하되 예외 조건을 미리 정해 유연성을 확보하세요.",
  },
  편인: {
    term: "편인",
    hanja: "偏印",
    plain: "직관·연구·비정형 사고가 강해지는 기운",
    strengths: ["통찰", "학습 속도", "독창성"],
    cautions: ["과몰입", "고립", "생각 과잉"],
    actionTip: "생각을 메모 3줄로 요약한 뒤 바로 작은 실행으로 전환하세요.",
  },
  정인: {
    term: "정인",
    hanja: "正印",
    plain: "보호·학습·회복력 중심의 안정 기운",
    strengths: ["기초 체력", "이해력", "멘토링"],
    cautions: ["행동 지연", "의존성", "우선순위 흐림"],
    actionTip: "자료 수집 30분 후 반드시 실행 30분을 붙여 진행하세요.",
  },
};

export function getTenGodGuide(term: string): TermGuide {
  return (
    TEN_GODS_GUIDE[term] ?? {
      term,
      plain: "전문 용어의 기준은 유지하되, 사용자 친화 해설을 계속 보강 중입니다.",
      strengths: ["핵심 의미 확인"],
      cautions: ["맥락 의존적 해석 필요"],
      actionTip: "기준 데이터(월주·일주·시간 정보)와 함께 해석하세요.",
    }
  );
}

export function getAllTenGodGuides(): TermGuide[] {
  return Object.values(TEN_GODS_GUIDE);
}

export function getTenGodSummary(term: string, locale: "ko" | "en" = "ko"): string {
  const guide = getTenGodGuide(term);
  if (locale === "en") {
    return TEN_GOD_SUMMARY_EN[guide.term] ?? "A balanced flow with both stability and transitions.";
  }
  return guide.plain;
}

export const TEN_GOD_GROUPS = {
  leadership: ["비견", "겁재", "편관"],
  empathy: ["식신", "정인", "편인"],
  logic: ["정재", "정관", "상관"],
} as const;

export const ELEMENT_ACTIONS: Record<string, string[]> = {
  목: ["새 프로젝트는 작은 MVP로 시작", "아침 시간대에 계획 수립", "관계 확장은 1건만 선택"],
  화: ["발표·소통 업무를 전면 배치", "감정 반응 전 3초 멈춤", "과열 일정은 저녁에 정리"],
  토: ["정리·관리·문서화에 집중", "루틴 점검표로 반복 작업 축소", "핵심 1개를 끝까지 완수"],
  금: ["의사결정 기준 3개를 먼저 고정", "불필요한 선택지 제거", "품질 검수는 체크리스트로 수행"],
  수: ["정보 수집 후 우선순위 1개 선정", "깊은 집중 블록 90분 확보", "회복 시간과 수면 우선 배치"],
};
