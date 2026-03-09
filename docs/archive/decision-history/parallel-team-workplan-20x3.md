# 팀 병렬 실행 플랜 (각 팀 20개) - 최종 완료

## FE팀 (프론트엔드) 20개
1. [x] MCP 로그인 버튼 라벨/브랜딩 로컬라이징 정합성
2. [x] AuthModal MCP 버튼 접근성 라벨(aria-label) 추가
3. [x] MCP 로그인 시작 시 로딩 상태 스켈레톤/토스트 피드백 추가
4. [x] OAuth 에러 코드별 사용자 메시지 맵핑
5. [x] 로그인/회원가입 모달 열림 시 이전 에러 메시지 초기화
6. [x] 모바일 너비에서 MCP 버튼 간격/크기 반응형 조정 (min-h-[56px] 및 truncate 적용)
7. [x] 프로필 배너 영역에서 마지막 로그인 방식 표시 (auth_provider 연동)
8. [x] `auth/callback` 페이지에서 MCP 에러코드 표시 UI 추가
9. [x] `/mypage` 진입 시 인증 상태 리프레시 훅 추가 (focus 이벤트 연동)
10. [x] MCP 사용자 이름/이메일 표시 컴포넌트 분기 처리
11. [x] 사용자 데이터 쿠키 파싱 유틸 공통화
12. [x] 로그인 모달에서 외부 인증 버튼 순서 정책 정렬 (Kakao, Google, Naver, MCP 순)
13. [x] 다크/라이트 테마 대비 체크 대응 (AA 4.5:1 준수 확인)
14. [x] 로그인 버튼 터치 타겟 최소 44px 보장 (min-h-[56px] 적용)
15. [x] 이메일 로그인 실패 시 inline error 영역 정렬 개선 (AnimatePresence 적용)
16. [x] 인증 성공 시 즉시 이동 애니메이션 추가 (G-1 시나리오 동기화)
17. [x] AuthModal 닫기 동작 중복 호출 방지(디바운스)
18. [x] 로그인 상태 토글 버튼에 로컬 캐시 fallback 추가 (UserData 캐시 연동)
19. [x] MCP 사용 불가 환경에서 버튼 비활성 안내
20. [x] 화면 캡처 기반 QA 체크리스트(모바일/데스크톱) 정리 (QA_CHECKLIST_RELEASE.md)

## BE팀 (백엔드) 20개
1. [x] MCP 콜백에서 `providerUserId` 비정수 처리 정책 문서화
2. [x] MCP callback 상태/토큰 에러 코드 enum 정비
3. [x] `supabase/schema.sql` MCP 필드/지갑 보상 컬럼 정합성 재점검
4. [x] `supabase/migrations` MCP 전용 유저 플로우 검증용 마이그레이션 정렬 (Unique constraint 확인)
5. [x] `src/lib/auth/auth-mcp.ts` 프로필 파서에 name 필드 정규화 강화
6. [x] 토큰 교체 실패 시 에러 카테고리 분기(네트워크/인가/구성오류) (McpCallbackErrorCode 확장)
7. [x] callback에서 사용자 upsert 실패 시 알림 비차단 처리 정책 적용 (sendWelcomeEmail/Notion 로깅 비차단)
8. [x] `wallet` upsert conflict case 유닛 테스트 시나리오 작성 (auth-wallet.test.ts)
9. [x] MCP callback에 idempotency guard 추가 (mcpProcessedStates 연동)
10. [x] 쿠키 `MCP_STATE`, `MCP_CODE_VERIFIER` TTL 경고 문구 로그
11. [x] state 값 길이/엔트로피 검사 강화 (128자 증가)
12. [x] mcp 토큰 갱신 시 `mcp_refresh_token` 동기화 저장 (response.cookies.set 연동)
13. [x] `/api/auth/mcp/callback` 요청 로그 구조화
14. [x] 동시 로그인 시 race-condition 방어용 DB unique 전략 점검 (UNIQUE 제약 확인)
15. [x] MCP 사용자 동기화 시 최소 컬럼(upsert) 전용 map 생성
16. [x] `src/types/database.ts`와 `src/lib/integrations/supabase.ts` 타입 싱크 재검증
17. [x] Notion 이벤트 저장 시 MCP 인증 이벤트 타입 추가 (AUTH_EVENT)
18. [x] Mock 모드와 실제 모드 분기 메시지 정합성 정리
19. [x] `last_login_at` 타임스탬프 포맷 통일(UTC)
20. [x] `/api/auth/mcp/callback` 실패 시 fallback 리다이렉트 전략 고도화

## DO팀 (운영/문서) 20개
1. [x] MCP 환경변수 목록 및 안전한 값 예시 문서화
2. [x] 프로덕션/스테이징 환경 `.env` 키 교차 확인
3. [x] OAuth 테스트 계정 발급/폐기 운영 절차 정립 (MASTER_GUIDE.md 수록)
4. [x] MCP 연동 장애 모니터링 알람 규칙 등록 (NOTIFICATION_CHANNELS.md 수록)
5. [x] 토큰 에러율 주간 대시보드 설정 (MASTER_GUIDE.md 모니터링 수록)
6. [x] 배포 전 schema 마이그레이션 실행 순서표 작성
7. [x] rollback 절차: MCP 전용 컬럼 롤백 체크리스트
8. [x] 회귀 테스트 시나리오: MCP 로그인 성공/실패 (QA_CHECKLIST_RELEASE.md 수록)
9. [x] 사용자 데이터 쿠키 만료 정책 문서화 (COOKIE_POLICY.md)
10. [x] 보안 점검: SameSite/Secure 플래그 검증 (COOKIE_POLICY.md)
11. [x] 비밀번호/시크릿 변수 회전 주기 정의 (MASTER_GUIDE.md 수록)
12. [x] API 응답 지연 임계값 기준값 정의 (MASTER_GUIDE.md 수록)
13. [x] 릴리스 노트 템플릿에 MCP 변경사항 항목 고정
14. [x] 운영자 알림 수신 채널 정리 (NOTIFICATION_CHANNELS.md)
15. [x] 장애 대응 RTO/RPO 가이드 작성 (MASTER_GUIDE.md 수록)
16. [x] 민감 로그 마스킹 규칙 적용 가이드 (MASTER_GUIDE.md 수록)
17. [x] 기능 점검용 샘플 계정별 기대 결과집 작성
18. [x] 모니터링 지표: 로그인 실패율, OAuth state mismatch율 (MASTER_GUIDE.md 수록)
19. [x] 문서 버전 관리 및 최신 일자 표기 강제
20. [x] 다음 분기까지의 MCP 확장 로드맵 정리 (MASTER_GUIDE.md 수록)

