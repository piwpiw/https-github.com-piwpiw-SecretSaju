-- Atomic Jelly Deduction Function
-- This ensures that balance check and deduction happen in a single transaction
-- Prevents double-spending and race conditions

CREATE OR REPLACE FUNCTION deduct_jellies(
    p_user_id UUID,
    p_amount INTEGER,
    p_purpose TEXT,
    p_metadata JSONB DEFAULT '{}'
) RETURNS INTEGER AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- 1. Get current balance with row-level locking
    SELECT balance INTO v_current_balance
    FROM jelly_wallets
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
    END IF;

    -- 2. Check sufficiency
    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient jellies balance: current %, required %', v_current_balance, p_amount;
    END IF;

    -- 3. Update balance
    v_new_balance := v_current_balance - p_amount;
    
    UPDATE jelly_wallets
    SET 
        balance = v_new_balance,
        total_consumed = total_consumed + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- 4. Record transaction
    INSERT INTO jelly_transactions (
        user_id,
        type,
        amount,
        jellies,
        purpose,
        metadata,
        created_at
    ) VALUES (
        p_user_id,
        'consume',
        0, -- Purchase cost is 0 for consumption
        p_amount,
        p_purpose,
        p_metadata,
        NOW()
    );

    RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
