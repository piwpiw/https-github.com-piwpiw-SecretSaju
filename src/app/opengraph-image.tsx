import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Secret Saju - 990 사주마미';
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '24px',
                        padding: '60px 80px',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <div
                        style={{
                            fontSize: 80,
                            fontWeight: 'bold',
                            color: 'white',
                            marginBottom: '20px',
                            textShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        }}
                    >
                        🐾 Secret Saju
                    </div>
                    <div
                        style={{
                            fontSize: 48,
                            color: '#FFD700',
                            fontWeight: '600',
                            marginBottom: '30px',
                        }}
                    >
                        990 사주마미
                    </div>
                    <div
                        style={{
                            fontSize: 32,
                            color: 'rgba(255,255,255,0.9)',
                            textAlign: 'center',
                            maxWidth: '800px',
                        }}
                    >
                        프리미엄 사주 플랫폼
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
