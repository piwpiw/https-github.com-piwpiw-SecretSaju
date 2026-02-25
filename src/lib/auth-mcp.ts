/**
 * MCP OAuth 2.1 Authentication Module
 * 
 * Implements Authorization Code Flow with PKCE (Proof Key for Code Exchange)
 * for Model Context Protocol (MCP) or general OAuth 2.1 compliance.
 */

import { STORAGE_KEYS } from '@/config';

export interface McpTokenResponse {
    access_token: string;
    refresh_token?: string;
    token_type: string;
    expires_in: number;
}

// Configuration for MCP Provider
const MCP_CONFIG = {
    CLIENT_ID: process.env.NEXT_PUBLIC_MCP_CLIENT_ID || 'mock_mcp_client',
    AUTH_URL: process.env.NEXT_PUBLIC_MCP_AUTH_URL || 'https://mcp.saju.example.com/oauth/authorize',
    TOKEN_URL: process.env.NEXT_PUBLIC_MCP_TOKEN_URL || 'https://mcp.saju.example.com/oauth/token',
    REDIRECT_URI: typeof window !== 'undefined' ? `${window.location.origin}/auth/mcp/callback` : '',
};

/**
 * Generates a random string for code verifier
 */
function generateRandomString(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    const randomValues = new Uint32Array(length);
    if (typeof window !== 'undefined' && window.crypto) {
        window.crypto.getRandomValues(randomValues);
        for (let i = 0; i < length; i++) {
            result += charset[randomValues[i] % charset.length];
        }
    } else {
        // Fallback for SSR
        for (let i = 0; i < length; i++) {
            result += charset[Math.floor(Math.random() * charset.length)];
        }
    }
    return result;
}

/**
 * Create SHA-256 hash
 */
async function generateCodeChallenge(codeVerifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const buffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(buffer));
    const base64Digest = btoa(String.fromCharCode(...hashArray))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    return base64Digest;
}

/**
 * Initiates the MCP OAuth 2.1 PKCE login flow.
 */
export async function initiateMcpLogin() {
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
        console.log('[MOCK] Bypassing MCP OAuth 2.1 Login');
        document.cookie = `${STORAGE_KEYS.USER_DATA}=${encodeURIComponent(JSON.stringify({ id: 999999, nickname: 'MCP 테스트 유저', provider: 'mcp' }))}; path=/; max-age=86400`;
        window.location.href = '/dashboard';
        return;
    }

    const codeVerifier = generateRandomString(128);
    const state = generateRandomString(32);

    // Save verifier to session storage for the callback phase
    sessionStorage.setItem('mcp_code_verifier', codeVerifier);
    sessionStorage.setItem('mcp_oauth_state', state);

    const codeChallenge = await generateCodeChallenge(codeVerifier);

    const params = new URLSearchParams({
        client_id: MCP_CONFIG.CLIENT_ID,
        redirect_uri: MCP_CONFIG.REDIRECT_URI,
        response_type: 'code',
        scope: 'openid profile email',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state: state
    });

    // Redirect to authorization server
    window.location.href = `${MCP_CONFIG.AUTH_URL}?${params.toString()}`;
}

/**
 * Validates the authorization code and exchanges it for tokens (Server Side or Next.js Route Handler).
 */
export async function exchangeMcpCodeForToken(code: string, codeVerifier: string): Promise<McpTokenResponse | null> {
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
        return {
            access_token: 'mock_mcp_access_token',
            refresh_token: 'mock_mcp_refresh_token',
            token_type: 'Bearer',
            expires_in: 3600
        };
    }

    try {
        const response = await fetch(MCP_CONFIG.TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: MCP_CONFIG.CLIENT_ID,
                redirect_uri: MCP_CONFIG.REDIRECT_URI,
                code: code,
                code_verifier: codeVerifier
            }),
        });

        if (!response.ok) {
            throw new Error(`Token exchange failed: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[MCP] Token Exchange Error:', error);
        return null;
    }
}
