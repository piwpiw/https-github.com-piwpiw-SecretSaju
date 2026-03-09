import { NextRequest, NextResponse } from 'next/server';
import { STORAGE_KEYS, DATABASE_CONFIG } from '@/config';
import { getSupabaseAdmin } from '@/lib/integrations/supabase';
import { getKakaoUser } from '@/lib/auth/kakao-auth';
import { isMockMode } from '@/lib/app/use-mock';

const ADMIN_EMAILS = new Set(
    (process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.ADMIN_EMAILS || 'piwpiw@naver.com')
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean)
);

export type AuthResult =
    | { user: { id: string; kakaoId: number; email?: string | null; isAdmin?: boolean }; error: null }
    | { user: null; error: NextResponse };

type StorageSessionCookie = { access_token?: string; refresh_token?: string; expires_at?: number };
type SupabaseUserSyncRow = { id: string; is_admin?: boolean | null; email?: string | null };

type CandidateSessionToken = {
    access_token?: string;
} | Array<{ access_token?: string }>;

const SUPPORTED_AUTH_PROVIDERS = new Set(['kakao', 'naver', 'google', 'mcp']);

function mergeAdminState(existing: boolean | null | undefined, granted: boolean): boolean | null {
    if (existing === true) return true;
    if (granted) return true;
    return existing ?? null;
}

function normalizeAdminEmail(email?: string | null) {
    if (!email) return '';
    return String(email).trim().toLowerCase();
}

function shouldGrantAdminEmail(email?: string | null) {
    return ADMIN_EMAILS.has(normalizeAdminEmail(email));
}

function normalizeAuthProvider(provider: unknown): 'kakao' | 'naver' | 'google' | 'mcp' {
    const value = String(provider || '').trim().toLowerCase();
    if (SUPPORTED_AUTH_PROVIDERS.has(value)) {
        return value as 'kakao' | 'naver' | 'google' | 'mcp';
    }
    return 'mcp';
}

function extractMissingColumn(message: string): string | null {
    const normalized = String(message || '');
    const patternA = normalized.match(/Could not find the '([^']+)' column/i);
    if (patternA?.[1]) return patternA[1];
    const patternB = normalized.match(/column\s+users\.([a-zA-Z0-9_]+)\s+does not exist/i);
    if (patternB?.[1]) return patternB[1];
    return null;
}

async function selectUserWithColumnFallback(
    supabase: ReturnType<typeof getSupabaseAdmin>,
    filter: { column: string; value: string | number },
    initialColumns: string[]
) {
    let columns = [...initialColumns];
    while (true) {
        const { data, error } = await supabase
            .from('users')
            .select(columns.join(', '))
            .eq(filter.column, filter.value)
            .maybeSingle();

        if (!error) return { data, error: null, columns };

        const missing = extractMissingColumn(error.message || '');
        if (missing && columns.includes(missing)) {
            columns = columns.filter((col) => col !== missing);
            continue;
        }
        return { data: null, error, columns };
    }
}

async function upsertUserWithColumnFallback(
    supabase: ReturnType<typeof getSupabaseAdmin>,
    payload: Record<string, unknown>,
    onConflict: string
) {
    let workingPayload: Record<string, unknown> = { ...payload };

    while (true) {
        const selectColumns = ['id', 'email', ...(Object.prototype.hasOwnProperty.call(workingPayload, 'is_admin') ? ['is_admin'] : [])];
        const { data, error } = await supabase
            .from('users')
            .upsert(workingPayload, { onConflict })
            .select(selectColumns.join(', '))
            .single();

        if (!error) return { data, error: null, payload: workingPayload };

        const missing = extractMissingColumn(error.message || '');
        if (missing && Object.prototype.hasOwnProperty.call(workingPayload, missing)) {
            delete workingPayload[missing];
            continue;
        }
        if (missing && selectColumns.includes(missing)) {
            continue;
        }
        return { data: null, error, payload: workingPayload };
    }
}

function deriveLegacyKakaoId(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash |= 0;
    }
    const positive = Math.abs(hash);
    return 9_000_000_000 + positive;
}

function resolveSessionToken(parsed: CandidateSessionToken | null): string | null {
    if (!parsed) return null;
    if (Array.isArray(parsed)) {
        const firstToken = parsed[0];
        if (firstToken?.access_token) return firstToken.access_token;
    }
    if (!Array.isArray(parsed) && parsed.access_token) return parsed.access_token;
    return null;
}

