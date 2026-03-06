import { NextRequest, NextResponse } from 'next/server'
import { refreshMcpToken, STORAGE_KEYS } from '@/lib/auth-mcp'

const MCP_COOKIE_DEFAULTS = {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
}

export async function POST(req: NextRequest) {
    const refreshToken = req.cookies.get(STORAGE_KEYS.MCP_REFRESH_TOKEN)?.value

    if (!refreshToken) {
        return NextResponse.json({ error: 'no_refresh_token' }, { status: 401 })
    }

    try {
        const tokenResponse = await refreshMcpToken(refreshToken)

        if (!tokenResponse?.access_token) {
            return NextResponse.json({ error: 'refresh_failed' }, { status: 400 })
        }

        const response = NextResponse.json({ success: true })
        const expiresIn = tokenResponse.expires_in ?? 3600
        const expiresAt = Date.now() + expiresIn * 1000

        response.cookies.set(STORAGE_KEYS.MCP_TOKEN, tokenResponse.access_token, { ...MCP_COOKIE_DEFAULTS, maxAge: expiresIn })
        response.cookies.set('mcp_expires_at', String(expiresAt), { ...MCP_COOKIE_DEFAULTS, httpOnly: false, maxAge: expiresIn })

        if (tokenResponse.refresh_token) {
            response.cookies.set(STORAGE_KEYS.MCP_REFRESH_TOKEN, tokenResponse.refresh_token, { ...MCP_COOKIE_DEFAULTS, maxAge: 2592000 })
        }

        return response
    } catch (error) {
        console.error('[mcp-refresh] Error:', error)
        return NextResponse.json({ error: 'internal_error' }, { status: 500 })
    }
}
