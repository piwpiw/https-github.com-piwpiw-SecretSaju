# SecretSaju NEXT_ACTIONS — 진짜 해야 할 것들
# 모든 AI 에이전트와 플랫폼이 참조하는 단일 작업 목록
# 이 파일이 "무엇을 해야 하는가"의 유일한 진실의 원천(SSOT)입니다.
# 다른 문서의 체크리스트는 이력용(archive). 이 파일만 최신.
#
# 사용법:
# - [ ] 미완료  |  [/] 진행중  |  [x] 완료
# - AI가 작업 시작 시: 해당 항목을 [/]로 변경
# - AI가 작업 완료 시: [x]로 변경 + AI_BOOTSTRAP.md Last Checkpoint 갱신

---

## 🔴 Priority 0 — 지금 당장 (제품이 동작하기 위해 필수)

### P0-1. 실제 LLM API 연동
- [x] `/api/persona/route.ts` — GPT-4o → Claude 3.5 → Gemini 1.5 → 폴백 체인 구현
- [x] `AINarrativeSection.tsx` — 실제 API 호출 + 로딩 스켈레톤 + 새로고침 버튼
- [ ] API Key 환경변수 설정 (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_AI_KEY`)
- **검증**: 키 설정 시 `/api/persona` POST → 실제 LLM 응답 반환

### P0-2. TransitTicker 실시간 만세력 연동
- [x] `ganji.ts`의 `getDayPillar(new Date())`, `getHourPillar()` 완전 연동
- [x] 유저 천간 기반 오행 충돌 감지 로직 구현
- [x] hydration-safe (client-only useEffect)
- **검증**: ✅ 완료

### P0-3. ProfileWallet DB 바인딩
- [x] `/api/saju/list` 실연동 + 로딩/에러/빈 상태 완비
- [x] `/api/saju/delete` 삭제 기능 + hover 표시
- [x] 로그인 안된 상태 (401) 처리
- **검증**: ✅ 완료

### P0-4. 빌드 안정성
- [x] `npx tsc --noEmit` exit code: 0
- [x] `npm run build` exit code: 0
- [x] DEEP_HISTORY.md 인코딩 깨짐 복구
- **검증**: ✅ 완료

---

## 🟡 Priority 1 — 다음 스프린트 (성장/전환에 필수)

### P1-1. MASTER_PRD.md 현행화
- [x] Next.js 14 → 15, React 19 반영
- [x] Phase 2-3 체크리스트 완료 항목 [x] 표시
- [x] Wave 11+ 내용 추가 (Auth, Stripe, MPPS, Context Efficiency)
- [x] 버전 5.0 → 6.0 업데이트

### P1-2. 테스트 커버리지 확대
- [x] `tests/saju-engine.test.ts` — 사주 엔진 핵심 테스트 20개
- [x] `tests/ai-routing.test.ts` — AI 라우팅 8개 테스트
- [x] `tests/payment-flow.test.ts` — 결제 로직 12개 테스트
- [x] `vitest.logic.config.ts` — 순수 로직 테스트 설정
- [x] `ai-routing.ts` 타입 개선 (rawSajuData optional, chat queryType)
- [x] **테스트 실행** — ERR-L001 해결 후 `npx vitest run --config vitest.logic.config.ts` (37개 로직 테스트 전체 통과 완료)

### P1-3. 결제 플로우 End-to-End
- [x] `/api/payment/verify` 완전 구현 확인 (519줄, 모든 엣지케이스 포함)
- [x] 첫 구매 보너스, 지갑 잔액 불일치 감지, Notion 로깅 확인
- [ ] 실 테스트 카드로 결제 → 젤리 잔액 변동 확인 (키 설정 필요)

### P1-4. 궁합/호환 페이지
- [x] `/compatibility` 페이지 이미 완전 구현 확인 (450줄)
- [x] ProfileProvider, WalletProvider, LoveScoreCounter, RelationshipRadar 연동
- **검증**: ✅ 완료 (추가 구현 불필요)

### P1-5. 일일운세
- [x] `/api/daily-fortune` 완전 구현 (만세력 연동 + Supabase DB 캐시 + 폴백)
- **검증**: ✅ 완료

### P1-6. Wave 12: 학파(Lineage) 및 근거(Evidence) 기반 신뢰도 시각화
- [x] `/api/persona/route.ts`에 `evidence`와 `canonicalFeatures` 컨텍스트 주입 로직 고도화
- [x] `AINarrativeSection.tsx` 또는 `ResultCard.tsx`에 "분석 학파 및 근거" 인장(Seal) UI 구현
- **검증**: 결과 화면에서 학파적 관점 및 명리학적 근거가 시각적으로 프리미엄하게 노출되는지 확인

---

## 🟢 Priority 2 — 품질/운영 (안정화 후)

### P2-1. 선물하기 기능
- [x] `/gift` — 수신자 생년월일 입력 → 젤리 차감(결제) → 익명 링크 확인 및 이메일 발송 완비
- **관련 파일**: `src/app/gift/page.tsx`, `src/app/api/gift/send/route.ts`

### P2-2. PWA 패키징
- [x] Service Worker, manifest, 오프라인 캐시 전략 (`next-pwa` 통합)
- **검증**: 모바일에서 "홈 화면에 추가" 동작 및 로컬 테스트 완료

### P2-3. Analytics 연동
- [x] GA4 또는 Vercel Analytics 실제 이벤트 트래킹
- [x] `start_analysis`, `share_click`, `payment_click`, `payment_complete` 이벤트
- **관련 파일**: `src/lib/analytics.ts`

### P2-4. Content DB 확장
- [x] `animal_archetypes` Supabase 테이블 보강 (seed.sql 생성)
- [x] 음식/제품 추천 DB화 (seed.sql 생성)
- **관련 파일**: `supabase/schema.sql`, `supabase/seed.sql`

### P2-5. Mock 모드 정리
- [x] 23개 파일에 `NEXT_PUBLIC_USE_MOCK_DATA` 분산 — 통합 유틸리티로 정리
- [x] 프로덕션 배포 시 mock 코드가 실행되지 않는지 확인 (use-mock.ts 단일 진실의 원천 적용)

---

## 📋 문서 정합성 (이번 감사에서 발견)

| 문서 | 상태 | 필요 조치 |
|------|------|----------|
| `MASTER_PRD.md` | ⚠️ 구버전 (v5, Next.js 14) | P1-1에서 현행화 |
| `implementation_plan_v11.md` | ⚠️ 모든 T-항목이 [ ] — task.md와 불일치 | 이 파일(NEXT_ACTIONS)로 대체 |
| `task.md` | ⚠️ Wave 11 항목이 [x]이지만 실제로는 스텁 | P0 항목들이 실제 완료 기준 |
| `execution-backlog-ko.md` | ✅ 정확 | 유지 (라우트 계약서) |
| `AI_BOOTSTRAP.md` | ✅ 최신 | 유지 |
| `ERROR_LEDGER.md` | ✅ 최신 | 유지 |

---

**Last Updated**: 2026-03-05T13:49
**Updated By**: Claude
## Resume Note (2026-03-06)
- [x] Recovered pre-reboot context and identified the active local blocker.
- [x] Mitigated Windows dev cache corruption by updating `scripts/dev-safe.js`
      to clean `.next/cache/webpack` before startup.
- [x] Re-run local `/login` verification with `npm run dev:safe`.
- [x] Continue remaining P1 items after dev runtime is stable.
