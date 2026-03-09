import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/config', () => ({
  ENV: { IS_PROD: false },
  MCP_CONFIG: { isConfigured: true },
}));

vi.mock('@/config/constants', () => ({
  STORAGE_KEYS: {
    MCP_STATE: 'mcp_state',
    MCP_CODE_VERIFIER: 'mcp_code_verifier',
    MCP_TOKEN: 'mcp_token',
    MCP_REFRESH_TOKEN: 'mcp_refresh_token',
    USER_DATA: 'user_data',
  },
}));

vi.mock('@/lib/integrations/supabase', () => ({
  getSupabaseAdmin: vi.fn(() => null),
  getSupabaseClient: vi.fn(() => null),
}));

vi.mock('@/lib/integrations/mail', () => ({
  sendWelcomeEmail: vi.fn(),
}));

vi.mock('@/lib/integrations/notion', () => ({
  insertNotionRow: vi.fn(),
}));

vi.mock('@/lib/auth/auth-mcp', () => ({
  exchangeMcpCodeForToken: vi.fn(),
  getMcpArtifactsFromCookieHeader: vi.fn(() => ({
    state: 'ABCDEFGHIJKLMNOP',
    codeVerifier: 'bad verifier!',
  })),
  getMcpUserProfile: vi.fn(),
  refreshMcpToken: vi.fn(),
}));

describe('/api/auth/mcp/callback', () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('rejects invalid PKCE code_verifier with explicit provider error details', async () => {
    const { GET } = await import('@/app/api/auth/mcp/callback/route');

    const request = new NextRequest(
      'http://localhost/api/auth/mcp/callback?code=test-code-12345678&state=ABCDEFGHIJKLMNOP',
      {
        headers: {
          cookie: 'mcp_state=x; mcp_code_verifier=y',
        },
      },
    );

    const response = await GET(request);
    const location = response.headers.get('location');

    expect(response.status).toBe(307);
    expect(location).toContain('/auth/callback');
    expect(location).toContain('error=oauth_callback_error');
    expect(location).toContain('provider=mcp');
    expect(location).toContain('provider_error=invalid_pkce_code_verifier');
    expect(location).toContain('provider_error_description=Invalid+PKCE+code_verifier');
  });
});
