import { NextRequest, NextResponse } from 'next/server'

import { ENV, MCP_CONFIG } from '@/config'
import { STORAGE_KEYS } from '@/config/constants'
import { getSupabaseAdmin, getSupabaseClient } from '@/lib/supabase'
import { sendWelcomeEmail } from '@/lib/mail'
import {
  exchangeMcpCodeForToken,
  getMcpArtifactsFromCookieHeader,
  getMcpUserProfile,
  refreshMcpToken,
} from '@/lib/auth-mcp'

function decodeJwtPayloadSub(jwt: string): string | null {
  try {
    const [, payload] = jwt.split('.')
    if (!payload) return null

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padLength = normalized.length % 4 === 0 ? 0 : 4 - (normalized.length % 4)
    const padded = `${normalized}${'='.repeat(padLength)}`
    const decoded = typeof atob === 'function' ? atob(padded) : Buffer.from(padded, 'base64').toString('utf-8')
    const parsed = JSON.parse(decoded) as { sub?: string; external_id?: string; externalUserId?: string; provider_id?: string }

    return (
      parsed.sub ??
      parsed.external_id ??
      parsed.externalUserId ??
      parsed.provider_id ??
      null
    )
  } catch {
    return null
  }
}

function resolveMcpProviderUserId(input: {
  profile?: {
    externalUserId?: unknown;
    providerUserId?: unknown;
  };
  tokenPayloadProviderId?: string | null;
}) {
  return String(
    input.profile?.externalUserId ??
    input.profile?.providerUserId ??
    input.tokenPayloadProviderId ??
    ''
  ).trim();
}


const MCP_COOKIE_DEFAULTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: ENV.IS_PROD,
  path: '/',
}

const MCP_ERROR_COOKIE_DEFAULTS = {
  ...MCP_COOKIE_DEFAULTS,
  path: '/',
  maxAge: 0,
}

const MCP_STATE_REGEX = /^[A-Za-z0-9._~\-]{16,128}$/
const MCP_CODE_VERIFIER_REGEX = /^[A-Za-z0-9._~\-]{16,128}$/

const mcpProcessedStates = new Set<string>()
const mcpProcessedVerifiers = new Set<string>()

function clearOauthArtifacts(response: NextResponse) {
  response.cookies.set(STORAGE_KEYS.MCP_STATE, '', MCP_ERROR_COOKIE_DEFAULTS)
  response.cookies.set(STORAGE_KEYS.MCP_CODE_VERIFIER, '', MCP_ERROR_COOKIE_DEFAULTS)
}

function clearMcpStateArtifacts(response: NextResponse) {
  clearOauthArtifacts(response)
}

function redirectWithError(req: NextRequest, error: string, requestId: string, details?: Record<string, string>) {
  const url = new URL('/auth/callback', req.url)
  url.searchParams.set('error', error)
  url.searchParams.set('provider', 'mcp')
  url.searchParams.set('request_id', requestId)
  if (details) {
    Object.entries(details).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value)
      }
    })
  }
  const response = NextResponse.redirect(url)
  clearMcpStateArtifacts(response)
  return response
}

