import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
    const rawBody = await request.json().catch(() => ({}));
    const syncChannel = rawBody && typeof rawBody.channel === 'string' ? rawBody.channel : 'unknown';
    const syncSource = rawBody && typeof rawBody.source === 'string' ? rawBody.source : undefined;

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
