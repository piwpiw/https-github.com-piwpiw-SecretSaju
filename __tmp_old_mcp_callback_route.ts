import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeMcpCodeForToken,
  getMcpArtifactsFromCookieHeader,
  getMcpUserProfile,
  refreshMcpToken,
} from '@/lib/auth-mcp';
import { insertNotionRow } from '@/lib/notion';
import { getSupabaseAdmin } from '@/lib/supabase';
import { STORAGE_KEYS } from '@/config';

function safeLogError(context: Record<string, unknown>) {
  insertNotionRow({
    category: 'ERROR',
    title: context.title as string,
    description: context.description as string,
    metadata: context,
  }).catch(() => {});
}

function setCookie(response: NextResponse, name: string, value: string, maxAge?: number) {
  response.cookies.set(name, value, {
    httpOnly: name !== STORAGE_KEYS.USER_DATA,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    ...(maxAge ? { maxAge } : {}),
  });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state') || '';

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  const artifacts =
    getMcpArtifactsFromCookieHeader(request.headers.get('cookie') || '') ||
    ({ state: '', codeVerifier: '' });

  if (!artifacts.codeVerifier) {
    const redirect = NextResponse.redirect(new URL('/?error=no_code_verifier', request.url));
    safeLogError({
      title: 'MCP callback missing code_verifier',
      description: 'OAuth callback did not include PKCE code verifier.',
      code,
      state,
    });
    return redirect;
  }

  if (artifacts.state && state && artifacts.state !== state) {
    const redirect = NextResponse.redirect(new URL('/?error=invalid_state', request.url));
    safeLogError({
      title: 'MCP callback invalid state',
      description: 'OAuth state mismatch. Possible CSRF or callback tampering.',
      code,
      state,
      storedState: artifacts.state,
    });
    return redirect;
  }

  const token = await exchangeMcpCodeForToken(code, artifacts.codeVerifier);
  if (!token) {
    const redirect = NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url));
    safeLogError({
      title: 'MCP token exchange failed',
      description: 'Token endpoint returned failure.',
      state,
      code,
    });
    return redirect;
  }

  const profile = await getMcpUserProfile(token.access_token);
  let profileSource = profile;

  // Refresh once if access token does not include profile and refresh token is present.
  if (!profileSource && token.refresh_token) {
    const refreshed = await refreshMcpToken(token.refresh_token);
    if (refreshed?.access_token) {
      token.access_token = refreshed.access_token;
      token.refresh_token = refreshed.refresh_token || token.refresh_token;
      token.expires_in = refreshed.expires_in;
      profileSource = await getMcpUserProfile(refreshed.access_token);
    }
  }

  let dbUserId: string | undefined;
  const now = new Date().toISOString();
  if (profileSource?.providerUserId && getSupabaseAdmin()) {
    const supabase = getSupabaseAdmin()!;
    const syncPayload = {
      kakao_id: profileSource.providerUserId,
      email: profileSource.email,
      auth_provider: 'mcp',
      mcp_access_token: token.access_token,
      mcp_refresh_token: token.refresh_token || null,
      updated_at: now,
      last_login_at: now,
    };

    const { data: user, error } = await supabase
      .from('users')
      .upsert(syncPayload, { onConflict: 'kakao_id' })
      .select('id')
      .single();

    if (error) {
      safeLogError({
        title: 'MCP DB sync failed',
        description: error.message,
        providerUserId: profileSource.providerUserId,
      });
    } else if (user) {
      dbUserId = (user as { id: string }).id;

      await supabase
        .from('jelly_wallets')
        .insert({ user_id: dbUserId })
        .select()
        .single();
    }
  }

  const redirect = NextResponse.redirect(new URL('/mypage?mcp=ok', request.url));

  setCookie(redirect, STORAGE_KEYS.MCP_TOKEN, token.access_token, token.expires_in || 3600);

  if (token.refresh_token) {
    setCookie(redirect, STORAGE_KEYS.MCP_REFRESH_TOKEN, token.refresh_token, 30 * 24 * 60 * 60);
  }

  const userData = {
    id: dbUserId ? Number.parseInt(dbUserId.replace(/-/g, '').slice(0, 8), 16) || 0 : profileSource?.providerUserId || 0,
    nickname: profileSource?.nickname || 'MCP User',
    email: profileSource?.email || null,
    provider: 'mcp',
    externalId: profileSource?.externalUserId || null,
  };

  setCookie(redirect, STORAGE_KEYS.USER_DATA, JSON.stringify(userData), token.expires_in || 3600);

  insertNotionRow({
    category: 'USER_FEEDBACK',
    title: 'MCP OAuth callback completed',
    description: 'Token exchange and session cookies set.',
    metadata: {
      providerUserId: profileSource?.providerUserId || null,
      hasRefreshToken: Boolean(token.refresh_token),
      state,
    },
  }).catch(() => {});

  return redirect;
}

