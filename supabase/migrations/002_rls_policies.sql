-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
-- Migration: 002_rls_policies
-- Created: 2026-01-31

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jelly_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE jelly_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saju_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- JELLY WALLETS POLICIES
-- ============================================
-- Users can view their own wallet
CREATE POLICY "Users can view own wallet"
  ON jelly_wallets FOR SELECT
  USING (user_id = auth.uid());

-- Only service role can update wallets (prevents client-side manipulation)
-- Client updates go through API routes with service role

-- ============================================
-- JELLY TRANSACTIONS POLICIES
-- ============================================
-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON jelly_transactions FOR SELECT
  USING (user_id = auth.uid());

-- Only service role can insert transactions

-- ============================================
-- SAJU PROFILES POLICIES
-- ============================================
-- Users can view their own profiles
CREATE POLICY "Users can view own saju profiles"
  ON saju_profiles FOR SELECT
  USING (user_id = auth.uid());

-- Users can create profiles
CREATE POLICY "Users can create saju profiles"
  ON saju_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own profiles
CREATE POLICY "Users can update own saju profiles"
  ON saju_profiles FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own profiles
CREATE POLICY "Users can delete own saju profiles"
  ON saju_profiles FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- UNLOCKS POLICIES
-- ============================================
-- Users can view their own unlocks
CREATE POLICY "Users can view own unlocks"
  ON unlocks FOR SELECT
  USING (user_id = auth.uid());

-- Only service role can insert unlocks (through API after jelly verification)

-- ============================================
-- INQUIRIES POLICIES
-- ============================================
-- Users can view their own inquiries
CREATE POLICY "Users can view own inquiries"
  ON inquiries FOR SELECT
  USING (user_id = auth.uid());

-- Users can create inquiries
CREATE POLICY "Users can create inquiries"
  ON inquiries FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own inquiries (only status?)
CREATE POLICY "Users can update own inquiries"
  ON inquiries FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- ADMIN POLICIES (for future admin dashboard)
-- ============================================
-- Note: Admin policies will be added in a future migration
-- For now, admins use service role directly
