import { NextRequest, NextResponse } from 'next/server'
import { KAKAO_CONFIG, STORAGE_KEYS } from '@/config'
import { sendWelcomeEmail, MAIL_RETRY_TTL_SECONDS } from '@/lib/mail'

const processedCodeSet: Set<string> = new Set<string>()
const WELCOME_RETRY_COOKIE = 'secretsaju_welcome_email_retry'

function scheduleProcessedCodeCleanup(code: string) {
  setTimeout(() => {
    processedCodeSet.delete(code)
  }, 10 * 60 * 1000)
}

function requestIdForLog() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Date.now().toString(36)
}

function redirectToAuthCallback(request: NextRequest, params: Record<string, string>) {
  const url = new URL('/auth/callback', request.url)
  const requestId = requestIdForLog()
  url.searchParams.set('request_id', requestId)

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  return NextResponse.redirect(url)
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (error) {
    console.error('Kakao OAuth error:', error)
    return redirectToAuthCallback(request, {
      error: 'provider_error',
      provider: 'kakao',
      provider_error: error,
      ...(errorDescription ? { provider_error_description: errorDescription } : {}),
    })
  }

  if (!code) {
    return redirectToAuthCallback(request, {
      error: 'no_code',
      provider: 'kakao',
      provider_error: 'missing_code',
      provider_error_description: 'OAuth code is required but missing',
    })
  }

  if (!KAKAO_CONFIG.isConfigured) {
    console.error('Kakao is not configured:', KAKAO_CONFIG.error)
    return redirectToAuthCallback(request, {
      error: 'kakao_not_configured',
      provider: 'kakao',
      provider_error_description: KAKAO_CONFIG.error || 'Kakao config missing',
    })
  }

  if (processedCodeSet.has(code)) {
    return redirectToAuthCallback(request, {
      error: 'oauth_callback_error',
      provider: 'kakao',
      provider_error: 'duplicate_code',
      provider_error_description: 'OAuth code already processed',
    })
  }

  processedCodeSet.add(code)
  scheduleProcessedCodeCleanup(code)

  try {
    let shouldRetryWelcomeEmail = false

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
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      return redirectToAuthCallback(request, {
        error: 'provider_error',
        provider: 'kakao',
        provider_error: tokenData.error || 'token_exchange_failed',
        provider_error_description: tokenData.error_description || 'OAuth token exchange failed',
      })
    }

    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const userData = await userResponse.json()

    if (!userResponse.ok) {
      return redirectToAuthCallback(request, {
        error: 'login_failed',
        provider: 'kakao',
        provider_error: 'kakao_userinfo_failed',
        provider_error_description: userData?.msg || 'Failed to fetch user info',
      })
    }

    const user = {
      id: userData.id,
      nickname: userData.kakao_account?.profile?.nickname || userData.properties?.nickname || 'Kakao User',
      email: userData.kakao_account?.email,
      profileImage: userData.kakao_account?.profile?.profile_image_url || userData.properties?.profile_image_url || userData.properties?.profile_image,
    }

    try {
      const { getSupabaseAdmin } = await import('@/lib/supabase')
      const supabaseAdmin = getSupabaseAdmin()

      if (supabaseAdmin) {
        const { data: existingUser, error: existingUserError } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('kakao_id', user.id)
          .maybeSingle()

        if (existingUserError) {
          console.error('Kakao user lookup failed:', existingUserError)
          return redirectToAuthCallback(request, {
            error: 'login_failed',
            provider: 'kakao',
            provider_error: 'kakao_user_lookup_failed',
            provider_error_description: existingUserError.message || 'Failed to check existing user',
          })
        }

        const { error: syncError } = await supabaseAdmin
          .from('users')
          .upsert(
            {
              kakao_id: user.id,
              nickname: user.nickname,
              email: user.email,
              profile_image_url: user.profileImage,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'kakao_id',
            },
          )

        if (syncError) {
          console.error('Supabase Sync Error:', syncError)
          return redirectToAuthCallback(request, {
            error: 'login_failed',
            provider: 'kakao',
            provider_error: 'kakao_user_sync_failed',
            provider_error_description: syncError.message || 'Failed to sync user',
          })
        } else if (!existingUser && user.email) {
          const mailResult = await sendWelcomeEmail(user.email, user.nickname || 'New User')
          if (!mailResult.success) {
            console.warn('[Kakao Callback] Welcome email failed:', mailResult.error)
            shouldRetryWelcomeEmail = true
          }
        }
      }
    } catch (dbError) {
      console.error('Database connection failed during sync:', dbError)
    }

    const response = NextResponse.redirect(new URL('/mypage', request.url))

    response.cookies.set(STORAGE_KEYS.KAKAO_TOKEN, tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expires_in || 21600,
      path: '/',
    })

    response.cookies.set(STORAGE_KEYS.USER_DATA, JSON.stringify(user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expires_in || 21600,
      path: '/',
    })

    if (shouldRetryWelcomeEmail) {
      response.cookies.set(WELCOME_RETRY_COOKIE, '1', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: MAIL_RETRY_TTL_SECONDS,
        path: '/',
      })
    }

    console.log('Kakao login successful for user:', user.nickname)

    return response
  } catch (error) {
    processedCodeSet.delete(code)
    console.error('Kakao login error:', error)
    return redirectToAuthCallback(request, {
      error: 'login_failed',
      provider: 'kakao',
      provider_error: 'kakao_callback_error',
      provider_error_description: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