function getSupabaseProjectRef(): string | null {
    if (!DATABASE_CONFIG.URL) return null;
    try {
        return new URL(DATABASE_CONFIG.URL).hostname.split('.').shift() || null;
    } catch {
        return null;
    }
}

function parseCookieJSON(value: string | undefined): Record<string, unknown> | null {
    if (!value) return null;
    try {
        return JSON.parse(decodeURIComponent(value)) as Record<string, unknown>;
    } catch {
        try {
            return JSON.parse(value) as Record<string, unknown>;
        } catch {
            return null;
        }
    }
}

function getSessionTokenFromRequest(request: NextRequest): string | null {
    const bearer = request.headers.get('authorization');
    if (bearer?.toLowerCase().startsWith('bearer ')) {
        const token = bearer.slice(7).trim();
        if (token) return token;
    }

    const customSession = parseCookieJSON(request.cookies.get(STORAGE_KEYS.AUTH_SESSION_TOKEN)?.value) as
        | StorageSessionCookie
        | null;
    if (customSession?.access_token) return customSession.access_token;

    const projectRef = getSupabaseProjectRef();
    if (!projectRef) return null;

    const candidates = [
        request.cookies.get(`sb-${projectRef}-auth-token`)?.value,
        request.cookies.get(`sb-${projectRef}-auth-token.0`)?.value,
        request.cookies.get(`sb-${projectRef}-auth-token.1`)?.value,
    ];

    for (const candidate of candidates) {
        const parsed = parseCookieJSON(candidate) as CandidateSessionToken | null;
        const token = resolveSessionToken(parsed);
        if (token) return token;
    }

    return null;
}

async function ensureJellyWallet(supabase: ReturnType<typeof getSupabaseAdmin>, userId: string, isNewUser: boolean) {
    const { data: existingWallet, error: walletLookupError } = await supabase
        .from('jelly_wallets')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

    if (walletLookupError) {
        console.error('[API-AUTH] Wallet lookup failed:', walletLookupError);
        return;
    }

    if (existingWallet?.user_id) {
        return;
    }

    if (isNewUser) {
        const provisionResult = await supabase.rpc('provision_signup_reward', {
            p_user_id: userId,
            p_channel: 'signup',
        });

        if (provisionResult.error) {
            console.error('[API-AUTH] provision_signup_reward failed:', provisionResult.error);
            await supabase
                .from('jelly_wallets')
                .insert({
                    user_id: userId,
                    balance: 10,
                    total_purchased: 10,
                    total_consumed: 0,
                    total_rewarded: 10,
                })
                .catch((walletCreateError: unknown) => console.error('[API-AUTH] Wallet create failed:', walletCreateError));
        }
        return;
    }

    await supabase
        .from('jelly_wallets')
        .insert({ user_id: userId, balance: 0 })
        .catch((walletCreateError: unknown) => console.error('[API-AUTH] Wallet create failed:', walletCreateError));
}

async function syncSupabaseUser(supabase: ReturnType<typeof getSupabaseAdmin>, accessToken: string): Promise<SupabaseUserSyncRow | null> {
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error || !data?.user) return null;

    const sessionUser = data.user;
    const authProvider = normalizeAuthProvider(sessionUser.app_metadata?.provider as string);
    const nickname =
        sessionUser.user_metadata?.nickname ||
        sessionUser.user_metadata?.name ||
        sessionUser.user_metadata?.full_name ||
        sessionUser.email?.split('@')[0] ||
        'member';
    const derivedKakaoId = deriveLegacyKakaoId(sessionUser.id);

    const existingLookup = await selectUserWithColumnFallback(
        supabase,
        { column: 'id', value: sessionUser.id },
        ['id', 'is_admin', 'kakao_id']
    );
    const existingUser = existingLookup.data as { id?: string; is_admin?: boolean | null; kakao_id?: number | null } | null;
    if (existingLookup.error) {
        console.error('[API-AUTH] Existing user lookup failed:', existingLookup.error);
    }

    const isNewUser = !existingUser;
    const shouldSetAdmin = shouldGrantAdminEmail(sessionUser.email);
    const nextAdminState = mergeAdminState(existingUser?.is_admin, shouldSetAdmin);

    const upsertResult = await upsertUserWithColumnFallback(
        supabase,
        {
            id: sessionUser.id,
            kakao_id: existingUser?.kakao_id ?? derivedKakaoId,
            email: sessionUser.email || null,
            name: sessionUser.user_metadata?.name || sessionUser.user_metadata?.full_name || nickname,
            nickname,
            is_admin: nextAdminState,
            auth_provider: authProvider,
            profile_image_url: sessionUser.user_metadata?.avatar_url || null,
            last_login_at: new Date().toISOString(),
        },
        'id'
    );
    const savedUser = upsertResult.data as SupabaseUserSyncRow | null;
    const syncError = upsertResult.error;

    if (syncError || !savedUser) {
        console.error('[API-AUTH] User sync failed:', syncError);
        return null;
    }

    await ensureJellyWallet(supabase, savedUser.id, isNewUser);

    return {
        ...savedUser,
        is_admin: mergeAdminState(savedUser.is_admin, shouldSetAdmin),
    } as SupabaseUserSyncRow;
}

