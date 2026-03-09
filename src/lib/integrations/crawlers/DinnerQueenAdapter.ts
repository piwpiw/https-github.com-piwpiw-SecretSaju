import { CampaignData } from '@/types/campaign';

/**
 * DinnerQueen Adapter
 * Fetches campaign data from https://dinnerqueen.net/taste
 */
export class DinnerQueenAdapter {
    private static BASE_URL = process.env.DINNER_QUEEN_CAMPAIGNS_URL || 'https://dinnerqueen.net/taste';

    static async fetchCampaigns(): Promise<CampaignData[]> {
        try {
            const response = await fetch(this.BASE_URL, {
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                },
                next: { revalidate: 3600 },
            });

            if (!response.ok) throw new Error(`DinnerQueen fetch failed: ${response.status}`);

            const html = await response.text();
            return this.parseHtml(html);
        } catch (error) {
            console.error('[DinnerQueenAdapter Error]:', error);
            return this.getFallbackData('error');
        }
    }

    private static parseHtml(html: string): CampaignData[] {
        const campaigns: CampaignData[] = [];
        const itemRegex = /<div class="campaign-item[^>]*>([\s\S]*?)<\/div>/g;
        let match: RegExpExecArray | null;

        while ((match = itemRegex.exec(html)) !== null && campaigns.length < 10) {
            const content = match[1];
            const titleMatch = content.match(/<h3[^>]*>(.*?)<\/h3>/i);
            const imageMatch = content.match(/src="([^"]+)"/i);
            const linkMatch = content.match(/href="([^"]+)"/i);
            const rewardMatch = content.match(/<span class="benefit"[^>]*>(.*?)<\/span>/i);

            if (titleMatch && imageMatch && linkMatch) {
                const title = titleMatch[1]?.trim();
                if (!title) continue;

                const href = linkMatch[1] || '';

                campaigns.push({
                    source: 'DinnerQueen',
                    title,
                    imageUrl: imageMatch[1] || '',
                    link: href.startsWith('http') ? href : `https://dinnerqueen.net${href}`,
                    description: rewardMatch?.[1]?.trim() || '혜택과 이벤트를 한눈에 확인해 보세요.',
                    reward: rewardMatch ? rewardMatch[1].trim() : '혜택 참여 포인트 지급',
                    category: '푸드/라이프스타일',
                });
            }
        }

        return campaigns.length > 0 ? campaigns : this.getFallbackData('empty_html');
    }

    private static getFallbackData(reason: string = 'generic'): CampaignData[] {
        const title =
            reason === 'error'
                ? '[DinnerQueen] 네트워크 오류'
                : '[DinnerQueen] 추천 캠페인 임시 목록';

        return [
            {
                source: 'DinnerQueen',
                title,
                imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400',
                link: this.BASE_URL,
                description: '현재 디너퀸 캠페인 연동이 일시적으로 지연되고 있습니다. 잠시 후 다시 시도해 주세요.',
                reward: '특전 혜택 참여 가능',
                category: '혜택',
            },
        ];
    }
}
