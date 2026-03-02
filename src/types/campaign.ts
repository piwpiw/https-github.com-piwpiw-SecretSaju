/**
 * Campaign Data Type
 */
export interface CampaignData {
    source: 'DinnerQueen' | 'Revu';
    title: string;
    imageUrl: string;
    link: string;
    description: string;
    reward: string;
    category: string;
    isProOnly?: boolean;
    dateAdded?: string;
}
