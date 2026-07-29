/**
 * 손금 사진 분석.
 *
 * 이 화면은 그동안 손금을 보지 않았다. 사용자가 유형 세 개 중 하나를 고르면
 * 그 유형의 설명을 그대로 돌려줬을 뿐이다. 사진도 분석도 없었다.
 *
 * 이제 실제로 올린 사진을 본다. gpt-4o 는 이미지를 읽을 수 있으므로,
 * 손바닥 사진에서 보이는 선을 근거로 해석을 만든다.
 *
 * 두 가지를 지킨다.
 * - 손바닥이 안 보이면 해석하지 않고 다시 찍어 달라고 한다. 아무 사진이나
 *   받아 그럴듯한 말을 지어내면 그게 예전 상태와 다를 게 없다.
 * - 건강·수명 같은 단정은 하지 않는다.
 */
import { NextResponse } from 'next/server';
import { isMockMode } from '@/lib/app/use-mock';

export const runtime = 'nodejs';
export const maxDuration = 60;

/** 업로드 상한. 손바닥 사진은 이 안에서 충분히 선명하다. */
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

const SYSTEM_PROMPT = `당신은 손금을 읽는 사람입니다. 사용자가 올린 손바닥 사진을 보고 해석합니다.

반드시 아래 JSON 형식으로만 답하세요. 다른 말을 덧붙이지 마세요.
{
  "isPalm": true 또는 false,
  "retakeReason": "손바닥이 아닐 때만 채우고, 아니면 빈 문자열",
  "observed": ["사진에서 실제로 보이는 선·특징을 3~5개", "예: 생명선이 엄지 아래를 크게 감싸며 뚜렷하다"],
  "summary": "두세 문장으로 전체 인상",
  "lines": [
    { "name": "생명선", "reading": "이 사람의 생활 리듬과 체력 운용에 대해 두 문장" },
    { "name": "감정선", "reading": "관계와 감정 표현에 대해 두 문장" },
    { "name": "두뇌선", "reading": "판단 방식과 집중 습관에 대해 두 문장" },
    { "name": "운명선", "reading": "보이면 해석, 흐리거나 없으면 그 사실을 그대로 적기" }
  ],
  "actions": ["오늘 바로 해볼 수 있는 행동 3개"]
}

지켜야 할 것:
- 사진에 손바닥이 안 보이면 isPalm 을 false 로 하고 retakeReason 에 무엇이 문제인지
  쓰세요(예: 손등이 찍혔습니다 / 너무 어둡습니다 / 손이 화면 밖으로 잘렸습니다).
  이때 나머지 항목은 빈 배열이나 빈 문자열로 두세요. 억지로 해석하지 마세요.
- observed 에는 사진에서 실제로 보이는 것만 적으세요. 안 보이는 선을 지어내지 마세요.
- 병명, 수명, 사망, 임신 여부는 말하지 마세요.
- 쉬운 한국어로 쓰세요. 한자어와 전문 용어는 피하고, 한 문장을 짧게 끊으세요.`;

type PalmReading = {
  isPalm: boolean;
  retakeReason: string;
  observed: string[];
  summary: string;
  lines: Array<{ name: string; reading: string }>;
  actions: string[];
};

function mockReading(): PalmReading {
  return {
    isPalm: true,
    retakeReason: '',
    observed: [
      '생명선이 엄지 아래를 넓게 감싸고 있습니다',
      '감정선이 검지 쪽까지 길게 이어집니다',
      '두뇌선이 곧게 뻗어 있습니다',
    ],
    summary:
      '전체적으로 선이 뚜렷한 손입니다. 한 번 정한 것을 오래 밀고 가는 편이고, 결정을 내릴 때 감정보다 판단을 먼저 세웁니다.',
    lines: [
      { name: '생명선', reading: '체력을 몰아 쓰기보다 꾸준히 나눠 쓰는 쪽이 잘 맞습니다. 무리한 날 다음은 회복에 시간을 주세요.' },
      { name: '감정선', reading: '마음을 바로 드러내기보다 한 번 정리해서 말하는 편입니다. 가까운 사람에게는 조금 더 일찍 말해도 좋습니다.' },
      { name: '두뇌선', reading: '한 가지에 오래 붙어 있는 힘이 있습니다. 대신 방향을 바꿔야 할 때 늦어질 수 있습니다.' },
      { name: '운명선', reading: '뚜렷하게 잡히지 않습니다. 정해진 길을 따르기보다 그때그때 만들어 가는 쪽에 가깝습니다.' },
    ],
    actions: [
      '오늘 할 일 중 하나만 골라 끝까지 마치세요',
      '미뤄 둔 연락 한 건을 먼저 하세요',
      '자기 전 10분은 화면을 끄고 쉬세요',
    ],
  };
}

function parseReading(raw: string): PalmReading | null {
  // 모델이 ```json 으로 감싸 보내는 경우가 있어 벗겨 낸다
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end < start) return null;

  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    return {
      isPalm: !!parsed.isPalm,
      retakeReason: String(parsed.retakeReason ?? ''),
      observed: Array.isArray(parsed.observed) ? parsed.observed.map(String) : [],
      summary: String(parsed.summary ?? ''),
      lines: Array.isArray(parsed.lines)
        ? parsed.lines.map((l: { name?: unknown; reading?: unknown }) => ({
            name: String(l?.name ?? ''),
            reading: String(l?.reading ?? ''),
          }))
        : [],
      actions: Array.isArray(parsed.actions) ? parsed.actions.map(String) : [],
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  let body: { image?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '요청을 읽을 수 없습니다.' }, { status: 400 });
  }

  const image = body.image;
  if (!image || typeof image !== 'string' || !image.startsWith('data:image/')) {
    return NextResponse.json(
      { error: '손바닥 사진을 함께 보내 주세요.' },
      { status: 400 },
    );
  }

  // data URL 은 base64 라 원본보다 약 4/3 크다. 대략적인 원본 크기로 막는다.
  if ((image.length * 3) / 4 > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: '사진이 너무 큽니다. 6MB 이하로 다시 올려 주세요.' },
      { status: 413 },
    );
  }

  if (isMockMode() || !process.env.OPENAI_API_KEY) {
    return NextResponse.json({ reading: mockReading(), source: 'mock' });
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0.6,
        max_tokens: 1200,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: '이 손바닥 사진을 보고 해석해 주세요.' },
              { type: 'image_url', image_url: { url: image, detail: 'high' } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      console.error('[palmistry] OpenAI 응답 실패', res.status);
      return NextResponse.json(
        { error: '분석에 실패했습니다. 잠시 후 다시 시도해 주세요.' },
        { status: 502 },
      );
    }

    const data = await res.json();
    const reading = parseReading(data.choices?.[0]?.message?.content ?? '');

    if (!reading) {
      return NextResponse.json(
        { error: '분석 결과를 읽지 못했습니다. 다시 시도해 주세요.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ reading, source: 'gpt-4o' });
  } catch (error) {
    console.error('[palmistry] 분석 오류', error);
    return NextResponse.json(
      { error: '분석 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.' },
      { status: 500 },
    );
  }
}
