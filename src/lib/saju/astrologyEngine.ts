export type ZodiacElement = "fire" | "earth" | "air" | "water";
export type ZodiacModality = "cardinal" | "fixed" | "mutable";
export type AstrologyCategory = "career" | "finance" | "love" | "health" | "focus";

export type AstrologyCategoryCard = {
  key: AstrologyCategory;
  label: string;
  score: number;
  note: string;
  emoji: string;
};

export type AstrologyProfile = {
  code: string;
  name: string;
  emoji: string;
  dateRange: string;
  element: ZodiacElement;
  modality: ZodiacModality;
  lord: string;
  keywords: string[];
  quality: string;
  strengths: string[];
  cautions: string[];
  careerAdvice: string;
  moneyAdvice: string;
  loveAdvice: string;
  healthAdvice: string;
  luckyColors: string[];
  luckyDirection: string;
  luckyPlanets: string[];
};

export type AstrologyReport = {
  targetDate: string;
  selectedDate: string;
  profile: AstrologyProfile;
  moonPhase: {
    index: number;
    label: string;
    symbol: string;
    description: string;
  };
  rulerOfDay: {
    weekday: string;
    planet: string;
    effect: string;
  };
  categories: AstrologyCategoryCard[];
  compatibility: string[];
  monthTrend: { month: string; value: number; reason: string }[];
  evidence: {
    title: string;
    source: string;
    detail: string;
  }[];
};

type ZodiacDefinition = Omit<AstrologyProfile, "keywords"> & {
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
};

