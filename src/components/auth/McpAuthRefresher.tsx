'use client';

import { useEffect } from 'react';

/**
 * McpAuthRefresher: G-14 (Token Buffer Refresh) implementation.
 * Monitors mcp_expires_at cookie and triggers a refresh 5 minutes before expiration.
 */
export default function McpAuthRefresher() {
    useEffect(() => {
        const checkToken = async () => {
            const expiresAtStr = document.cookie
                .split('; ')
                .find(row => row.startsWith('mcp_expires_at='))
                ?.split('=')[1];

            if (!expiresAtStr) return;

            const expiresAt = parseInt(expiresAtStr, 10);
            if (isNaN(expiresAt)) return;

            const now = Date.now();
            const timeRemaining = expiresAt - now;

            // Trigger refresh if less than 5 minutes (300,000ms) left
            if (timeRemaining > 0 && timeRemaining < 300000) {
                console.log('[Auth] Token near expiration, refreshing...');
                try {
                    const res = await fetch('/api/auth/mcp/refresh', { method: 'POST' });
                    if (res.ok) {
                        console.log('[Auth] Token refreshed successfully.');
                    }
                } catch (err) {
                    console.error('[Auth] Token refresh error:', err);
                }
            }
        };

        // Check every minute
        const interval = setInterval(checkToken, 60000);
        checkToken();

        return () => clearInterval(interval);
    }, []);

    return null;
}
