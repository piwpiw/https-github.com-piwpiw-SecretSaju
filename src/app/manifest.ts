import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Secret Saju - 시크릿 사주',
        short_name: '시크릿사주',
        description: '당신의 운명과 본능을 분석하는 하이퍼 력셔리 명리학 플랫폼',
        start_url: '/',
        display: 'standalone',
        background_color: '#09090b',
        theme_color: '#7c3aed',
        icons: [
            {
                src: '/favicon.ico',   // Note: Requires realistic icon files
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/favicon.ico',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