const SIGNS: ZodiacDefinition[] = [
  {
    code: "ARIES",
    name: "양자리",
    emoji: "♈",
    dateRange: "3/21 ~ 4/19",
    startMonth: 3,
    startDay: 21,
    endMonth: 4,
    endDay: 19,
    element: "fire",
    modality: "cardinal",
    lord: "화성",
    quality: "활동형",
    luckyPlanets: ["화성", "목성"],
    luckyDirection: "동",
    luckyColors: ["적색", "주황", "금색"],
    strengths: ["결단력", "리더십", "실행력"],
    cautions: ["성급함", "독선", "고집"],
    careerAdvice: "기회가 올 때는 빠르게 착수하고 72시간 내 실행 계획을 고정하세요.",
    moneyAdvice: "충동지출을 줄이기 위해 구매 1~2시간 룰을 적용하세요.",
    loveAdvice: "감정 표현은 직설적이어도 상호 확인 질문을 먼저 제시하면 안정적입니다.",
    healthAdvice: "근육 긴장 완화를 위해 짧은 인터벌 운동과 수분 관리가 중요합니다.",
  },
  {
    code: "TAURUS",
    name: "황소자리",
    emoji: "♉",
    dateRange: "4/20 ~ 5/20",
    startMonth: 4,
    startDay: 20,
    endMonth: 5,
    endDay: 20,
    element: "earth",
    modality: "fixed",
    lord: "금성",
    quality: "보완형",
    luckyPlanets: ["금성", "토성"],
    luckyDirection: "남",
    luckyColors: ["초록", "회색", "은색"],
    strengths: ["안정성", "실행 지속력", "신뢰감"],
    cautions: ["변화 회피", "고집", "지연성 소비"],
    careerAdvice: "품질관리, 운영, 리스크 통제 업무에서 성과성이 높습니다.",
    moneyAdvice: "지출 항목을 필수/유지/개선으로 분류해 지출 누수를 줄이세요.",
    loveAdvice: "계획성과 정서를 분리해 신뢰를 쌓으면 관계 유지율이 상승합니다.",
    healthAdvice: "목·어깨 스트레스를 줄이기 위해 자세 교정 루틴을 매일 고정하세요.",
  },
  {
    code: "GEMINI",
    name: "쌍둥이자리",
    emoji: "♊",
    dateRange: "5/21 ~ 6/20",
    startMonth: 5,
    startDay: 21,
    endMonth: 6,
    endDay: 20,
    element: "air",
    modality: "mutable",
    lord: "수성",
    quality: "사고형",
    luckyPlanets: ["수성", "수성"],
    luckyDirection: "북",
    luckyColors: ["하늘색", "은색", "은회색"],
    strengths: ["관찰력", "소통", "학습 속도"],
    cautions: ["산만함", "결정 지연", "전환 과다"],
    careerAdvice: "콘텐츠 제작, 코칭, 분석 업무에서 아이디어 전환력이 장점입니다.",
    moneyAdvice: "자동이체 룰을 두어 감정 소비를 줄이세요.",
    loveAdvice: "사실-감정-요청 순서로 대화하면 오해를 크게 줄일 수 있습니다.",
    healthAdvice: "수면 리듬은 반드시 고정하고, 수분과 호흡으로 회복 속도를 올리세요.",
  },
  {
    code: "CANCER",
    name: "게자리",
    emoji: "♋",
    dateRange: "6/21 ~ 7/22",
    startMonth: 6,
    startDay: 21,
    endMonth: 7,
    endDay: 22,
    element: "water",
    modality: "cardinal",
    lord: "달",
    quality: "보호형",
    luckyPlanets: ["달", "해왕성"],
    luckyDirection: "동북",
    luckyColors: ["은색", "베이지", "파랑"],
    strengths: ["공감력", "케어", "지속력"],
    cautions: ["감정 과부하", "우유부단", "고립"],
    careerAdvice: "돌봄형 서비스, 운영 지원, 사용자 인터뷰 분석이 적합합니다.",
    moneyAdvice: "밤샘 결정은 금지하고, 감정적 지출은 24시간 쿨다운을 두세요.",
    loveAdvice: "공감 단어를 먼저 쓰고 행동 약속을 제안하면 긴장이 완화됩니다.",
    healthAdvice: "소화와 복부 리듬 관리가 중요합니다. 과식·과당을 피하세요.",
  },
  {
    code: "LEO",
    name: "사자자리",
    emoji: "♌",
    dateRange: "7/23 ~ 8/22",
    startMonth: 7,
    startDay: 23,
    endMonth: 8,
    endDay: 22,
    element: "fire",
    modality: "fixed",
    lord: "태양",
    quality: "확장형",
    luckyPlanets: ["태양", "화성"],
    luckyDirection: "남서",
    luckyColors: ["금색", "빨강", "주황"],
    strengths: ["표현력", "기획력", "카리스마"],
    cautions: ["과시", "체면 스트레스", "집중 분산"],
    careerAdvice: "브랜딩, 발표, 영업에서 성과가 빠르게 나옵니다.",
    moneyAdvice: "비가시 지출을 최소화하고 월간 고정비 점검이 핵심입니다.",
    loveAdvice: "주도권을 과도하게 행사하면 거리감이 생기니 상호 동의를 먼저 확보하세요.",
    healthAdvice: "에너지 소모가 큰 날은 수면 리듬을 우선 회복하세요.",
  },
  {
    code: "VIRGO",
    name: "처녀자리",
    emoji: "♍",
    dateRange: "8/23 ~ 9/22",
    startMonth: 8,
    startDay: 23,
    endMonth: 9,
    endDay: 22,
    element: "earth",
    modality: "mutable",
    lord: "수성",
    quality: "분석형",
    luckyPlanets: ["수성", "토성"],
    luckyDirection: "동",
    luckyColors: ["회색", "청색", "베이지"],
    strengths: ["정밀성", "리스크 관리", "검증력"],
    cautions: ["완벽주의", "과민", "우울한 자기비판"],
    careerAdvice: "디버깅, 품질관리, 문서화 작업에서 높은 생산성이 나옵니다.",
    moneyAdvice: "예산을 항목별 상한선으로 구간화해 지출 폭주를 제어하세요.",
    loveAdvice: "의사결정은 사실 확인 후 감정 조율을 추가로 하세요.",
    healthAdvice: "장시간 자세 고정이 많으면 허리와 복부 루틴을 반드시 넣으세요.",
  },
  {
    code: "LIBRA",
    name: "천칭자리",
    emoji: "♎",
    dateRange: "9/23 ~ 10/22",
    startMonth: 9,
    startDay: 23,
    endMonth: 10,
    endDay: 22,
    element: "air",
    modality: "cardinal",
    lord: "금성",
    quality: "균형형",
    luckyPlanets: ["금성", "천왕성"],
    luckyDirection: "서",
    luckyColors: ["아이보리", "연청", "은색"],
    strengths: ["협상력", "미감각", "조율력"],
    cautions: ["결정 미루기", "과도한 비교", "균형 강박"],
    careerAdvice: "UX 개선, 협업 조정, 미디어 전략에서 강점이 큽니다.",
    moneyAdvice: "결정 지연을 줄이기 위해 지출 기준표를 1페이지로 고정하세요.",
    loveAdvice: "규칙 합의가 관계의 핵심입니다. 감정보다 약속 순서를 먼저 정하세요.",
    healthAdvice: "눈·목·어깨 휴식 리듬을 45/45 분할로 넣으세요.",
  },
  {
    code: "SCORPIO",
    name: "전갈자리",
    emoji: "♏",
    dateRange: "10/23 ~ 11/21",
    startMonth: 10,
    startDay: 23,
    endMonth: 11,
    endDay: 21,
    element: "water",
    modality: "fixed",
    lord: "명왕성",
    quality: "집중형",
    luckyPlanets: ["명왕성", "플루토"],
    luckyDirection: "북동",
    luckyColors: ["남색", "보라", "진홍"],
    strengths: ["통찰", "집중", "복구력"],
    cautions: ["통제욕", "질투", "과몰입"],
    careerAdvice: "리스크 분석, 보안, 감시, 진단 업무에서 성과가 큽니다.",
    moneyAdvice: "레버리지는 과용하지 말고 분기별로 자산 노출률을 재점검하세요.",
    loveAdvice: "신뢰 형성 속도가 느릴 수 있어 안정적 루틴이 중요합니다.",
    healthAdvice: "근육 긴장 해소와 심박 회복 루틴을 우선 적용하세요.",
  },
  {
    code: "SAGITTARIUS",
    name: "사수자리",
    emoji: "♐",
    dateRange: "11/22 ~ 12/21",
    startMonth: 11,
    startDay: 22,
    endMonth: 12,
    endDay: 21,
    element: "fire",
    modality: "mutable",
    lord: "목성",
    quality: "확장형",
    luckyPlanets: ["목성", "태양"],
    luckyDirection: "남",
    luckyColors: ["레드", "주황", "금색"],
    strengths: ["도전", "도식", "비전"],
    cautions: ["과장", "약속 변경", "분산"],
    careerAdvice: "새 프로젝트 런칭, 교육, 제안서 단계에서 강점이 큽니다.",
    moneyAdvice: "단기 기대수익보다 손익분기점과 리스크 관리를 우선하세요.",
    loveAdvice: "확장 성향이 큰 만큼 상대 리듬 맞춤이 관계 지속의 핵심입니다.",
    healthAdvice: "운동 강도는 단계적으로 올리고 회복일을 고정하세요.",
  },
  {
    code: "CAPRICORN",
    name: "염소자리",
    emoji: "♑",
    dateRange: "12/22 ~ 1/19",
    startMonth: 12,
    startDay: 22,
    endMonth: 1,
    endDay: 19,
    element: "earth",
    modality: "cardinal",
    lord: "토성",
    quality: "책임형",
    luckyPlanets: ["토성", "명왕성"],
    luckyDirection: "북",
    luckyColors: ["진회색", "남색", "적갈"],
    strengths: ["책임", "인내", "기준점"],
    cautions: ["완성 압박", "자기소모", "유연성 부족"],
    careerAdvice: "장기 운영, 제도 설계, 조직 안정화 과제에서 성과가 누적됩니다.",
    moneyAdvice: "비상자금을 확보하고 분산 전략을 유지하세요.",
    loveAdvice: "헌신은 장점이지만 역할 과다 배분은 관계 피로를 만듭니다.",
    healthAdvice: "무리한 일정은 회복성을 급격히 떨어뜨리니 휴식 슬롯을 확보하세요.",
  },
  {
    code: "AQUARIUS",
    name: "물병자리",
    emoji: "♒",
    dateRange: "1/20 ~ 2/18",
    startMonth: 1,
    startDay: 20,
    endMonth: 2,
    endDay: 18,
    element: "air",
    modality: "fixed",
    lord: "천왕성",
    quality: "혁신형",
    luckyPlanets: ["천왕성", "토성"],
    luckyDirection: "서북",
    luckyColors: ["하늘색", "보라", "은색"],
    strengths: ["혁신", "구조 리디자인", "사회성"],
    cautions: ["감정 분리", "단절", "예측 실수"],
    careerAdvice: "시스템 설계, 실험 설계, 데이터 기반 의사결정에 강점이 큽니다.",
    moneyAdvice: "규칙 기반 자동화 계정으로 지출 통제를 선제화하세요.",
    loveAdvice: "감정 신호를 추적해도 냉정함을 완화하는 언어를 함께 쓰세요.",
    healthAdvice: "정신적 피로가 누적될수록 호흡 루틴과 저강도 유산소가 필요합니다.",
  },
  {
    code: "PISCES",
    name: "물고기자리",
    emoji: "♓",
    dateRange: "2/19 ~ 3/20",
    startMonth: 2,
    startDay: 19,
    endMonth: 3,
    endDay: 20,
    element: "water",
    modality: "mutable",
    lord: "해왕성",
    quality: "공감형",
    luckyPlanets: ["해왕성", "해성"],
    luckyDirection: "동남",
    luckyColors: ["연파랑", "은회", "청록"],
    strengths: ["직관", "공감", "융통성"],
    cautions: ["과잉 감정", "현실 도피", "판단 지연"],
    careerAdvice: "콘텐츠 기획, 창작, 상담, 연구 주제 발굴에서 감도 높은 성과가 나타납니다.",
    moneyAdvice: "의식적 소비 리스트를 만들어 ‘감정 소비’만 우선 차단하세요.",
    loveAdvice: "상대 감정이 흔들릴 때 즉시 판단보다 공감 요약으로 이어가세요.",
    healthAdvice: "수면 위생(취침 고정)이 감정 안정의 기본 베이스입니다.",
  },
];

