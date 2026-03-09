"use client";

/**
 * Global Share Utility
 * Creates viral loops by leveraging OS-native Web Share API where available,
 * gracefully falling back to Clipboard API for Desktop browsers.
 */
export async function handleShare(title: string, text: string, url: string): Promise<'shared' | 'copied' | 'failed'> {
    if (typeof navigator !== 'undefined' && navigator.share) {
        try {
            await navigator.share({
                title,
                text,
                url
            });
            return 'shared';
        } catch (error: any) {
            if (error.name === 'AbortError') {
                return 'failed';
            }
            // If share fails for other reasons, fallback
        }
    }

    // Fallback: Clipboard API
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
        try {
            await navigator.clipboard.writeText(`${text} ${url}`.trim());
            return 'copied';
        } catch {
            return 'failed';
        }
    }

    return 'failed';
}
