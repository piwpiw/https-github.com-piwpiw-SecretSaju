-- Secret Saju - MVP Production Schema
-- Updated: 2026-01-31 for tomorrow's launch

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 사용자 관리
-- ============================================

-- 사용자 기본 정보 (Kakao OAuth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kakao_id BIGINT UNIQUE NOT NULL,
  email TEXT,
  name TEXT,
  profile_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 사주 프로필 관리
-- ============================================

-- 저장된 사주 프로필
CREATE TABLE saju_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT,  -- 'self', 'spouse', 'child', 'friend', etc.
  birth_date DATE NOT NULL,
  birth_time TIME,
  is_time_unknown BOOLEAN DEFAULT FALSE,
  calendar_type TEXT NOT NULL CHECK (calendar_type IN ('solar', 'lunar')),
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 젤리 시스템 (결제 & 보상)
-- ============================================

-- 젤리 지갑
CREATE TABLE jelly_wallets (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0 CHECK (balance >= 0),
  total_purchased INTEGER DEFAULT 0,
  total_consumed INTEGER DEFAULT 0,
  total_rewarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 젤리 거래 내역
CREATE TABLE jelly_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'consume', 'reward', 'refund', 'bonus')),
  jellies INTEGER NOT NULL,
  amount INTEGER,  -- KRW (for purchases)
  purpose TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 기능 잠금 해제
-- ============================================

-- 프리미엄 기능 잠금 해제 로그
CREATE TABLE unlocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES saju_profiles(id) ON DELETE CASCADE,
  feature TEXT NOT NULL CHECK (feature IN ('detailed_analysis', 'compatibility', 'celebrity_match')),
  jellies_spent INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, profile_id, feature)  -- 중복 결제 방지
);

-- ============================================
-- 친구 초대 시스템
-- ============================================

-- 초대 코드 & 추적
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  referral_code TEXT UNIQUE NOT NULL,
  reward_claimed BOOLEAN DEFAULT FALSE,
  referrer_reward_jellies INTEGER DEFAULT 0,
  referred_reward_jellies INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  claimed_at TIMESTAMPTZ
);

-- ============================================
-- 보상 히스토리
-- ============================================

-- 보상 지급 로그
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('signup', 'first_saju', 'profile_save', 'referral_success', 'first_purchase', 'review')),
  jellies INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 고객 지원
-- ============================================

-- 문의 사항
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email TEXT,
  category TEXT CHECK (category IN ('payment', 'bug', 'feature', 'account', 'other')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'closed')),
  admin_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 인덱스 (성능 최적화)
-- ============================================

CREATE INDEX idx_saju_profiles_user ON saju_profiles(user_id);
CREATE INDEX idx_jelly_transactions_user ON jelly_transactions(user_id);
CREATE INDEX idx_jelly_transactions_type ON jelly_transactions(type);
CREATE INDEX idx_unlocks_user ON unlocks(user_id);
CREATE INDEX idx_unlocks_profile ON unlocks(profile_id);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_rewards_user ON rewards(user_id);
CREATE INDEX idx_rewards_type ON rewards(reward_type);
CREATE INDEX idx_inquiries_user ON inquiries(user_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);

-- ============================================
-- 트리거 (자동화)
-- ============================================

-- 젤리 지갑 자동 생성
CREATE OR REPLACE FUNCTION create_jelly_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO jelly_wallets (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_jelly_wallet
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_jelly_wallet();

-- 젤리 거래 시 지갑 업데이트
CREATE OR REPLACE FUNCTION update_jelly_wallet()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'purchase' OR NEW.type = 'reward' OR NEW.type = 'bonus' THEN
    UPDATE jelly_wallets
    SET balance = balance + NEW.jellies,
        total_purchased = CASE WHEN NEW.type = 'purchase' THEN total_purchased + NEW.jellies ELSE total_purchased END,
        total_rewarded = CASE WHEN NEW.type IN ('reward', 'bonus') THEN total_rewarded + NEW.jellies ELSE total_rewarded END,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
  ELSIF NEW.type = 'consume' THEN
    UPDATE jelly_wallets
    SET balance = balance - NEW.jellies,
        total_consumed = total_consumed + NEW.jellies,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_jelly_wallet
  AFTER INSERT ON jelly_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_jelly_wallet();

-- ============================================
-- Row Level Security (RLS) - 활성화
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE saju_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jelly_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE jelly_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Users: 자기 정보만 조회
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Profiles: 자기 프로필만 CRUD
CREATE POLICY "Users can view own profiles" ON saju_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profiles" ON saju_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profiles" ON saju_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profiles" ON saju_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Jelly Wallets: 자기 지갑만 조회
CREATE POLICY "Users can view own wallet" ON jelly_wallets
  FOR SELECT USING (auth.uid() = user_id);

-- Jelly Transactions: 자기 거래만 조회
CREATE POLICY "Users can view own transactions" ON jelly_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Unlocks: 자기 잠금 해제만 조회
CREATE POLICY "Users can view own unlocks" ON unlocks
  FOR SELECT USING (auth.uid() = user_id);

-- Referrals: 자기 초대만 조회
CREATE POLICY "Users can view own referrals" ON referrals
  FOR SELECT USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

-- Rewards: 자기 보상만 조회
CREATE POLICY "Users can view own rewards" ON rewards
  FOR SELECT USING (auth.uid() = user_id);

-- Inquiries: 자기 문의만 CRUD
CREATE POLICY "Users can manage own inquiries" ON inquiries
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 초기 데이터 (선택 사항)
-- ============================================

-- 테스트 사용자 (개발 환경용)
-- INSERT INTO users (kakao_id, email, name) VALUES 
--   (12345678, 'test@example.com', '테스트 사용자');

