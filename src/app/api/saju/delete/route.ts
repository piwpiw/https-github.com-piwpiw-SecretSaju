import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-auth';

export async function DELETE(request: NextRequest) {
    // 1. Authenticate
    const { user, error } = await getAuthenticatedUser(request);
    if (error) return error;
    if (!user) return NextResponse.json({ error: 'Unexpected auth state' }, { status: 500 });

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: 'DB Error' }, { status: 500 });

    // Delete with ownership check (user_id must match)
    const { error: deleteError } = await supabase
        .from('saju_profiles')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Security: Ensure ownership

    if (deleteError) {
        console.error('Delete Profile Error:', deleteError);
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
