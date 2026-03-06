import animalsData from "@/data/animals.json";

export type AgeGroup = "10s" | "20s" | "30s";

export type AnimalArchetype = {
  code: string;
  animal_name: string;
  base_traits: { mask: string; hashtags: string[] };
  age_context: Record<AgeGroup, { hook: string; secret_preview: string }>;
};

const DEFAULT_STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
const DEFAULT_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

const FALLBACK_NAMES = Array.from({ length: 60 }, (_, index) => `${DEFAULT_STEMS[index % 10]}${DEFAULT_BRANCHES[index % 12]}형`);

const FALLBACK_LABEL = {
  mask: "사주 기반 기본 성향 해석을 제공합니다.",
  hook: "주요 성향을 요약해 핵심 방향성을 먼저 제시합니다.",
  secret_preview: "프리미엄 해석은 결제 후 잠금이 해제됩니다.",
  hashtags: ["#사주기본", "#요약해석"],
};

type AnimalsData = { archetypes: AnimalArchetype[] };
const RAW_ARCHETYPES = (animalsData as AnimalsData).archetypes ?? [];
const ARCHETYPES = Array.isArray(RAW_ARCHETYPES) ? RAW_ARCHETYPES : [];
const BY_CODE = new Map<string, AnimalArchetype>(ARCHETYPES.map((a) => [a.code, a]));

function getFallbackArchetype(code: string, index: number): AnimalArchetype {
  const name = FALLBACK_NAMES[index % FALLBACK_NAMES.length] || FALLBACK_NAMES[0];
  return {
    code,
    animal_name: `${name}`,
    base_traits: {
      mask: FALLBACK_LABEL.mask,
      hashtags: FALLBACK_LABEL.hashtags,
    },
    age_context: {
      "10s": { hook: FALLBACK_LABEL.hook, secret_preview: FALLBACK_LABEL.secret_preview },
      "20s": { hook: FALLBACK_LABEL.hook, secret_preview: FALLBACK_LABEL.secret_preview },
      "30s": { hook: FALLBACK_LABEL.hook, secret_preview: FALLBACK_LABEL.secret_preview },
    },
  };
}

function normalizeCode(code: string | undefined): string {
  return typeof code === "string" && code.trim() ? code.trim() : "GAP_JA";
}

function normalizeAgeGroup(ageGroup: AgeGroup | undefined): AgeGroup {
  if (ageGroup === "10s" || ageGroup === "30s" || ageGroup === "20s") return ageGroup;
  return "20s";
}

/**
 * Keep 60-step fallback mapping aligned with saju pillar indexes when code is missing.
 */
const PILLAR_CODES = [
  "GAP_JA", "EUL_CHUK", "BYEONG_IN", "JEONG_MYO", "MU_JIN", "GI_SA", "GYEONG_O", "SIN_MI", "IM_SIN", "GYE_YU",
  "GAP_SUL", "EUL_HAE", "BYEONG_JA", "JEONG_CHUK", "MU_IN", "GI_MYO", "GYEONG_JIN", "SIN_SA", "IM_O", "GYE_MI",
  "GAP_SIN", "EUL_YU", "BYEONG_SUL", "JEONG_HAE", "MU_JA", "GI_CHUK", "GYEONG_IN", "SIN_MYO", "IM_JIN", "GYE_SA",
  "GAP_O", "EUL_MI", "BYEONG_SIN", "JEONG_YU", "MU_SUL", "GI_HAE", "GYEONG_JA", "SIN_CHUK", "IM_IN", "GYE_MYO",
  "GAP_JIN", "EUL_SA", "BYEONG_O", "JEONG_MI", "MU_SIN", "GI_YU", "GYEONG_SUL", "SIN_HAE", "IM_JA", "GYE_CHUK",
  "GAP_IN", "EUL_MYO", "BYEONG_JIN", "JEONG_SA", "MU_O", "GI_MI", "GYEONG_SIN", "SIN_YU", "IM_SUL", "GYE_HAE",
];

function getCodeFallbackIndex(code: string): number {
  const idx = PILLAR_CODES.indexOf(code);
  return idx >= 0 ? idx : 0;
}

export function getArchetypeByCode(
  code: string,
  ageGroup: AgeGroup
): AnimalArchetype & { displayHook: string; displaySecretPreview: string } {
  const safeCode = normalizeCode(code);
  const safeAgeGroup = normalizeAgeGroup(ageGroup);
  const archetype = BY_CODE.get(safeCode) ?? getFallbackArchetype(safeCode, getCodeFallbackIndex(safeCode));
  const ctx = archetype.age_context?.[safeAgeGroup];

  return {
    ...archetype,
    displayHook:
      typeof ctx?.hook === "string" && ctx.hook.trim()
        ? ctx.hook
        : FALLBACK_LABEL.hook,
    displaySecretPreview:
      typeof ctx?.secret_preview === "string" && ctx.secret_preview.trim()
        ? ctx.secret_preview
        : FALLBACK_LABEL.secret_preview,
  };
}

export { PILLAR_CODES };