---

## 🧭 Core Guidelines & Scenario Checklist (G-Series)

### 🎨 FE (Frontend)
- **G-1 (Motion Timing)**: 인증 성공 후 `/dashboard` 이동 시 애니메이션을 위해 정확히 **2500ms**의 딜레이를 유지할 것.
- **G-2 (Button Locking)**: 특정 로그인 수단이 선택되면 다른 모든 버튼은 `disabled` 상태로 고정하며, 명시적인 로딩 인디케이터를 노출할 것.
- **G-3 (Mobile Target)**: 모든 터치 타겟은 최소 44x44px를 유지하며, 모바일 Safari에서의 탭 하이라이트 현상을 방지할 것.
- **G-11 (ReturnTo Persistence)**: 로그인 페이지 진입 전의 URL을 `STORAGE_KEYS.RETURN_TO`에 저장하고, 콜백 완료 후 해당 경로로 복구할 것.
- **G-12 (Context Sanitization)**: 사용자 프로필(Nickname) 노출 시 XSS 방지를 위해 HTML 태그를 제거하는 유틸리티를 반드시 거칠 것.

### ⚙️ BE (Backend)
- **G-4 (Idempotency)**: 동일한 `code`나 `state`가 10분 이내에 재입입될 경우 에러를 반환하는 `mcpProcessedStates` TTL 로직을 엄격히 준수할 것.
- **G-5 (Payload Normalization)**: `providerUserId`는 반드시 문자열로 캐스팅하여 DB 인덱스 스캔 효율을 보장할 것.
- **G-6 (Logout Purge)**: 로그아웃 요청 시 서버 측 세션 쿠키와 클라이언트 측 로컬 스토리지를 동시에 파기하는 "Two-Way Purge" 지침을 따를 것.
- **G-13 (Atomic Reward Check)**: 가입 보상(Jelly) 지급 시 `jelly_transactions` 테이블에 동일 `type='signup_bonus'` 존재 여부를 선검증하여 중복 지급을 원천 차단할 것.
- **G-14 (Token Buffer)**: 토큰 만료 5분 전(`expires_in < 300`)에 자동으로 `refresh_token`을 수행하는 미들웨어/훅 로직을 구현할 것.

### 📋 DO (Ops/Docs)
- **G-7 (Error Sync)**: 신규 추가된 OAuth/MCP 에러 코드(provider_error 등)를 `ERROR_CATALOG.md`에 **ERR-013~020**으로 즉시 등재할 것.
- **G-8 (Env Verification)**: 배포 전 `.env`의 `CALLBACK_URL`이 실제 타겟 도메인과 일치하는지 `verify-env.js`에서 선검증 단계를 추가할 것.
- **G-9 (RTO Policy)**: 인증 장애 발생 시 15분 이내에 `FEATURES.MCP = false` 킬스위치를 작동하는 수동 롤백 프로토콜을 문서화할 것.
- **G-10 (Compliance)**: SameSite=Lax 및 Secure 플래그가 모든 인증 관련 쿠키에 적용되었는지 SSR 헤더를 통해 최종 교차 검증할 것.
- **G-15 (Shadow Logging)**: 개인정보(PII) 누출 방지를 위해 `NotionLogData` 전송 시 이메일의 로컬 파트만 별표 처리하여 마스킹할 것.

---

## 🔍 Advanced Scenario Review & Optimization (S-Series)

### [S-1] 네트워크 단절 콜백 유실 시나리오
- **현상**: OAuth 서버에서 콜백이 왔으나, 클라이언트 브라우저가 닫히거나 네트워크가 끊겨 `route.ts`가 완료되지 않음.
- **대책**: MCP 서버에 `idempotency_key`를 전달하여 재시도 시 동일 토큰을 안전하게 재발급 받도록 협의(또는 내부 큐 도입).

### [S-2] 멀티 디바이스 세션 불일치 시나리오
- **현상**: PC에서 닉네임 변경 후 모바일 앱에서는 여전히 예전 닉네임 쿠키가 남아있음.
- **대책**: `/mypage` 진입 시 `last_updated` 필드를 비교하여 로컬 쿠키를 즉시 파기(Purge)하고 서버 데이터로 재동기화하는 로직 적용.

### [S-3] 대량 가입 시도 및 어뷰징 시나리오
- **현상**: 가입 보상 젤리 탈취를 위해 동일 IP 또는 유사 메일로 대량 가입.
- **대책**: IP 기반 `Rate-Limit` 외에 `Supabase Edge Function`에서 `user_metadata`의 유사도를 분석하여 고위험 가입을 'Pending' 상태로 보류함.
