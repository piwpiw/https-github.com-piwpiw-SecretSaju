import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/integrations/supabase';
import { getAuthenticatedUser } from '@/lib/auth/api-auth';
import { CreateSajuProfileRequest } from '@/types/schema';

export async function POST(request: NextRequest) {
    // 1. Authenticate
    const { user, error } = await getAuthenticatedUser(request);
    if (error) return error;
    if (!user) return NextResponse.json({ error: 'Unexpected auth state' }, { status: 500 });

    try {
        const body: CreateSajuProfileRequest = await request.json();

        // Validate Body (Basic check)
        if (!body.name || !body.birthdate || !body.gender) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();
        if (!supabase) return NextResponse.json({ error: 'DB Error' }, { status: 500 });

        // Insert
        // Note: birth_time needs simple conversion if it's "HH:mm" from client
        // to "1970-01-01 HH:mm:00" or just "HH:mm:00" depending on Postgres TIME type handling.
        // Postgres TIME type works with "HH:mm:ss".
        // If client sends "15:30", we can store it directly if type is TIME.
        // But schema definition in supabase.ts says string. 
        // Let's rely on string format.

        const { data, error: insertError } = await supabase
            .from('saju_profiles')
            .insert({
                user_id: user.id,
                name: body.name,
                relationship: body.relationship,
                birthdate: body.birthdate,
                birth_time: body.birthTime ? `${body.birthTime}:00` : null,
                is_time_unknown: body.isTimeUnknown || false,
                calendar_type: body.calendarType,
                is_leap_month: body.isLeapMonth || false,
                gender: body.gender,
            })
            .select()
            .single();

        if (insertError) {
            console.error('Create Profile Error:', insertError);
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        return NextResponse.json({ profile: data });

    } catch (e) {
        console.error('Create API parsing error:', e);
        return NextResponse.json({ error: 'Invalid Request' }, { status: 400 });
    }
}
