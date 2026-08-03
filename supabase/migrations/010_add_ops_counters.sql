-- ============================================
-- Ops Counters Table (운영 지표 카운터)
-- ============================================
-- Migration: 010_add_ops_counters
-- Created: 2026-08-03
--
-- /api/payment/verify 가 쓰던 인스턴스 로컬 Map 카운터
-- (VERIFY_IDEMPOTENCY_COUNTER / WALLET_MISMATCH_COUNTER / VERIFY_FAILURE_COUNTER)
-- 는 서버리스 인스턴스가 재활용될 때마다 리셋되어 지표를 신뢰할 수 없었다.
-- 이 테이블이 그 카운터들의 단일 저장소가 된다. (이중 지급 방지 자체는
-- orders 의 조건부 상태 전이가 담당하며, 이 카운터는 관측 지표 전용이다.)
--
-- 카운터 이름 컨벤션 (payment/verify 라우트 참조):
--   payment_verify_attempts:{orderId}   — 주문별 verify 호출 횟수
--   payment_verify_failures:{orderId}   — 주문별 검증 실패 횟수
--   payment_wallet_mismatch:{userId}    — 사용자별 지갑 잔액 불일치 감지 횟수

CREATE TABLE IF NOT EXISTS ops_counters (
  name TEXT PRIMARY KEY,
  count BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- RLS
-- ============================================
-- 운영 지표는 service-role API 라우트에서만 읽고 쓴다. 정책 없이 RLS 만
-- 활성화하면 anon/authenticated 접근이 전면 차단된다 (기존 컨벤션: 009 참조).
ALTER TABLE ops_counters ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Atomic increment RPC
-- ============================================
-- upsert + 증가 + 새 값 반환을 단일 문장으로 처리해 동시 요청에서도
-- 카운트 유실이 없도록 한다.
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

-- SECURITY DEFINER 함수이므로 클라이언트 롤에서는 실행을 차단하고
-- service_role 에만 명시적으로 허용한다.
REVOKE EXECUTE ON FUNCTION increment_ops_counter(TEXT, BIGINT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION increment_ops_counter(TEXT, BIGINT) FROM anon;
REVOKE EXECUTE ON FUNCTION increment_ops_counter(TEXT, BIGINT) FROM authenticated;
GRANT EXECUTE ON FUNCTION increment_ops_counter(TEXT, BIGINT) TO service_role;
