# 실운영 전환 런북 (Launch Runbook)

목표: 무료 오픈(FREE_LAUNCH) 상태의 SecretSaju 를 **유료 판매 가능한 운영 상태**로 전환하는 전체 절차.
각 단계는 순서대로 수행한다. ✅ = 코드가 이미 준비된 것, ⚠️ = 운영자(사람)가 직접 해야 하는 것.

## 🚀 먼저 이것부터 — 지금 뭐가 남았는지 1초에 확인

```bash
npm run preflight:launch   # 현재(무료 오픈) 기준 — 무엇이 미설정인지
npm run preflight:paid     # 유료 전환 기준(엄격) — 판매 개시를 막는 것만
```

환경변수·사업자 정보·마이그레이션·FREE_LAUNCH 상태를 한 번에 점검하고, 차단 항목이 있으면 종료코드 1 을 낸다.

DB 는 코드가 확인할 수 없으므로 **`scripts/ops/verify-db.sql`** 를 Supabase SQL Editor 에 붙여 넣어라 (읽기 전용·안전). 마이그레이션 001~010 중 무엇이 적용됐는지, RLS 가 켜져 있는지, 잔액 변경 트리거가 잘못 생기지 않았는지 표로 나온다. **"미적용"으로 나온 것만** 순서대로 실행하면 된다.

---

## 1. 필수 환경변수 (Vercel → Project Settings → Environment Variables)

### 코어 (없으면 해당 기능이 mock 으로 동작)

| 변수 | 용도 | 비고 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | ⚠️ 클라이언트 노출 안전 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon 키 | ⚠️ RLS 전제. 클라이언트 노출 안전 |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 전용 관리 키 | ⚠️ **NEXT_PUBLIC 금지**, 서버 라우트만 사용 |
| `NEXT_PUBLIC_BASE_URL` | 결제 콜백·메일 링크의 기준 도메인 | 예: `https://서비스도메인` |

### 결제 (Toss — 유료 전환 시 필수)

| 변수 | 용도 |
|---|---|
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | 위젯용 클라이언트 키 |
| `TOSS_SECRET_KEY` | 서버 검증용 시크릿 |
| `NEXT_PUBLIC_TOSS_SUCCESS_URL` / `NEXT_PUBLIC_TOSS_FAIL_URL` | 콜백 URL (도메인 allowlist 검증 있음) |

### 인증 (카카오)

| 변수 | 용도 |
|---|---|
| `NEXT_PUBLIC_KAKAO_JS_KEY` | 카카오 JS SDK |
| `KAKAO_REST_API_KEY` / `KAKAO_CLIENT_SECRET` | 서버 토큰 교환 |

### AI (해당 기능 사용 시)

| 변수 | 용도 |
|---|---|
| `ANTHROPIC_API_KEY` | AI 서사(persona 등) |
| `GEMINI_API_KEY` | 손금 분석·타로 이미지 재생성 스크립트 |

### 운영 보조

| 변수 | 용도 |
|---|---|
| `CRON_SECRET` | `/api/cron/*` 인증 (⚠️ 미설정 시 prod 에서 크론이 401) |
| `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_KAKAO_PIXEL_ID` | 분석 (선택) |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | PostHog 제품 분석 (선택 — phc_ 공개 토큰, 미설정 시 no-op) |
| `ADMIN_EMAILS` / `NEXT_PUBLIC_ADMIN_EMAILS` | 관리자 이메일 목록 |

---

## 2. 데이터베이스 (Supabase)

1. ⚠️ `supabase/schema.sql` 이 적용된 프로젝트인지 확인.
2. ⚠️ **먼저 `scripts/ops/verify-db.sql` 로 적용 상태를 확인**한 뒤, 미적용분만 파일명 순서대로 SQL Editor 에서 실행 — 현재 001~**010** (신규: 009 `gift_results`, 010 `ops_counters`+원자 증가 RPC).
3. ✅ 잔액 변경 경로는 두 가지뿐이다 — RPC `deduct_jellies`(차감)와 라우트의 수동 `update`(적립). **트랜잭션 INSERT 로 잔액이 바뀌는 트리거는 없다** — 새 라우트를 만들 때 이 가정을 다시 들여오지 말 것.
4. ⚠️ RLS 활성 상태 확인 (`saju_profiles`, `jelly_wallets`, `jelly_transactions`, `orders`, `gift_results`, `ops_counters`).

---

## 3. 유료 전환 절차 (FREE_LAUNCH 플립)

전환 전 사전 조건:

1. ✅ 지갑 단일화 완료 상태여야 한다 (jelly 단일 통화 — churu/nyang 잔재가 코드에 없어야 함).
2. ⚠️ Toss 실키 등록 + 결제 1건 실테스트 (990원 티어 → 젤리 적립 → 환불 처리 확인).
3. ⚠️ `src/config/constants.ts` 의 `FREE_LAUNCH = true` → `false` 로 변경 후 배포.
   - 의도적으로 env 가 아니라 코드 상수다 (미정의 env 는 클라이언트 번들에서 조용히 falsy 가 되어 전 기능이 잠기는 사고 방지).
