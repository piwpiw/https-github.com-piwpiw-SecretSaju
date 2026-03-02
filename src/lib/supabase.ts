/**
 * Supabase Client Configuration
 * 
 * Provides both client-side and server-side Supabase clients
 * with proper authentication handling.
 */

import { createClient } from '@supabase/supabase-js';
import { DATABASE_CONFIG } from '@/config';
import type { Database } from '@/types/database';

// Singletons to avoid multiple client instances in production
let supabaseClient: any = null;
let supabaseAdmin: any = null;
let fallbackPublicClient: any = null;

function createPublicSupabaseClient() {
    if (fallbackPublicClient) return fallbackPublicClient;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
    fallbackPublicClient = createClient(supabaseUrl, supabaseKey);
    return fallbackPublicClient;
}

/**
 * Client-side Supabase client
 * Use in React components (client-side only)
 */
export function getSupabaseClient() {
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
        return createMockSupabase();
    }

    if (supabaseClient) return supabaseClient;

    if (!DATABASE_CONFIG.isConfigured) {
        if (typeof window !== 'undefined') {
            console.warn('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
        }
        return null;
    }

    supabaseClient = createClient(DATABASE_CONFIG.URL, DATABASE_CONFIG.ANON_KEY);
    return supabaseClient;
}

/**
 * Service role client (admin access)
 * Use only in API routes for privileged operations
 * NEVER expose service role key to client
 */
export function getSupabaseAdmin() {
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
        return createMockSupabase();
    }

    if (supabaseAdmin) return supabaseAdmin;

    if (!DATABASE_CONFIG.isConfigured || !DATABASE_CONFIG.SERVICE_ROLE_KEY) {
        const errorMsg = 'Supabase Service Role is not configured properly.';
        console.warn(`[Supabase Admin Error] ${errorMsg}`);
        // mock gracefully instead of throwing in mock mode is already handled above
        return createMockSupabase();
    }

    supabaseAdmin = createClient(
        DATABASE_CONFIG.URL,
        DATABASE_CONFIG.SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
    return supabaseAdmin;
}

