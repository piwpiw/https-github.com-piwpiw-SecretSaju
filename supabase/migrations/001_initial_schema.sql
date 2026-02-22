-- ============================================
-- Initial Database Schema for Secret Paws
-- ============================================
-- Migration: 001_initial_schema
-- Created: 2026-01-31

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kakao_id BIGINT UNIQUE NOT NULL,
  nickname TEXT NOT NULL,
  email TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_kakao_id ON users(kakao_id);

-- ============================================
-- 2. JELLY WALLETS TABLE
-- ============================================
CREATE TABLE jelly_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_purchased INTEGER NOT NULL DEFAULT 0 CHECK (total_purchased >= 0),
  total_consumed INTEGER NOT NULL DEFAULT 0 CHECK (total_consumed >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_jelly_wallets_user_id ON jelly_wallets(user_id);

-- ============================================
-- 3. JELLY TRANSACTIONS TABLE
-- ============================================
CREATE TABLE jelly_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'consume', 'gift')),
  amount INTEGER NOT NULL, -- KRW for purchases, jellies for consume/gift
  jellies INTEGER NOT NULL,
  purpose TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  payment_id TEXT, -- Toss payment key (only for purchases)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_jelly_transactions_user_id ON jelly_transactions(user_id);
CREATE INDEX idx_jelly_transactions_type ON jelly_transactions(type);
CREATE INDEX idx_jelly_transactions_created_at ON jelly_transactions(created_at DESC);

-- ============================================
-- 4. SAJU PROFILES TABLE
-- ============================================
CREATE TABLE saju_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL CHECK (relationship IN ('self', 'spouse', 'child', 'parent', 'friend', 'lover', 'other')),
  birthdate DATE NOT NULL,
  birth_time TIME,
  is_time_unknown BOOLEAN DEFAULT FALSE,
  calendar_type TEXT NOT NULL CHECK (calendar_type IN ('solar', 'lunar')),
  gender TEXT NOT NULL CHECK (gender IN ('female', 'male')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_saju_profiles_user_id ON saju_profiles(user_id);
CREATE INDEX idx_saju_profiles_created_at ON saju_profiles(created_at DESC);

-- ============================================
-- 5. UNLOCKS TABLE
-- ============================================
CREATE TABLE unlocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES saju_profiles(id) ON DELETE CASCADE,
  section_id TEXT, -- NULL for profile unlock, specific ID for section unlock
  jellies_spent INTEGER NOT NULL CHECK (jellies_spent > 0),
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, profile_id, section_id)
);

-- Indexes
CREATE INDEX idx_unlocks_user_id ON unlocks(user_id);
CREATE INDEX idx_unlocks_profile_id ON unlocks(profile_id);

-- ============================================
-- 6. INQUIRIES TABLE
-- ============================================
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('error', 'feedback', 'review', 'refund', 'convert')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_inquiries_user_id ON inquiries(user_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jelly_wallets_updated_at
  BEFORE UPDATE ON jelly_wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saju_profiles_updated_at
  BEFORE UPDATE ON saju_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA
-- ============================================
-- Create a function to initialize wallet when user is created
CREATE OR REPLACE FUNCTION create_wallet_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO jelly_wallets (user_id, balance, total_purchased, total_consumed)
  VALUES (NEW.id, 0, 0, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_wallet_on_user_insert
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_wallet_for_new_user();
