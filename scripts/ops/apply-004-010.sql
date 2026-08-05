-- ============================================================
-- apply-004-010.sql — 미적용 마이그레이션 004~010 일괄 적용
--
-- 사용법: Supabase 대시보드 → SQL Editor → 이 파일 전체 붙여넣기 → Run
--
-- verify-db.sql 결과에서 004~010 이 전부 "❌ 미적용"으로 나온 DB 를 위한
-- 일괄 적용본이다. supabase/migrations/004~010 의 내용을 순서대로 담되,
-- **몇 번을 다시 실행해도 안전하도록(idempotent)** 보강했다:
--   * 원본 008 의 CREATE POLICY 에는 IF NOT EXISTS 가 없어 재실행 시 실패한다
--     → DROP POLICY IF EXISTS 를 앞에 붙였다.
--   * 나머지는 원본이 이미 IF NOT EXISTS / OR REPLACE 로 되어 있다.
--
-- 기존 데이터는 하나도 건드리지 않는다 (컬럼·테이블·함수 추가 전용).
-- 이미 적용된 001~003 은 포함하지 않았다.
--
-- ⚠️ Supabase SQL Editor 는 **마지막 결과만** 화면에 보여준다.
--    그래서 맨 끝에 검증 쿼리를 붙여 뒀다 — 실행 후 표에 004~010 이 전부
--    '✅ 적용됨' 으로 나오면 성공이다.
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- 004 — deduct_jellies RPC (젤리 원자적 차감)
-- ════════════════════════════════════════════════════════════
-- 잔액 확인과 차감을 한 트랜잭션에서 처리해 이중 차감/경쟁 상태를 막는다.
-- 앱의 잔액 감소 경로는 이 함수 하나뿐이다.

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
    -- 1. 행 잠금과 함께 현재 잔액 조회
    SELECT balance INTO v_current_balance
    FROM jelly_wallets
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
    END IF;

    -- 2. 잔액 충분한지 확인
    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient jellies balance: current %, required %', v_current_balance, p_amount;
    END IF;

    -- 3. 잔액 갱신
    v_new_balance := v_current_balance - p_amount;

    UPDATE jelly_wallets
    SET
        balance = v_new_balance,
        total_consumed = total_consumed + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- 4. 거래 내역 기록
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
        0, -- 소비 시 결제 금액은 0
        p_amount,
        p_purpose,
        p_metadata,
        NOW()
    );

    RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ════════════════════════════════════════════════════════════
-- 005 — MCP 연동 필드 + 지갑 유니크 인덱스
-- ════════════════════════════════════════════════════════════

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS auth_provider TEXT,
  ADD COLUMN IF NOT EXISTS mcp_user_id TEXT,
  ADD COLUMN IF NOT EXISTS mcp_access_token TEXT,
  ADD COLUMN IF NOT EXISTS mcp_refresh_token TEXT,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Postgres 는 UNIQUE 인덱스에서 NULL 을 여러 개 허용하므로 기존 비-MCP
-- 사용자(mcp_user_id IS NULL)끼리는 충돌하지 않는다. 여기서 실패한다면
-- 실제로 중복된 non-null mcp_user_id 가 있다는 뜻이다.
CREATE UNIQUE INDEX IF NOT EXISTS users_mcp_user_id_key
  ON public.users (mcp_user_id);

-- 지갑을 user_id 기준으로 안전하게 upsert 하기 위한 인덱스.
-- 실패한다면 user_id 가 중복된 jelly_wallets 행을 먼저 정리해야 한다.
CREATE UNIQUE INDEX IF NOT EXISTS jelly_wallets_user_id_key
  ON public.jelly_wallets (user_id);


-- ════════════════════════════════════════════════════════════
-- 006 — kakao_id NULL 허용 (MCP 전용 사용자)
-- ════════════════════════════════════════════════════════════
-- 되돌리려면: ALTER TABLE public.users ALTER COLUMN kakao_id SET NOT NULL;
-- (단, NULL 인 행이 남아 있으면 실패한다)

