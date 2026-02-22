import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { SajuProfileDTO } from '@/types/schema';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    // 1. Authenticate
    const { user, error } = await getAuthenticatedUser(request);
    if (error) return error;

    if (!user) return NextResponse.json({ error: 'Unexpected auth state' }, { status: 500 });

    // 2. Fetch Profiles
    const supabase = getSupabaseAdmin();
    // admin check is inside getAuthenticatedUser but we need client here
    if (!supabase) return NextResponse.json({ error: 'DB Error' }, { status: 500 });

    const { data, error: dbError } = await supabase
        .from('saju_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (dbError) {
        console.error('Fetch Profiles Error:', dbError);
        return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ profiles: data as SajuProfileDTO[] });
}