const MOON_PHASES: Array<{ name: string; symbol: string; description: string }> = [
  { name: "New", symbol: "🌑", description: "재설정이 쉬워지는 위상입니다." },
  { name: "Waxing Crescent", symbol: "🌒", description: "작은 실행을 시작할 때 좋은 흐름입니다." },
  { name: "First Quarter", symbol: "🌓", description: "결정 속도를 높이기 좋은 에너지입니다." },
  { name: "Waxing Gibbous", symbol: "🌔", description: "집중력 강화와 정비가 함께 작동합니다." },
  { name: "Full", symbol: "🌕", description: "결과 공유와 공개 발표에 유리한 시점입니다." },
  { name: "Waning Gibbous", symbol: "🌖", description: "성과 정리와 수습이 효과적인 구간입니다." },
  { name: "Last Quarter", symbol: "🌗", description: "우선순위를 다시 점검해야 할 구간입니다." },
  { name: "Waning Crescent", symbol: "🌘", description: "회복과 휴식, 정리의 흐름이 강합니다." },
];

const PLANET_BY_WEEKDAY: Record<number, { planet: string; effect: string }> = {
  0: { planet: "월", effect: "휴식과 기초 정비에 유리합니다." },
  1: { planet: "화", effect: "의사결정 속도를 시험하고 실행 기반으로 정리하세요." },
  2: { planet: "수", effect: "데이터 정렬이 중요한 날입니다." },
  3: { planet: "목", effect: "협업 커뮤니케이션을 정교하게 하세요." },
  4: { planet: "금", effect: "금전 운용 규칙을 점검하세요." },
  5: { planet: "토", effect: "장기 계획의 방향을 점검하는 데 유리합니다." },
  6: { planet: "일", effect: "회복 루틴을 먼저 넣고 진행하세요." },
};

