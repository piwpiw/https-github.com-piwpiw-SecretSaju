-- Secret Saju - Ultimate Enterprise Production Schema
-- Optimized for: PostgreSQL / Supabase
-- Target Version: v4.2 (Full Phase 1-11 Support)
-- Updated: 2026-03-02

-- ============================================
-- 0. EXTENSIONS & SETUP
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CORE USER SYSTEM
-- ============================================

-- 유저 (다중 인증 지원 및 관리자 권한 포함)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kakao_id BIGINT UNIQUE,
  auth_provider TEXT DEFAULT 'kakao' CHECK (auth_provider IN ('kakao', 'naver', 'google', 'mcp')),
  mcp_user_id TEXT UNIQUE,
  mcp_access_token TEXT,
  mcp_refresh_token TEXT,
  email TEXT,
  nickname TEXT,
  name TEXT,
  profile_image_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- 사주 프로필 (SajuProfileRepository 기반)
CREATE TABLE IF NOT EXISTS saju_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT DEFAULT 'self', -- self, spouse, friend 등
  birthdate DATE NOT NULL,
  birth_time TIME,
  is_time_unknown BOOLEAN DEFAULT FALSE,
  calendar_type TEXT NOT NULL CHECK (calendar_type IN ('solar', 'lunar')),
  is_leap_month BOOLEAN DEFAULT FALSE,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. ECONOMY SYSTEM (Jelly)
-- ============================================

-- 젤리 지갑 (Atomic balance management)
CREATE TABLE IF NOT EXISTS jelly_wallets (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0 CHECK (balance >= 0),
  total_purchased INTEGER DEFAULT 0,
  total_consumed INTEGER DEFAULT 0,
  total_rewarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 젤리 트랜잭션 (History & Audit)
CREATE TABLE IF NOT EXISTS jelly_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'consume', 'reward', 'refund', 'bonus', 'gift')),
  jellies INTEGER NOT NULL,
  amount INTEGER, -- KRW
  purpose TEXT, -- 상세 사유
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 결제 주문 (Toss Payments 연동용)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_type TEXT NOT NULL CHECK (package_type IN ('TRIAL', 'SMART', 'PRO')),
  amount INTEGER NOT NULL CHECK (amount >= 0),
  jellies INTEGER NOT NULL CHECK (jellies > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_key TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. CONTENT & LOGIC (Phase 9-10)
-- ============================================

-- 동물 아키타입 (60갑자 마스터 데이터)
CREATE TABLE IF NOT EXISTS animal_archetypes (
  code TEXT PRIMARY KEY,
  animal_name TEXT NOT NULL,
  persona JSONB NOT NULL DEFAULT '{}', -- title, summary, tags 등
  wealth_analysis JSONB DEFAULT '{}',
  love_analysis JSONB DEFAULT '{}',
  hidden_truth JSONB DEFAULT '{}',
  visual_guide JSONB DEFAULT '{}', -- prompt, color_code
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 음식 추천 (Static/Content DB)
CREATE TABLE IF NOT EXISTS food_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL, -- GAP_JA 등
  name TEXT NOT NULL,
  reason TEXT,
  emoji TEXT,
  image_url TEXT,
  target_age_group TEXT CHECK (target_age_group IN ('10s', '20s', '30s', 'all')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 제품 추천 (Static/Content DB)
CREATE TABLE IF NOT EXISTS product_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  reason TEXT,
  emoji TEXT,
  price_range TEXT,
  affiliate_url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 오늘의 예언 (Daily Fortune Banner)
CREATE TABLE IF NOT EXISTS daily_fortunes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pillar_code TEXT NOT NULL, -- GAP_JA 등
  fortune_date DATE NOT NULL DEFAULT CURRENT_DATE,
  message TEXT NOT NULL,
  lucky_color TEXT,
  lucky_number INTEGER,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  UNIQUE(pillar_code, fortune_date)
);

-- 크롤링된 캠페인 (Crawled Data Accumulation)
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL, -- 'DinnerQueen', 'Revu'
  external_id TEXT, -- 원본 사이트 ID
  title TEXT NOT NULL,
  image_url TEXT,
  landing_url TEXT NOT NULL,
  description TEXT,
  reward_info TEXT,
  category TEXT,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. SERVICE & OPERATIONS
-- ============================================

-- 분석 로그 (History / AI Training Data)
CREATE TABLE IF NOT EXISTS analysis_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  profile_id UUID REFERENCES saju_profiles(id) ON DELETE SET NULL,
  topic TEXT NOT NULL, -- 'saju', 'tarot', 'compatibility'
  input_params JSONB,
  result_data JSONB,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 잠금 해제 (Feature Gating)
CREATE TABLE IF NOT EXISTS unlocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES saju_profiles(id) ON DELETE CASCADE,
  feature TEXT NOT NULL, -- detailed_analysis, compatibility, etc.
  jellies_spent INTEGER NOT NULL CHECK (jellies_spent >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, profile_id, feature)
);

-- 고객 문의 (Support System)
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email TEXT,
  category TEXT CHECK (category IN ('payment', 'bug', 'feature', 'account', 'other', 'refund')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'closed')),
  admin_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 보상 및 초대 (Growth Loops)
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  referral_code TEXT UNIQUE NOT NULL,
  reward_claimed BOOLEAN DEFAULT FALSE,
  referrer_reward_jellies INTEGER DEFAULT 0,
  referred_reward_jellies INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  claimed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL, -- signup, referral, first_purchase
  jellies INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. PERFORMANCE & AUDIT (Indexes)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_kakao ON users(kakao_id);
