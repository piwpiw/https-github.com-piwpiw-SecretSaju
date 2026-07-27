# SecretSaju NEXT_ACTIONS — 진짜 해야 할 것들
# 모든 AI 에이전트와 플랫폼이 참조하는 단일 작업 목록
# 이 파일이 "무엇을 해야 하는가"의 유일한 진실의 원천(SSOT)입니다.
#
# 사용법: [ ] 미완료 | [/] 진행중 | [x] 완료
# 완료 시: [x]로 변경 + AI_BOOTSTRAP.md Last Checkpoint 갱신

---

## 🔴 Priority 0 — 지금 당장

### P0-1. 실제 LLM API 키 설정 (수동)
- [ ] Vercel 환경변수 설정: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_AI_KEY`
- **검증**: `/api/persona` POST → 실제 LLM 응답 반환

> P0 나머지 모두 완료 (LLM 체인, TransitTicker, ProfileWallet, 빌드 안정성)

---

## 🟡 Priority 1 — 다음 스프린트

### P1-3. 결제 End-to-End 실 테스트 (수동)
- [ ] 실 테스트 카드로 결제 → 젤리 잔액 변동 확인 (키 설정 필요)

> P1 나머지 모두 완료 (MASTER_PRD, 테스트 커버리지, 궁합, 일일운세, Wave 12 Lineage UI)

---

## 🟢 Priority 2 — 품질/운영

> P2 모두 완료 (선물하기, PWA, GA4, Content DB, Mock 모드 정리)

---

## 📋 문서 정합성

| 문서 | 상태 |
|------|------|
| `MASTER_PRD.md` | ✅ v6.0 현행화 완료 |
| `execution-backlog-ko.md` | ✅ 라우트 계약서 (유지) |
| `AI_BOOTSTRAP.md` | ✅ 최신 |
| `ERROR_LEDGER.md` | ✅ 최신 |
| `implementation_plan_v11.md` | 🗃️ 이 파일로 대체됨 (참고용) |

---

## 🔵 진행 중 / 다음 우선순위

### DOC-1. 대형 문서 Compact (완료)
- [x] `docs/00-overview/DEEP_HISTORY.md` (25KB → ~2KB)
- [x] `docs/00-overview/fortune-reader-system-design-2026-03-07.md` (18KB)
- [x] `docs/02-technical/core-engine/SAJU_VALIDATED_IMPLEMENTATION_BLUEPRINT.md` (18KB)
- [x] `docs/02-technical/core-engine/SAJU_DEEP_RESEARCH_STANDARD.md` (16KB)
- [x] `docs/02-technical/architecture/overview.md` (15KB)
- [x] `docs/01-team/engineering/coding-standards.md` (14KB)
- [x] `NEXT_ACTIONS.md` — 완료 항목 아카이브
- [x] `AI_BOOTSTRAP.md` — 구버전 Resume Checkpoint 섹션 제거 (free-launch 현황으로 갱신)

### PWQ-1. 병렬 작업 큐 소진 (완료 2026-07-13)
- [x] Frontend FE-312~320 잔여 항목 해소 (실제 수정 + 이미 충족분 검증)
- [x] Backend BE-305~320 잔여 항목 해소 (실제 수정 + 이미 충족분 검증)
- [x] `docs/archive/decision-history/parallel-work-queue.md` mojibake 손상 → UTF-8 복원
- [x] Ops/QA 문서 정합성 항목(OPS-309/310/311/312/313/319) — deployment.md, setup.md, active-dispatch.md, roadmap.md, mcp-rollback-checklist.md 최신화 + UI 영어 카피 누락 3건 수정
- [x] Ops/QA 자동화 가능 항목(OPS-303/305/306/307/308/315/316/318/320) — 모바일 브레이크포인트·404/빈상태·성능·세션만료·직접진입·접근성 전수 점검, 버그 4건 발견·수정(오버플로우 2건, 로딩/빈상태 중복노출 1건, a11y 아리아라벨 6건)
- [x] ERROR_LEDGER ERR-L004 해결 (2026-07-14) — 세션 쿠키 만료 후 localStorage 캐시로 로그인 상태 유지되던 버그, 사용자 결정에 따라 TTL(1시간) 방식 채택. `src/lib/auth/kakao-auth.ts`
- [ ] Ops/QA OPS-301/302/304/314/317 — 라이브 배포/실 결제 키/크로스브라우저 필요로 헤드리스 불가, 최종 잔존

### PWQ-2. 런타임 회귀 스윕 (완료 2026-07-13)
- [x] 전체 54개 라우트 모바일 뷰포트 런타임 스모크(Playwright, `scripts/qa/menu-smoke.mjs`) — 크래시/404/예외 0건
- [x] 전역 위젯 4종 graceful-degradation 처리(weather/geolocation, wallet balance API, ambient audio, user-sync API) — 콘솔 에러/500 스팸 제거
- [x] `/fortune-readers`, `AINarrativeSection` hydration mismatch 버그 발견·수정 (실험 변형 조회를 렌더 중 비순수 호출 → 상태 기반 순수 함수로 전환) — 재검증 5/5 클린
- 최종 결과: 54/54 라우트 정상, tsc 0 / lint 0 / 테스트 68/68 / guard pass / mojibake 0

### PWQ-3. 프로덕션 빌드 기준 실구동 검증 (완료 2026-07-26)
> 배운 점: `next dev`는 지연 로드 청크를 캐시해 수정이 반영되지 않은 것처럼 보였고, 이 프로젝트는 `output: standalone` 설정이라 `next start`도 미지원(낡은 빌드를 서빙). **검증은 반드시 `next build` + `node .next/standalone/server.js`로 할 것.**
- [x] `FREE_LAUNCH`가 브라우저에서 항상 false로 평가되던 치명적 버그 수정 — `process.env.NEXT_PUBLIC_*`는 빌드 시 정의된 경우에만 치환되므로, 미설정(=기본 ON 의도) 시 표현식이 클라이언트 번들에 그대로 남아 모든 유료 장벽이 다시 잠김. 리터럴 `true`로 전환 + 누락된 게이트 2곳(`AINarrativeSection`, `/fortune-readers`) 연결
- [x] `/shop` 죽은 CTA 제거 — "이 플랜 선택"이 onClick 없는 `<div>`(소스 주석: *stylized button-look label*)였고 `<label className="cursor-pointer">`로 감싸 클릭 가능해 보였음. 무료 오픈 상태 표시로 교체 + 안내 배너/동작하는 CTA 추가
- [x] 홈 메인 폼 "시간 모름" 체크박스 키보드 접근 불가 수정 — `<div onClick>` → `<button role="checkbox" aria-checked>`. 사주 계산 결과를 바꾸는 항목이라 기능적으로도 중요
- [x] `/my-saju/list` 가짜 데이터 노출 수정 — "인연 네트워크"가 하드코딩된 김철수 85%·이영희 92%·박민수 78%를 사용자 실제 관계인 것처럼 표시. 실제 프로필 기반으로 전환 + 빈 상태 추가
- [x] 인터랙션/가짜버튼 검증 도구 추가: `scripts/qa/interaction-smoke.mjs`(입력·주요 버튼 실제 구동), `scripts/qa/fake-button-scan.mjs`(죽은/키보드 접근 불가 CTA 탐지)
- 최종 결과: 54/54 라우트 정상 · 인터랙션 18/18 에러 0 · 가짜버튼 스캔 잔여 0 · tsc 0 / lint 0 / 테스트 68/68 / guard pass

### PWQ-4. 메뉴 노출 · 무료 오픈 게이트 · 결과 화면 정합성 (완료 2026-07-27)
> 실제로 앱을 써 보고 나온 보고를 기점으로 진행. 소스 검사만으로는 안 잡히고 **프로덕션 빌드를 브라우저로 몰아 봐야** 드러나는 것들이었음.

**메뉴 트리 — 구현했는데 안 보이던 기능들**
- [x] `src/config/site-menu.ts` 신설 — 사용자 화면 37개를 6그룹으로 정리한 **단일 정본**. 타로·토정비결·꿈해몽·작명·손금·천문·신살·만세력이 홈 캐러셀과 `/more` 안에만 있어 "메뉴에 없다 = 없는 기능"처럼 보이던 문제 해소
- [x] 모바일 드로어(`Nav.tsx`)에 전체 그룹 메뉴 노출, `/more`에 전체 메뉴 디렉터리 추가
- [x] `scripts/qa/menu-coverage.mjs` 가드 — 라우트와 메뉴 정본 대조. 현재 라우트 54 / 등록 37 / 명시 제외 19 → 누락 0, 유령 0

**무료 오픈 게이트 — 무료라면서 전부 막혀 있던 문제 (런칭 블로커)**
- [x] `FREE_LAUNCH`는 표시·해금 7곳에서만 참조되고 **젤리 차감 10곳은 아무도 확인하지 않았음**. 게스트 잔액은 0이라 사주·궁합·토정비결·작명·신살·힐링이 전부 "젤리가 부족합니다"로 차단됨. 게이트가 `consumeChuru(n)` 반환값 확인과 `churu < n` 직접 비교 두 모양으로 흩어져 있어 `WalletProvider`에서 노출 잔액과 소비를 함께 처리
- [x] `hasSufficientBalance()`도 무료 기간 통과 처리 (`/my-saju/add`, `/relationship/[id]`)
- [x] 잔액 배지는 숫자 대신 "무료" 표시 — 내부적으로 큰 값을 넣는 구조라 그대로 두면 "1조 젤리 보유"처럼 읽혔음. 충전(+) 아이콘도 무료 기간에는 숨김
- [x] 1차 CTA에서 가격 제거 (`3젤리로 사주 실행` → `사주 분석 시작 (무료)` 등), 젤리 상점 모달에 무료 오픈 안내 배너
- [x] `scripts/qa/free-launch-smoke.mjs` 가드 — 실제 브라우저로 각 화면 CTA를 눌러 잔액 차단 문구·가격 CTA를 탐지

**결과 화면 — 사용자가 지적한 4건**
- [x] **멘탈 게이지가 항상 0** — 엔진 정본 표기는 한글인데 `advancedScoring.ts` 점수 테이블은 한자 키라 모든 조회가 undefined. 득령·득지·득세 전부 0 → **모든 사용자가 언제나 "신약"** 이었음. 표기 정규화 6곳 적용, 회귀 테스트 `tests/logic/gangyak-scoring.test.ts` 추가 (ERROR_LEDGER E-008)
- [x] **오행 "10점 만점"이 3/2/3/2/2** — 오행은 합이 100%인 구성비라 평균이 20%다. 0~100 척도나 `/10` 라벨로는 누구도 높은 값이 안 나옴. 균형점 20%, 최대 40% 척도로 전환하고 비중(%)+강약 라벨로 표기 → 실제 분포(3%~46%)가 드러남
- [x] **레이더가 너무 작게 보임** — 같은 원인. `SvgChart`에 `maxValue`/`baselineValue` 추가, 균형선(20%) 점선 표시. 결과 카드·결과 차트 실험실이 `wuxing.ts`의 공용 상수를 쓰도록 통일
- [x] **운세 상호작용이 영문** — `scope`('daewun')와 `actors`('currentSaewunBranch')가 내부 식별자 그대로 렌더링됨. 한국어 라벨 매핑 추가. 격국 근거 문구(`Month branch hidden stem ...`), 역법 스냅샷(`Calendar Boundary Snapshot`, `lichun`, `hour-source`), 결과 섹션 헤더(`Who You Are` 등)도 한국어화
- [x] 결과 차트 실험실이 카드와 다른 지표(`percent`, 출현 횟수 기반)를 써서 같은 오행이 카드 8% / 실험실 0%로 어긋나던 문제 → 카드와 같은 `score`로 통일

**가독성 · 줄바꿈 전수 점검**
- [x] 320/390/430 폭에서 문자 단위 rect를 측정해 단어 중간 줄바꿈·1~2자 고아 줄을 탐지하고, 수정 전 런타임으로 개선 여부를 확인한 뒤 소스 반영 — 20개 파일에 `break-keep`(+ 좁은 줄간격 `leading-relaxed`)
- [x] `/tarot`, `/dreams` 320px 가로 오버플로(콘텐츠 잘림) — 모바일 패딩 축소로 해소

**로그인 · 결제 점검**
- [x] `loginWithKakao()`가 JS 키 없이 호출되면 예외로 죽고 **사용자에게 아무 안내가 없던** 문제 — 키/리다이렉트 URI 검증과 한국어 안내 추가, 반환값으로 로딩 상태 해제
- [x] 카카오 콜백이 `NEXT_PUBLIC_KAKAO_JS_KEY is not configured` 를 사용자에게 그대로 노출하던 문제 제거(서버 로그에는 유지)
- [x] **로그아웃 시 Supabase 세션이 남던 문제** — `clearUserSession()`이 `sb-*` 세션을 지우지 않아, 로그아웃 후에도 `resolveUserId()`가 이전 사용자로 해석돼 공용 기기에서 타인 프로필이 보일 수 있었음. `auth.signOut()` 연결
- [x] API 4곳이 빈/깨진 JSON 본문에 500을 반환하던 문제 → 400으로 정정, `/gift` 중복 제출 잠금과 영문 오류 노출 수정
- [x] 클라이언트 번들에 미치환 `process.env.*` 0건 확인(결제 키 미설정 빌드 기준)

**영문 노출 가드**
- [x] `scripts/qa/english-leak-scan.mjs` — 54개 라우트를 실제로 렌더해 화면 텍스트의 영문을 탐지. 잔여 226건은 기준선(`english-leak-baseline.json`)으로 관리하고 **새로 생긴 것만 실패**. 잔여는 타로 카드 영문 원명과 장식용 헤더가 대부분

**검증 결과**: tsc 0 / lint 0 / 로직 테스트 50/50 / 메뉴 커버리지 누락 0 / 무료 게이트 차단 0 / 54개 라우트 스모크 54/54 / 신규 영문 노출 0

### PWQ-5. 영문 노출 정리 · 사문 제거 (완료 2026-07-27)
- [x] **`/fortune-readers`가 내부 식별자를 그대로 렌더링** — `queryType`/`tier`/`category`(`result`, `starter`, `plus · love` 등)에 CSS `uppercase`까지 걸려 `RESULT`, `STARTER`처럼 보였음. 사용자가 지적한 "운세 상호작용 영문"과 **같은 계열의 버그**. 정본(`fortune-readers.ts`)에 한국어 라벨 맵을 두고 모든 소비자가 쓰도록 함
- [x] **A/B 실험군(`control`)이 화면에 그대로 노출**되던 디버그 표시 제거 (`/fortune-readers`, 결과 화면)
- [x] 결과 헤더 3종(`Who You Are` / `Why It Happens` / `What To Do`)이 **7개 페이지**에 흩어져 있던 것 일괄 한국어화
- [x] 결제·환불·타로 문구: `UNKNOWN`→`확인 불가`, `Order ID:`→`주문번호`, `Eligible`/`Not Eligible`→`환불 가능`/`환불 불가`, `Awaiting Ritual`→`의식을 기다리는 중`, `Tap to Reveal`→`눌러서 펼치기`, `Reverse`/`Upright`→`역방향`/`정방향`, `Image Pending`→`이미지 준비 중`
- [x] 백과사전 카드가 내부 카테고리 코드(`STEMS` 등)를 노출하던 것 → 필터와 같은 한국어 라벨
- [x] 장식용 영문 헤더 20여 곳 한국어화(`Destiny Nexus`, `FATE FLOW`, `Secret Tarot Gallery`, `Year Fortune Analysis`, `Healing Mode`, `Life Path Energy`, `Security First` 등) — `uppercase` 클래스도 함께 제거해야 한국어가 뭉개지지 않음
- [x] 배지 `HOT`/`NEW`/`PICK` → `인기`/`신규`/`에디터 추천`
- [x] **영문 노출 기준선 226 → 170건.** 남은 170건 중 126건은 타로 카드 영문 원명, 44건은 한국어 안에 괄호로 든 영어(`용(Dragon)`, `원국(Original Chart)`)·브랜드명·이메일·라우트 경로 등 **오탐**
- [x] `KakaoLoginButton.tsx` 삭제 — import하는 곳 0개인 사문. 실제 로그인 경로는 `AuthModal`
- [x] `buildAuthCallbackMessage`가 provider 오류 설명을 그대로 붙여 raw Supabase 에러 같은 **영문 기술 문자열이 사용자에게 도달**하던 문제 — 한글이 없는 설명은 화면에서 감추고(서버 로그에는 유지), 요청번호만 한국어로 노출

**검증 결과**: tsc 0 / lint 0 / 로직 테스트 51/51 / 라우트 스모크 54/54 / 메뉴 누락 0 / 무료 게이트 차단 0 / 신규 영문 노출 0

### 잔여 인코딩 관측
- [x] `docs/01-team/cs/provider_error_mapping.md` EUC-KR → UTF-8 변환 완료
- [x] `docs/archive/legacy/readme.md` EUC-KR → UTF-8 변환 완료
- [x] `docs/01-team/operations/cs-ops-brief.md` 혼합 인코딩(EUC-KR+UTF-8 이어붙임) 완전 복구
- [x] `docs/00-overview/mcp-rollback-checklist.md` 파일 끝부분 mojibake 조각 제거
- [ ] `docs/01-team/engineering/setup.md` — 부분 손상, 완전 복구 불가로 ERROR_LEDGER ERR-L002에 미해결 기록 (앱 기능 영향 없음)
- [ ] `docs/archive/decision-history/admin-audit-priority-plan.md` — 원본 생성 시점 손실(리터럴 `?`), 복구 불가로 ERROR_LEDGER ERR-L003에 기록 (아카이브 참고용, 영향 없음)

**Last Updated**: 2026-07-27
**Updated By**: Claude
