# 팀 병렬 실행 플랜 (각 팀 20개)

## FE팀 (프론트엔드) 20개
1. MCP 로그인 버튼 라벨/브랜딩 로컬라이징 정합성
2. AuthModal MCP 버튼 접근성 라벨(aria-label) 추가
3. MCP 로그인 시작 시 로딩 상태 스켈레톤/토스트 피드백 추가
4. OAuth 에러 코드별 사용자 메시지 맵핑
5. 로그인/회원가입 모달 열림 시 이전 에러 메시지 초기화
6. 모바일 너비에서 MCP 버튼 간격/크기 반응형 조정
7. 프로필 배너 영역에서 마지막 로그인 방식 표시
8. `auth/callback` 페이지에서 MCP 에러코드 표시 UI 추가
9. `/mypage` 진입 시 인증 상태 리프레시 훅 추가
10. MCP 사용자 이름/이메일 표시 컴포넌트 분기 처리
11. 사용자 데이터 쿠키 파싱 유틸 공통화
12. 로그인 모달에서 외부 인증 버튼 순서 정책 정렬
13. 다크/라이트 테마 대비 체크 대응
14. 로그인 버튼 터치 타겟 최소 44px 보장
15. 이메일 로그인 실패 시 inline error 영역 정렬 개선
16. 인증 성공시 즉시 이동 애니메이션 추가
17. AuthModal 닫기 동작 중복 호출 방지(디바운스)
18. 로그인 상태 토글 버튼에 로컬 캐시 fallback 추가
19. MCP 사용 불가 환경에서 버튼 비활성 안내
20. 화면 캡처 기반 QA 체크리스트(모바일/데스크톱) 정리

## BE팀 (백엔드) 20개
1. MCP 콜백에서 `providerUserId` 비정수 처리 정책 문서화
2. MCP callback 상태/토큰 에러 코드 enum 정비
3. `supabase/schema.sql` MCP 필드/지갑 보상 컬럼 정합성 재점검
4. `supabase/migrations` MCP 전용 유저 플로우 검증용 마이그레이션 정렬
5. `src/lib/auth-mcp.ts` 프로필 파서에 name 필드 정규화 강화
6. 토큰 교체 실패 시 에러 카테고리 분기(네트워크/인가/구성오류)
7. callback에서 사용자 upsert 실패 시 알림 비차단 처리 정책 적용
8. `wallet` upsert 충돌 케이스 유닛 테스트 시나리오 작성
9. MCP callback에 idempotency guard 추가
10. 쿠키 `MCP_STATE`, `MCP_CODE_VERIFIER` TTL 경고 문구 로그
11. state 값 길이/엔트로피 검사 강화
12. mcp 토큰 갱신 시 `mcp_refresh_token` 동기화 저장
13. `/api/auth/mcp/callback` 요청 로그 구조화
14. 동시 로그인 시 race-condition 방어용 DB unique 전략 점검
15. MCP 사용자 동기화 시 최소 컬럼(upsert) 전용 map 생성
16. `src/types/database.ts`와 `src/lib/supabase.ts` 타입 싱크 재검증
17. Notion 이벤트 저장 시 MCP 인증 이벤트 타입 추가
18. Mock 모드와 실제 모드 분기 메시지 정합성 정리
19. `last_login_at` 타임스탬프 포맷 통일(UTC)
20. `/api/auth/mcp/callback` 실패 시 fallback 리다이렉트 전략 고도화

## DO팀 (운영/문서) 20개
1. MCP 환경변수 목록 및 안전한 값 예시 문서화
2. 프로덕션/스테이징 환경 `.env` 키 교차 확인
3. OAuth 테스트 계정 발급/폐기 운영 절차 정립
4. MCP 연동 장애 모니터링 알람 규칙 등록
5. 토큰 에러율 주간 대시보드 설정
6. 배포 전 schema 마이그레이션 실행 순서표 작성
7. rollback 절차: MCP 전용 컬럼 롤백 체크리스트
8. 회귀 테스트 시나리오: MCP 로그인 성공/실패
9. 사용자 데이터 쿠키 만료 정책 문서화
10. 보안 점검: SameSite/Secure 플래그 검증
11. 비밀번호/시크릿 변수 회전 주기 정의
12. API 응답 지연 임계값 기준값 정의
13. 릴리스 노트 템플릿에 MCP 변경사항 항목 고정
14. 운영자 알림 수신 채널 정리
15. 장애 대응 RTO/RPO 가이드 작성
16. 민감 로그 마스킹 규칙 적용 가이드
17. 기능 점검용 샘플 계정별 기대 결과집 작성
18. 모니터링 지표: 로그인 실패율, OAuth state mismatch율
19. 문서 버전 관리 및 최신 일자 표기 강제
20. 다음 분기까지의 MCP 확장 로드맵 정리
