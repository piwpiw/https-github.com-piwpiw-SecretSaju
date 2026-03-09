import { getPersona, Tendency } from "@/lib/reader/persona-matrix";
import {
  getFortuneReaderById,
  getRecommendedReader,
  type FortuneReaderProfile,
  type ReaderQueryType,
} from "@/lib/reader/fortune-readers";

export interface AIRoutingRequest {
  userName: string;
  ageGroup: string;
  tendency: Tendency;
  rawSajuData?: unknown;
  queryType: ReaderQueryType;
  readerId?: string;
  categoryFocus?: string;
}

export interface AIRoutingResponse {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  isEnsemble: boolean;
  reader: FortuneReaderProfile;
}

function focusLabel(categoryFocus?: string) {
  if (categoryFocus === "love") return "연애/관계";
  if (categoryFocus === "money") return "재물/현금흐름";
  if (categoryFocus === "career") return "직업/커리어";
  return "전체 흐름";
}

export function routeAIPersona(req: AIRoutingRequest): AIRoutingResponse {
  const legacyPersona = getPersona(req.ageGroup, req.tendency);
  const reader = req.readerId
    ? getFortuneReaderById(req.readerId)
    : getRecommendedReader(req.queryType, req.categoryFocus, req.tendency);

  const systemPrompt = [
    legacyPersona.systemPrompt,
    `당신은 SecretSaju의 "${reader.name}" 캐릭터입니다.`,
    `역할 설명: ${reader.description}`,
    `전문 분야: ${reader.specialties.join(", ")}`,
    `말투 규칙: 따뜻함 ${reader.warmth}/100, 직설성 ${reader.directness}/100, 전문용어 밀도 ${reader.jargonDensity}/100.`,
    `출력 규칙: 같은 근거로 쉬운 설명과 전문 해설을 함께 제공해야 하며, 두 설명의 결론은 달라지면 안 됩니다.`,
    `쉬운 설명은 초보자도 이해할 수 있어야 하고, 전문 해설은 명리 용어를 유지해도 됩니다.`,
    `행동 제안은 1~3개로 짧고 실전적으로 제시하세요.`,
    `공포 조장, 단정적 파국 예언, 검증되지 않은 권위 표현은 금지합니다.`,
  ].join("\n");

  const userPrompt = [
    `사용자 이름: ${req.userName}`,
    `연령대: ${req.ageGroup}`,
    `질문 유형: ${req.queryType}`,
    `집중 카테고리: ${focusLabel(req.categoryFocus)}`,
    `선택 리더: ${reader.name}`,
    `사주 분석 데이터: ${req.rawSajuData ? JSON.stringify(req.rawSajuData).slice(0, 900) : "정보 없음"}`,
    `이 데이터를 바탕으로 같은 결론을 유지하는 easy, expert, action, hook, disclaimer 5개 블록을 작성하세요.`,
  ].join("\n");

  return {
    model: reader.recommendedModel || legacyPersona.recommendedModel,
    systemPrompt,
    userPrompt,
    isEnsemble: reader.recommendedModel === "GEMINI-1.5",
    reader,
  };
}