export async function getAuthenticatedUser(request: NextRequest): Promise<AuthResult> {
    const accessToken = request.cookies.get(STORAGE_KEYS.KAKAO_TOKEN)?.value;

    if (isMockMode()) {
        return {
            user: { id: 'mock-user-123', kakaoId: 999999, email: 'admin@example.com', isAdmin: true },
            error: null
        };
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
        return {
            user: null,
            error: NextResponse.json({ error: 'Service Unavailable: Database error' }, { status: 503 })
        };
    }

    if (accessToken) {
        const kakaoUser = await getKakaoUser(accessToken);
        if (!kakaoUser) {
            return {
                user: null,
                error: NextResponse.json({ error: 'Unauthorized: Invalid Kakao session' }, { status: 401 })
            };
        }

        const existingLookup = await selectUserWithColumnFallback(
            supabase,
            { column: 'kakao_id', value: kakaoUser.id },
            ['id', 'is_admin']
        );
        const existingUser = existingLookup.data as { id?: string; is_admin?: boolean | null } | null;
        const existingUserError = existingLookup.error;

        if (existingUserError) {
            console.error('[API-AUTH] Kakao user lookup failed:', existingUserError);
        }

        const shouldSetAdmin = shouldGrantAdminEmail(kakaoUser.kakao_account?.email);
        const nextAdminState = mergeAdminState(existingUser?.is_admin, shouldSetAdmin);
        const isNewKakaoUser = !existingUser;

        const upsertResult = await upsertUserWithColumnFallback(
            supabase,
            {
                kakao_id: kakaoUser.id,
                email: kakaoUser.kakao_account?.email || null,
                name: kakaoUser.kakao_account?.profile?.nickname || 'Kakao User',
                auth_provider: 'kakao',
                profile_image_url: kakaoUser.kakao_account?.profile?.profile_image_url || null,
                is_admin: nextAdminState,
                last_login_at: new Date().toISOString(),
            },
            'kakao_id'
        );
        const user = upsertResult.data as { id: string; is_admin?: boolean | null } | null;
        const userError = upsertResult.error;

        if (userError || !user) {
            console.error('[API-AUTH] User UPSERT Failed:', userError);
            return {
                user: null,
                error: NextResponse.json({ error: 'User sync failed', code: 'USER_SYNC_ERROR' }, { status: 500 })
            };
        }

        await ensureJellyWallet(supabase, user.id, isNewKakaoUser);

        return {
            user: {
                id: user.id,
                kakaoId: kakaoUser.id,
                email: kakaoUser.kakao_account?.email,
                isAdmin: mergeAdminState((user as any).is_admin, shouldSetAdmin) ?? false
            },
            error: null
        };
    }

    const sessionToken = getSessionTokenFromRequest(request);
    if (!sessionToken) {
        return {
            user: null,
            error: NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 })
        };
    }

    const user = await syncSupabaseUser(supabase, sessionToken);
    if (!user) {
        return {
            user: null,
            error: NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 })
        };
    }

    return {
        user: { id: user.id, kakaoId: 0, email: user.email, isAdmin: user.is_admin ?? undefined },
        error: null
    };
}
