# 병렬 실행 큐 (잔여작업)

이 문서는 즉시 실행 가능한 잔여 작업을 팀 단위로 병렬 배치한 목록입니다.
상태: `[ ]` 대기 -> `[/]` 진행중 -> `[x]` 완료

> **인코딩 주의**: 이 파일은 이전에 mojibake(UTF-8 replacement 문자)로 손상되어 2026-07-13에 깨끗한 UTF-8로 복원되었습니다. 이후 모든 편집은 UTF-8을 유지해야 합니다.

## Frontend Team (20)
1. [x] FE-301: `/src/app/payment/fail/page.tsx` CTA 문구 모바일 가독성 및 재시도 버튼 보정
2. [x] FE-302: `/src/app/payment/success/page.tsx` 상태 메시지 및 중복 이벤트 검토
3. [x] FE-303: `/src/app/relationship/[id]/vs/page.tsx` 공유 버튼 접근성(aria-label) 추가
4. [x] FE-304: `/src/components/charts/RadarChart.tsx` 라벨/축 컬러 대비 가독성 토큰 정확화
5. [x] FE-305: `/src/components/dashboard/DestinyNetwork.tsx` 모바일 터치 영역 최소 44px 미만 방지
6. [x] FE-306: `/src/app/encyclopedia/page.tsx` 배경 패턴 오버레이 z-index 정리
7. [x] FE-307: `/src/components/layout/QuantumBackground.tsx` 다크 테마 명비도 보정
8. [x] FE-308: `/src/app/custom/partnership/page.tsx` 라우팅 경로 및 빌드 경고 정리
9. [x] FE-309: `/src/app/login/page.tsx` form 자동완성 attribute 보강
10. [x] FE-310: `/src/app/page.tsx` Hero CTA 이벤트 중복 클릭 차단
11. [x] FE-311: `/src/app/inquiry/page.tsx` 에러 메시지 문구 정리(한국어/영문)
12. [x] FE-312: `/src/app/gift/page.tsx` 결제 버튼 disabled 상태 분기 강화 — 이중 제출 재진입 가드 추가
13. [x] FE-313: `/src/app/mypage/page.tsx` MCP 배지 컴포넌트 렌더 fallback 검증 — 로딩/비로그인 분기 안전 확인
14. [x] FE-314: `/src/components/system/TerminalBoot.tsx` 애니메이션 완료 후 상태 문구 검토
15. [x] FE-315: `/src/app/tarot/page.tsx` SVG 패턴 깨짐 방지 — useId 기반 고유 filter id 적용(크로스브라우저 안전)
16. [x] FE-316: `/src/app/luck/page.tsx` 분석 완료 배지 렌더링 지연 방지 — phase 상태와 원자적 렌더 확인
17. [x] FE-317: `/src/app/palmistry/page.tsx` 버튼 링크 404 방지 — 네비게이션 링크 없음(onClick만) 확인
18. [x] FE-318: 공통 버튼 컴포넌트 hover/tap 그림자 감도 수치화 정렬 — InteractiveMotion 단일 값 확인, 불일치 없음
19. [x] FE-319: `/src/app/dreams/page.tsx` 결과 카드 공유 링크 클립보드 폴백 처리 — 해당 페이지에 공유 컨트롤 없음 확인
20. [x] FE-320: 결제/회원/분석 페이지 공통 스켈레톤 상태 컴포넌트 적용 범위 정리 — 각 페이지 로딩 상태 존재 확인(불필요한 restyle 회피)

## Backend Team (20)
1. [x] BE-301: `/src/app/api/payment/verify/route.ts` 멀티 요청 idempotency 가드 정확화
2. [x] BE-302: (완료)
3. [x] BE-303: (완료)
4. [x] BE-304: `/src/app/api/auth/mcp/callback/route.ts` state 만료/중복 제출 로그 정렬
5. [x] BE-305: `/src/lib/integrations/notion.ts` insert 실패 시 재시도 정책 문서화 — bounded retry(429/5xx, 2회, backoff) 구현
6. [x] BE-306: `/src/lib/integrations/mail.ts` 메일 발송 실패 사유 코드 분기 정합성 점검 — welcome 발송 normalizeMailError 일관화
7. [x] BE-307: `/src/app/api/payment/initialize/route.ts` 환불/취소 분기 하드코드 처리 — 취소 콜백 URL 처리 안전 확인(허용 호스트 검증)
8. [x] BE-308: `/src/app/api/payment/verify/route.ts` orderId 중복 방지 가드 강화 — 조건부 업데이트 compare-and-swap 가드 확인
9. [x] BE-309: `/src/app/api/payment/verify/route.ts` 금액 정합성 실패 원인코드 메시지 분리 — 주문/토스 금액 불일치 메시지·details 구분
10. [x] BE-310: `/src/lib/integrations/supabase.ts` mock payload 타입 정합성 추가 검증 — opt-in dev 스키마 검증기 추가
11. [x] BE-311: `/src/lib/auth/auth-mcp.ts` providerUserId 정규화 경계값 처리 — 공백/과길이/비정상 입력 안전 처리
12. [x] BE-312: `/src/lib/auth/kakao-auth.ts` MCP 쿠키 서명 유효성 체크 강화
13. [x] BE-313: `/src/app/api/gift/send/route.ts` 결과 링크 생성 시 URL 인코딩 처리 — encodeURIComponent 적용 확인
14. [x] BE-314: `/src/app/api/auth/kakao/callback/route.ts` 재시도/경합 처리 점검 — 동기 블록 내 중복 code 차단 확인
15. [x] BE-315: `/supabase/migrations/005_add_mcp_fields_and_wallet_unique.sql` 제약조건 충돌 예외 처리 — 멱등성 가드 문서화
16. [x] BE-316: `/supabase/migrations/006_relax_users_kakao_id_for_mcp.sql` 롤백 문구 정리 — 정확한 역방향 SQL 주석 추가
17. [x] BE-317: API 에러 응답 필드 스키마 일치화 문서 반영 — flat 페이로드로 문서 정정
18. [x] BE-318: `/src/app/api/auth/mcp/callback/route.ts` 감사 로그 필드 정리 — 로그에서 code/state 등 민감값 redact
19. [x] BE-319: `/src/app/api/payment/initialize/route.ts` 토큰/secret fallback 로드 점검 — 미설정 시 안전 실패(PAYMENT_CONFIG_MISSING) 확인
20. [x] BE-320: `/src/lib/auth/auth-mcp.ts` JWT subject 파싱 예외 문자열 처리 보강 — 비문자 sub 안전 처리

