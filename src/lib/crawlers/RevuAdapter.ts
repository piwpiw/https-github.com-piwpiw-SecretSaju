import { CampaignData } from '@/types/campaign';

/**
 * Revu Adapter
 * Fetches campaign data from Revu.net API
 */
export class RevuAdapter {
    private static API_URL = 'https://api.revu.net/campaign/list'; // Example endpoint

    static async fetchCampaigns(): Promise<CampaignData[]> {
        try {
            // Revu API requires specific headers often
            const response = await fetch(`${this.API_URL}?limit=10&order=new`, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    // Note: Real API might need x-api-key or similar, adding placeholder
                    'X-Platform': 'web'
                },
                next: { revalidate: 3600 }
            });

            if (!response.ok) {
                // Return mock if API is not accessible or needs auth
                return this.getMockData();
            }

            const data = await response.json();
            return this.transform(data);
        } catch (error) {
            console.error('[RevuAdapter Error]:', error);
            return this.getMockData();
        }
    }

    private static transform(data: any): CampaignData[] {
        // Example transformation logic
        if (!data?.list) return this.getMockData();

        return data.list.map((item: any) => ({
            source: 'Revu',
            title: item.title,
            imageUrl: item.image_url || item.thumbnail,
            link: `https://www.revu.net/campaign/view/${item.id}`,
            description: item.summary || '레뷰 프리미엄 캠페인',
            reward: item.reward_text || '포인트/상품 제공',
            category: item.category_name || '블로그/SNS',
        }));
    }

    private static getMockData(): CampaignData[] {
        return [
            {
                source: 'Revu',
                title: '[레뷰] 신규 브랜드 런칭 체험단 모집',
                imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400',
                link: 'https://www.revu.net',
                description: '국내 최대 규모의 인플루언서 플랫폼 레뷰 캠페인',
                reward: '3만 포인트',
                category: '라이프',
            }
        ];
    }
}