4. 전환 직후 확인 체크리스트:
   - [ ] 헤더 잔액 배지가 "무료" → 실잔액 숫자로 바뀌는가
   - [ ] 신규 방문자가 웰컴 젤리를 받는가 (히스토리에 `welcome_bonus` 트랜잭션)
   - [ ] 젤리 부족 상태에서 사주 실행 시 결제 유도가 뜨는가 (음수/이중 차감 없음)
   - [ ] 로그인 사용자의 차감이 DB 잔액에 반영되는가 (`/api/wallet/consume` → RPC)
   - [ ] 결제 → 젤리 적립 → 기능 사용 전체 루프

---

## 4. 법적 표기 (전자상거래법)

- ✅ **안전장치**: `tests/logic/launch-readiness.test.ts` 가 FREE_LAUNCH=false 인데 자리표시자가 남아 있으면 **CI 를 실패시킨다** — 가짜 사업자 정보로 판매가 시작되는 사고가 구조적으로 불가능하다.
- ⚠️ `src/config/constants.ts` 의 `BUSINESS_INFO` 가 **플레이스홀더 상태다** (등록번호 `123-45-67890`, 주소 `Seoul, Korea 123` 등). 실제 사업자등록번호·통신판매업 신고번호·대표자명·주소·연락처로 교체해야 판매 가능.
- ✅ `/terms`, `/privacy`, `/refund`, `/legal` 페이지 존재 + 메뉴 등록 완료. ⚠️ 내용이 실제 사업 조건과 일치하는지 법률 검토.

---

## 5. 배포·검증·롤백

### 정기 검증 (배포 전 로컬/CI)
```bash
npx tsc --noEmit && npx next lint && npm run test:logic && npm run build
```

### 실동작 가드 (standalone 서버 필요)
```bash
# 빌드 후 static/public 복사 → 서버 기동 (배경)
PORT=3900 node .next/standalone/server.js &
export PW_CHROMIUM=/opt/pw-browsers/chromium-1194/chrome-linux/chrome  # 환경에 맞게
node scripts/qa/menu-coverage.mjs
node scripts/qa/menu-smoke.mjs      http://localhost:3900   # ROUTES 환경변수에 menu-routes.json 내용
node scripts/qa/english-leak-scan.mjs http://localhost:3900
node scripts/qa/layout-audit.mjs     http://localhost:3900
node scripts/qa/contrast-audit.mjs   http://localhost:3900
node scripts/qa/free-launch-smoke.mjs http://localhost:3900
```
가드는 기준선(baseline) 대비 **신규 발생만** 실패로 본다. 의도한 변경이면 `--update-baseline`.

### 배포
- main 머지 → Vercel 자동 배포. PR 은 Quality 체크(CI) 그린 확인 후 머지.

### 롤백
- Vercel 대시보드 → Deployments → 직전 배포 "Promote to Production" (1분 내).
- DB 마이그레이션이 얽힌 경우: 마이그레이션은 additive-only 원칙 (컬럼/테이블 추가만) — 코드 롤백만으로 안전해야 한다.

---

## 6. 모니터링·보안 운영

- ✅ `/api/health` 헬스체크 존재 — ⚠️ 업타임 모니터(UptimeRobot 등)에 등록.
- ✅ 보안 헤더 구성 완료 (HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy).
- ✅ 결제 검증: 서명 timingSafeEqual + 콜백 도메인 allowlist + pending→completed 조건부 전이(중복 적립 방지).
- ⚠️ 의존성: `npm audit fix` 를 릴리스마다 실행. 현재 잔여 런타임 취약점은 Next 에 번들된 postcss 3건뿐 — 상류(Vercel) 수정 대기 항목. `--force` 는 메이저 업그레이드를 동반하므로 별도 검증 없이 금지.
- ⚠️ **키 로테이션**: 개발 중 대화·로그에 노출된 `GEMINI_API_KEY` 는 즉시 재발급.
- ✅ PWA 서비스워커 재구성 완료 (next-pwa 제거, 순수 SW): 정적 자산 CacheFirst, 문서 NetworkFirst, **결제·지갑·인증 경로 캐시 금지**, 오프라인 폴백. 정책은 `src/lib/pwa/route-policy.ts` 가 단일 원본.

---

## 7. 알려진 잔여 한계 (판매 차단 요소 아님, 인지 필요)

- ~~인메모리 idempotency 카운터~~ → `ops_counters` 테이블 + 원자 RPC 로 이전 완료 (마이그레이션 010). 카운터는 여전히 best-effort(DB 실패가 결제 검증을 막지 않음)이며, 안전장치의 본체는 orders 의 pending→completed 조건부 전이다.
- 비로그인 사용자의 지갑·해금 기록은 기기(localStorage) 단위다 — 기기 변경 시 이전 불가. 로그인 유도가 해결책.
- 영문 라벨 기준선 116건은 전수 분류를 거친 의도된 표기(타로 카드 원명 78건 등) — 신규 유입만 가드가 차단.
