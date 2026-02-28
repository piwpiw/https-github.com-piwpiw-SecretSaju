/**
 * Supabase Client Configuration
 * 
 * Provides both client-side and server-side Supabase clients
 * with proper authentication handling.
 */

import { createClient } from '@supabase/supabase-js';
import { DATABASE_CONFIG } from '@/config';

// Singletons to avoid multiple client instances in production
let supabaseClient: any = null;
let supabaseAdmin: any = null;

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
    const createChain = (table: string) => {
        const chain: any = {
            select: () => chain,
            insert: () => chain,
            update: () => chain,
            delete: () => chain,
            eq: () => chain,
            order: () => chain,
            limit: () => chain,
            single: async () => ({
                data: table === 'jelly_wallets' ? { balance: 9999 } :
                    table === 'users' ? { id: 'mock-user-123', kakao_id: 999999 } :
                        table === 'saju_profiles' ? { id: 'mock-prof-1', name: '테스트 사주', relationship: 'self', birthdate: '1990-01-01', gender: 'female', calendar_type: 'solar' } :
                            { id: 'mock-id' },
                error: null
            }),
            then: (resolve: any) => resolve({
                data: table === 'saju_profiles' ? [
                    {
                        id: 'mock-prof-1',
                        name: '테스트 가족 사주',
                        relationship: 'child',
                        birthdate: '2010-05-05',
                        gender: 'male',
                        calendar_type: 'solar',
                        is_time_unknown: true,
                        birth_time: null
                    }
                ] : table === 'orders' ? [] : table === 'users' ? [{ id: 'mock-user-123' }] : [],
                error: null
            })
        };
        return chain;
    };

    return {
        from: (table: string) => createChain(table),
        auth: {
            getSession: async () => ({ data: { session: { user: { id: 'mock-user-123' } } }, error: null }),
            getUser: async () => ({ data: { user: { id: 'mock-user-123' } }, error: null }),
            signInWithOAuth: async () => ({ data: { url: 'http://localhost:3000' }, error: null }),
            signOut: async () => ({ error: null })
        }
    };
}

/**
 * Database Types
 * Generated from Supabase schema
 */
export type Database = {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    kakao_id: number;
                    nickname: string;
                    email: string | null;
                    profile_image_url: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    kakao_id: number;
                    nickname: string;
                    email?: string | null;
                    profile_image_url?: string | null;
                };
                Update: {
                    nickname?: string;
                    email?: string | null;
                    profile_image_url?: string | null;
                };
            };
            jelly_wallets: {
                Row: {
                    id: string;
                    user_id: string;
                    balance: number;
                    total_purchased: number;
                    total_consumed: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    user_id: string;
                    balance?: number;
                    total_purchased?: number;
                    total_consumed?: number;
                };
                Update: {
                    balance?: number;
                    total_purchased?: number;
                    total_consumed?: number;
                };
            };
            jelly_transactions: {
                Row: {
                    id: string;
                    user_id: string;
                    type: 'purchase' | 'consume' | 'gift';
                    amount: number;
                    jellies: number;
                    purpose: string;
                    metadata: Record<string, any>;
                    payment_id: string | null;
                    created_at: string;
                };
                Insert: {
                    user_id: string;
                    type: 'purchase' | 'consume' | 'gift';
                    amount: number;
                    jellies: number;
                    purpose: string;
                    metadata?: Record<string, any>;
                    payment_id?: string | null;
                };
            };
            saju_profiles: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    relationship: 'self' | 'spouse' | 'child' | 'parent' | 'friend' | 'lover' | 'other';
                    birthdate: string;
                    birth_time: string | null;
                    is_time_unknown: boolean;
                    calendar_type: 'solar' | 'lunar';
                    gender: 'female' | 'male';
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    user_id: string;
                    name: string;
                    relationship: 'self' | 'spouse' | 'child' | 'parent' | 'friend' | 'lover' | 'other';
                    birthdate: string;
                    birth_time?: string | null;
                    is_time_unknown?: boolean;
                    calendar_type: 'solar' | 'lunar';
                    gender: 'female' | 'male';
                };
                Update: {
                    name?: string;
                    relationship?: 'self' | 'spouse' | 'child' | 'parent' | 'friend' | 'lover' | 'other';
                    birthdate?: string;
                    birth_time?: string | null;
                    is_time_unknown?: boolean;
                    calendar_type?: 'solar' | 'lunar';
                    gender?: 'female' | 'male';
                };
            };
            unlocks: {
                Row: {
                    id: string;
                    user_id: string;
                    profile_id: string | null;
                    section_id: string | null;
                    jellies_spent: number;
                    unlocked_at: string;
                };
                Insert: {
                    user_id: string;
                    profile_id?: string | null;
                    section_id?: string | null;
                    jellies_spent: number;
                };
            };
            inquiries: {
                Row: {
                    id: string;
                    user_id: string;
                    category: 'error' | 'feedback' | 'review' | 'refund' | 'convert';
                    subject: string;
                    message: string;
                    status: 'pending' | 'in_progress' | 'resolved' | 'closed';
                    admin_response: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    user_id: string;
                    category: 'error' | 'feedback' | 'review' | 'refund' | 'convert';
                    subject: string;
                    message: string;
                    status?: 'pending' | 'in_progress' | 'resolved' | 'closed';
                };
                Update: {
                    status?: 'pending' | 'in_progress' | 'resolved' | 'closed';
                    admin_response?: string | null;
                };
            };
            orders: {
                Row: {
                    id: string;
                    order_id: string;
                    user_id: string;
                    package_type: 'TRIAL' | 'SMART' | 'PRO';
                    amount: number;
                    jellies: number;
                    status: 'pending' | 'completed' | 'failed' | 'refunded';
                    payment_key: string | null;
                    metadata: Record<string, any>;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    order_id: string;
                    user_id: string;
                    package_type: 'TRIAL' | 'SMART' | 'PRO';
                    amount: number;
                    jellies: number;
                    status?: 'pending' | 'completed' | 'failed' | 'refunded';
                    payment_key?: string | null;
                    metadata?: Record<string, any>;
                };
                Update: {
                    status?: 'pending' | 'completed' | 'failed' | 'refunded';
                    payment_key?: string | null;
                    updated_at?: string;
                };
            };
        };
    };
};

// Legacy type exports for backward compatibility
export type UserRow = Database['public']['Tables']['users']['Row'];
export type UnlockLogRow = Database['public']['Tables']['unlocks']['Row'];

// create a single Supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);
