-- ============================================================
-- verify-db.sql — Supabase 적용 상태 확인 (읽기 전용, 안전)
--
-- 사용법: Supabase 대시보드 → SQL Editor → 이 파일 전체 붙여넣기 → Run
--
-- ⚠️ 중요: Supabase SQL Editor 는 여러 문장을 실행하면 **마지막 결과만**
--    보여준다. 그래서 이 파일은 의도적으로 **단일 쿼리**로 되어 있다.
--    (여러 SELECT 로 쪼개면 앞의 결과가 화면에서 사라진다.)
--
-- 아무것도 바꾸지 않는다. 마이그레이션 001~010 중 무엇이 적용됐는지,
-- RLS 가 켜져 있는지, 잔액 변경 트리거가 잘못 생기지 않았는지만 확인한다.
-- 결과의 "❌ 미적용" 항목에 해당하는 마이그레이션 파일만 순서대로 실행하라.
--
-- 참고: 앱이 실제로 이 DB 에 붙어 있는지(환경변수 설정 여부)는
--       프로덕션의 /api/health 로 확인하는 편이 빠르다.
-- ============================================================

SELECT "구분", "항목", "상태" FROM (

-- ── 마이그레이션 적용 상태 (대표 객체 존재로 판정) ──────────
SELECT 1 ord,'마이그레이션'"구분",'001 기본 스키마'"항목",
  CASE WHEN to_regclass('public.saju_profiles') IS NOT NULL
        AND to_regclass('public.jelly_wallets') IS NOT NULL
       THEN '✅ 적용됨' ELSE '❌ 미적용' END "상태"
UNION ALL SELECT 2,'마이그레이션','002 주문(orders)',
  CASE WHEN to_regclass('public.orders') IS NOT NULL THEN '✅ 적용됨' ELSE '❌ 미적용' END
UNION ALL SELECT 3,'마이그레이션','003 RLS 정책',
  CASE WHEN EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='saju_profiles')
       THEN '✅ 적용됨' ELSE '❌ 미적용' END
UNION ALL SELECT 4,'마이그레이션','004 deduct_jellies RPC',
  CASE WHEN EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
                   WHERE n.nspname='public' AND p.proname='deduct_jellies')
       THEN '✅ 적용됨' ELSE '❌ 미적용' END
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
  CASE WHEN to_regclass('public.campaigns') IS NOT NULL THEN '✅ 적용됨' ELSE '❌ 미적용' END
UNION ALL SELECT 9,'마이그레이션','009 gift_results (선물 링크)',
  CASE WHEN to_regclass('public.gift_results') IS NOT NULL THEN '✅ 적용됨' ELSE '❌ 미적용' END
UNION ALL SELECT 10,'마이그레이션','010 ops_counters (운영 지표)',
  CASE WHEN to_regclass('public.ops_counters') IS NOT NULL
        AND EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
                   WHERE n.nspname='public' AND p.proname='increment_ops_counter')
       THEN '✅ 적용됨' ELSE '❌ 미적용' END

-- ── RLS 활성 상태 (꺼져 있으면 anon 키로 전체 열람 가능) ────
UNION ALL SELECT 21,'RLS','users',
  CASE WHEN (SELECT c.relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
             WHERE n.nspname='public' AND c.relname='users') THEN '✅ 켜짐' ELSE '🔴 꺼짐/없음' END
UNION ALL SELECT 22,'RLS','saju_profiles',
  CASE WHEN (SELECT c.relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
             WHERE n.nspname='public' AND c.relname='saju_profiles') THEN '✅ 켜짐' ELSE '🔴 꺼짐/없음' END
UNION ALL SELECT 23,'RLS','jelly_wallets',
  CASE WHEN (SELECT c.relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
             WHERE n.nspname='public' AND c.relname='jelly_wallets') THEN '✅ 켜짐' ELSE '🔴 꺼짐/없음' END
UNION ALL SELECT 24,'RLS','jelly_transactions',
  CASE WHEN (SELECT c.relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
             WHERE n.nspname='public' AND c.relname='jelly_transactions') THEN '✅ 켜짐' ELSE '🔴 꺼짐/없음' END
UNION ALL SELECT 25,'RLS','orders',
  CASE WHEN (SELECT c.relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
             WHERE n.nspname='public' AND c.relname='orders') THEN '✅ 켜짐' ELSE '🔴 꺼짐/없음' END
UNION ALL SELECT 26,'RLS','gift_results',
  CASE WHEN (SELECT c.relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
             WHERE n.nspname='public' AND c.relname='gift_results') THEN '✅ 켜짐' ELSE '🔴 꺼짐/없음' END
UNION ALL SELECT 27,'RLS','ops_counters',
  CASE WHEN (SELECT c.relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
             WHERE n.nspname='public' AND c.relname='ops_counters') THEN '✅ 켜짐' ELSE '🔴 꺼짐/없음' END

-- ── 안전 점검 ──────────────────────────────────────────────
-- 앱은 잔액을 deduct_jellies() RPC(차감) + 라우트의 수동 update(적립)로만 바꾼다.
-- jelly_transactions INSERT 로 잔액이 바뀌는 트리거는 "없어야" 정상이다.
UNION ALL SELECT 31,'안전','잔액 변경 트리거 없음',
  CASE WHEN (SELECT count(*) FROM information_schema.triggers
             WHERE event_object_schema='public' AND event_object_table='jelly_transactions')=0
       THEN '✅ 정상' ELSE '🔴 예상치 못한 트리거 발견 — 이중 반영 위험' END

) t ORDER BY ord;
