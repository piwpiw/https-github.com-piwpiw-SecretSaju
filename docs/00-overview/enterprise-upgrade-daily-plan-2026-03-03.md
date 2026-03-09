# Enterprise Upgrade Daily Plan (2026-03-03)

## 목적
- 구현된 프로젝트를 문서 SOT 기준으로 재정렬하고, 엔터프라이즈급 운영으로 올리기 위한 당일 실행 계획을 정의한다.
- 배포 이슈 재발(무한 반복, 헬스체크 의존 실패) 방지를 위해 배포/검증 단계를 분리 운영한다.

## 운영 메모
- 본 문서는 대량 체크리스트 원본이다.
- 2026-03-07부터 실제 active set은 `docs/00-overview/active-top10-backlog-2026-03-07.md`를 우선 사용한다.

## 기준 문서 (SOT)
- `docs/MASTER_PRD.md`
- `docs/00-overview/execution-backlog-ko.md`
- `docs/00-overview/document-governance.md`
- `docs/00-overview/roadmap.md`
- `docs/01-team/engineering/deployment-guide.md`
- `docs/01-team/engineering/testing-guide.md`
- `docs/02-technical/ERROR_CATALOG.md`
- `docs/01-team/qa/USER_VERIFICATION.md`
- `docs/archive/decision-history/active-dispatch.md`

## 현재 진단 요약
- 배포 체인: `deploy:fast`가 트리거 성공 기준으로 분리되어 무한 반복 리스크를 줄임(헬스체크는 별도 실행).
- 기능 체인: 결제 검증 API는 idempotency/금액검증/노션로깅까지 강함, 반면 일부 페이지는 정적/모의 데이터 비중이 높아 운영 실시간성 확장이 필요.
- 운영 관측성: `/api/health`는 단순 상태 응답 구조라 DB/외부의존성 상태를 포함한 확장형 health 모델이 필요.
- UI 품질: 일부 화면 텍스트 인코딩 깨짐 흔적이 있어 전면 정리 필요(ERR-004 관련).

## 페이지 기능 리서치 (핵심)
| Route | 현재 기능 | 엔터프라이즈 고도화 포인트 |
|---|---|---|
| `/` | 부트-입력-결과 플로우, 공유, 이력저장, 홈 피드 | 입력 성공률/첫 분석 완료율 계측 강화, 결과 재현성 보장 |
| `/fortune` | 연도 선택 기반 운세 계산/시각화/공유 | 계산 API 분리, 결과 캐시, 다국어/인코딩 정리 |
| `/shop` | 티어 카드 중심 결제 유도 UI | 실시간 가격/혜택/재고성 메시지, 실결제 흐름 결합 강화 |
| `/payment/loading` | 단계형 로딩, 90초 타임아웃 처리 | 주문 상태 polling/webhook 상태 반영, timeout UX 표준화 |
| `/payment/success` | 쿼리 파라미터 기반 검증 호출 후 이동 | 재진입/중복호출 안전성, 사용자 안내 메시지 정합화 |
| `/payment/fail` | 실패코드 분기/복귀 동선 | 오류코드 매핑 표준화, 재시도 경로 최적화 |
| `/mypage` | 인증 상태, 지갑, 프로필/히스토리/공유 | 권한별 메뉴 제어, 행동 로그/CRM 연계 |
| `/compatibility` | 프로필 2인 선택, 30젤리 소모 분석 | 계산비용 제어, 실패 복구, 결과 저장/비교 기능 강화 |
| `/daily` | 탭형 운세 카드, 시각 컴포넌트 | 서버 데이터 동기화, 개인화 추천/리텐션 이벤트 강화 |
| `/calendar` | 월별 캘린더+일자 상세, 일부 API 연동 | 월간 배치/캐시/재계산 전략, 신뢰도 라벨 표준화 |
| `/gift` | 수신자 정보 입력 후 `/api/gift/send` 호출 | 결제 연계형 선물 플로우, 발송추적/재발송 체계 |
| `/history` | 로컬 분석 이력 조회/필터/삭제 | 서버 동기화/백업, 계정 간 이력 일관성 |
| `/support` | 후원/커뮤니티 링크 중심 | 티켓 시스템/FAQ 검색/응답 SLA 도입 |
| `/admin` | 모의 상태보드/로그 테이블 | 실데이터 health, 점검 자동화 버튼, 감사로그 연결 |
| `/api/health` | 단순 status 응답 | 의존성별 상태(DB/메일/결제/크론) 확장 |
| `/api/payment/initialize` | 콜백 검증/주문 생성/노션 로깅 | SLA 지표, 결제 실패 분류 리포트 자동화 |
| `/api/payment/verify` | 금액검증/idempotency/지갑반영/메일 | 회계 정합성 대시보드, 장기 재처리 큐 |
| `/api/cron/campaigns/sync` | 어댑터 수집 후 캠페인 동기화 | 부분 실패 재시도/소스별 에러예산/관측성 강화 |
| `/api/auth/mcp/callback` | state/pkce/profile 보강 OAuth 처리 | 보안감사, 토큰수명 정책, 세션 회복력 강화 |
| `/api/auth/kakao/callback` | 코드 중복가드/유저동기화 | 에러 채널 표준화, 재시도 및 실패분석 대시보드 |

