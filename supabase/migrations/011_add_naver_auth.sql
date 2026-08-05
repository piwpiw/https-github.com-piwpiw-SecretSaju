-- ============================================
-- Naver OAuth 사용자 식별 컬럼
-- ============================================
-- Migration: 011_add_naver_auth
-- Created: 2026-08-05
--
-- 네이버 로그인 사용자를 kakao_id 와 같은 방식으로 식별한다.
-- (kakao_id 는 숫자, naver_id 는 네이버가 주는 문자열 고유값)
-- 기존 행은 전부 NULL 이며, Postgres 유니크 인덱스는 NULL 중복을
-- 허용하므로 기존 사용자와 충돌하지 않는다.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS naver_id TEXT;

-- 앱이 naver_id 기준 upsert(onConflict) 를 하기 위한 유니크 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS users_naver_id_key
  ON public.users (naver_id);