export async function GET(req: NextRequest) {
  const requestId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Date.now().toString(36)

  console.info(`[mcp-callback][${requestId}] callback received`, {
    hasCode: !!req.nextUrl.searchParams.get('code'),
    hasState: !!req.nextUrl.searchParams.get('state'),
    path: req.nextUrl.pathname,
  })

  const code = req.nextUrl.searchParams.get('code')?.trim() ?? ''
  const state = req.nextUrl.searchParams.get('state')?.trim() ?? ''
  const artifacts = getMcpArtifactsFromCookieHeader(req.headers.get('cookie') || '')
  const providerError = req.nextUrl.searchParams.get('error')?.trim() ?? ''
  const providerErrorDescription = req.nextUrl.searchParams.get('error_description')?.trim() ?? ''

  if (providerError) {
    console.warn(`[mcp-callback][${requestId}] provider returned error`, {
      providerError,
      providerErrorDescription,
    })
    return redirectWithError(req, 'provider_error', requestId, {
      provider_error: providerError,
      provider_error_description: providerErrorDescription,
    })
  }

  if (!MCP_CONFIG.isConfigured) {
    console.error(`[mcp-callback][${requestId}] MCP config missing`)
    return redirectWithError(req, 'oauth_callback_error', requestId)
  }

  if (!MCP_CONFIG.USERINFO_URL) {
    console.error(`[mcp-callback][${requestId}] MCP userinfo endpoint is not configured`)
    return redirectWithError(req, 'missing_oauth_profile', requestId)
  }

  if (!code || !state) {
    return redirectWithError(req, 'missing_required_params', requestId)
  }

  if (!MCP_STATE_REGEX.test(state) || !/^[A-Za-z0-9._~\-+=/]{8,256}$/.test(code)) {
    console.warn(`[mcp-callback][${requestId}] malformed oauth params`, { stateLength: state.length, codeLength: code.length })
    return redirectWithError(req, 'invalid_oauth_state', requestId)
  }

  if (!artifacts?.state || !artifacts?.codeVerifier) {
    console.warn(`[mcp-callback][${requestId}] oauth artifacts missing`)
    return redirectWithError(req, 'missing_oauth_artifacts', requestId)
  }

  const codeVerifier = artifacts.codeVerifier.trim()
  if (!MCP_CODE_VERIFIER_REGEX.test(codeVerifier)) {
    console.error(
      `[mcp-callback][${requestId}] invalid PKCE code_verifier`,
      {
        state,
        codeLength: codeVerifier.length,
      },
    )
    return redirectWithError(req, 'oauth_callback_error', requestId, {
      provider_error: 'invalid_pkce',
      provider_error_description: 'Invalid PKCE code_verifier',
    })
  }

  if (artifacts.state !== state) {
    console.warn(`[mcp-callback][${requestId}] state mismatch`, {
      expected: artifacts.state,
      received: state,
    })
    return redirectWithError(req, 'invalid_oauth_state', requestId)
  }

  if (artifacts.stateIssuedAt) {
    const stateAgeMs = Date.now() - artifacts.stateIssuedAt
    if (stateAgeMs > 10 * 60 * 1000) {
      console.warn(`[mcp-callback][${requestId}] expired oauth state`, { stateAgeMs })
      return redirectWithError(req, 'expired_oauth_state', requestId)
    }
  }

  if (mcpProcessedVerifiers.has(codeVerifier)) {
    console.warn(`[mcp-callback][${requestId}] duplicate code_verifier`, {
      state,
      codeVerifierLength: codeVerifier.length,
    })
  }

  if (mcpProcessedStates.has(state)) {
    console.warn(`[mcp-callback][${requestId}] duplicate callback`, { state })
    return redirectWithError(req, 'oauth_callback_error', requestId)
  }

  mcpProcessedStates.add(state)
  mcpProcessedVerifiers.add(codeVerifier)
  setTimeout(() => {
    mcpProcessedStates.delete(state)
    mcpProcessedVerifiers.delete(codeVerifier)
  }, 10 * 60 * 1000)

  try {
    const authClient = getSupabaseAdmin() || getSupabaseClient()
    let tokenResponse = await exchangeMcpCodeForToken(code, codeVerifier)

    if (!tokenResponse?.access_token) {
      return redirectWithError(req, 'token_exchange_failed', requestId)
    }

    if (tokenResponse.expires_in && tokenResponse.expires_in < 60) {
      console.warn(`[mcp-callback][${requestId}] short token expiry`, {
        expiresIn: tokenResponse.expires_in,
      })
    }

    let profile = await getMcpUserProfile(tokenResponse.access_token)
    if (!profile && tokenResponse.refresh_token) {
      const refreshedToken = await refreshMcpToken(tokenResponse.refresh_token)
      if (refreshedToken?.access_token) {
        tokenResponse = { ...tokenResponse, ...refreshedToken }
        profile = await getMcpUserProfile(refreshedToken.access_token)
      }
    }

    const tokenPayloadProviderId = tokenResponse.id_token ? decodeJwtPayloadSub(tokenResponse.id_token) : null
    if (!profile && tokenPayloadProviderId) {
      profile = {
        providerUserId: tokenPayloadProviderId,
        externalUserId: tokenPayloadProviderId,
        nickname: 'MCP User',
        email: null,
        profileImage: null,
      }
    }

    if (!profile) {
      return redirectWithError(req, 'missing_oauth_profile', requestId)
    }
    const providerUserId = resolveMcpProviderUserId({ profile, tokenPayloadProviderId })

    if (!providerUserId) {
        return redirectWithError(req, 'missing_provider_user_id', requestId)
    }

    const userUpsertPayload: Record<string, unknown> = {
      auth_provider: 'mcp',
      mcp_user_id: providerUserId,
      mcp_access_token: tokenResponse.access_token,
      mcp_refresh_token: tokenResponse.refresh_token ?? null,
      last_login_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile_image_url: profile?.profileImage ?? null,
    }

    if (profile?.email) {
      userUpsertPayload.email = profile.email
    }
    if (profile?.nickname) {
      userUpsertPayload.nickname = profile.nickname
    }
    if (profile.nickname) {
      userUpsertPayload.name = profile.nickname
    }
    if (profile?.profileImage) {
      userUpsertPayload.profile_image_url = profile.profileImage
    }

    let userId: string | null = null
    let isNewUser = true

    if (authClient) {
      const { data: existingUser, error: existingUserError } = await authClient
        .from('users')
        .select('id')
        .eq('mcp_user_id', providerUserId)
        .maybeSingle()

      if (existingUserError) {
        console.error('[mcp-callback] existing user lookup failed', existingUserError)
        return redirectWithError(req, 'user_sync_failed', requestId, {
          provider_error: 'mcp_user_lookup_failed',
          provider_error_description: existingUserError.message,
        })
      }

      isNewUser = !existingUser?.id

      const { data: user, error: userError } = await authClient
        .from('users')
        .upsert(userUpsertPayload as never, { onConflict: 'mcp_user_id' })
        .select('id')
        .single()

      if (userError) {
        console.error('[mcp-callback] user sync failed', userError)
        return redirectWithError(req, 'user_sync_failed', requestId)
      } else if (user?.id) {
        userId = user.id
        if (isNewUser && profile?.email) {
          const welcomeName = profile.nickname || (profile as { name?: string })?.name || 'New User'
          const welcomeResult = await sendWelcomeEmail(profile.email, welcomeName)
          if (!welcomeResult.success) {
            console.warn('[mcp-callback] Welcome email failed:', welcomeResult.error)
          }
        }
      }
    }

    if (authClient && userId) {
      try {
        const upsertWallet = await authClient.from('jelly_wallets').upsert(
          { user_id: userId },
          {
            onConflict: 'user_id',
          }
        )

        if (upsertWallet.error) {
          console.warn('[mcp-callback] wallet upsert failed, fallback insert', upsertWallet.error)
          const insertWallet = await authClient.from('jelly_wallets').insert({ user_id: userId })

          if (insertWallet.error) {
            console.error('[mcp-callback] wallet insert fallback failed', insertWallet.error)
          }
        }
      } catch (walletError) {
        console.error('[mcp-callback] wallet sync failed', walletError)
      }
    }

    const response = NextResponse.redirect(new URL('/auth/callback', req.url))

    response.cookies.set(
      STORAGE_KEYS.MCP_TOKEN,
      tokenResponse.access_token,
      {
        ...MCP_COOKIE_DEFAULTS,
        maxAge: Number(tokenResponse.expires_in ?? 3600),
      }
    )

    if (tokenResponse.refresh_token) {
      response.cookies.set(
        STORAGE_KEYS.MCP_REFRESH_TOKEN,
        tokenResponse.refresh_token,
        {
          ...MCP_COOKIE_DEFAULTS,
          maxAge: 60 * 60 * 24 * 30,
        }
      )
    }

    response.cookies.set(
      STORAGE_KEYS.USER_DATA,
      JSON.stringify({
        id: userId ?? providerUserId,
        email: profile?.email ?? '',
        name: profile?.nickname ?? (profile as { name?: string })?.name ?? '',
        auth_provider: 'mcp',
        provider_user_id: providerUserId,
      }),
      {
        httpOnly: false,
        sameSite: 'lax',
        secure: ENV.IS_PROD,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      }
    )

    clearMcpStateArtifacts(response)

    return response
  } catch (error) {
    console.error('[mcp-callback] Failed', error)
    return redirectWithError(req, 'oauth_callback_error', requestId)
  }
}
