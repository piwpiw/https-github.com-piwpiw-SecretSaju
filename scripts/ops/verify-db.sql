-- ============================================================
-- verify-db.sql — Supabase 적용 상태 확인 (읽기 전용, 안전)
--
-- 사용법: Supabase 대시보드 → SQL Editor → 이 파일 전체 붙여넣기 → Run
--
-- 아무것도 바꾸지 않습니다. 마이그레이션 001~010 중 무엇이 적용됐는지,
-- RLS 가 켜져 있는지, 잔액 변경 RPC 가 살아 있는지만 확인합니다.
-- 결과의 "미적용" 항목에 해당하는 마이그레이션 파일만 순서대로 실행하세요.
-- ============================================================

-- ── 1. 마이그레이션 적용 상태 ──────────────────────────────
-- 각 마이그레이션이 만든 대표 객체의 존재 여부로 판정합니다.

SELECT
  m.migration,
  m.creates,
  CASE WHEN m.applied THEN '✅ 적용됨' ELSE '❌ 미적용 — 실행 필요' END AS status
FROM (
  VALUES
    ('001_initial_schema',      'users, saju_profiles, jelly_wallets, jelly_transactions',
      to_regclass('public.saju_profiles')   IS NOT NULL
      AND to_regclass('public.jelly_wallets') IS NOT NULL),
    ('002_add_orders_table',    'orders (결제 주문)',
      to_regclass('public.orders')          IS NOT NULL),
    ('003_rls_policies',        'RLS 정책',
      EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'saju_profiles')),
    ('004_add_wallet_rpc',      'deduct_jellies() — 원자적 젤리 차감',
      EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
              WHERE n.nspname = 'public' AND p.proname = 'deduct_jellies')),
    ('005_mcp_fields',          'users.mcp_* 컬럼, 지갑 unique',
      EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = 'users' AND column_name LIKE 'mcp%')),
    ('006_relax_kakao_id',      'users.kakao_id NULL 허용 (MCP 로그인)',
      EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = 'users'
                AND column_name = 'kakao_id' AND is_nullable = 'YES')),
    ('007_user_admin',          'users.is_admin, updated_at',
      EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'is_admin')),
    ('008_content_tables',      '콘텐츠 테이블',
      to_regclass('public.campaigns')       IS NOT NULL),
    ('009_gift_results',        'gift_results — 선물 결과 링크 (신규)',
      to_regclass('public.gift_results')    IS NOT NULL),
    ('010_ops_counters',        'ops_counters + increment_ops_counter() (신규)',
      to_regclass('public.ops_counters')    IS NOT NULL
      AND EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
                  WHERE n.nspname = 'public' AND p.proname = 'increment_ops_counter'))
) AS m(migration, creates, applied)
ORDER BY m.migration;


-- ── 2. RLS 활성 상태 ───────────────────────────────────────
-- 전부 't' 여야 합니다. 'f' 인 테이블은 anon 키로 전체 열람이 가능해집니다.

SELECT
  c.relname AS "테이블",
  CASE WHEN c.relrowsecurity THEN '✅ RLS 켜짐' ELSE '🔴 RLS 꺼짐 — 위험' END AS "상태",
  (SELECT count(*) FROM pg_policies p
    WHERE p.schemaname = 'public' AND p.tablename = c.relname) AS "정책 수"
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN (
    'users', 'saju_profiles', 'jelly_wallets', 'jelly_transactions',
    'orders', 'gift_results', 'ops_counters'
  )
ORDER BY c.relname;


-- ── 3. 잔액 변경 경로 확인 ─────────────────────────────────
-- 앱은 잔액을 두 경로로만 바꿉니다: deduct_jellies() RPC(차감) + 라우트의 수동 update(적립).
-- jelly_transactions INSERT 로 잔액이 바뀌는 트리거는 "없어야" 정상입니다
-- (있다면 과거의 잘못된 가정이 되살아난 것 — 이중 차감/이중 적립 위험).

SELECT
  CASE WHEN count(*) = 0
    THEN '✅ 정상 — jelly_transactions 에 잔액 변경 트리거 없음'
    ELSE '🔴 예상치 못한 트리거 ' || count(*) || '건 — 이중 반영 위험, 확인 필요'
  END AS "트리거 점검"
FROM information_schema.triggers
WHERE event_object_schema = 'public' AND event_object_table = 'jelly_transactions';


-- ── 4. 데이터 규모 (감각 확인용) ───────────────────────────

SELECT '사용자'        AS "구분", count(*) AS "건수" FROM public.users
UNION ALL SELECT '사주 프로필',  count(*) FROM public.saju_profiles
UNION ALL SELECT '지갑',        count(*) FROM public.jelly_wallets
UNION ALL SELECT '거래 내역',    count(*) FROM public.jelly_transactions
UNION ALL SELECT '주문',        count(*) FROM public.orders;
-- ※ 위 쿼리는 해당 테이블이 모두 있을 때만 동작합니다.
--   "relation does not exist" 오류가 나면 1번 결과에서 미적용 마이그레이션을 먼저 실행하세요.
