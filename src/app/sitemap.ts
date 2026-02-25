import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://secretsaju.vercel.app';
    const now = new Date();

    return [
        // Core — High Priority
        { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1 },
        { url: `${baseUrl}/fortune`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
        { url: `${baseUrl}/compatibility`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
        { url: `${baseUrl}/dashboard`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },

        // Content
        { url: `${baseUrl}/wiki`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/relationship`, lastModified: now, changeFrequency: 'weekly', priority: 0.75 },
        { url: `${baseUrl}/my-saju`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
        { url: `${baseUrl}/select-fortune`, lastModified: now, changeFrequency: 'weekly', priority: 0.65 },

        // User
        { url: `${baseUrl}/mypage`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/gift`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/inquiry`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },

        // Legal
        { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
        { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
        { url: `${baseUrl}/refund`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    ];
}

