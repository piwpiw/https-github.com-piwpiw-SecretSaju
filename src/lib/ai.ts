import OpenAI from 'openai';

// [gem-backend] 최적화: 싱글톤 패턴으로 불필요한 인스턴스화 방지
// Note: Moved inside function to avoid top-level env-var issues during build

export async function generatePersonalizedFortune(
    animalName: string,
    ageGroup: string,
    gender: string,
    traits: any,
    mockMode: boolean = false
): Promise<string> {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    if (mockMode || !process.env.OPENAI_API_KEY) {
        // [gem-backend] 강제 방어: 과금 방지 및 로컬 테스트용 폴백
        return `${ageGroup} ${gender === 'M' ? '남성' : '여성'}인 당신, 가면 속엔 [${animalName}]의 기질이 꿈틀대고 있네요. 남몰래 숨겨온 욕망을 젤리로 조련해 보는 건 어떤가요? (Mock AI 텍스트)`;
    }

    const prompt = `
당신은 사람들의 사회적 가면(Persona)을 벗겨내고 숨겨진 본능(Instinct)을 날카롭게 꿰뚫어보는 '시크릿 사주(Secret Saju)'의 수석 역술가입니다.
말투는 예의 바르지만 매우 직설적이고, 뼈 때리는(팩폭) 특징이 있습니다. 

# 타겟 정보
- 띠/일주 동물: ${animalName}
- 나이대: ${ageGroup}
- 성별: ${gender === 'M' ? '남성' : '여성'}
- 주요 기질: ${JSON.stringify(traits)}

# 지시사항
이 사람의 주요 기질을 바탕으로, ${ageGroup}의 현실적인 고민과 연결지어 3~4문장의 짧고 강렬한 '팩폭 조언'을 작성해 주세요.
친근하게 존댓말을 쓰되, 숨기고 싶어하는 본능을 흥미롭게 자극해야 합니다.
  `.trim();

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a direct, insightful, and slightly sarcastic modern fortune teller.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.8,
            max_tokens: 250,
        });

        return response.choices[0]?.message?.content || 'AI 분석에 실패했습니다.';
    } catch (error) {
        console.error('[AI Personalization Error]:', error);
        return '본능을 분석하는 도중 마나가 부족했습니다. (AI 처리 오류)';
    }
}
