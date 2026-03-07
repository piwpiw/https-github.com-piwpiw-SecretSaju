import { NextResponse } from 'next/server';
import { routeAIPersona } from '@/core/ai-routing';
import { isMockMode } from '@/lib/use-mock';

async function callLLM(model: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const isMock = isMockMode();

  if ((model === 'GPT-4O' || model.startsWith('GPT')) && process.env.OPENAI_API_KEY && !isMock) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0.7,
        max_tokens: 800,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.choices?.[0]?.message?.content ?? '';
    }
  }

  if ((model === 'CLAUDE-3.5' || model.startsWith('CLAUDE')) && process.env.ANTHROPIC_API_KEY && !isMock) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 800,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.content?.[0]?.text ?? '';
    }
  }

  if ((model === 'GEMINI-1.5' || model.startsWith('GEMINI')) && process.env.GOOGLE_AI_KEY && !isMock) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_AI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
          generationConfig: { maxOutputTokens: 800, temperature: 0.7 },
        }),
      },
    );
    if (res.ok) {
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    }
  }

  return generateFallbackNarrative(systemPrompt, userPrompt);
}

function generateFallbackNarrative(systemPrompt: string, userPrompt: string): string {
  const userName = userPrompt.match(/사용자 이름: (.+)/)?.[1]?.trim() ?? '당신';
  const ageGroup = userPrompt.match(/연령대: (.+)/)?.[1]?.trim() ?? '';
  const evidenceCount = (userPrompt.match(/"id":/g) ?? []).length;

  const tone =
    systemPrompt.includes('10대') ? '생동감 있게'
      : systemPrompt.includes('20대') ? '확장감 있게'
        : systemPrompt.includes('30대') ? '밀도 있게'
          : systemPrompt.includes('40대') ? '무게감 있게'
            : '안정감 있게';

  const ageLine = ageGroup ? `현재 ${ageGroup} 흐름에서는` : '지금 흐름에서는';
  const evidenceLine = evidenceCount > 0 ? `📚 근거 로그 ${evidenceCount}건을 바탕으로 보면` : `📚 현재 드러난 간지 구조를 기준으로 보면`;

  return [
    `🪞 ${userName}님의 사주는 한쪽으로 단순화하기보다, 강한 축과 보완 축이 동시에 작동하는 구조로 읽는 편이 정확합니다.`,
    `🌿 ${ageLine} 기질을 크게 흔들기보다, 이미 강하게 잡힌 장점을 어디에 배치하느냐가 성과와 만족도를 가릅니다.`,
    `🔥 ${evidenceLine} 표면에 드러난 힘보다 반복적으로 작동하는 패턴이 더 중요하므로, 관계와 일 모두 '한 번의 반응'보다 '계속 반복되는 방식'을 관리하는 해석이 유효합니다.`,
    `🧭 따라서 지금은 무리한 확장보다 기준을 세우고, 맞는 타이밍에 집중도를 높이는 전략이 더 전문적인 처방에 가깝습니다. ${tone} 읽을수록 장점이 더 선명해지는 사주입니다.`,
  ].join(' ');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const routing = routeAIPersona({
      userName: body.userName || '익명',
      ageGroup: body.ageGroup || '20s',
      tendency: body.tendency || 'Balanced',
      rawSajuData: body.rawSajuData,
      queryType: body.queryType || 'result',
    });

    let finalUserPrompt = routing.userPrompt;
    if (body.lineageProfileId) {
      finalUserPrompt += `\n\n[분석 학파 기준]: ${body.lineageProfileId}\n이 해석은 위 학파의 관점을 존중하며 근거 기반으로 서술합니다.`;
    }
    if (body.evidence && Array.isArray(body.evidence) && body.evidence.length > 0) {
      finalUserPrompt += `\n\n[명시적 근거 로그]:\n${JSON.stringify(body.evidence, null, 2)}\n위 근거를 바탕으로 더 자세하고 전문적인 결과를 작성하되, 과장된 단정은 피하고 의미가 드러나는 이모지를 적절히 사용하세요.`;
    }
    if (body.canonicalFeatures) {
      finalUserPrompt += `\n\n[Canonical Features]:\n${JSON.stringify(body.canonicalFeatures, null, 2)}`;
    }

    const narrative = await callLLM(routing.model, routing.systemPrompt, finalUserPrompt);

    return NextResponse.json({
      status: 'success',
      narrative,
      routing: {
        selectedModel: routing.model,
        isEnsembleActive: routing.isEnsemble,
        personaApplied: `${routing.systemPrompt.substring(0, 50)}...`,
      },
    });
  } catch (error) {
    console.error('[Persona API] Error:', error);
    return NextResponse.json({ status: 'error', message: 'AI generation failed' }, { status: 500 });
  }
}
