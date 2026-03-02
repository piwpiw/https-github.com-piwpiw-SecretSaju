// TypeScript types for the Ultimate Enterprise Database Schema
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    kakao_id: number | null
                    auth_provider: 'kakao' | 'naver' | 'google' | 'mcp' | null
                    mcp_user_id: string | null
                    mcp_access_token: string | null
                    mcp_refresh_token: string | null
                    email: string | null
                    nickname: string | null
                    name: string | null
                    profile_image_url: string | null
                    is_admin: boolean | null
                    created_at: string
                    updated_at: string
                    last_login_at: string | null
                }
                Insert: {
                    id?: string
                    kakao_id?: number | null
                    auth_provider?: 'kakao' | 'naver' | 'google' | 'mcp' | null
                    mcp_user_id?: string | null
                    mcp_access_token?: string | null
                    mcp_refresh_token?: string | null
                    email?: string | null
                    nickname?: string | null
                    name?: string | null
                    profile_image_url?: string | null
                    is_admin?: boolean | null
                    created_at?: string
                    updated_at?: string
                    last_login_at?: string | null
                }
                Update: {
                    id?: string
                    kakao_id?: number | null
                    auth_provider?: 'kakao' | 'naver' | 'google' | 'mcp' | null
                    mcp_user_id?: string | null
                    mcp_access_token?: string | null
                    mcp_refresh_token?: string | null
                    email?: string | null
                    nickname?: string | null
                    name?: string | null
                    profile_image_url?: string | null
                    is_admin?: boolean | null
                    created_at?: string
                    updated_at?: string
                    last_login_at?: string | null
                }
            }
            saju_profiles: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    relationship: string | null
                    birthdate: string
                    birth_time: string | null
                    is_time_unknown: boolean
                    calendar_type: 'solar' | 'lunar'
                    is_leap_month: boolean
                    gender: 'male' | 'female'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    relationship?: string | null
                    birthdate: string
                    birth_time?: string | null
                    is_time_unknown?: boolean
                    calendar_type: 'solar' | 'lunar'
                    is_leap_month?: boolean
                    gender: 'male' | 'female'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    relationship?: string | null
                    birthdate?: string
                    birth_time?: string | null
                    is_time_unknown?: boolean
                    calendar_type?: 'solar' | 'lunar'
                    is_leap_month?: boolean
                    gender?: 'male' | 'female'
                    created_at?: string
                    updated_at?: string
                }
            }
            jelly_wallets: {
                Row: {
                    user_id: string
                    balance: number
                    total_purchased: number
                    total_consumed: number
                    total_rewarded: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    user_id: string
                    balance?: number
                    total_purchased?: number
                    total_consumed?: number
                    total_rewarded?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    user_id?: string
                    balance?: number
                    total_purchased?: number
                    total_consumed?: number
                    total_rewarded?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            jelly_transactions: {
                Row: {
                    id: string
                    user_id: string
                    type: 'purchase' | 'consume' | 'reward' | 'refund' | 'bonus' | 'gift'
                    jellies: number
                    amount: number | null
                    purpose: string | null
                    metadata: Json
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    type: 'purchase' | 'consume' | 'reward' | 'refund' | 'bonus' | 'gift'
                    jellies: number
                    amount?: number | null
                    purpose?: string | null
                    metadata?: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    type?: 'purchase' | 'consume' | 'reward' | 'refund' | 'bonus' | 'gift'
                    jellies?: number
                    amount?: number | null
                    purpose?: string | null
                    metadata?: Json
                    created_at?: string
                }
            }
            orders: {
                Row: {
                    id: string
                    order_id: string
                    user_id: string
                    package_type: 'TRIAL' | 'SMART' | 'PRO'
                    amount: number
                    jellies: number
                    status: 'pending' | 'completed' | 'failed' | 'refunded'
                    payment_key: string | null
                    metadata: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    order_id: string
                    user_id: string
                    package_type: 'TRIAL' | 'SMART' | 'PRO'
                    amount: number
                    jellies: number
                    status?: 'pending' | 'completed' | 'failed' | 'refunded'
                    payment_key?: string | null
                    metadata?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    order_id?: string
                    user_id?: string
                    package_type?: 'TRIAL' | 'SMART' | 'PRO'
                    amount?: number
                    jellies?: number
                    status?: 'pending' | 'completed' | 'failed' | 'refunded'
                    payment_key?: string | null
                    metadata?: Json
                    created_at?: string
                    updated_at?: string
                }
            }
            animal_archetypes: {
                Row: {
                    code: string
                    animal_name: string
                    persona: Json
                    wealth_analysis: Json
                    love_analysis: Json
                    hidden_truth: Json
                    visual_guide: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    code: string
                    animal_name: string
                    persona?: Json
                    wealth_analysis?: Json
                    love_analysis?: Json
                    hidden_truth?: Json
                    visual_guide?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    code?: string
                    animal_name?: string
                    persona?: Json
                    wealth_analysis?: Json
                    love_analysis?: Json
                    hidden_truth?: Json
                    visual_guide?: Json
                    created_at?: string
                    updated_at?: string
                }
            }
            food_recommendations: {
                Row: {
                    id: string
                    code: string
                    name: string
                    reason: string | null
                    emoji: string | null
                    image_url: string | null
                    target_age_group: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    code: string
                    name: string
                    reason?: string | null
                    emoji?: string | null
                    image_url?: string | null
                    target_age_group?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    code?: string
                    name?: string
                    reason?: string | null
                    emoji?: string | null
                    image_url?: string | null
                    target_age_group?: string | null
                    created_at?: string
                }
            }
            product_recommendations: {
                Row: {
                    id: string
                    code: string
                    name: string
                    reason: string | null
                    emoji: string | null
                    price_range: string | null
                    affiliate_url: string | null
                    image_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    code: string
                    name: string
                    reason?: string | null
                    emoji?: string | null
                    price_range?: string | null
                    affiliate_url?: string | null
                    image_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    code?: string
                    name?: string
                    reason?: string | null
                    emoji?: string | null
                    price_range?: string | null
                    affiliate_url?: string | null
                    image_url?: string | null
                    created_at?: string
                }
            }
            daily_fortunes: {
                Row: {
                    id: string
                    pillar_code: string
                    fortune_date: string
                    message: string
                    lucky_color: string | null
                    lucky_number: number | null
                    score: number | null
                }
                Insert: {
                    id?: string
                    pillar_code: string
                    fortune_date?: string
                    message: string
                    lucky_color?: string | null
                    lucky_number?: number | null
                    score?: number | null
                }
                Update: {
                    id?: string
                    pillar_code?: string
                    fortune_date?: string
                    message?: string
                    lucky_color?: string | null
                    lucky_number?: number | null
                    score?: number | null
                }
            }
            campaigns: {
                Row: {
                    id: string
                    source: string
                    external_id: string | null
                    title: string
                    image_url: string | null
                    landing_url: string
                    description: string | null
                    reward_info: string | null
                    category: string | null
                    end_date: string | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    source: string
                    external_id?: string | null
                    title: string
                    image_url?: string | null
                    landing_url: string
                    description?: string | null
                    reward_info?: string | null
                    category?: string | null
                    end_date?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    source?: string
                    external_id?: string | null
                    title?: string
                    image_url?: string | null
                    landing_url?: string
                    description?: string | null
                    reward_info?: string | null
                    category?: string | null
                    end_date?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            analysis_logs: {
                Row: {
                    id: string
                    user_id: string | null
                    profile_id: string | null
                    topic: string
                    input_params: Json
                    result_data: Json
                    is_premium: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    profile_id?: string | null
                    topic: string
                    input_params?: Json
                    result_data?: Json
                    is_premium?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    profile_id?: string | null
                    topic?: string
                    input_params?: Json
                    result_data?: Json
                    is_premium?: boolean
                    created_at?: string
                }
            }
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
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            deduct_jellies: {
                Args: {
                    p_user_id: string
                    p_amount: number
                    p_purpose: string
                    p_metadata?: Json
                }
                Returns: number
            }
        }
        Enums: {
            [_ in never]: never
        }
    }
}