// ============================================
// MOCK CLIENT FOR LOCAL TESTING
// ============================================
function createMockSupabase() {
    const MOCK_DB_DELAY_MS = Number(process.env.NEXT_PUBLIC_MOCK_DB_DELAY_MS ?? 0);
    const MOCK_UPSERT_LIMIT = Number(process.env.NEXT_PUBLIC_MOCK_UPSERT_LIMIT ?? 500);
    const ensureId = (table: string, row: Record<string, unknown>) => {
        if (!row.id) {
            row.id = `${table}-${Math.random().toString(36).slice(2, 10)}`;
        }
        return row;
    };
    const state: Record<string, Array<Record<string, unknown>>> = {
        users: [
            {
                id: 'mock-user-123',
                kakao_id: 999999,
                nickname: 'Mock User',
                email: 'mock@secretsaju.com',
                profile_image_url: null,
                auth_provider: 'mcp',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        ],
        saju_profiles: [
            {
                id: 'mock-prof-1',
                user_id: 'mock-user-123',
                name: '홍길동',
                relationship: 'self',
                birthdate: '1990-01-01',
                birth_time: '12:00',
                is_time_unknown: true,
                calendar_type: 'solar',
                gender: 'female',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            {
                id: 'mock-prof-2',
                user_id: 'mock-user-123',
                name: '아들',
                relationship: 'child',
                birthdate: '2010-05-05',
                birth_time: null,
                is_time_unknown: true,
                calendar_type: 'solar',
                gender: 'male',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        ],
        jelly_wallets: [
            {
                id: 'mock-wallet-1',
                user_id: 'mock-user-123',
                balance: 9999,
                total_purchased: 0,
                total_consumed: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        ],
        orders: [],
        inquiries: [],
        unlocks: [],
        jelly_transactions: [],
        rewards: [],
    };

    const createChain = (table: string) => {
        const filters: Array<{ column: string; value: unknown }> = [];
        let currentRows: Record<string, unknown>[] = [...(state[table] || [])];
        let payload: Record<string, unknown> | Record<string, unknown>[] = {};
        let hasSingle = false;
        let selectedColumns: string[] | null = null;
        let operation: 'select' | 'insert' | 'update' | 'delete' = 'select';
        let sortColumn: string | null = null;
        let sortAsc = true;
        let limitCount: number | null = null;
        let conflictColumns: string[] | null = null;
        let mockError: { message: string; code: string } | null = null;

        const getConflictKeys = (item: Record<string, unknown>) => {
            const conflictByTable: Record<string, string[]> = {
                users: ['id', 'mcp_user_id', 'kakao_id'],
                saju_profiles: ['id', 'user_id'],
                jelly_wallets: ['id', 'user_id'],
                jelly_transactions: ['id'],
                orders: ['order_id', 'id'],
                unlocks: ['user_id', 'profile_id', 'section_id'],
                inquiries: ['id'],
                rewards: ['id'],
            };

            if (conflictColumns && conflictColumns.length > 0) {
                return conflictColumns;
            }

            return conflictByTable[table] ?? ['id'];
        };

        const findConflictingIndex = (item: Record<string, unknown>) => {
            const keys = getConflictKeys(item).filter((key) => key in item);
            if (!keys.length) return -1;

            return state[table].findIndex((row) =>
                keys.every((key) => row[key] === item[key])
            );
        };

        const mergeRows = (items: Record<string, unknown>[]) => {
            if (!state[table]) state[table] = [];
            items.forEach((item) => {
                const conflictIdx = findConflictingIndex(item);
                const candidate = ensureId(table, { ...item });
                if (conflictIdx >= 0) {
                    state[table][conflictIdx] = {
                        ...state[table][conflictIdx],
                        ...candidate,
                        updated_at: new Date().toISOString(),
                    };
                    return;
                }
                state[table].push(candidate);
            });
            currentRows = [...state[table]];
            return currentRows;
        };

        const applyFilters = (rows: Array<Record<string, unknown>>) => {
            if (!filters.length) return rows.slice();
            return rows.filter((row) => filters.every((f) => row[f.column] === f.value));
        };

        const applyOrdering = (rows: Array<Record<string, unknown>>) => {
            if (!sortColumn) return rows;
            return rows.slice().sort((a, b) => {
                const av = a[sortColumn!];
                const bv = b[sortColumn!];
                if (av === bv) return 0;
                if (av === undefined) return sortAsc ? 1 : -1;
                if (bv === undefined) return sortAsc ? -1 : 1;
                return String(av).localeCompare(String(bv)) * (sortAsc ? 1 : -1);
            });
        };

        const finalizeResult = () => {
            let rows = applyFilters(currentRows);
            rows = applyOrdering(rows);
            if (limitCount !== null) {
                rows = rows.slice(0, limitCount);
            }
            if (selectedColumns) {
                rows = rows.map((row) => {
                    const projected: Record<string, unknown> = {};
                    selectedColumns!.forEach((col) => {
                        projected[col] = row[col];
                    });
                    return projected;
                });
            }

            if (hasSingle) {
                return rows[0] ?? null;
            }
            return rows;
        };

        const chain: any = {
            select: (columns?: string) => {
                if (columns && columns !== '*') {
                    selectedColumns = columns.split(',').map((c) => c.trim());
                }
                operation = 'select';
                return chain;
            },
            insert: (input: Record<string, unknown> | Record<string, unknown>[]) => {
                operation = 'insert';
                const items = Array.isArray(input) ? input : [input];
                if (items.length > MOCK_UPSERT_LIMIT) {
                    mockError = { code: 'MOCK_UPSERT_LIMIT', message: 'Mock insert limit exceeded' };
                    return chain;
                }
                payload = items.map((item) => ({ ...item, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }));
                const normalized = payload.map((item) => ensureId(table, item as Record<string, unknown>));
                mergeRows(normalized as Record<string, unknown>[]);
                currentRows = [...state[table]];
                return chain;
            },
            upsert: (input: Record<string, unknown> | Record<string, unknown>[], options?: { onConflict?: string }) => {
                operation = 'insert';
                const items = Array.isArray(input) ? input : [input];
                if (items.length > MOCK_UPSERT_LIMIT) {
                    mockError = { code: 'MOCK_UPSERT_LIMIT', message: 'Mock upsert limit exceeded' };
                    return chain;
                }
                conflictColumns = options?.onConflict ? options.onConflict.split(',').map((key) => key.trim()) : null;
                payload = items.map((item) => ({ ...item, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }));
                mergeRows(payload as Record<string, unknown>[]);
                currentRows = [...state[table]];
                return chain;
            },
            update: (input: Record<string, unknown>) => {
                operation = 'update';
                payload = input;
                return chain;
            },
            delete: () => {
                operation = 'delete';
                return chain;
            },
            eq: (column: string, value: unknown) => {
                filters.push({ column, value });
                return chain;
            },
            order: (column: string, opts?: { ascending?: boolean }) => {
                sortColumn = column;
                sortAsc = opts?.ascending !== false;
                return chain;
            },
            limit: (count: number) => {
                limitCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : null;
                return chain;
            },
            single: async () => {
                hasSingle = true;
                const result = finalizeResult();
                return { data: result, error: null };
            },
            then: (resolve: any) => {
                const finalize = () => {
                    if (mockError) {
                        resolve({ data: null, error: mockError });
                        return;
                    }
                    if (operation === 'delete') {
                        const beforeCount = currentRows.length;
                        const nextRows = applyFilters(state[table] || []);
                        if (!state[table]) state[table] = [];
                        state[table] = state[table].filter((row) => !nextRows.includes(row));
                        currentRows = [...state[table]];
                        resolve({ data: beforeCount - currentRows.length, error: null });
                        return;
                    }

                    if (operation === 'update') {
                        const merged = applyFilters(currentRows).map((row) => ({
                            ...row,
                            ...(payload as Record<string, unknown>),
                            updated_at: new Date().toISOString(),
                        }));
                        const tableRows = state[table] || [];
                        state[table] = tableRows.map((row) => {
                            const matched = merged.some((r: any) => r.id === (row as any).id);
                            return matched ? { ...row, ...(payload as Record<string, unknown>), updated_at: new Date().toISOString() } : row;
                        });
                        currentRows = [...state[table]];
                        const result = hasSingle ? state[table].find((row) => filters.every((f) => row[f.column] === f.value)) ?? null : merged;
                        resolve({ data: result, error: null });
                        return;
                    }

                    resolve({
                        data: finalizeResult(),
                        error: null,
                    });
                };

                if (MOCK_DB_DELAY_MS > 0) {
                    setTimeout(finalize, MOCK_DB_DELAY_MS);
                    return;
                }
                finalize();
            },
        };

        return chain;
    };

    return {
        from: (table: string) => createChain(table),
        rpc: async () => ({ data: true, error: null }),
        auth: {
            getSession: async () => ({ data: { session: { user: { id: 'mock-user-123' } } }, error: null }),
            getUser: async () => ({ data: { user: { id: 'mock-user-123' } }, error: null }),
            signInWithOAuth: async () => ({ data: { url: 'http://localhost:3000' }, error: null }),
            signInWithOtp: async ({ email }: { email: string }) => {
                return {
                    data: { user: { id: 'mock-user-123', email } },
                    error: null
                };
            },
            signOut: async () => ({ error: null })
        }
    };
}


// Legacy type exports for backward compatibility
export type UserRow = Database['public']['Tables']['users']['Row'];
export type UnlockLogRow = Database['public']['Tables']['unlocks']['Row'];

export const supabase = createPublicSupabaseClient();


