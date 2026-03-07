import { NextResponse } from "next/server";
import { routeAIPersona } from "@/core/ai-routing";
import { isMockMode } from "@/lib/use-mock";

type DualNarrative = {
  easy: string;
  expert: string;
  action: string;
  hook: string;
  disclaimer: string;
};

async function callLLM(model: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const isMock = isMockMode();

  if ((model === "GPT-4O" || model.startsWith("GPT")) && process.env.OPENAI_API_KEY && !isMock) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.7,
        max_tokens: 1000,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.choices?.[0]?.message?.content ?? "";
    }
  }

  if ((model === "CLAUDE-3.5" || model.startsWith("CLAUDE")) && process.env.ANTHROPIC_API_KEY && !isMock) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.content?.[0]?.text ?? "";
    }
  }

  if ((model === "GEMINI-1.5" || model.startsWith("GEMINI")) && process.env.GOOGLE_AI_KEY && !isMock) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_AI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
          generationConfig: { maxOutputTokens: 1000, temperature: 0.7 },
        }),
      },
    );
    if (res.ok) {
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    }
  }

  return "";
}

function buildFallbackDualNarrative({
  userName,
  readerName,
  categoryFocus,
  evidenceCount,
}: {
  userName: string;
  readerName: string;
  categoryFocus?: string;
  evidenceCount: number;
}): DualNarrative {
  const focusLabel =
    categoryFocus === "love"
      ? "연애와 관계"
      : categoryFocus === "money"
        ? "재물과 소비 흐름"
        : categoryFocus === "career"
          ? "일과 커리어"
          : "전체 삶의 흐름";

  return {
    hook: `✨ ${readerName}는 이번 결과에서 ${focusLabel} 축을 먼저 읽는 편이 정확하다고 봅니다.`,
    easy: `📘 ${userName}님은 강한 축과 보완이 필요한 축이 같이 보이는 구조입니다. 그래서 무작정 넓히기보다, 지금 잘 되는 방향에 힘을 모으고 부족한 부분은 천천히 보완하는 전략이 더 안정적입니다.`,
    expert: `🧭 근거 로그 ${evidenceCount}건을 기준으로 보면, 이번 명식은 강한 성향축과 보완축이 동시에 작동합니다. 따라서 같은 원국이라도 어떤 리더는 구조 안정성을, 어떤 리더는 관계나 실행 타이밍을 먼저 강조하게 되며, 이 차이는 결론 충돌이 아니라 해석 우선순위의 차이로 보는 것이 맞습니다.`,
    action: `✨ 지금은 ${focusLabel} 영역에서 한 번에 크게 바꾸기보다, 가장 반복되는 패턴 하나를 먼저 줄이는 행동이 가장 실전적입니다.`,
    disclaimer:
      "같은 사주라도 역술가의 관점과 강조점에 따라 설명 방식은 달라질 수 있습니다. SecretSaju는 계산 결과는 유지하고, 설명 스타일과 집중 영역만 다르게 제공합니다.",
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const routing = routeAIPersona({
      userName: body.userName || "사용자",
      ageGroup: body.ageGroup || "20s",
      tendency: body.tendency || "Balanced",
      rawSajuData: body.rawSajuData,
      queryType: body.queryType || "result",
      readerId: body.readerId,
      categoryFocus: body.categoryFocus,
    });

    let finalUserPrompt = routing.userPrompt;
    if (body.lineageProfileId) {
      finalUserPrompt += `\n\n[분석 학파 기준]: ${body.lineageProfileId}`;
    }
    if (body.evidence && Array.isArray(body.evidence) && body.evidence.length > 0) {
      finalUserPrompt += `\n\n[명시적 근거 로그]\n${JSON.stringify(body.evidence, null, 2)}`;
    }
    if (body.canonicalFeatures) {
      finalUserPrompt += `\n\n[Canonical Features]\n${JSON.stringify(body.canonicalFeatures, null, 2)}`;
    }

    const llmText = await callLLM(routing.model, routing.systemPrompt, finalUserPrompt);
    const fallback = buildFallbackDualNarrative({
      userName: body.userName || "사용자",
      readerName: routing.reader.name,
      categoryFocus: body.categoryFocus,
      evidenceCount: Array.isArray(body.evidence) ? body.evidence.length : 0,
    });

    const dualNarrative: DualNarrative = {
      ...fallback,
      expert: llmText || fallback.expert,
    };

    return NextResponse.json({
      status: "success",
      narrative: dualNarrative.expert,
      dualNarrative,
      reader: routing.reader,
      routing: {
        selectedModel: routing.model,
        isEnsembleActive: routing.isEnsemble,
        personaApplied: `${routing.systemPrompt.substring(0, 80)}...`,
        readerId: routing.reader.id,
      },
    });
  } catch (error) {
    console.error("[Persona API] Error:", error);
    return NextResponse.json({ status: "error", message: "AI generation failed" }, { status: 500 });
  }
}