CREATE INDEX IF NOT EXISTS idx_users_mcp ON users(mcp_user_id);
CREATE INDEX IF NOT EXISTS idx_saju_profiles_user ON saju_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_jelly_transactions_user ON jelly_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_unlocks_user_profile ON unlocks(user_id, profile_id);
CREATE INDEX IF NOT EXISTS idx_analysis_logs_user ON analysis_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_active ON campaigns(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_daily_fortunes_date ON daily_fortunes(fortune_date);

-- ============================================
-- 6. AUTOMATION (Triggers & Functions)
-- ============================================

-- Updated At 필드 자동 갱신 트리거 엔진
CREATE OR REPLACE FUNCTION update_timestamp_engine()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT table_name FROM information_schema.columns WHERE column_name = 'updated_at' AND table_schema = 'public'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_update_%I ON %I', t, t);
    EXECUTE format('CREATE TRIGGER trg_update_%I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_timestamp_engine()', t, t);
  END LOOP;
END;
$$;

-- 신규 유저 지갑 자동 생성
CREATE OR REPLACE FUNCTION handle_new_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.jelly_wallets (user_id, balance) VALUES (NEW.id, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_wallet();

-- ============================================
-- 7. STORED PROCEDURES (RPC)
-- ============================================

-- 젤리 차감 (Atomic Transaction)
CREATE OR REPLACE FUNCTION deduct_jellies(
  p_user_id UUID,
  p_amount INTEGER,
  p_purpose TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS INTEGER AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  -- 1. 잔액 확인 및 차감
  UPDATE public.jelly_wallets
  SET balance = balance - p_amount,
      total_consumed = total_consumed + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id AND balance >= p_amount
  RETURNING balance INTO v_new_balance;

  -- 찾지 못했거나 잔액 부족 시
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient balance or user not found';
  END IF;

  -- 2. 거래 내역 삽입
  INSERT INTO public.jelly_transactions (user_id, type, jellies, purpose, metadata)
  VALUES (p_user_id, 'consume', p_amount, p_purpose, p_metadata);

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 가입 보상 지급 (Atomic Reward Check - G-13)
CREATE OR REPLACE FUNCTION provision_signup_reward(
  p_user_id UUID,
  p_channel TEXT DEFAULT 'mcp',
  p_amount INTEGER DEFAULT 10
)
RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  -- 1. 중복 지급 탐색 (type='bonus', purpose='signup_bonus')
  SELECT EXISTS (
    SELECT 1 FROM public.jelly_transactions
    WHERE user_id = p_user_id AND type = 'bonus' AND purpose = 'signup_bonus'
  ) INTO v_exists;

  IF v_exists THEN
    RETURN FALSE;
  END IF;

  -- 2. 거래 내역 삽입
  INSERT INTO public.jelly_transactions (user_id, type, jellies, purpose, metadata)
  VALUES (p_user_id, 'bonus', p_amount, 'signup_bonus', jsonb_build_object('channel', p_channel));

  -- 3. 지갑 잔액 업데이트
  UPDATE public.jelly_wallets
  SET balance = balance + p_amount,
      total_rewarded = total_rewarded + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. SECURITY (Row Level Security)
-- ============================================

-- 모든 테이블 RLS 활성화 루프
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END;
$$;

-- 정책 정의 (Generous initial access for rapid dev)
CREATE POLICY "Users view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users full access own profiles" ON saju_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own wallet" ON jelly_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own transactions" ON jelly_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users full access own inquiries" ON inquiries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own history" ON analysis_logs FOR SELECT USING (auth.uid() = user_id);

-- 공용 콘텐츠는 전체 조회 허용
CREATE POLICY "Public view animal_archetypes" ON animal_archetypes FOR SELECT USING (true);
CREATE POLICY "Public view food" ON food_recommendations FOR SELECT USING (true);
CREATE POLICY "Public view products" ON product_recommendations FOR SELECT USING (true);
CREATE POLICY "Public view campaigns" ON campaigns FOR SELECT USING (is_active = true);
CREATE POLICY "Public view daily_fortunes" ON daily_fortunes FOR SELECT USING (true);