## 부서별 작업 - Product/PM (100)
- [ ] PO-001: / 화면 목표/핵심 기능/필수 요소 DoD를 `execution-backlog-ko.md`와 `MASTER_PRD.md`에 동기화
- [ ] PO-002: / KPI 이벤트(`start_analysis`, `share_click`, `payment_click`, `payment_complete`) 목표 수치 정의
- [ ] PO-003: / 정책/약관/개인정보/환불 노출 기준과 예외 시나리오 승인 기록
- [ ] PO-004: / 에러/장애 시 사용자 안내 카피(ko/en) 표준안 확정
- [ ] PO-005: / A/B 실험 가설 1건과 성공/중단 기준 문서화
- [ ] PO-006: /fortune 화면 목표/핵심 기능/필수 요소 DoD를 `execution-backlog-ko.md`와 `MASTER_PRD.md`에 동기화
- [ ] PO-007: /fortune KPI 이벤트(`start_analysis`, `share_click`, `payment_click`, `payment_complete`) 목표 수치 정의
- [ ] PO-008: /fortune 정책/약관/개인정보/환불 노출 기준과 예외 시나리오 승인 기록
- [ ] PO-009: /fortune 에러/장애 시 사용자 안내 카피(ko/en) 표준안 확정
- [ ] PO-010: /fortune A/B 실험 가설 1건과 성공/중단 기준 문서화
- [ ] PO-011: /payment/loading 화면 목표/핵심 기능/필수 요소 DoD를 `execution-backlog-ko.md`와 `MASTER_PRD.md`에 동기화
- [ ] PO-012: /payment/loading KPI 이벤트(`start_analysis`, `share_click`, `payment_click`, `payment_complete`) 목표 수치 정의
- [ ] PO-013: /payment/loading 정책/약관/개인정보/환불 노출 기준과 예외 시나리오 승인 기록
- [ ] PO-014: /payment/loading 에러/장애 시 사용자 안내 카피(ko/en) 표준안 확정
- [ ] PO-015: /payment/loading A/B 실험 가설 1건과 성공/중단 기준 문서화
- [ ] PO-016: /payment/success 화면 목표/핵심 기능/필수 요소 DoD를 `execution-backlog-ko.md`와 `MASTER_PRD.md`에 동기화
- [ ] PO-017: /payment/success KPI 이벤트(`start_analysis`, `share_click`, `payment_click`, `payment_complete`) 목표 수치 정의
- [ ] PO-018: /payment/success 정책/약관/개인정보/환불 노출 기준과 예외 시나리오 승인 기록
- [ ] PO-019: /payment/success 에러/장애 시 사용자 안내 카피(ko/en) 표준안 확정
- [ ] PO-020: /payment/success A/B 실험 가설 1건과 성공/중단 기준 문서화
- [ ] PO-021: /payment/fail 화면 목표/핵심 기능/필수 요소 DoD를 `execution-backlog-ko.md`와 `MASTER_PRD.md`에 동기화
- [ ] PO-022: /payment/fail KPI 이벤트(`start_analysis`, `share_click`, `payment_click`, `payment_complete`) 목표 수치 정의
- [ ] PO-023: /payment/fail 정책/약관/개인정보/환불 노출 기준과 예외 시나리오 승인 기록
- [ ] PO-024: /payment/fail 에러/장애 시 사용자 안내 카피(ko/en) 표준안 확정
- [ ] PO-025: /payment/fail A/B 실험 가설 1건과 성공/중단 기준 문서화
- [ ] PO-026: /shop 화면 목표/핵심 기능/필수 요소 DoD를 `execution-backlog-ko.md`와 `MASTER_PRD.md`에 동기화
- [ ] PO-027: /shop KPI 이벤트(`start_analysis`, `share_click`, `payment_click`, `payment_complete`) 목표 수치 정의
- [ ] PO-028: /shop 정책/약관/개인정보/환불 노출 기준과 예외 시나리오 승인 기록
- [ ] PO-029: /shop 에러/장애 시 사용자 안내 카피(ko/en) 표준안 확정
- [ ] PO-030: /shop A/B 실험 가설 1건과 성공/중단 기준 문서화
- [ ] PO-031: /mypage 화면 목표/핵심 기능/필수 요소 DoD를 `execution-backlog-ko.md`와 `MASTER_PRD.md`에 동기화
- [ ] PO-032: /mypage KPI 이벤트(`start_analysis`, `share_click`, `payment_click`, `payment_complete`) 목표 수치 정의
- [ ] PO-033: /mypage 정책/약관/개인정보/환불 노출 기준과 예외 시나리오 승인 기록
- [ ] PO-034: /mypage 에러/장애 시 사용자 안내 카피(ko/en) 표준안 확정
- [ ] PO-035: /mypage A/B 실험 가설 1건과 성공/중단 기준 문서화
- [ ] PO-036: /compatibility 화면 목표/핵심 기능/필수 요소 DoD를 `execution-backlog-ko.md`와 `MASTER_PRD.md`에 동기화
- [ ] PO-037: /compatibility KPI 이벤트(`start_analysis`, `share_click`, `payment_click`, `payment_complete`) 목표 수치 정의
- [ ] PO-038: /compatibility 정책/약관/개인정보/환불 노출 기준과 예외 시나리오 승인 기록
- [ ] PO-039: /compatibility 에러/장애 시 사용자 안내 카피(ko/en) 표준안 확정
- [ ] PO-040: /compatibility A/B 실험 가설 1건과 성공/중단 기준 문서화
- [ ] PO-041: /daily 화면 목표/핵심 기능/필수 요소 DoD를 `execution-backlog-ko.md`와 `MASTER_PRD.md`에 동기화
- [ ] PO-042: /daily KPI 이벤트(`start_analysis`, `share_click`, `payment_click`, `payment_complete`) 목표 수치 정의
- [ ] PO-043: /daily 정책/약관/개인정보/환불 노출 기준과 예외 시나리오 승인 기록
- [ ] PO-044: /daily 에러/장애 시 사용자 안내 카피(ko/en) 표준안 확정
- [ ] PO-045: /daily A/B 실험 가설 1건과 성공/중단 기준 문서화
- [ ] PO-046: /calendar 화면 목표/핵심 기능/필수 요소 DoD를 `execution-backlog-ko.md`와 `MASTER_PRD.md`에 동기화
- [ ] PO-047: /calendar KPI 이벤트(`start_analysis`, `share_click`, `payment_click`, `payment_complete`) 목표 수치 정의
- [ ] PO-048: /calendar 정책/약관/개인정보/환불 노출 기준과 예외 시나리오 승인 기록
- [ ] PO-049: /calendar 에러/장애 시 사용자 안내 카피(ko/en) 표준안 확정
- [ ] PO-050: /calendar A/B 실험 가설 1건과 성공/중단 기준 문서화
- [ ] PO-051: /gift 화면 목표/핵심 기능/필수 요소 DoD를 `execution-backlog-ko.md`와 `MASTER_PRD.md`에 동기화
- [ ] PO-052: /gift KPI 이벤트(`start_analysis`, `share_click`, `payment_click`, `payment_complete`) 목표 수치 정의
- [ ] PO-053: /gift 정책/약관/개인정보/환불 노출 기준과 예외 시나리오 승인 기록
- [ ] PO-054: /gift 에러/장애 시 사용자 안내 카피(ko/en) 표준안 확정
- [ ] PO-055: /gift A/B 실험 가설 1건과 성공/중단 기준 문서화
- [ ] PO-056: /history 화면 목표/핵심 기능/필수 요소 DoD를 `execution-backlog-ko.md`와 `MASTER_PRD.md`에 동기화
- [ ] PO-057: /history KPI 이벤트(`start_analysis`, `share_click`, `payment_click`, `payment_complete`) 목표 수치 정의
- [ ] PO-058: /history 정책/약관/개인정보/환불 노출 기준과 예외 시나리오 승인 기록
- [ ] PO-059: /history 에러/장애 시 사용자 안내 카피(ko/en) 표준안 확정
- [ ] PO-060: /history A/B 실험 가설 1건과 성공/중단 기준 문서화
- [ ] PO-061: /support 화면 목표/핵심 기능/필수 요소 DoD를 `execution-backlog-ko.md`와 `MASTER_PRD.md`에 동기화
- [ ] PO-062: /support KPI 이벤트(`start_analysis`, `share_click`, `payment_click`, `payment_complete`) 목표 수치 정의
- [ ] PO-063: /support 정책/약관/개인정보/환불 노출 기준과 예외 시나리오 승인 기록
- [ ] PO-064: /support 에러/장애 시 사용자 안내 카피(ko/en) 표준안 확정
- [ ] PO-065: /support A/B 실험 가설 1건과 성공/중단 기준 문서화
- [ ] PO-066: /admin 화면 목표/핵심 기능/필수 요소 DoD를 `execution-backlog-ko.md`와 `MASTER_PRD.md`에 동기화
- [ ] PO-067: /admin KPI 이벤트(`start_analysis`, `share_click`, `payment_click`, `payment_complete`) 목표 수치 정의
- [ ] PO-068: /admin 정책/약관/개인정보/환불 노출 기준과 예외 시나리오 승인 기록
- [ ] PO-069: /admin 에러/장애 시 사용자 안내 카피(ko/en) 표준안 확정
- [ ] PO-070: /admin A/B 실험 가설 1건과 성공/중단 기준 문서화
- [ ] PO-071: /relationship 화면 목표/핵심 기능/필수 요소 DoD를 `execution-backlog-ko.md`와 `MASTER_PRD.md`에 동기화
- [ ] PO-072: /relationship KPI 이벤트(`start_analysis`, `share_click`, `payment_click`, `payment_complete`) 목표 수치 정의
- [ ] PO-073: /relationship 정책/약관/개인정보/환불 노출 기준과 예외 시나리오 승인 기록
- [ ] PO-074: /relationship 에러/장애 시 사용자 안내 카피(ko/en) 표준안 확정
- [ ] PO-075: /relationship A/B 실험 가설 1건과 성공/중단 기준 문서화
- [ ] PO-076: /dreams 화면 목표/핵심 기능/필수 요소 DoD를 `execution-backlog-ko.md`와 `MASTER_PRD.md`에 동기화
- [ ] PO-077: /dreams KPI 이벤트(`start_analysis`, `share_click`, `payment_click`, `payment_complete`) 목표 수치 정의
- [ ] PO-078: /dreams 정책/약관/개인정보/환불 노출 기준과 예외 시나리오 승인 기록
- [ ] PO-079: /dreams 에러/장애 시 사용자 안내 카피(ko/en) 표준안 확정
- [ ] PO-080: /dreams A/B 실험 가설 1건과 성공/중단 기준 문서화
- [ ] PO-081: /encyclopedia 화면 목표/핵심 기능/필수 요소 DoD를 `execution-backlog-ko.md`와 `MASTER_PRD.md`에 동기화
- [ ] PO-082: /encyclopedia KPI 이벤트(`start_analysis`, `share_click`, `payment_click`, `payment_complete`) 목표 수치 정의
- [ ] PO-083: /encyclopedia 정책/약관/개인정보/환불 노출 기준과 예외 시나리오 승인 기록
- [ ] PO-084: /encyclopedia 에러/장애 시 사용자 안내 카피(ko/en) 표준안 확정
- [ ] PO-085: /encyclopedia A/B 실험 가설 1건과 성공/중단 기준 문서화
- [ ] PO-086: /tarot 화면 목표/핵심 기능/필수 요소 DoD를 `execution-backlog-ko.md`와 `MASTER_PRD.md`에 동기화
- [ ] PO-087: /tarot KPI 이벤트(`start_analysis`, `share_click`, `payment_click`, `payment_complete`) 목표 수치 정의
- [ ] PO-088: /tarot 정책/약관/개인정보/환불 노출 기준과 예외 시나리오 승인 기록
- [ ] PO-089: /tarot 에러/장애 시 사용자 안내 카피(ko/en) 표준안 확정
- [ ] PO-090: /tarot A/B 실험 가설 1건과 성공/중단 기준 문서화
- [ ] PO-091: /naming 화면 목표/핵심 기능/필수 요소 DoD를 `execution-backlog-ko.md`와 `MASTER_PRD.md`에 동기화
- [ ] PO-092: /naming KPI 이벤트(`start_analysis`, `share_click`, `payment_click`, `payment_complete`) 목표 수치 정의
- [ ] PO-093: /naming 정책/약관/개인정보/환불 노출 기준과 예외 시나리오 승인 기록
- [ ] PO-094: /naming 에러/장애 시 사용자 안내 카피(ko/en) 표준안 확정
- [ ] PO-095: /naming A/B 실험 가설 1건과 성공/중단 기준 문서화
- [ ] PO-096: /auth/callback 화면 목표/핵심 기능/필수 요소 DoD를 `execution-backlog-ko.md`와 `MASTER_PRD.md`에 동기화
- [ ] PO-097: /auth/callback KPI 이벤트(`start_analysis`, `share_click`, `payment_click`, `payment_complete`) 목표 수치 정의
- [ ] PO-098: /auth/callback 정책/약관/개인정보/환불 노출 기준과 예외 시나리오 승인 기록
- [ ] PO-099: /auth/callback 에러/장애 시 사용자 안내 카피(ko/en) 표준안 확정
- [ ] PO-100: /auth/callback A/B 실험 가설 1건과 성공/중단 기준 문서화

