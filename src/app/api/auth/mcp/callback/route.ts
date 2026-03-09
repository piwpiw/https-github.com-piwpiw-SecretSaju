import { NextRequest, NextResponse } from 'next/server'

import { ENV, MCP_CONFIG } from '@/config'
import { STORAGE_KEYS } from '@/config/constants'
import { getSupabaseAdmin, getSupabaseClient } from '@/lib/integrations/supabase'
import { sendWelcomeEmail } from '@/lib/integrations/mail'
import {
  exchangeMcpCodeForToken,
  getMcpArtifactsFromCookieHeader,
  getMcpUserProfile,
  refreshMcpToken,
} from '@/lib/auth/auth-mcp'

import { insertNotionRow } from '@/lib/integrations/notion'

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

  console.info(`[MCP:AUTH_CALLBACK][${requestId}] Request start`, {
    timestamp: new Date().toISOString(),
    url: req.url,
  })

  const code = req.nextUrl.searchParams.get('code')?.trim() ?? ''
  const state = req.nextUrl.searchParams.get('state')?.trim() ?? ''
  const artifacts = getMcpArtifactsFromCookieHeader(req.headers.get('cookie') || '')
  const providerError = req.nextUrl.searchParams.get('error')?.trim() ?? ''
  const providerErrorDescription = req.nextUrl.searchParams.get('error_description')?.trim() ?? ''

  if (providerError) {
    return redirectWithError(req, 'provider_error', requestId, {
      provider_error: providerError,
      provider_error_description: providerErrorDescription,
    })
  }

  if (!MCP_CONFIG.isConfigured || !code || !state || !artifacts) {
    return redirectWithError(req, 'oauth_callback_error', requestId, {
      provider_error: 'missing_required_params',
      provider_error_description: 'Missing OAuth code, state, or PKCE artifacts',
    })
  }

  if (!MCP_STATE_REGEX.test(state) || !MCP_STATE_REGEX.test(artifacts.state)) {
    return redirectWithError(req, 'invalid_oauth_state', requestId, {
      provider_error: 'invalid_oauth_state',
      provider_error_description: 'OAuth state format invalid',
    })
  }

  if (!MCP_CODE_VERIFIER_REGEX.test(artifacts.codeVerifier)) {
    console.error('[mcp-callback] invalid PKCE code_verifier', { requestId })
    return redirectWithError(req, 'oauth_callback_error', requestId, {
      provider_error: 'invalid_pkce_code_verifier',
      provider_error_description: 'Invalid PKCE code_verifier',
    })
  }

  if (artifacts.state !== state) {
    return redirectWithError(req, 'invalid_oauth_state', requestId, {
      provider_error: 'invalid_oauth_state',
      provider_error_description: 'OAuth state mismatch',
    })
  }

  if (mcpProcessedStates.has(state)) {
    return redirectWithError(req, 'oauth_callback_error', requestId, {
      provider_error: 'duplicate_state',
      provider_error_description: 'OAuth state already processed',
    })
  }

  if (mcpProcessedVerifiers.has(artifacts.codeVerifier)) {
    return redirectWithError(req, 'oauth_callback_error', requestId, {
      provider_error: 'duplicate_code_verifier',
      provider_error_description: 'PKCE code_verifier already processed',
    })
  }

  mcpProcessedStates.add(state)
  mcpProcessedVerifiers.add(artifacts.codeVerifier)
  setTimeout(() => mcpProcessedStates.delete(state), 10 * 60 * 1000)
  setTimeout(() => mcpProcessedVerifiers.delete(artifacts.codeVerifier), 10 * 60 * 1000)

  try {
    const authClient = getSupabaseAdmin() || getSupabaseClient()
    let tokenResponse = await exchangeMcpCodeForToken(code, artifacts.codeVerifier)

    if (!tokenResponse?.access_token) {
      return redirectWithError(req, 'token_exchange_failed', requestId, {
        provider_error: 'token_exchange_failed',
        provider_error_description: 'Failed to exchange authorization code',
      })
    }

    let profile = await getMcpUserProfile(tokenResponse.access_token)
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

    if (!profile) return redirectWithError(req, 'missing_oauth_profile', requestId, {
      provider_error: 'missing_oauth_profile',
      provider_error_description: 'Could not fetch user profile from provider',
    })

    const providerUserId = resolveMcpProviderUserId({ profile, tokenPayloadProviderId })
    if (!providerUserId) return redirectWithError(req, 'missing_provider_user_id', requestId, {
      provider_error: 'missing_provider_user_id',
      provider_error_description: 'Provider user ID could not be resolved',
    })

    const userUpsertPayload = {
      auth_provider: 'mcp',
      mcp_user_id: providerUserId,
      mcp_access_token: tokenResponse.access_token,
      mcp_refresh_token: tokenResponse.refresh_token ?? null,
      nickname: profile.nickname,
      email: (profile as any).email || null,
      profile_image_url: (profile as any).profileImage || null,
      last_login_at: new Date().toISOString(),
    }

    let userId: string | null = null
    let isNewUser = true

    if (authClient) {
      const { data: existingUser } = await authClient
        .from('users')
        .select('id')
        .eq('mcp_user_id', providerUserId)
        .maybeSingle()

      isNewUser = !existingUser?.id

      const { data: user, error: userError } = await authClient
        .from('users')
        .upsert(userUpsertPayload as never, { onConflict: 'mcp_user_id' })
        .select('id')
        .single()

      if (userError) throw userError
      userId = user?.id || null

      if (userId) {
        // Non-blocking secondary tasks
        if (isNewUser && (profile as any).email) {
          sendWelcomeEmail((profile as any).email, profile.nickname).catch(console.error)
        }
        insertNotionRow({
          category: 'AUTH_EVENT',
          title: `MCP Login: ${profile.nickname}`,
          description: `User ${isNewUser ? 'registered' : 'logged in'} via MCP.`,
          metadata: { userId, providerUserId, requestId }
        }).catch(console.error)

        // Wallet sync & Signup Reward (G-13)
        await authClient.from('jelly_wallets').upsert({ user_id: userId }, { onConflict: 'user_id' }).catch(console.error)
        if (isNewUser) {
          await authClient.rpc('provision_signup_reward', { p_user_id: userId, p_channel: 'mcp' }).catch((e: any) => console.error('[mcp-callback] Reward error:', e))
        }
      }
    }

    const response = NextResponse.redirect(new URL('/auth/callback', req.url))
    const expiresIn = tokenResponse.expires_in ?? 3600
    const expiresAt = Date.now() + expiresIn * 1000

    response.cookies.set(STORAGE_KEYS.MCP_TOKEN, tokenResponse.access_token, { ...MCP_COOKIE_DEFAULTS, maxAge: expiresIn })
    response.cookies.set('mcp_expires_at', String(expiresAt), { ...MCP_COOKIE_DEFAULTS, httpOnly: false, maxAge: expiresIn })

    if (tokenResponse.refresh_token) {
      response.cookies.set(STORAGE_KEYS.MCP_REFRESH_TOKEN, tokenResponse.refresh_token, { ...MCP_COOKIE_DEFAULTS, maxAge: 2592000 })
    }

    response.cookies.set(STORAGE_KEYS.USER_DATA, JSON.stringify({
      id: userId ?? providerUserId,
      nickname: profile.nickname,
      auth_provider: 'mcp',
      provider_user_id: providerUserId,
    }), { ...MCP_COOKIE_DEFAULTS, httpOnly: false, maxAge: 604800 })

    clearMcpStateArtifacts(response)
    return response

  } catch (error) {
    mcpProcessedStates.delete(state)
    mcpProcessedVerifiers.delete(artifacts.codeVerifier)
    console.error('[mcp-callback] Failed', error)
    return redirectWithError(req, 'oauth_callback_error', requestId, {
      provider_error: 'oauth_callback_error',
      provider_error_description: error instanceof Error ? error.message : 'Unknown OAuth callback error',
    })
  }
}
