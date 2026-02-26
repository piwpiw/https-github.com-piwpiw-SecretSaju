import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Secret Paws - 멍냥의 이중생활',
        short_name: '사주라떼',
        description: '사회적 가면 뒤에 숨겨진 당신의 진짜 본능을 폭로하는 하이퍼 력셔리 명리학 플랫폼',
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