## 부서별 작업 - Frontend (100)
- [ ] FE-001: / 디자인 토큰/타이포/간격을 공통 컴포넌트 규칙에 맞게 정렬
- [ ] FE-002: / 로딩/에러/빈 상태를 `ERROR_CATALOG.md` 기준으로 화면화
- [ ] FE-003: / 모바일 360px/키보드/스크린리더 접근성 점검 및 수정
- [ ] FE-004: / 핵심 CTA 이벤트 중복 발화 방지 및 단일 발화 보장
- [ ] FE-005: / 렌더 성능 개선(불필요 리렌더 제거, 지연 로딩 분리)
- [ ] FE-006: /fortune 디자인 토큰/타이포/간격을 공통 컴포넌트 규칙에 맞게 정렬
- [ ] FE-007: /fortune 로딩/에러/빈 상태를 `ERROR_CATALOG.md` 기준으로 화면화
- [ ] FE-008: /fortune 모바일 360px/키보드/스크린리더 접근성 점검 및 수정
- [ ] FE-009: /fortune 핵심 CTA 이벤트 중복 발화 방지 및 단일 발화 보장
- [ ] FE-010: /fortune 렌더 성능 개선(불필요 리렌더 제거, 지연 로딩 분리)
- [ ] FE-011: /payment/loading 디자인 토큰/타이포/간격을 공통 컴포넌트 규칙에 맞게 정렬
- [ ] FE-012: /payment/loading 로딩/에러/빈 상태를 `ERROR_CATALOG.md` 기준으로 화면화
- [ ] FE-013: /payment/loading 모바일 360px/키보드/스크린리더 접근성 점검 및 수정
- [ ] FE-014: /payment/loading 핵심 CTA 이벤트 중복 발화 방지 및 단일 발화 보장
- [ ] FE-015: /payment/loading 렌더 성능 개선(불필요 리렌더 제거, 지연 로딩 분리)
- [ ] FE-016: /payment/success 디자인 토큰/타이포/간격을 공통 컴포넌트 규칙에 맞게 정렬
- [ ] FE-017: /payment/success 로딩/에러/빈 상태를 `ERROR_CATALOG.md` 기준으로 화면화
- [ ] FE-018: /payment/success 모바일 360px/키보드/스크린리더 접근성 점검 및 수정
- [ ] FE-019: /payment/success 핵심 CTA 이벤트 중복 발화 방지 및 단일 발화 보장
- [ ] FE-020: /payment/success 렌더 성능 개선(불필요 리렌더 제거, 지연 로딩 분리)
- [ ] FE-021: /payment/fail 디자인 토큰/타이포/간격을 공통 컴포넌트 규칙에 맞게 정렬
- [ ] FE-022: /payment/fail 로딩/에러/빈 상태를 `ERROR_CATALOG.md` 기준으로 화면화
- [ ] FE-023: /payment/fail 모바일 360px/키보드/스크린리더 접근성 점검 및 수정
- [ ] FE-024: /payment/fail 핵심 CTA 이벤트 중복 발화 방지 및 단일 발화 보장
- [ ] FE-025: /payment/fail 렌더 성능 개선(불필요 리렌더 제거, 지연 로딩 분리)
- [ ] FE-026: /shop 디자인 토큰/타이포/간격을 공통 컴포넌트 규칙에 맞게 정렬
- [ ] FE-027: /shop 로딩/에러/빈 상태를 `ERROR_CATALOG.md` 기준으로 화면화
- [ ] FE-028: /shop 모바일 360px/키보드/스크린리더 접근성 점검 및 수정
- [ ] FE-029: /shop 핵심 CTA 이벤트 중복 발화 방지 및 단일 발화 보장
- [ ] FE-030: /shop 렌더 성능 개선(불필요 리렌더 제거, 지연 로딩 분리)
- [ ] FE-031: /mypage 디자인 토큰/타이포/간격을 공통 컴포넌트 규칙에 맞게 정렬
- [ ] FE-032: /mypage 로딩/에러/빈 상태를 `ERROR_CATALOG.md` 기준으로 화면화
- [ ] FE-033: /mypage 모바일 360px/키보드/스크린리더 접근성 점검 및 수정
- [ ] FE-034: /mypage 핵심 CTA 이벤트 중복 발화 방지 및 단일 발화 보장
- [ ] FE-035: /mypage 렌더 성능 개선(불필요 리렌더 제거, 지연 로딩 분리)
- [ ] FE-036: /compatibility 디자인 토큰/타이포/간격을 공통 컴포넌트 규칙에 맞게 정렬
- [ ] FE-037: /compatibility 로딩/에러/빈 상태를 `ERROR_CATALOG.md` 기준으로 화면화
- [ ] FE-038: /compatibility 모바일 360px/키보드/스크린리더 접근성 점검 및 수정
- [ ] FE-039: /compatibility 핵심 CTA 이벤트 중복 발화 방지 및 단일 발화 보장
- [ ] FE-040: /compatibility 렌더 성능 개선(불필요 리렌더 제거, 지연 로딩 분리)
- [ ] FE-041: /daily 디자인 토큰/타이포/간격을 공통 컴포넌트 규칙에 맞게 정렬
- [ ] FE-042: /daily 로딩/에러/빈 상태를 `ERROR_CATALOG.md` 기준으로 화면화
- [ ] FE-043: /daily 모바일 360px/키보드/스크린리더 접근성 점검 및 수정
- [ ] FE-044: /daily 핵심 CTA 이벤트 중복 발화 방지 및 단일 발화 보장
- [ ] FE-045: /daily 렌더 성능 개선(불필요 리렌더 제거, 지연 로딩 분리)
- [ ] FE-046: /calendar 디자인 토큰/타이포/간격을 공통 컴포넌트 규칙에 맞게 정렬
- [ ] FE-047: /calendar 로딩/에러/빈 상태를 `ERROR_CATALOG.md` 기준으로 화면화
- [ ] FE-048: /calendar 모바일 360px/키보드/스크린리더 접근성 점검 및 수정
- [ ] FE-049: /calendar 핵심 CTA 이벤트 중복 발화 방지 및 단일 발화 보장
- [ ] FE-050: /calendar 렌더 성능 개선(불필요 리렌더 제거, 지연 로딩 분리)
- [ ] FE-051: /gift 디자인 토큰/타이포/간격을 공통 컴포넌트 규칙에 맞게 정렬
- [ ] FE-052: /gift 로딩/에러/빈 상태를 `ERROR_CATALOG.md` 기준으로 화면화
- [ ] FE-053: /gift 모바일 360px/키보드/스크린리더 접근성 점검 및 수정
- [ ] FE-054: /gift 핵심 CTA 이벤트 중복 발화 방지 및 단일 발화 보장
- [ ] FE-055: /gift 렌더 성능 개선(불필요 리렌더 제거, 지연 로딩 분리)
- [ ] FE-056: /history 디자인 토큰/타이포/간격을 공통 컴포넌트 규칙에 맞게 정렬
- [ ] FE-057: /history 로딩/에러/빈 상태를 `ERROR_CATALOG.md` 기준으로 화면화
- [ ] FE-058: /history 모바일 360px/키보드/스크린리더 접근성 점검 및 수정
- [ ] FE-059: /history 핵심 CTA 이벤트 중복 발화 방지 및 단일 발화 보장
- [ ] FE-060: /history 렌더 성능 개선(불필요 리렌더 제거, 지연 로딩 분리)
- [ ] FE-061: /support 디자인 토큰/타이포/간격을 공통 컴포넌트 규칙에 맞게 정렬
- [ ] FE-062: /support 로딩/에러/빈 상태를 `ERROR_CATALOG.md` 기준으로 화면화
- [ ] FE-063: /support 모바일 360px/키보드/스크린리더 접근성 점검 및 수정
- [ ] FE-064: /support 핵심 CTA 이벤트 중복 발화 방지 및 단일 발화 보장
- [ ] FE-065: /support 렌더 성능 개선(불필요 리렌더 제거, 지연 로딩 분리)
- [ ] FE-066: /admin 디자인 토큰/타이포/간격을 공통 컴포넌트 규칙에 맞게 정렬
- [ ] FE-067: /admin 로딩/에러/빈 상태를 `ERROR_CATALOG.md` 기준으로 화면화
- [ ] FE-068: /admin 모바일 360px/키보드/스크린리더 접근성 점검 및 수정
- [ ] FE-069: /admin 핵심 CTA 이벤트 중복 발화 방지 및 단일 발화 보장
- [ ] FE-070: /admin 렌더 성능 개선(불필요 리렌더 제거, 지연 로딩 분리)
- [ ] FE-071: /relationship 디자인 토큰/타이포/간격을 공통 컴포넌트 규칙에 맞게 정렬
- [ ] FE-072: /relationship 로딩/에러/빈 상태를 `ERROR_CATALOG.md` 기준으로 화면화
- [ ] FE-073: /relationship 모바일 360px/키보드/스크린리더 접근성 점검 및 수정
- [ ] FE-074: /relationship 핵심 CTA 이벤트 중복 발화 방지 및 단일 발화 보장
- [ ] FE-075: /relationship 렌더 성능 개선(불필요 리렌더 제거, 지연 로딩 분리)
- [ ] FE-076: /dreams 디자인 토큰/타이포/간격을 공통 컴포넌트 규칙에 맞게 정렬
- [ ] FE-077: /dreams 로딩/에러/빈 상태를 `ERROR_CATALOG.md` 기준으로 화면화
- [ ] FE-078: /dreams 모바일 360px/키보드/스크린리더 접근성 점검 및 수정
- [ ] FE-079: /dreams 핵심 CTA 이벤트 중복 발화 방지 및 단일 발화 보장
- [ ] FE-080: /dreams 렌더 성능 개선(불필요 리렌더 제거, 지연 로딩 분리)
- [ ] FE-081: /encyclopedia 디자인 토큰/타이포/간격을 공통 컴포넌트 규칙에 맞게 정렬
- [ ] FE-082: /encyclopedia 로딩/에러/빈 상태를 `ERROR_CATALOG.md` 기준으로 화면화
- [ ] FE-083: /encyclopedia 모바일 360px/키보드/스크린리더 접근성 점검 및 수정
- [ ] FE-084: /encyclopedia 핵심 CTA 이벤트 중복 발화 방지 및 단일 발화 보장
- [ ] FE-085: /encyclopedia 렌더 성능 개선(불필요 리렌더 제거, 지연 로딩 분리)
- [ ] FE-086: /tarot 디자인 토큰/타이포/간격을 공통 컴포넌트 규칙에 맞게 정렬
- [ ] FE-087: /tarot 로딩/에러/빈 상태를 `ERROR_CATALOG.md` 기준으로 화면화
- [ ] FE-088: /tarot 모바일 360px/키보드/스크린리더 접근성 점검 및 수정
- [ ] FE-089: /tarot 핵심 CTA 이벤트 중복 발화 방지 및 단일 발화 보장
- [ ] FE-090: /tarot 렌더 성능 개선(불필요 리렌더 제거, 지연 로딩 분리)
- [ ] FE-091: /naming 디자인 토큰/타이포/간격을 공통 컴포넌트 규칙에 맞게 정렬
- [ ] FE-092: /naming 로딩/에러/빈 상태를 `ERROR_CATALOG.md` 기준으로 화면화
- [ ] FE-093: /naming 모바일 360px/키보드/스크린리더 접근성 점검 및 수정
- [ ] FE-094: /naming 핵심 CTA 이벤트 중복 발화 방지 및 단일 발화 보장
- [ ] FE-095: /naming 렌더 성능 개선(불필요 리렌더 제거, 지연 로딩 분리)
- [ ] FE-096: /auth/callback 디자인 토큰/타이포/간격을 공통 컴포넌트 규칙에 맞게 정렬
- [ ] FE-097: /auth/callback 로딩/에러/빈 상태를 `ERROR_CATALOG.md` 기준으로 화면화
- [ ] FE-098: /auth/callback 모바일 360px/키보드/스크린리더 접근성 점검 및 수정
- [ ] FE-099: /auth/callback 핵심 CTA 이벤트 중복 발화 방지 및 단일 발화 보장
- [ ] FE-100: /auth/callback 렌더 성능 개선(불필요 리렌더 제거, 지연 로딩 분리)

