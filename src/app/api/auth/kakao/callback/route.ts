import { NextRequest, NextResponse } from 'next/server';
import { KAKAO_CONFIG, STORAGE_KEYS } from '@/config';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
        console.error('Kakao OAuth error:', error);
        return NextResponse.redirect(new URL(`/?error=${error}`, request.url));
    }

    if (!code) {
        return NextResponse.redirect(new URL('/?error=no_code', request.url));
    }

    // Validate configuration
    if (!KAKAO_CONFIG.isConfigured) {
        console.error('Kakao is not configured:', KAKAO_CONFIG.error);
        return NextResponse.redirect(
            new URL(`/?error=kakao_not_configured`, request.url)
        );
    }

    try {
        // Exchange authorization code for access token
        const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: KAKAO_CONFIG.REST_API_KEY,
                redirect_uri: KAKAO_CONFIG.REDIRECT_URI,
                code,
                client_secret: KAKAO_CONFIG.CLIENT_SECRET,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            throw new Error(tokenData.error_description || tokenData.error);
        }

        // Get user information
        const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        });

        const userData = await userResponse.json();

        if (!userResponse.ok) {
            throw new Error('Failed to fetch user info');
        }

        // Prepare user data
        const user = {
            id: userData.id,
            nickname: userData.kakao_account?.profile?.nickname || userData.properties?.nickname || '사용자',
            email: userData.kakao_account?.email,
            profileImage: userData.kakao_account?.profile?.profile_image_url || userData.properties?.profile_image,
        };

        // Sync to Supabase
        // We use Admin client because we are in a trusted server environment
        // and we might need to bypass RLS or simply use the service role for upserting
        try {
            const { getSupabaseAdmin } = await import('@/lib/supabase');
            const supabaseAdmin = getSupabaseAdmin();

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
                    // We don't block login if sync fails, but we should log it
                } else {
                    console.log('User synced to Supabase:', user.id);
                }
            }
        } catch (dbError) {
            console.error('Database connection failed during sync:', dbError);
        }

        // Set cookies
        const response = NextResponse.redirect(new URL('/mypage', request.url));

        // Store access token (httpOnly for security)
        response.cookies.set(STORAGE_KEYS.KAKAO_TOKEN, tokenData.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: tokenData.expires_in || 21600, // 6 hours default
            path: '/',
        });

        // Store user data (accessible by client)
        response.cookies.set(STORAGE_KEYS.USER_DATA, JSON.stringify(user), {
            httpOnly: false, // Client needs to read this
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: tokenData.expires_in || 21600,
            path: '/',
        });

        console.log('Kakao login successful for user:', user.nickname);

        return response;
    } catch (error) {
        console.error('Kakao login error:', error);
        return NextResponse.redirect(
            new URL(`/?error=login_failed&message=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`, request.url)
        );
    }
}
