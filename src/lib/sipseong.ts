import { WuxingElement, WUXING_INFO, getWuxingFromPillarCode } from "./wuxing";

export type Sipseong =
  | "BI_JIAN" // 비견
  | "XIE_CAI" // 겁재
  | "SHI_SHEN" // 식신
  | "SHANG_GUAN" // 상관
  | "ZHI_GUAN" // 정관
  | "PIAN_GUAN" // 편관
  | "ZHI_REN" // 정인
  | "PIAN_REN" // 편인
  | "ZHI_CAI" // 정재
  | "PIAN_CAI"; // 편재

export interface SipseongInfo {
  name: Sipseong;
  hanja: string;
  category: "Output" | "Resource" | "Power" | "Authority" | "Wealth";
  yinyangMatch: "yang" | "yin";
  trait: string;
  positive: string[];
  negative: string[];
  emoji: string;
}

export const SIPSEONG_DEFINITIONS: Record<Sipseong, SipseongInfo> = {
  BI_JIAN: {
    name: "BI_JIAN",
    hanja: "比肩",
    category: "Resource",
    yinyangMatch: "yang",
    trait: "Same element and same polarity support; stable and competitive.",
    positive: ["Fairness", "confidence", "self-confidence"],
    negative: ["Over-competitiveness", "pride", "rigidity"],
    emoji: "🤝",
  },
  XIE_CAI: {
    name: "XIE_CAI",
    hanja: "劫财",
    category: "Resource",
    yinyangMatch: "yin",
    trait: "Same element but opposite polarity; aggressive resource exchange.",
    positive: ["Speed", "initiative", "risk-taking"],
    negative: ["Conflict", "loss", "instability"],
    emoji: "💥",
  },
  SHI_SHEN: {
    name: "SHI_SHEN",
    hanja: "食神",
    category: "Output",
    yinyangMatch: "yang",
    trait: "Smooth output energy and generosity when harmonized.",
    positive: ["Expression", "creativity", "good timing"],
    negative: ["Overindulgence", "carelessness", "inconsistency"],
    emoji: "🔥",
  },
  SHANG_GUAN: {
    name: "SHANG_GUAN",
    hanja: "傷官",
    category: "Output",
    yinyangMatch: "yin",
    trait: "Strong expression and disruptive output; can challenge hierarchy.",
    positive: ["Innovation", "boldness", "clarity"],
    negative: ["Rebellion", "arrogance", "burnout"],
    emoji: "⚡",
  },
  ZHI_GUAN: {
    name: "ZHI_GUAN",
    hanja: "正官",
    category: "Authority",
    yinyangMatch: "yang",
    trait: "Authority in balance and long-term reliability.",
    positive: ["Discipline", "leadership", "focus"],
    negative: ["Suppression", "pressure", "rigidity"],
    emoji: "👑",
  },
  PIAN_GUAN: {
    name: "PIAN_GUAN",
    hanja: "偏官",
    category: "Authority",
    yinyangMatch: "yin",
    trait: "Intensity and direct influence; quick execution under pressure.",
    positive: ["Decisiveness", "challenge handling", "courage"],
    negative: ["Impulsiveness", "harshness", "conflict"],
    emoji: "⚔️",
  },
  ZHI_REN: {
    name: "ZHI_REN",
    hanja: "正印",
    category: "Power",
    yinyangMatch: "yang",
    trait: "Nurturing support and structural protection.",
    positive: ["Care", "loyalty", "consistency"],
    negative: ["Overprotection", "dependence", "over-caution"],
    emoji: "🛡️",
  },
  PIAN_REN: {
    name: "PIAN_REN",
    hanja: "偏印",
    category: "Power",
    yinyangMatch: "yin",
    trait: "Sensitive support with hidden intuition; can be fragile.",
    positive: ["Insight", "adaptability", "subtle observation"],
    negative: ["Confusion", "flickering attention", "withdrawal"],
    emoji: "🌙",
  },
  ZHI_CAI: {
    name: "ZHI_CAI",
    hanja: "正财",
    category: "Wealth",
    yinyangMatch: "yang",
    trait: "Stable resource accumulation and practical benefit.",
    positive: ["Planning", "prudence", "trust"],
    negative: ["Conservation bias", "stagnation", "missed timing"],
    emoji: "💰",
  },
  PIAN_CAI: {
    name: "PIAN_CAI",
    hanja: "偏财",
    category: "Wealth",
    yinyangMatch: "yin",
    trait: "Opportunistic and fast resource gain, quick but unstable.",
    positive: ["Adaptability", "initiative", "market sense"],
    negative: ["Risky spending", "unpredictability", "impulse"],
    emoji: "💎",
  },
};

const WUXING_ORDER = Object.keys(WUXING_INFO) as WuxingElement[];

export function calculateSipseong(
  myElement: WuxingElement,
  targetElement: WuxingElement,
  myYinyang: "yang" | "yin",
  targetYinyang: "yang" | "yin"
): Sipseong {
  if (myElement === targetElement) {
    return myYinyang === targetYinyang ? "BI_JIAN" : "XIE_CAI";
  }

  const myIndex = WUXING_ORDER.indexOf(myElement);
  const targetIndex = WUXING_ORDER.indexOf(targetElement);

  if (myIndex === -1 || targetIndex === -1) return "BI_JIAN";

  const nextIndex = (myIndex + 1) % 5; // generating (sheng)
  if (targetIndex === nextIndex) {
    return myYinyang === targetYinyang ? "SHI_SHEN" : "SHANG_GUAN";
  }

  const keIndex = (myIndex + 2) % 5; // restraining (ke)
  if (targetIndex === keIndex) {
    return myYinyang === targetYinyang ? "PIAN_CAI" : "ZHI_CAI";
  }

  const prevIndex = (myIndex + 3) % 5;
  if (targetIndex === prevIndex) {
    return myYinyang === targetYinyang ? "PIAN_GUAN" : "ZHI_GUAN";
  }

  const parentIndex = (myIndex + 4) % 5;
  if (targetIndex === parentIndex) {
    return myYinyang === targetYinyang ? "PIAN_REN" : "ZHI_REN";
  }

  return "BI_JIAN";
}