## 부서별 작업 - Backend/Data/AI (100)
- [ ] BE-001: / API 계약 입력/출력 스키마를 route-level contract와 일치화
- [ ] BE-002: / idempotency/재시도/중복호출 방지 로직 보강
- [ ] BE-003: / 검증 로직(파라미터/권한/도메인 규칙) 강화 및 에러코드 표준화
- [ ] BE-004: / 추적 로그/감사 로그/운영 메타데이터를 Notion 이벤트와 연결
- [ ] BE-005: / 성능 예산(응답시간, 타임아웃, 캐시전략) 설정 및 코드 반영
- [ ] BE-006: /fortune API 계약 입력/출력 스키마를 route-level contract와 일치화
- [ ] BE-007: /fortune idempotency/재시도/중복호출 방지 로직 보강
- [ ] BE-008: /fortune 검증 로직(파라미터/권한/도메인 규칙) 강화 및 에러코드 표준화
- [ ] BE-009: /fortune 추적 로그/감사 로그/운영 메타데이터를 Notion 이벤트와 연결
- [ ] BE-010: /fortune 성능 예산(응답시간, 타임아웃, 캐시전략) 설정 및 코드 반영
- [ ] BE-011: /payment/loading API 계약 입력/출력 스키마를 route-level contract와 일치화
- [ ] BE-012: /payment/loading idempotency/재시도/중복호출 방지 로직 보강
- [ ] BE-013: /payment/loading 검증 로직(파라미터/권한/도메인 규칙) 강화 및 에러코드 표준화
- [ ] BE-014: /payment/loading 추적 로그/감사 로그/운영 메타데이터를 Notion 이벤트와 연결
- [ ] BE-015: /payment/loading 성능 예산(응답시간, 타임아웃, 캐시전략) 설정 및 코드 반영
- [ ] BE-016: /payment/success API 계약 입력/출력 스키마를 route-level contract와 일치화
- [ ] BE-017: /payment/success idempotency/재시도/중복호출 방지 로직 보강
- [ ] BE-018: /payment/success 검증 로직(파라미터/권한/도메인 규칙) 강화 및 에러코드 표준화
- [ ] BE-019: /payment/success 추적 로그/감사 로그/운영 메타데이터를 Notion 이벤트와 연결
- [ ] BE-020: /payment/success 성능 예산(응답시간, 타임아웃, 캐시전략) 설정 및 코드 반영
- [ ] BE-021: /payment/fail API 계약 입력/출력 스키마를 route-level contract와 일치화
- [ ] BE-022: /payment/fail idempotency/재시도/중복호출 방지 로직 보강
- [ ] BE-023: /payment/fail 검증 로직(파라미터/권한/도메인 규칙) 강화 및 에러코드 표준화
- [ ] BE-024: /payment/fail 추적 로그/감사 로그/운영 메타데이터를 Notion 이벤트와 연결
- [ ] BE-025: /payment/fail 성능 예산(응답시간, 타임아웃, 캐시전략) 설정 및 코드 반영
- [ ] BE-026: /shop API 계약 입력/출력 스키마를 route-level contract와 일치화
- [ ] BE-027: /shop idempotency/재시도/중복호출 방지 로직 보강
- [ ] BE-028: /shop 검증 로직(파라미터/권한/도메인 규칙) 강화 및 에러코드 표준화
- [ ] BE-029: /shop 추적 로그/감사 로그/운영 메타데이터를 Notion 이벤트와 연결
- [ ] BE-030: /shop 성능 예산(응답시간, 타임아웃, 캐시전략) 설정 및 코드 반영
- [ ] BE-031: /mypage API 계약 입력/출력 스키마를 route-level contract와 일치화
- [ ] BE-032: /mypage idempotency/재시도/중복호출 방지 로직 보강
- [ ] BE-033: /mypage 검증 로직(파라미터/권한/도메인 규칙) 강화 및 에러코드 표준화
- [ ] BE-034: /mypage 추적 로그/감사 로그/운영 메타데이터를 Notion 이벤트와 연결
- [ ] BE-035: /mypage 성능 예산(응답시간, 타임아웃, 캐시전략) 설정 및 코드 반영
- [ ] BE-036: /compatibility API 계약 입력/출력 스키마를 route-level contract와 일치화
- [ ] BE-037: /compatibility idempotency/재시도/중복호출 방지 로직 보강
- [ ] BE-038: /compatibility 검증 로직(파라미터/권한/도메인 규칙) 강화 및 에러코드 표준화
- [ ] BE-039: /compatibility 추적 로그/감사 로그/운영 메타데이터를 Notion 이벤트와 연결
- [ ] BE-040: /compatibility 성능 예산(응답시간, 타임아웃, 캐시전략) 설정 및 코드 반영
- [ ] BE-041: /daily API 계약 입력/출력 스키마를 route-level contract와 일치화
- [ ] BE-042: /daily idempotency/재시도/중복호출 방지 로직 보강
- [ ] BE-043: /daily 검증 로직(파라미터/권한/도메인 규칙) 강화 및 에러코드 표준화
- [ ] BE-044: /daily 추적 로그/감사 로그/운영 메타데이터를 Notion 이벤트와 연결
- [ ] BE-045: /daily 성능 예산(응답시간, 타임아웃, 캐시전략) 설정 및 코드 반영
- [ ] BE-046: /calendar API 계약 입력/출력 스키마를 route-level contract와 일치화
- [ ] BE-047: /calendar idempotency/재시도/중복호출 방지 로직 보강
- [ ] BE-048: /calendar 검증 로직(파라미터/권한/도메인 규칙) 강화 및 에러코드 표준화
- [ ] BE-049: /calendar 추적 로그/감사 로그/운영 메타데이터를 Notion 이벤트와 연결
- [ ] BE-050: /calendar 성능 예산(응답시간, 타임아웃, 캐시전략) 설정 및 코드 반영
- [ ] BE-051: /gift API 계약 입력/출력 스키마를 route-level contract와 일치화
- [ ] BE-052: /gift idempotency/재시도/중복호출 방지 로직 보강
- [ ] BE-053: /gift 검증 로직(파라미터/권한/도메인 규칙) 강화 및 에러코드 표준화
- [ ] BE-054: /gift 추적 로그/감사 로그/운영 메타데이터를 Notion 이벤트와 연결
- [ ] BE-055: /gift 성능 예산(응답시간, 타임아웃, 캐시전략) 설정 및 코드 반영
- [ ] BE-056: /history API 계약 입력/출력 스키마를 route-level contract와 일치화
- [ ] BE-057: /history idempotency/재시도/중복호출 방지 로직 보강
- [ ] BE-058: /history 검증 로직(파라미터/권한/도메인 규칙) 강화 및 에러코드 표준화
- [ ] BE-059: /history 추적 로그/감사 로그/운영 메타데이터를 Notion 이벤트와 연결
- [ ] BE-060: /history 성능 예산(응답시간, 타임아웃, 캐시전략) 설정 및 코드 반영
- [ ] BE-061: /support API 계약 입력/출력 스키마를 route-level contract와 일치화
- [ ] BE-062: /support idempotency/재시도/중복호출 방지 로직 보강
- [ ] BE-063: /support 검증 로직(파라미터/권한/도메인 규칙) 강화 및 에러코드 표준화
- [ ] BE-064: /support 추적 로그/감사 로그/운영 메타데이터를 Notion 이벤트와 연결
- [ ] BE-065: /support 성능 예산(응답시간, 타임아웃, 캐시전략) 설정 및 코드 반영
- [ ] BE-066: /admin API 계약 입력/출력 스키마를 route-level contract와 일치화
- [ ] BE-067: /admin idempotency/재시도/중복호출 방지 로직 보강
- [ ] BE-068: /admin 검증 로직(파라미터/권한/도메인 규칙) 강화 및 에러코드 표준화
- [ ] BE-069: /admin 추적 로그/감사 로그/운영 메타데이터를 Notion 이벤트와 연결
- [ ] BE-070: /admin 성능 예산(응답시간, 타임아웃, 캐시전략) 설정 및 코드 반영
- [ ] BE-071: /relationship API 계약 입력/출력 스키마를 route-level contract와 일치화
- [ ] BE-072: /relationship idempotency/재시도/중복호출 방지 로직 보강
- [ ] BE-073: /relationship 검증 로직(파라미터/권한/도메인 규칙) 강화 및 에러코드 표준화
- [ ] BE-074: /relationship 추적 로그/감사 로그/운영 메타데이터를 Notion 이벤트와 연결
- [ ] BE-075: /relationship 성능 예산(응답시간, 타임아웃, 캐시전략) 설정 및 코드 반영
- [ ] BE-076: /dreams API 계약 입력/출력 스키마를 route-level contract와 일치화
- [ ] BE-077: /dreams idempotency/재시도/중복호출 방지 로직 보강
- [ ] BE-078: /dreams 검증 로직(파라미터/권한/도메인 규칙) 강화 및 에러코드 표준화
- [ ] BE-079: /dreams 추적 로그/감사 로그/운영 메타데이터를 Notion 이벤트와 연결
- [ ] BE-080: /dreams 성능 예산(응답시간, 타임아웃, 캐시전략) 설정 및 코드 반영
- [ ] BE-081: /encyclopedia API 계약 입력/출력 스키마를 route-level contract와 일치화
- [ ] BE-082: /encyclopedia idempotency/재시도/중복호출 방지 로직 보강
- [ ] BE-083: /encyclopedia 검증 로직(파라미터/권한/도메인 규칙) 강화 및 에러코드 표준화
- [ ] BE-084: /encyclopedia 추적 로그/감사 로그/운영 메타데이터를 Notion 이벤트와 연결
- [ ] BE-085: /encyclopedia 성능 예산(응답시간, 타임아웃, 캐시전략) 설정 및 코드 반영
- [ ] BE-086: /tarot API 계약 입력/출력 스키마를 route-level contract와 일치화
- [ ] BE-087: /tarot idempotency/재시도/중복호출 방지 로직 보강
- [ ] BE-088: /tarot 검증 로직(파라미터/권한/도메인 규칙) 강화 및 에러코드 표준화
- [ ] BE-089: /tarot 추적 로그/감사 로그/운영 메타데이터를 Notion 이벤트와 연결
- [ ] BE-090: /tarot 성능 예산(응답시간, 타임아웃, 캐시전략) 설정 및 코드 반영
- [ ] BE-091: /naming API 계약 입력/출력 스키마를 route-level contract와 일치화
- [ ] BE-092: /naming idempotency/재시도/중복호출 방지 로직 보강
- [ ] BE-093: /naming 검증 로직(파라미터/권한/도메인 규칙) 강화 및 에러코드 표준화
- [ ] BE-094: /naming 추적 로그/감사 로그/운영 메타데이터를 Notion 이벤트와 연결
- [ ] BE-095: /naming 성능 예산(응답시간, 타임아웃, 캐시전략) 설정 및 코드 반영
- [ ] BE-096: /auth/callback API 계약 입력/출력 스키마를 route-level contract와 일치화
- [ ] BE-097: /auth/callback idempotency/재시도/중복호출 방지 로직 보강
- [ ] BE-098: /auth/callback 검증 로직(파라미터/권한/도메인 규칙) 강화 및 에러코드 표준화
- [ ] BE-099: /auth/callback 추적 로그/감사 로그/운영 메타데이터를 Notion 이벤트와 연결
- [ ] BE-100: /auth/callback 성능 예산(응답시간, 타임아웃, 캐시전략) 설정 및 코드 반영

