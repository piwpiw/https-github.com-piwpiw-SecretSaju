-- Migration: V1.0 Upgrade - Admin, Calendar, Wallet, and Donation Support
-- Date: 2026-03-01

-- 1. Add admin role to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Create jelly_wallets table (referenced by /api/wallet/balance)
CREATE TABLE IF NOT EXISTS jelly_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create wallet_transactions table for audit trail
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_id UUID REFERENCES jelly_wallets(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn', 'spend', 'refund', 'admin_grant')),
  description TEXT,
  reference_id TEXT,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES saju_profiles(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  score INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_date, event_type, profile_id)
);

-- 5. Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL CHECK (amount >= 1000),
  message TEXT,
  payment_key TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 6. Enable RLS
ALTER TABLE jelly_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Wallet RLS policies
CREATE POLICY "Users can view own wallet" ON jelly_wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Calendar RLS
CREATE POLICY "Users can manage own calendar events" ON calendar_events
  FOR ALL USING (auth.uid() = user_id);

-- Donations RLS
CREATE POLICY "Users can view own donations" ON donations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public can view completed donation messages" ON donations
  FOR SELECT USING (status = 'completed' AND is_public = TRUE);

-- 7. Performance indexes
CREATE INDEX IF NOT EXISTS idx_jelly_wallets_user_id ON jelly_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created ON wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date ON calendar_events(user_id, event_date);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);

-- 8. Auto-create wallet trigger on user insert
CREATE OR REPLACE FUNCTION create_wallet_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO jelly_wallets (user_id, balance)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created_create_wallet ON users;
CREATE TRIGGER on_user_created_create_wallet
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_wallet_for_new_user();
