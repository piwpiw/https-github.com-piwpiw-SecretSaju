import { NextRequest, NextResponse } from 'next/server';
import { STORAGE_KEYS } from '@/config';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        // 1. Get Access Token from Cookie
        const accessToken = request.cookies.get(STORAGE_KEYS.KAKAO_TOKEN)?.value;

        if (!accessToken) {
            return NextResponse.json(
                { error: 'No access token found', code: 'UNAUTHORIZED' },
                { status: 401 }
            );
        }

        // 2. Fetch User Info from Kakao (validates token as well)
        const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!userResponse.ok) {
            return NextResponse.json(
                { error: 'Failed to verify Kakao token', code: 'INVALID_TOKEN' },
                { status: 401 }
            );
        }

        const userData = await userResponse.json();

        // 3. Prepare User Data
        const user = {
            id: userData.id,
            nickname: userData.kakao_account?.profile?.nickname || userData.properties?.nickname || '사용자',
            email: userData.kakao_account?.email,
            profileImage: userData.kakao_account?.profile?.profile_image_url || userData.properties?.profile_image,
        };

        // 4. Upsert to Supabase
        const supabaseAdmin = getSupabaseAdmin();

        let dbResult = 'skipped';
        if (supabaseAdmin) {
            const { error: syncError } = await supabaseAdmin
                .from('users')
                .upsert({
                    kakao_id: user.id,
                    nickname: user.nickname,
                    email: user.email,
                    profile_image_url: user.profileImage,
                    updated_at: new Date().toISOString(),
                }, {
                    onConflict: 'kakao_id'
                });

            if (syncError) {
                console.error('Supabase Sync Error:', syncError);
                return NextResponse.json(
                    { error: 'Database sync failed', details: syncError.message },
                    { status: 500 }
                );
            }
            dbResult = 'synced';
        }

        // 5. Return success
        return NextResponse.json({
            success: true,
            message: 'User synced successfully',
            dbStatus: dbResult,
            user: {
                id: user.id,
                nickname: user.nickname
            }
        });

    } catch (error) {
        console.error('User Sync API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