## 부서별 작업 - QA/DevOps/SRE (100)
- [ ] OPS-001: / `USER_VERIFICATION.md`에 사용자 E2E 시나리오 1건 추가/갱신
- [ ] OPS-002: / CI 게이트(`preflight`, `test`, `build`)와 실패 판정 기준 정합화
- [ ] OPS-003: / 배포/롤백 런북을 `deployment-guide.md` 기준으로 갱신
- [ ] OPS-004: / 합성 모니터링(헬스체크/핵심 API) 경보 조건 수치화
- [ ] OPS-005: / 장애 대응 커뮤니케이션 템플릿과 에스컬레이션 경로 점검
- [ ] OPS-006: /fortune `USER_VERIFICATION.md`에 사용자 E2E 시나리오 1건 추가/갱신
- [ ] OPS-007: /fortune CI 게이트(`preflight`, `test`, `build`)와 실패 판정 기준 정합화
- [ ] OPS-008: /fortune 배포/롤백 런북을 `deployment-guide.md` 기준으로 갱신
- [ ] OPS-009: /fortune 합성 모니터링(헬스체크/핵심 API) 경보 조건 수치화
- [ ] OPS-010: /fortune 장애 대응 커뮤니케이션 템플릿과 에스컬레이션 경로 점검
- [ ] OPS-011: /payment/loading `USER_VERIFICATION.md`에 사용자 E2E 시나리오 1건 추가/갱신
- [ ] OPS-012: /payment/loading CI 게이트(`preflight`, `test`, `build`)와 실패 판정 기준 정합화
- [ ] OPS-013: /payment/loading 배포/롤백 런북을 `deployment-guide.md` 기준으로 갱신
- [ ] OPS-014: /payment/loading 합성 모니터링(헬스체크/핵심 API) 경보 조건 수치화
- [ ] OPS-015: /payment/loading 장애 대응 커뮤니케이션 템플릿과 에스컬레이션 경로 점검
- [ ] OPS-016: /payment/success `USER_VERIFICATION.md`에 사용자 E2E 시나리오 1건 추가/갱신
- [ ] OPS-017: /payment/success CI 게이트(`preflight`, `test`, `build`)와 실패 판정 기준 정합화
- [ ] OPS-018: /payment/success 배포/롤백 런북을 `deployment-guide.md` 기준으로 갱신
- [ ] OPS-019: /payment/success 합성 모니터링(헬스체크/핵심 API) 경보 조건 수치화
- [ ] OPS-020: /payment/success 장애 대응 커뮤니케이션 템플릿과 에스컬레이션 경로 점검
- [ ] OPS-021: /payment/fail `USER_VERIFICATION.md`에 사용자 E2E 시나리오 1건 추가/갱신
- [ ] OPS-022: /payment/fail CI 게이트(`preflight`, `test`, `build`)와 실패 판정 기준 정합화
- [ ] OPS-023: /payment/fail 배포/롤백 런북을 `deployment-guide.md` 기준으로 갱신
- [ ] OPS-024: /payment/fail 합성 모니터링(헬스체크/핵심 API) 경보 조건 수치화
- [ ] OPS-025: /payment/fail 장애 대응 커뮤니케이션 템플릿과 에스컬레이션 경로 점검
- [ ] OPS-026: /shop `USER_VERIFICATION.md`에 사용자 E2E 시나리오 1건 추가/갱신
- [ ] OPS-027: /shop CI 게이트(`preflight`, `test`, `build`)와 실패 판정 기준 정합화
- [ ] OPS-028: /shop 배포/롤백 런북을 `deployment-guide.md` 기준으로 갱신
- [ ] OPS-029: /shop 합성 모니터링(헬스체크/핵심 API) 경보 조건 수치화
- [ ] OPS-030: /shop 장애 대응 커뮤니케이션 템플릿과 에스컬레이션 경로 점검
- [ ] OPS-031: /mypage `USER_VERIFICATION.md`에 사용자 E2E 시나리오 1건 추가/갱신
- [ ] OPS-032: /mypage CI 게이트(`preflight`, `test`, `build`)와 실패 판정 기준 정합화
- [ ] OPS-033: /mypage 배포/롤백 런북을 `deployment-guide.md` 기준으로 갱신
- [ ] OPS-034: /mypage 합성 모니터링(헬스체크/핵심 API) 경보 조건 수치화
- [ ] OPS-035: /mypage 장애 대응 커뮤니케이션 템플릿과 에스컬레이션 경로 점검
- [ ] OPS-036: /compatibility `USER_VERIFICATION.md`에 사용자 E2E 시나리오 1건 추가/갱신
- [ ] OPS-037: /compatibility CI 게이트(`preflight`, `test`, `build`)와 실패 판정 기준 정합화
- [ ] OPS-038: /compatibility 배포/롤백 런북을 `deployment-guide.md` 기준으로 갱신
- [ ] OPS-039: /compatibility 합성 모니터링(헬스체크/핵심 API) 경보 조건 수치화
- [ ] OPS-040: /compatibility 장애 대응 커뮤니케이션 템플릿과 에스컬레이션 경로 점검
- [ ] OPS-041: /daily `USER_VERIFICATION.md`에 사용자 E2E 시나리오 1건 추가/갱신
- [ ] OPS-042: /daily CI 게이트(`preflight`, `test`, `build`)와 실패 판정 기준 정합화
- [ ] OPS-043: /daily 배포/롤백 런북을 `deployment-guide.md` 기준으로 갱신
- [ ] OPS-044: /daily 합성 모니터링(헬스체크/핵심 API) 경보 조건 수치화
- [ ] OPS-045: /daily 장애 대응 커뮤니케이션 템플릿과 에스컬레이션 경로 점검
- [ ] OPS-046: /calendar `USER_VERIFICATION.md`에 사용자 E2E 시나리오 1건 추가/갱신
- [ ] OPS-047: /calendar CI 게이트(`preflight`, `test`, `build`)와 실패 판정 기준 정합화
- [ ] OPS-048: /calendar 배포/롤백 런북을 `deployment-guide.md` 기준으로 갱신
- [ ] OPS-049: /calendar 합성 모니터링(헬스체크/핵심 API) 경보 조건 수치화
- [ ] OPS-050: /calendar 장애 대응 커뮤니케이션 템플릿과 에스컬레이션 경로 점검
- [ ] OPS-051: /gift `USER_VERIFICATION.md`에 사용자 E2E 시나리오 1건 추가/갱신
- [ ] OPS-052: /gift CI 게이트(`preflight`, `test`, `build`)와 실패 판정 기준 정합화
- [ ] OPS-053: /gift 배포/롤백 런북을 `deployment-guide.md` 기준으로 갱신
- [ ] OPS-054: /gift 합성 모니터링(헬스체크/핵심 API) 경보 조건 수치화
- [ ] OPS-055: /gift 장애 대응 커뮤니케이션 템플릿과 에스컬레이션 경로 점검
- [ ] OPS-056: /history `USER_VERIFICATION.md`에 사용자 E2E 시나리오 1건 추가/갱신
- [ ] OPS-057: /history CI 게이트(`preflight`, `test`, `build`)와 실패 판정 기준 정합화
- [ ] OPS-058: /history 배포/롤백 런북을 `deployment-guide.md` 기준으로 갱신
- [ ] OPS-059: /history 합성 모니터링(헬스체크/핵심 API) 경보 조건 수치화
- [ ] OPS-060: /history 장애 대응 커뮤니케이션 템플릿과 에스컬레이션 경로 점검
- [ ] OPS-061: /support `USER_VERIFICATION.md`에 사용자 E2E 시나리오 1건 추가/갱신
- [ ] OPS-062: /support CI 게이트(`preflight`, `test`, `build`)와 실패 판정 기준 정합화
- [ ] OPS-063: /support 배포/롤백 런북을 `deployment-guide.md` 기준으로 갱신
- [ ] OPS-064: /support 합성 모니터링(헬스체크/핵심 API) 경보 조건 수치화
- [ ] OPS-065: /support 장애 대응 커뮤니케이션 템플릿과 에스컬레이션 경로 점검
- [ ] OPS-066: /admin `USER_VERIFICATION.md`에 사용자 E2E 시나리오 1건 추가/갱신
- [ ] OPS-067: /admin CI 게이트(`preflight`, `test`, `build`)와 실패 판정 기준 정합화
- [ ] OPS-068: /admin 배포/롤백 런북을 `deployment-guide.md` 기준으로 갱신
- [ ] OPS-069: /admin 합성 모니터링(헬스체크/핵심 API) 경보 조건 수치화
- [ ] OPS-070: /admin 장애 대응 커뮤니케이션 템플릿과 에스컬레이션 경로 점검
- [ ] OPS-071: /relationship `USER_VERIFICATION.md`에 사용자 E2E 시나리오 1건 추가/갱신
- [ ] OPS-072: /relationship CI 게이트(`preflight`, `test`, `build`)와 실패 판정 기준 정합화
- [ ] OPS-073: /relationship 배포/롤백 런북을 `deployment-guide.md` 기준으로 갱신
- [ ] OPS-074: /relationship 합성 모니터링(헬스체크/핵심 API) 경보 조건 수치화
- [ ] OPS-075: /relationship 장애 대응 커뮤니케이션 템플릿과 에스컬레이션 경로 점검
- [ ] OPS-076: /dreams `USER_VERIFICATION.md`에 사용자 E2E 시나리오 1건 추가/갱신
- [ ] OPS-077: /dreams CI 게이트(`preflight`, `test`, `build`)와 실패 판정 기준 정합화
- [ ] OPS-078: /dreams 배포/롤백 런북을 `deployment-guide.md` 기준으로 갱신
- [ ] OPS-079: /dreams 합성 모니터링(헬스체크/핵심 API) 경보 조건 수치화
- [ ] OPS-080: /dreams 장애 대응 커뮤니케이션 템플릿과 에스컬레이션 경로 점검
- [ ] OPS-081: /encyclopedia `USER_VERIFICATION.md`에 사용자 E2E 시나리오 1건 추가/갱신
- [ ] OPS-082: /encyclopedia CI 게이트(`preflight`, `test`, `build`)와 실패 판정 기준 정합화
- [ ] OPS-083: /encyclopedia 배포/롤백 런북을 `deployment-guide.md` 기준으로 갱신
- [ ] OPS-084: /encyclopedia 합성 모니터링(헬스체크/핵심 API) 경보 조건 수치화
- [ ] OPS-085: /encyclopedia 장애 대응 커뮤니케이션 템플릿과 에스컬레이션 경로 점검
- [ ] OPS-086: /tarot `USER_VERIFICATION.md`에 사용자 E2E 시나리오 1건 추가/갱신
- [ ] OPS-087: /tarot CI 게이트(`preflight`, `test`, `build`)와 실패 판정 기준 정합화
- [ ] OPS-088: /tarot 배포/롤백 런북을 `deployment-guide.md` 기준으로 갱신
- [ ] OPS-089: /tarot 합성 모니터링(헬스체크/핵심 API) 경보 조건 수치화
- [ ] OPS-090: /tarot 장애 대응 커뮤니케이션 템플릿과 에스컬레이션 경로 점검
- [ ] OPS-091: /naming `USER_VERIFICATION.md`에 사용자 E2E 시나리오 1건 추가/갱신
- [ ] OPS-092: /naming CI 게이트(`preflight`, `test`, `build`)와 실패 판정 기준 정합화
- [ ] OPS-093: /naming 배포/롤백 런북을 `deployment-guide.md` 기준으로 갱신
- [ ] OPS-094: /naming 합성 모니터링(헬스체크/핵심 API) 경보 조건 수치화
- [ ] OPS-095: /naming 장애 대응 커뮤니케이션 템플릿과 에스컬레이션 경로 점검
- [ ] OPS-096: /auth/callback `USER_VERIFICATION.md`에 사용자 E2E 시나리오 1건 추가/갱신
- [ ] OPS-097: /auth/callback CI 게이트(`preflight`, `test`, `build`)와 실패 판정 기준 정합화
- [ ] OPS-098: /auth/callback 배포/롤백 런북을 `deployment-guide.md` 기준으로 갱신
- [ ] OPS-099: /auth/callback 합성 모니터링(헬스체크/핵심 API) 경보 조건 수치화
- [ ] OPS-100: /auth/callback 장애 대응 커뮤니케이션 템플릿과 에스컬레이션 경로 점검

