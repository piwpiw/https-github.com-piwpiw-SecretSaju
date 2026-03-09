import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/integrations/supabase';
import { getAuthenticatedUser } from '@/lib/auth/api-auth';

export async function GET(request: NextRequest) {
    const authResult = await getAuthenticatedUser(request);
    if (authResult.error) return authResult.error;
    if (!authResult.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const supabase = getSupabaseAdmin();
        if (!supabase) {
            return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
        }

        const { data: history, error: historyError } = await supabase
            .from('jelly_transactions')
            .select('*')
            .eq('user_id', authResult.user.id)
            .order('created_at', { ascending: false });

        if (historyError) throw historyError;

        return NextResponse.json({ history });
    } catch (error) {
        console.error('Wallet History API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
