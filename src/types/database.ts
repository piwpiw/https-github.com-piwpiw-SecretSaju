// TypeScript types for MVP database schema
// Auto-generated from Supabase schema.sql

export type Database = {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    kakao_id: number;
                    email: string | null;
                    name: string | null;
                    profile_image: string | null;
                    created_at: string;
                    last_login_at: string;
                };
                Insert: {
                    id?: string;
                    kakao_id: number;
                    email?: string | null;
                    name?: string | null;
                    profile_image?: string | null;
                    created_at?: string;
                    last_login_at?: string;
                };
                Update: {
                    id?: string;
                    kakao_id?: number;
                    email?: string | null;
                    name?: string | null;
                    profile_image?: string | null;
                    created_at?: string;
                    last_login_at?: string;
                };
            };
            saju_profiles: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    relationship: string | null;
                    birth_date: string;
                    birth_time: string | null;
                    is_time_unknown: boolean;
                    calendar_type: 'solar' | 'lunar';
                    gender: 'male' | 'female';
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    name: string;
                    relationship?: string | null;
                    birth_date: string;
                    birth_time?: string | null;
                    is_time_unknown?: boolean;
                    calendar_type: 'solar' | 'lunar';
                    gender: 'male' | 'female';
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    name?: string;
                    relationship?: string | null;
                    birth_date?: string;
                    birth_time?: string | null;
                    is_time_unknown?: boolean;
                    calendar_type?: 'solar' | 'lunar';
                    gender?: 'male' | 'female';
                    created_at?: string;
                };
            };
            jelly_wallets: {
                Row: {
                    user_id: string;
                    balance: number;
                    total_purchased: number;
                    total_consumed: number;
                    total_rewarded: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    user_id: string;
                    balance?: number;
                    total_purchased?: number;
                    total_consumed?: number;
                    total_rewarded?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    user_id?: string;
                    balance?: number;
                    total_purchased?: number;
                    total_consumed?: number;
                    total_rewarded?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            jelly_transactions: {
                Row: {
                    id: string;
                    user_id: string;
                    type: 'purchase' | 'consume' | 'reward' | 'refund' | 'bonus';
                    jellies: number;
                    amount: number | null;
                    purpose: string | null;
                    metadata: Record<string, any>;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    type: 'purchase' | 'consume' | 'reward' | 'refund' | 'bonus';
                    jellies: number;
                    amount?: number | null;
                    purpose?: string | null;
                    metadata?: Record<string, any>;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    type?: 'purchase' | 'consume' | 'reward' | 'refund' | 'bonus';
                    jellies?: number;
                    amount?: number | null;
                    purpose?: string | null;
                    metadata?: Record<string, any>;
                    created_at?: string;
                };
            };
            unlocks: {
                Row: {
                    id: string;
                    user_id: string;
                    profile_id: string;
                    feature: 'detailed_analysis' | 'compatibility' | 'celebrity_match';
                    jellies_spent: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    profile_id: string;
                    feature: 'detailed_analysis' | 'compatibility' | 'celebrity_match';
                    jellies_spent: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    profile_id?: string;
                    feature?: 'detailed_analysis' | 'compatibility' | 'celebrity_match';
                    jellies_spent?: number;
                    created_at?: string;
                };
            };
            referrals: {
                Row: {
                    id: string;
                    referrer_user_id: string;
                    referred_user_id: string | null;
                    referral_code: string;
                    reward_claimed: boolean;
                    referrer_reward_jellies: number;
                    referred_reward_jellies: number;
                    created_at: string;
                    claimed_at: string | null;
                };
                Insert: {
                    id?: string;
                    referrer_user_id: string;
                    referred_user_id?: string | null;
                    referral_code: string;
                    reward_claimed?: boolean;
                    referrer_reward_jellies?: number;
                    referred_reward_jellies?: number;
                    created_at?: string;
                    claimed_at?: string | null;
                };
                Update: {
                    id?: string;
                    referrer_user_id?: string;
                    referred_user_id?: string | null;
                    referral_code?: string;
                    reward_claimed?: boolean;
                    referrer_reward_jellies?: number;
                    referred_reward_jellies?: number;
                    created_at?: string;
                    claimed_at?: string | null;
                };
            };
            rewards: {
                Row: {
                    id: string;
                    user_id: string;
                    reward_type: 'signup' | 'first_saju' | 'profile_save' | 'referral_success' | 'first_purchase' | 'review';
                    jellies: number;
                    metadata: Record<string, any>;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    reward_type: 'signup' | 'first_saju' | 'profile_save' | 'referral_success' | 'first_purchase' | 'review';
                    jellies: number;
                    metadata?: Record<string, any>;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    reward_type?: 'signup' | 'first_saju' | 'profile_save' | 'referral_success' | 'first_purchase' | 'review';
                    jellies?: number;
                    metadata?: Record<string, any>;
                    created_at?: string;
                };
            };
            inquiries: {
                Row: {
                    id: string;
                    user_id: string | null;
                    email: string | null;
                    category: 'payment' | 'bug' | 'feature' | 'account' | 'other' | null;
                    subject: string;
                    message: string;
                    status: 'pending' | 'answered' | 'closed';
                    admin_response: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    email?: string | null;
                    category?: 'payment' | 'bug' | 'feature' | 'account' | 'other' | null;
                    subject: string;
                    message: string;
                    status?: 'pending' | 'answered' | 'closed';
                    admin_response?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string | null;
                    email?: string | null;
                    category?: 'payment' | 'bug' | 'feature' | 'account' | 'other' | null;
                    subject?: string;
                    message?: string;
                    status?: 'pending' | 'answered' | 'closed';
                    admin_response?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
        Views: {};
        Functions: {};
        Enums: {};
    };
};