## 오늘 하루 실행 플랜 (D1)
1. 09:00-09:40: 킥오프 - SOT 정합성 확인 및 우선순위 확정 (`MASTER_PRD`, `execution-backlog`, `deployment-guide`)
2. 09:40-11:30: P0 안정화 - 결제/인증/헬스체크 체인에 대한 오류코드/로그/모니터링 보강
3. 11:30-12:30: 페이지 품질 - 홈/결제/마이페이지 인코딩/카피/접근성 긴급 정리
4. 13:30-15:00: 운영 자동화 - 배포 트리거와 헬스 검증 분리 룰 문서화 및 런북 반영
5. 15:00-16:30: 데이터 정합성 - 결제 검증/지갑 반영/이력 저장 정합성 회귀 케이스 확장
6. 16:30-18:00: 성장 기능 - `daily`, `calendar`, `compatibility`, `gift`의 실데이터화 계획 확정
7. 18:00-19:00: 통합 QA - `USER_VERIFICATION` 핵심 시나리오 재실행 및 실패 원인 기록
8. 19:00-20:00: 릴리즈 판단 - Go/No-Go 체크, `active-dispatch` 상태 갱신, 다음날 인수인계

## 자동 유지관리 루프
- 코드 변경 시 해당 도메인의 SOT 1개만 수정한다.
- 상태 변경은 반드시 `docs/archive/decision-history/active-dispatch.md`에 Wave 단위로 기록한다.
- 배포 기준/명령이 바뀌면 `package.json` + `deployment-guide.md`를 같은 변경셋으로 묶는다.
- 테스트 게이트 변경 시 `testing-guide.md`와 route contract 문서를 함께 갱신한다.
- 매일 종료 시 KPI/장애/미해결 항목을 다음날 D1 계획으로 자동 이월한다.

## 당일 성공 기준
- 배포는 "트리거 성공"과 "헬스 성공"을 분리 보고하고, 실패 원인을 단계별로 기록한다.
- P0 라우트(`/`, `/shop`, `/payment/*`, `/mypage`)에서 치명적 차단 이슈 0건.
- 결제 검증 체인에서 금액불일치/중복호출/지갑불일치 경보가 즉시 추적 가능해야 한다.
- `active-dispatch`와 본 문서의 작업 상태가 일치해야 한다.

---
Last Updated: 2026-03-03
Owner: Product Ops + Engineering Lead + DevOps Lead
Next Review: 2026-03-04
