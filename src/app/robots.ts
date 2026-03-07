import { MetadataRoute } from 'next';
import { APP_CONFIG } from '@/config/env';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = APP_CONFIG.BASE_URL || 'https://secret-saju.vercel.app';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/payment/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
