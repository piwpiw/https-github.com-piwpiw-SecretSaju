export function normalizeCacheSegment(value: string) {
    return String(value)
        .trim()
        .toLowerCase()
        .normalize('NFKC')
        .replace(/[^a-z0-9가-힣-]/g, '_');
}

export function buildCacheKey(...segments: string[]) {
    return segments.map((segment) => normalizeCacheSegment(segment)).join('_');
}