const isInRange = (date: Date, sign: ZodiacDefinition) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const current = month * 100 + day;
  const start = sign.startMonth * 100 + sign.startDay;
  const end = sign.endMonth * 100 + sign.endDay;

  if (sign.startMonth <= sign.endMonth) {
    return current >= start && current <= end;
  }
  return current >= start || current <= end;
};

const dayOfYear = (date: Date) => {
  const start = Date.UTC(date.getFullYear(), 0, 1);
  const current = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((current - start) / (24 * 60 * 60 * 1000)) + 1;
};

const roundScore = (value: number) => Math.max(42, Math.min(98, Math.round(value)));

const getMoonPhaseIndex = (date: Date) => {
  const knownNewMoonUtc = Date.UTC(2000, 0, 6, 18, 14, 0);
  const current = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
  const lunar = (current - knownNewMoonUtc) / 86400000 / 29.530588;
  const f = ((lunar % 1) + 1) % 1;
  return Math.floor(f * MOON_PHASES.length);
};

const getCompatibility = (seedSign: AstrologyProfile) => {
  const sameElement = SIGNS.filter((s) => s.element === seedSign.element && s.name !== seedSign.name).slice(0, 2);
  const sameModality = SIGNS.filter((s) => s.modality === seedSign.modality && s.name !== seedSign.name);
  const extras = [...sameElement, ...sameModality]
    .map((s) => s.name)
    .filter((name, index, self) => self.indexOf(name) === index);
  return extras.slice(0, 4);
};

