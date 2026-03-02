import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { DinnerQueenAdapter } from '@/lib/crawlers/DinnerQueenAdapter';
import { RevuAdapter } from '@/lib/crawlers/RevuAdapter';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
    try {
        // In production, you would want to secure this endpoint
        // e.g. checking an Authorization header matching a CRON_SECRET
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}` && process.env.NODE_ENV !== 'development') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('[CRON] Starting Campaign Sync...');

        const [dinnerQueenCampaigns, revuCampaigns] = await Promise.allSettled([
            DinnerQueenAdapter.fetchCampaigns(),
            RevuAdapter.fetchCampaigns()
        ]);

        const newCampaigns = [
            ...(dinnerQueenCampaigns.status === 'fulfilled' ? dinnerQueenCampaigns.value : []),
            ...(revuCampaigns.status === 'fulfilled' ? revuCampaigns.value : [])
        ];

        if (newCampaigns.length === 0) {
            return NextResponse.json({ message: 'No campaigns fetched.' });
        }

        const supabase = getSupabaseAdmin();
        if (!supabase) {
            throw new Error('Supabase admin not configured');
        }

        // 1. Mark existing campaigns as inactive
        await supabase
            .from('campaigns')
            .update({ is_active: false })
            .eq('is_active', true);

        // 2. Insert new campaigns
        const insertPayload = newCampaigns.map(camp => ({
            source: camp.source,
            external_id: null,
            title: camp.title,
            image_url: camp.imageUrl,
            landing_url: camp.link,
            description: camp.description,
            reward_info: camp.reward,
            category: camp.category,
            is_active: true,
            updated_at: new Date().toISOString()
        }));

        const { error: insertError } = await supabase
            .from('campaigns')
            .insert(insertPayload);

        if (insertError) {
            console.error('[CRON] Insert Error:', insertError);
            throw insertError;
        }

        console.log(`[CRON] Successfully synced ${insertPayload.length} campaigns.`);

        return NextResponse.json({
            success: true,
            syncedCount: insertPayload.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[CRON] Campaign sync failed:', error);
        return NextResponse.json(
            { error: 'Campaign sync failed' },
            { status: 500 }
        );
    }
}
