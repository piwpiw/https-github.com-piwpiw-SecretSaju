import { getPersona, Tendency } from '@/lib/persona-matrix';

export interface AIRoutingRequest {
    userName: string;
    ageGroup: string;
    tendency: Tendency;
    rawSajuData?: unknown;
    queryType: "daily" | "result" | "compatibility" | "chat";
}

export interface AIRoutingResponse {
    model: string;
    systemPrompt: string;
    userPrompt: string;
    isEnsemble: boolean;
}

export function routeAIPersona(req: AIRoutingRequest): AIRoutingResponse {
    const persona = getPersona(req.ageGroup, req.tendency);

    // Logic for augmenting the user prompt with specific context
    const userPrompt = `
        사용자 이름: ${req.userName}
        연령대: ${req.ageGroup}
        사주 분석 데이터: ${req.rawSajuData ? JSON.stringify(req.rawSajuData).substring(0, 500) + '...' : '정보 없음'}
        요청 종류: ${req.queryType}

        위 정보를 바탕으로 유저의 운명을 분석하고, 지정된 페르소나의 어조로 깊이 있는 통찰을 제공하세요.
    `;

    return {
        model: persona.recommendedModel,
        systemPrompt: persona.systemPrompt,
        userPrompt,
        isEnsemble: persona.recommendedModel === "GEMINI-1.5" // Example: Gemini handles ensemble-heavy mining
    };
}