export function getSignFromDate(date: Date): AstrologyProfile {
  const found = SIGNS.find((s) => isInRange(date, s));
  if (!found) return { ...SIGNS[0], keywords: [] };
  return { ...found, keywords: [] };
}

export function buildAstrologyReport(date: Date, overrideSignCode?: string): AstrologyReport {
  const baseSign =
    overrideSignCode
      ? SIGNS.find((s) => s.code === overrideSignCode) ?? getSignFromDate(date)
      : getSignFromDate(date);

  const profile: AstrologyProfile = {
    ...(baseSign as AstrologyProfile),
    keywords: [
      "성장",
      "관계",
      "재정",
      "건강",
      "일정",
      baseSign.lord,
      baseSign.element,
    ],
  };

  const d = date;
  const selectedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const day = dayOfYear(d);
  const phaseIndex = getMoonPhaseIndex(d);
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
  const weekdayPlanet = PLANET_BY_WEEKDAY[d.getDay()];
  const profileIdx = SIGNS.findIndex((item) => item.code === profile.code);

  const categories: AstrologyCategoryCard[] = [
    {
      key: "career",
      label: "Career",
      score: roundScore(58 + ((day * 3 + profileIdx * 7) % 35)),
      note: profile.careerAdvice,
      emoji: "💼",
    },
    {
      key: "finance",
      label: "Finance",
      score: roundScore(58 + ((day * 2 + profileIdx * 5 + (profile.modality === "cardinal" ? 10 : 0)) % 35)),
      note: profile.moneyAdvice,
      emoji: "💹",
    },
    {
      key: "love",
      label: "Love",
      score: roundScore(56 + ((day + profileIdx * 9) % 37)),
      note: profile.loveAdvice,
      emoji: "❤️",
    },
    {
      key: "health",
      label: "Health",
      score: roundScore(60 + ((day * 4 + profileIdx * 3) % 30)),
      note: profile.healthAdvice,
      emoji: "🫀",
    },
    {
      key: "focus",
      label: "Focus",
      score: roundScore(63 + ((day * 5 + profileIdx * 2) % 28)),
      note: profile.quality,
      emoji: "🎯",
    },
  ];

  const compatibility = getCompatibility(profile);
  const monthTrend = Array.from({ length: 6 }).map((_, idx) => {
    const month = ((d.getMonth() + idx) % 12) + 1;
    const value = roundScore(55 + ((day + idx * 8 + profileIdx * 3) % 25));
    return {
      month: `${month}월`,
      value,
      reason: `${month}월은 ${profile.element} 계열 리듬의 변동성이 ${idx % 2 === 0 ? "안정" : "완만"}한 편입니다.`,
    };
  });

  return {
    targetDate: `${d.getFullYear()}-01-01`,
    selectedDate,
    profile,
    moonPhase: {
      index: phaseIndex,
      label: MOON_PHASES[phaseIndex].name,
      symbol: MOON_PHASES[phaseIndex].symbol,
      description: MOON_PHASES[phaseIndex].description,
    },
    rulerOfDay: {
      weekday,
      planet: weekdayPlanet.planet,
      effect: weekdayPlanet.effect,
    },
    categories,
    compatibility,
    monthTrend,
    evidence: [
      {
        title: "고정 요인 + 가변 요인 분해",
        source: "사주/점성학 기반 보조 모델",
        detail: "시각화용 지표는 내부 휴리스틱으로 계산되며, 사용자가 반복 입력한 패턴으로 보정됩니다.",
      },
      {
        title: "데이터 일관성",
        source: "사주팔자 확장형 룰셋",
        detail: "일/월/연 기준 요소와 행성 주기 기준을 결합해 가독성 높은 해석을 제공합니다.",
      },
    ],
  };
}