ALTER TABLE public.users
  ALTER COLUMN kakao_id DROP NOT NULL;


-- ════════════════════════════════════════════════════════════
-- 007 — is_admin / updated_at
-- ════════════════════════════════════════════════════════════

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON users;
CREATE TRIGGER trigger_update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();


-- ════════════════════════════════════════════════════════════
-- 008 — 콘텐츠 테이블 (동물 원형 / 음식·상품 추천)
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS animal_archetypes (
  code TEXT PRIMARY KEY,
  animal_name TEXT NOT NULL,
  base_traits JSONB NOT NULL,
  age_context JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS food_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL,
  food_name TEXT NOT NULL,
  reason TEXT,
  image_url TEXT,
  target_age_group TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL,
  product_name TEXT NOT NULL,
  reason TEXT,
  price_range TEXT,
  affiliate_url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 콘텐츠는 공개 읽기 전용 (쓰기는 service-role 만)
ALTER TABLE animal_archetypes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_recommendations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recommendations ENABLE ROW LEVEL SECURITY;

-- 원본 008 에는 IF NOT EXISTS 가 없어 재실행이 불가능했다 → DROP 먼저.
DROP POLICY IF EXISTS "Allow public read access to animal_archetypes" ON animal_archetypes;
CREATE POLICY "Allow public read access to animal_archetypes" ON animal_archetypes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to food_recommendations" ON food_recommendations;
CREATE POLICY "Allow public read access to food_recommendations" ON food_recommendations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to product_recommendations" ON product_recommendations;
CREATE POLICY "Allow public read access to product_recommendations" ON product_recommendations
  FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_food_recommendations_code    ON food_recommendations(code);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_code ON product_recommendations(code);


-- ════════════════════════════════════════════════════════════
-- 009 — gift_results (선물 결과 링크 영속화)
-- ════════════════════════════════════════════════════════════
-- /api/gift/send 가 만든 공유 결과를 저장해, 메일로 보낸 /result/{token}
-- 링크가 만료 전까지 계속 살아 있게 한다.

CREATE TABLE IF NOT EXISTS gift_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT UNIQUE NOT NULL,
  sender_name TEXT,
  recipient_email TEXT,
  message TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_gift_results_token      ON gift_results(token);
CREATE INDEX IF NOT EXISTS idx_gift_results_expires_at ON gift_results(expires_at);

-- 토큰 조회는 service-role API 라우트(/api/gift/[token])만 수행한다.
-- 수신자는 익명이므로 anon/authenticated 정책을 만들지 않는다.
-- 정책 없이 RLS 만 켜면 service-role 외 모든 접근이 차단된다.
ALTER TABLE gift_results ENABLE ROW LEVEL SECURITY;


-- ════════════════════════════════════════════════════════════
-- 010 — ops_counters (운영 지표 카운터) + 원자 증가 RPC
-- ════════════════════════════════════════════════════════════
-- 서버리스 인스턴스가 재활용될 때마다 리셋되던 인메모리 카운터를 대체한다.
-- (이중 지급 방지 자체는 orders 의 조건부 상태 전이가 담당하고,
--  이 카운터는 관측 지표 전용이다.)

CREATE TABLE IF NOT EXISTS ops_counters (
  name TEXT PRIMARY KEY,
  count BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ops_counters ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION increment_ops_counter(
    p_name TEXT,
    p_delta BIGINT DEFAULT 1
) RETURNS BIGINT AS $$
DECLARE
    v_count BIGINT;
BEGIN
    INSERT INTO ops_counters (name, count, updated_at)
    VALUES (p_name, p_delta, NOW())
    ON CONFLICT (name) DO UPDATE
        SET count = ops_counters.count + EXCLUDED.count,
            updated_at = NOW()
    RETURNING count INTO v_count;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SECURITY DEFINER 함수이므로 클라이언트 롤에서는 실행을 차단한다.
REVOKE EXECUTE ON FUNCTION increment_ops_counter(TEXT, BIGINT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION increment_ops_counter(TEXT, BIGINT) FROM anon;
REVOKE EXECUTE ON FUNCTION increment_ops_counter(TEXT, BIGINT) FROM authenticated;
GRANT  EXECUTE ON FUNCTION increment_ops_counter(TEXT, BIGINT) TO service_role;


-- ════════════════════════════════════════════════════════════
-- 검증 — 이 표가 화면에 보이는 유일한 결과다.
-- 004~010 이 전부 '✅ 적용됨', RLS 가 전부 '✅ 켜짐' 이면 성공.
-- ════════════════════════════════════════════════════════════

SELECT "구분", "항목", "상태" FROM (

SELECT 4 ord,'마이그레이션'"구분",'004 deduct_jellies RPC'"항목",
  CASE WHEN EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
                   WHERE n.nspname='public' AND p.proname='deduct_jellies')
       THEN '✅ 적용됨' ELSE '❌ 미적용' END "상태"
UNION ALL SELECT 5,'마이그레이션','005 MCP 필드',
  CASE WHEN EXISTS(SELECT 1 FROM information_schema.columns
                   WHERE table_schema='public' AND table_name='users' AND column_name LIKE 'mcp%')
       THEN '✅ 적용됨' ELSE '❌ 미적용' END
UNION ALL SELECT 6,'마이그레이션','006 kakao_id NULL 허용',
  CASE WHEN EXISTS(SELECT 1 FROM information_schema.columns
                   WHERE table_schema='public' AND table_name='users'
                     AND column_name='kakao_id' AND is_nullable='YES')
       THEN '✅ 적용됨' ELSE '❌ 미적용' END
UNION ALL SELECT 7,'마이그레이션','007 is_admin',
  CASE WHEN EXISTS(SELECT 1 FROM information_schema.columns
                   WHERE table_schema='public' AND table_name='users' AND column_name='is_admin')
       THEN '✅ 적용됨' ELSE '❌ 미적용' END
UNION ALL SELECT 8,'마이그레이션','008 콘텐츠 테이블',
  CASE WHEN to_regclass('public.animal_archetypes') IS NOT NULL THEN '✅ 적용됨' ELSE '❌ 미적용' END
UNION ALL SELECT 9,'마이그레이션','009 gift_results',
  CASE WHEN to_regclass('public.gift_results') IS NOT NULL THEN '✅ 적용됨' ELSE '❌ 미적용' END
UNION ALL SELECT 10,'마이그레이션','010 ops_counters',
  CASE WHEN to_regclass('public.ops_counters') IS NOT NULL
        AND EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
                   WHERE n.nspname='public' AND p.proname='increment_ops_counter')
       THEN '✅ 적용됨' ELSE '❌ 미적용' END

UNION ALL SELECT 21,'RLS','gift_results',
  CASE WHEN (SELECT c.relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
             WHERE n.nspname='public' AND c.relname='gift_results') THEN '✅ 켜짐' ELSE '🔴 꺼짐/없음' END
UNION ALL SELECT 22,'RLS','ops_counters',
  CASE WHEN (SELECT c.relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
             WHERE n.nspname='public' AND c.relname='ops_counters') THEN '✅ 켜짐' ELSE '🔴 꺼짐/없음' END
UNION ALL SELECT 23,'RLS','animal_archetypes',
  CASE WHEN (SELECT c.relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
             WHERE n.nspname='public' AND c.relname='animal_archetypes') THEN '✅ 켜짐' ELSE '🔴 꺼짐/없음' END

-- 잔액은 deduct_jellies RPC(차감) + 라우트의 수동 update(적립)로만 바뀐다.
-- jelly_transactions INSERT 로 잔액이 바뀌는 트리거는 "없어야" 정상이다.
UNION ALL SELECT 31,'안전','잔액 변경 트리거 없음',
  CASE WHEN (SELECT count(*) FROM information_schema.triggers
             WHERE event_object_schema='public' AND event_object_table='jelly_transactions')=0
       THEN '✅ 정상' ELSE '🔴 예상치 못한 트리거 발견 — 이중 반영 위험' END

) t ORDER BY ord;