export function getSipseongRelation(myPillarCode: string, targetPillarCode: string): {
  sipseong: Sipseong;
  info: SipseongInfo;
  reversed: Sipseong;
} {
  const myWuxing = getWuxingFromPillarCode(myPillarCode);
  const targetWuxing = getWuxingFromPillarCode(targetPillarCode);

  const myYinyang: "yang" | "yin" = getYinyang(myPillarCode);
  const targetYinyang: "yang" | "yin" = getYinyang(targetPillarCode);

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

function getYinyang(pillarCode: string): "yang" | "yin" {
  const yangChars = ["GAP", "BYEONG", "MU", "GYEONG", "IM"];
  const firstPart = pillarCode.split("_")[0];
  return yangChars.includes(firstPart) ? "yang" : "yin";
}

export function getSipseongContext(
  sipseong: Sipseong,
  context: "career" | "relationship" | "health"
): { sipseong: Sipseong; score: number; dynamic: string; advice: string } {
  const contextMap: Record<
    Sipseong,
    Record<"career" | "relationship" | "health", { score: number; dynamic: string; advice: string }>
  > = {
    BI_JIAN: {
      career: { score: 70, dynamic: "Balanced peer interaction with potential rivalry.", advice: "Keep communication transparent in teamwork." },
      relationship: { score: 60, dynamic: "Mutual understanding with friction when boundaries are unclear.", advice: "Set clear roles and avoid over-competition." },
      health: { score: 75, dynamic: "Generally stable energy with occasional friction.", advice: "Maintain regular rest cycles." },
    },
    XIE_CAI: {
      career: { score: 50, dynamic: "High-intensity support with conflict risk.", advice: "Use conflict-prevention checkpoints." },
      relationship: { score: 40, dynamic: "Attachment can become possessive quickly.", advice: "Reduce expectation pressure." },
      health: { score: 55, dynamic: "Stress spikes may appear under pressure.", advice: "Prioritize hydration and sleep." },
    },
    SHI_SHEN: {
      career: { score: 80, dynamic: "Good execution and gentle influence.", advice: "Use this phase for service-oriented goals." },
      relationship: { score: 72, dynamic: "Caring communication style is a strength.", advice: "Avoid over-giving without boundaries." },
      health: { score: 78, dynamic: "Easy-to-maintain rhythm possible.", advice: "Light exercise and hydration are beneficial." },
    },
    SHANG_GUAN: {
      career: { score: 66, dynamic: "Creative spark with strict expression.", advice: "Separate ideas from ego in meetings." },
      relationship: { score: 62, dynamic: "Can become blunt and critical.", advice: "Practice paced feedback." },
      health: { score: 68, dynamic: "Inflammatory stress can rise quickly.", advice: "Track stress and reduce overload." },
    },
    ZHI_GUAN: {
      career: { score: 84, dynamic: "Reliable structure and predictable progress.", advice: "Lead with defined process and fairness." },
      relationship: { score: 82, dynamic: "Good governance in long-term commitments.", advice: "Balance leadership with listening." },
      health: { score: 80, dynamic: "Stable regulation with manageable tension.", advice: "Keep routines consistent." },
    },
    PIAN_GUAN: {
      career: { score: 76, dynamic: "Strong execution pressure with conflict risk.", advice: "Use escalation gates and deadlines." },
      relationship: { score: 68, dynamic: "Possibility of forceful interactions.", advice: "Pause before reacting." },
      health: { score: 70, dynamic: "Overuse of stress can drain energy.", advice: "Set daily wind-down habits." },
    },
    ZHI_REN: {
      career: { score: 88, dynamic: "Protective and stable support.", advice: "Use mentorship and backup plans." },
      relationship: { score: 84, dynamic: "Nurturing behavior helps deepen trust.", advice: "Support without over-attachment." },
      health: { score: 86, dynamic: "High emotional support buffer.", advice: "Sustain with sleep and routine nutrition." },
    },
    PIAN_REN: {
      career: { score: 64, dynamic: "Flexible approach with hidden uncertainty.", advice: "Verify assumptions before action." },
      relationship: { score: 58, dynamic: "Subtle signals may be misunderstood.", advice: "Use explicit communication." },
      health: { score: 62, dynamic: "Sensitivity can drain energy quickly.", advice: "Reduce stimulation and monitor fatigue." },
    },
    ZHI_CAI: {
      career: { score: 78, dynamic: "Good for stable retention and scaling.", advice: "Prioritize sustainable cash-flow moves." },
      relationship: { score: 74, dynamic: "Reliability over intensity in long terms.", advice: "Build transparent sharing norms." },
      health: { score: 76, dynamic: "Stable resource energy with steady pace.", advice: "Keep spending and rest cycle balanced." },
    },
    PIAN_CAI: {
      career: { score: 69, dynamic: "Fast gain opportunities with volatility.", advice: "Cap risk and avoid single-point dependency." },
      relationship: { score: 60, dynamic: "Emotional fluctuation may appear.", advice: "Keep contingency plans in communication." },
      health: { score: 63, dynamic: "Short-term overload episodes are possible.", advice: "Introduce recovery breaks every cycle." },
    },
  };

  return {
    sipseong,
    ...contextMap[sipseong][context],
  };
}
