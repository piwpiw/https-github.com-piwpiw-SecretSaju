import { NextResponse } from 'next/server';
import { routeAIPersona } from '@/core/ai-routing';import { isMockMode } from '@/lib/use-mock';


// Real LLM call with model-specific endpoints + graceful fallback
async function callLLM(model: string, systemPrompt: string, userPrompt: string): Promise<string> {
    const isMock = isMockMode();

    // OpenAI (GPT-4o)
    if ((model === 'GPT-4O' || model.startsWith('GPT')) && process.env.OPENAI_API_KEY && !isMock) {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
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

    // Anthropic (Claude 3.5)
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

    // Google Gemini
    if ((model === 'GEMINI-1.5' || model.startsWith('GEMINI')) && process.env.GOOGLE_AI_KEY && !isMock) {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_AI_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
                    ],
                    generationConfig: { maxOutputTokens: 800, temperature: 0.7 },
                }),
            }
        );
        if (res.ok) {
            const data = await res.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        }
    }

    // Fallback: rich static narrative based on persona
    return generateFallbackNarrative(systemPrompt, userPrompt);
}

function generateFallbackNarrative(systemPrompt: string, userPrompt: string): string {
    const userName = userPrompt.match(/사용자 이름: (.+)/)?.[1]?.trim() ?? '당신';
    const ageGroup = userPrompt.match(/연령대: (.+)/)?.[1]?.trim() ?? '';

    const tone = systemPrompt.includes('10대') ? '친근하고 활기차게'
        : systemPrompt.includes('20대') ? '세련되고 실용적으로'
            : systemPrompt.includes('30대') ? '깊이 있고 통찰력 있게'
                : systemPrompt.includes('40대') ? '품격 있고 지혜롭게'
                    : '권위 있고 따뜻하게';

    return `${userName}님의 사주는 독특한 기운을 품고 있습니다. \
당신의 천간과 지지가 만들어내는 조화는 ${tone} 표현할 수 있는 운명의 설계도입니다. \
오행의 흐름 속에서 당신만의 강점이 빛을 발하는 시기가 다가오고 있습니다. \
지금 이 순간, 우주의 기운은 당신 편입니다.`;
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

        const narrative = await callLLM(routing.model, routing.systemPrompt, routing.userPrompt);

        return NextResponse.json({
            status: 'success',
            narrative,
            routing: {
                selectedModel: routing.model,
                isEnsembleActive: routing.isEnsemble,
                personaApplied: routing.systemPrompt.substring(0, 50) + '...',
            },
        });

    } catch (error) {
        console.error('[Persona API] Error:', error);
        return NextResponse.json({ status: 'error', message: 'AI generation failed' }, { status: 500 });
    }
}
