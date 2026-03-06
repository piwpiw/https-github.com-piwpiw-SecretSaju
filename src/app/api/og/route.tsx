import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const ELEMENT_COLORS: Record<string, string> = {
  목: '#4ade80',
  화: '#f87171',
  토: '#fbbf24',
  금: '#9ca3af',
  수: '#60a5fa',
};

const ELEMENT_LABELS: Record<string, string> = {
  목: 'Wood',
  화: 'Fire',
  토: 'Earth',
  금: 'Metal',
  수: 'Water',
};

function sanitizeText(value: string, maxLength = 40) {
  return (value || 'Secret Saju')
    .toString()
    .slice(0, maxLength)
    .replace(/[<>]/g, '');
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = sanitizeText(searchParams.get('name') ?? '사용자');
  const pillar = sanitizeText(searchParams.get('pillar') ?? '궁합', 24);
  const element = sanitizeText(searchParams.get('element') ?? '목');
  const score = searchParams.get('score');
  const locale = searchParams.get('locale') ?? 'ko';

  const accentColor = ELEMENT_COLORS[element] ?? '#a78bfa';
  const elementLabel = ELEMENT_LABELS[element] ?? element;
  const parsedScore = Number(score);
  const hasScore = Number.isFinite(parsedScore);
  const tagline = locale === 'ko' ? '당신만의 사주 리딩' : 'Your Saju Reading';
  const brand = 'Secret Saju';
  const subline = locale === 'ko' ? '프리미엄 사주 분석 결과' : 'Premium Four Pillars Analysis';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a1a 0%, #12122a 50%, #1a0a2a 100%)',
          fontFamily: 'Arial, Helvetica, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(139,92,246,0.18) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(99,102,241,0.15) 0%, transparent 50%)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '420px',
            height: '420px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${accentColor}33 0%, transparent 70%)`,
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: '38px',
            left: '60px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6d28d9, #4f46e5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: 900,
            }}
          >
            SS
          </div>
          <span
            style={{
              color: '#e2e8f0',
              fontSize: '18px',
              fontWeight: 700,
              letterSpacing: '0.15em',
            }}
          >
            {brand}
          </span>
        </div>

        <div
          style={{
            padding: '6px 20px',
            borderRadius: '999px',
            border: `1px solid ${accentColor}44`,
            background: `${accentColor}11`,
            color: accentColor,
            fontSize: '16px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '24px',
          }}
        >
          {tagline}
        </div>

        <div
          style={{
            fontSize: '64px',
            fontWeight: 900,
            color: 'white',
            letterSpacing: '-0.03em',
            lineHeight: 1,
            textShadow: `0 0 60px ${accentColor}88`,
            marginBottom: '8px',
            textAlign: 'center',
            padding: '0 120px',
          }}
        >
          {pillar}
        </div>

        <div
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#94a3b8',
            marginBottom: '30px',
          }}
        >
          {name}님의 결과
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              padding: '8px 24px',
              borderRadius: '999px',
              background: `${accentColor}22`,
              border: `1px solid ${accentColor}55`,
              color: accentColor,
              fontSize: '20px',
              fontWeight: 700,
            }}
          >
            {elementLabel}
          </div>
          {hasScore && (
            <div
              style={{
                padding: '8px 24px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#e2e8f0',
                fontSize: '20px',
                fontWeight: 700,
              }}
            >
              Score {Math.round(parsedScore)}
            </div>
          )}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            color: '#475569',
            fontSize: '16px',
            fontWeight: 500,
            letterSpacing: '0.05em',
          }}
        >
          {subline}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}