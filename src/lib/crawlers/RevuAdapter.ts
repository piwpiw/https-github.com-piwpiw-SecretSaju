import { CampaignData } from '@/types/campaign';

/**
 * Revu Adapter
 * Fetches campaign data from Revu API
 */
export class RevuAdapter {
    private static API_URL = process.env.REVU_API_URL || 'https://api.revu.net/campaign/list';

    static async fetchCampaigns(): Promise<CampaignData[]> {
        try {
            const response = await fetch(`${this.API_URL}?limit=10&order=new`, {
                headers: {
                    Accept: 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'X-Platform': 'web',
                },
                next: { revalidate: 3600 },
            });

            if (!response.ok) return this.getMockData('api_unavailable');

            const data = await response.json();
            return this.transform(data);
        } catch (error) {
            console.error('[RevuAdapter Error]:', error);
            return this.getMockData('error');
        }
    }

    private static transform(data: unknown): CampaignData[] {
        if (!data || typeof data !== 'object') return this.getMockData('invalid_payload');

        const payload = data as { list?: Array<Record<string, unknown>> };
        const list = Array.isArray(payload.list) ? payload.list : [];
        const campaigns = list
            .map((item) => {
                const itemTitle = typeof item.title === 'string' ? item.title : null;
                if (!itemTitle) return null;

                const itemId = item.id;
                const sourceLink =
                    itemId && typeof itemId === 'string' || typeof itemId === 'number'
                        ? `https://www.revu.net/campaign/view/${itemId}`
                        : 'https://www.revu.net';

                return {
                    source: 'Revu',
                    title: itemTitle,
                    imageUrl:
                        typeof item.image_url === 'string'
                            ? item.image_url
                            : typeof item.thumbnail === 'string'
                              ? item.thumbnail
                              : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400',
                    link: sourceLink,
                    description:
                        typeof item.summary === 'string' ? item.summary : '실시간 혜택과 이벤트를 확인해 보세요.',
                    reward:
                        typeof item.reward_text === 'string' ? item.reward_text : '적립 혜택 제공',
                    category:
                        typeof item.category_name === 'string'
                            ? item.category_name
                            : '라이프스타일/이벤트',
                };
            })
            .filter((item): item is CampaignData => Boolean(item));

        return campaigns.length > 0 ? campaigns : this.getMockData('no_data');
    }

    private static getMockData(reason: string = 'generic'): CampaignData[] {
        const title =
            reason === 'api_unavailable'
                ? '[Revu] API 응답 지연'
                : reason === 'error'
                  ? '[Revu] 데이터 로드 실패'
                  : '[Revu] 캠페인 임시 목록';

        return [
            {
                source: 'Revu',
                title,
                imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400',
                link: 'https://www.revu.net',
                description: '현재 Revu 캠페인 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
                reward: '포인트 적립 혜택 제공',
                category: '혜택/이벤트',
            },
        ];
    }
}
