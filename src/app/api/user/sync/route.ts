import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/api-auth';
import { DATABASE_CONFIG } from '@/config';
import { isMockMode } from '@/lib/app/use-mock';

export async function POST(request: NextRequest) {
    const rawBody = await request.json().catch(() => ({}));
    const syncChannel = rawBody && typeof rawBody.channel === 'string' ? rawBody.channel : 'unknown';
    const syncSource = rawBody && typeof rawBody.source === 'string' ? rawBody.source : undefined;

    // Degrade gracefully when the database is not set up yet. Without Supabase
    // configured (and outside mock mode) there is nothing to sync — this is an
    // expected, benign state, not a server error, so avoid a 500 + error spam.
    if (!DATABASE_CONFIG.isConfigured && !isMockMode()) {
        return NextResponse.json({ synced: false, configured: false });
    }

    const { user, error } = await getAuthenticatedUser(request);

    if (error) return error;
    if (!user) {
        return NextResponse.json({ error: 'User sync failed' }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        user: {
            id: user.id,
            email: user.email,
            isAdmin: user.isAdmin,
            syncChannel,
            syncSource,
        },
    });
}
