import { getSupabaseAdmin } from './supabase';

/**
 * Deducts jelly from user's wallet and records transaction.
 * @param userId - Supabase User UUID
 * @param amount - Number of jellies to deduct
 * @param purpose - Description of consumption
 * @param metadata - Optional JSON metadata
 * @returns Object indicating success or failure
 */
export async function deductJelly(
    userId: string,
    amount: number,
    purpose: string,
    metadata: any = {}
) {
    const supabase = getSupabaseAdmin();
    if (!supabase) throw new Error('Supabase admin not configured');

    // 1. Check balance (Atomic check would be better but let's do a transaction-like flow)
    const { data: wallet, error: fetchError } = await supabase
        .from('jelly_wallets')
        .select('balance')
        .eq('user_id', userId)
        .single();

    if (fetchError || !wallet) {
        return { success: false, error: 'Wallet not found' };
    }

    if (wallet.balance < amount) {
        return { success: false, error: 'Insufficient jellies', currentBalance: wallet.balance };
    }

    // 2. Perform deduction and transaction recording in a transaction
    // Using Supabase RPC is safest for atomic decrements
    // But for now, we'll use a standard update and insert

    // We'll use RPC for atomicity to prevent double-spend
    // Function signature: deduct_jellies(p_user_id uuid, p_amount int, p_purpose text, p_metadata jsonb)
    const { data, error: rpcError } = await supabase.rpc('deduct_jellies', {
        p_user_id: userId,
        p_amount: amount,
        p_purpose: purpose,
        p_metadata: metadata
    });

    if (rpcError) {
        console.error('[WALLET-SERVER] RPC Deduction Error:', rpcError);
        return { success: false, error: rpcError.message };
    }

    return { success: true, remainingBalance: data };
}