## Ops/QA Team (20)
> 아래 항목은 대부분 실행 중인 배포 환경 또는 수동 검증이 필요하여 헤드리스 자동화로 완료할 수 없습니다. 라이브 환경 확보 후 순차 수행합니다.
1. [ ] OPS-301: `/docs/01-team/qa/USER_VERIFICATION.md` 사용자 시나리오 체크리스트 1회 수행 (수동)
2. [ ] OPS-302: `/docs/01-team/qa/USER_VERIFICATION.md` `/gift` 플로우 결과 검증 (수동)
3. [x] OPS-303: `/docs/GITHUB_ISSUES.md` — 해당 파일 없음(문서 구조 리팩터로 제거/미생성 확인). N/A 처리
4. [/] OPS-304: `/docs/01-team/qa/test-scenarios.md` Homepage, 결제, 로그인 시나리오 1회 통과 — Homepage/로그인은 로컬 스모크로 커버, 실 결제는 라이브 키 필요 (수동 잔존)
5. [x] OPS-305: `/docs/01-team/qa/test-scenarios.md` 콘솔 error critical 없음 검증 — 54개 라우트 전수 스모크로 완료(2026-07-13)
6. [x] OPS-306: 모바일 브레이크포인트(320~768) 시각 정합 점검 (완료 2026-07-13, `/tarot` 잔액 배지 오버플로우·`/daily` 텍스트 컬럼 붕괴 2건 수정)
7. [x] OPS-307: 404/로딩/빈 상태 페이지 동작 1회 점검 (완료 2026-07-13, `/history` 로딩·빈상태 동시노출 수정)
8. [x] OPS-308: 성능 체크: 초기 렌더 블록 리소스 2초 이상 측정 (완료 2026-07-13, 전 라우트 2초 이하, 렌더블로킹 없음 확인)
9. [x] OPS-309: `/docs/02-technical/deployment.md` 배포 사전 검증 절차 최신화 (완료 2026-07-13)
10. [x] OPS-310: `/docs/01-team/engineering/setup.md` 환경변수 문구와 실제 필요 변수 정합 (완료 2026-07-13)
11. [x] OPS-311: `docs/archive/decision-history/active-dispatch.md` Wave 상태 정합 정리 (완료 2026-07-13)
12. [x] OPS-312: `docs/00-overview/roadmap.md` Remaining 항목 우선순위 재분류 (완료 2026-07-13)
13. [x] OPS-313: MCP rollback checklist 최신 문구/명령 정합 점검 (완료 2026-07-13, mojibake 조각도 제거)
14. [ ] OPS-314: 결제 플로우 에러 시나리오(실패/취소/중단) 로그 체크 (수동, 라이브 키 필요)
15. [x] OPS-315: 로그인 상태 이탈/세션 만료 UX 점검 (완료 2026-07-13 — 실제 취약점 발견: 쿠키 만료 후에도 localStorage 캐시로 로그인 상태 지속 표시. 제품 결정 필요해 자동수정 안 함, ERROR_LEDGER ERR-L004 기록)
16. [x] OPS-316: 결제 성공/실패 페이지 접근권한 없이 직접 진입 시 안내 UX 점검 (완료 2026-07-13, 이미 안전하게 처리됨 확인)
17. [ ] OPS-317: 공유 기능(카카오/복사) 크로스 브라우저 호환 점검 (수동, 이 환경엔 Chromium만 있어 크로스브라우저 불가 — 단일 브라우저 동작만 검증 가능)
18. [x] OPS-318: 접근성(포커스 순서/ARIA) 샘플 페이지 1회 점검 (완료 2026-07-13, 아이콘 전용 버튼 aria-label 누락 6건 수정)
19. [x] OPS-319: 에러 문구/버튼 라벨 번역 누락 검토(한국어 우선) (완료 2026-07-13, 영어 노출 3건 수정)
20. [x] OPS-320: 주간 업데이트 루틴 확정 (완료 2026-07-13, 아래 명시)

**주간 업데이트 루틴(OPS-320)**: 매주 스프린트 종료 시 (1) 이 큐 파일의 신규 완료 항목 체크, (2) `NEXT_ACTIONS.md` Last Updated 갱신, (3) `ERROR_LEDGER.md` 신규/해결 항목 반영, (4) `scripts/qa/menu-smoke.mjs` 재실행으로 회귀 확인.

---

**Last Updated**: 2026-07-13
**Updated By**: Claude (project review — 잔여 FE/BE 작업 병렬 완료, 큐 파일 UTF-8 복원)
