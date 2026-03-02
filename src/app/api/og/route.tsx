/**
 * src/app/api/og/route.tsx
 * Dynamic OG Image API — Saju Result Share Card
 *
 * Usage: /api/og?name=홍길동&pillar=갑자&element=목&score=78&locale=ko
 * Output: 1200×630 PNG image
 */

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const ELEMENT_COLORS: Record<string, string> = {
    '목': '#4ade80',
    '화': '#f87171',
    '토': '#fbbf24',
    '금': '#e2e8f0',
    '수': '#60a5fa',
};

const ELEMENT_LABELS: Record<string, string> = {
    '목': 'Wood 木',
    '화': 'Fire 火',
    '토': 'Earth 土',
    '금': 'Metal 金',
    '수': 'Water 水',
};

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name') ?? '사주';
    const pillar = searchParams.get('pillar') ?? '甲子';
    const element = searchParams.get('element') ?? '목';
    const score = searchParams.get('score') ?? '';
    const locale = searchParams.get('locale') ?? 'ko';

    const accentColor = ELEMENT_COLORS[element] ?? '#a78bfa';
    const elementLabel = ELEMENT_LABELS[element] ?? element;
    const tagline = locale === 'ko' ? '나의 사주 결과' : 'My Saju Reading';
    const brand = 'Secret Saju';
    const subline = locale === 'ko' ? '시크릿사주 — 프리미엄 사주 분석' : 'Premium Four Pillars Analysis';

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
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Background grid */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(139,92,246,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(99,102,241,0.1) 0%, transparent 50%)',
                }} />

                {/* Accent glow */}
                <div style={{
                    position: 'absolute',
                    top: '-100px',
                    right: '-100px',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${accentColor}33 0%, transparent 70%)`,
                }} />

                {/* Brand top */}
                <div style={{
                    position: 'absolute',
                    top: '40px',
                    left: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #6d28d9, #4f46e5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '900',
                    }}>SS</div>
                    <span style={{ color: '#e2e8f0', fontSize: '18px', fontWeight: '700', letterSpacing: '0.1em' }}>{brand}</span>
                </div>

                {/* Tagline */}
                <div style={{
                    padding: '6px 20px',
                    borderRadius: '999px',
                    border: `1px solid ${accentColor}44`,
                    background: `${accentColor}11`,
                    color: accentColor,
                    fontSize: '16px',
                    fontWeight: '700',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    marginBottom: '24px',
                }}>{tagline}</div>

                {/* Main pillar */}
                <div style={{
                    fontSize: '96px',
                    fontWeight: '900',
                    color: 'white',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                    textShadow: `0 0 60px ${accentColor}88`,
                    marginBottom: '12px',
                }}>{pillar}</div>

                {/* Name */}
                <div style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: '#94a3b8',
                    marginBottom: '32px',
                }}>{name}의 일주</div>

                {/* Element badge */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                }}>
                    <div style={{
                        padding: '8px 24px',
                        borderRadius: '999px',
                        background: `${accentColor}22`,
                        border: `1px solid ${accentColor}55`,
                        color: accentColor,
                        fontSize: '20px',
                        fontWeight: '700',
                    }}>{elementLabel}</div>
                    {score && (
                        <div style={{
                            padding: '8px 24px',
                            borderRadius: '999px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#e2e8f0',
                            fontSize: '20px',
                            fontWeight: '700',
                        }}>⭐ {score}점</div>
                    )}
                </div>

                {/* Bottom subline */}
                <div style={{
                    position: 'absolute',
                    bottom: '40px',
                    color: '#475569',
                    fontSize: '16px',
                    fontWeight: '500',
                    letterSpacing: '0.05em',
                }}>{subline}</div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
