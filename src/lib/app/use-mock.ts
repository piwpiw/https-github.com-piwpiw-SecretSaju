/**
 * lib/use-mock.ts
 * 단일 진실 원천 — Mock 모드 여부 판단
 * 23개 파일에 분산된 NEXT_PUBLIC_USE_MOCK_DATA 체크를 이 함수로 대체합니다.
 *
 * 사용법:
 *   import { isMockMode, useMock } from '@/lib/app/use-mock';
 *
 *   // 서버/클라이언트 공용 (process.env 기반)
 *   if (isMockMode()) { return MOCK_DATA; }
 *
 *   // 클라이언트 React 훅
 *   const mock = useMock();
 */

/** 현재 환경이 Mock 모드인지 판단합니다. */
export function isMockMode(): boolean {
    // 서버: process.env 직접 접근
    if (typeof window === 'undefined') {
        return process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
    }
    // 클라이언트: 동일 환경변수 (Next.js가 빌드 시 인라인)
    return process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
}

/**
 * React 훅 — 컴포넌트 내부에서 사용
 * useMock() === true 이면 mock 데이터를 반환하세요.
 */
export function useMock(): boolean {
    return isMockMode();
}

/**
 * 조건부 데이터 선택 헬퍼
 * @example
 *   const profiles = mockOr(MOCK_PROFILES, () => fetchFromDB());
 */
export function mockOr<T>(mockData: T, realFn: () => T): T {
    return isMockMode() ? mockData : realFn();
}
