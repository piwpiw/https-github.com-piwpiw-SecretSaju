import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
    try {
        const { category, subject, message, email } = await req.json();

        if (!category || !subject || !message) {
            return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
        }

        if (message.length > 1000) {
            return NextResponse.json({ error: '내용은 1000자 이내로 입력해주세요.' }, { status: 400 });
        }

        const validCategories = ['error', 'feedback', 'review', 'refund', 'convert'];
        if (!validCategories.includes(category)) {
            return NextResponse.json({ error: '유효하지 않은 문의 유형입니다.' }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();

        // Get user if logged in (optional)
        let userId: string | null = null;
        try {
            const authResult = await getAuthenticatedUser(req);
            if (authResult.user) userId = authResult.user.id;
        } catch { }

        const { error: dbError } = await supabase.from('inquiries').insert({
            user_id: userId,
            email: email || null,
            category,
            subject: subject.substring(0, 200),
            message: message.substring(0, 1000),
            status: 'pending',
        });

        if (dbError) {
            console.error('[Inquiry] DB error:', dbError);
            return NextResponse.json({ error: '저장 중 오류가 발생했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: '문의가 접수되었습니다.' });
    } catch (err: any) {
        console.error('[Inquiry] Error:', err);
        return NextResponse.json({ error: err.message || '서버 오류' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const authResult = await getAuthenticatedUser(req);
        if (!authResult.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
            .from('inquiries')
            .select('id, category, subject, status, created_at, admin_response')
            .eq('user_id', authResult.user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        return NextResponse.json({ inquiries: data || [] });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
