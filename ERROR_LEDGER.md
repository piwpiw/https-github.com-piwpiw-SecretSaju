# SecretSaju Error Ledger
# 발생한 에러와 해결법을 기록합니다. 모든 AI는 작업 전 이 파일을 확인하여 같은 실수를 반복하지 않습니다.
# ↔ 코드 레벨 에러 패턴은 `docs/02-technical/ERROR_CATALOG.md` 참조 (상호 연동)

---

## 역할 분담
- **ERROR_LEDGER.md** (이 파일): AI 세션 간 발생하는 에러 이력과 재발 방지. "어떤 AI가 무슨 실수를 했고 어떻게 고쳤나."
- **docs/02-technical/ERROR_CATALOG.md**: 코드 패턴 에러와 표준 해결법. "이런 증상이 나오면 이렇게 고쳐라."
- 에러 발생 시: 아래 형식으로 추가
- 에러 해결 시: `상태`를 ✅로 변경하고 해결법 기입
- 새 AI 세션 시작 시: 이 파일의 ❌ 항목을 먼저 확인

---

## 에러 이력

### ERR-L001 | 상태: ❌ 미해결
- **날짜**: 2026-03-05
- **발생 AI**: Claude (Gemini)
- **증상**: `npx vitest run` 실행 시 `Cannot find module '@rollup/rollup-win32-x64-msvc'` 오류
- **근본 원인**: `vercel.json`의 `installCommand: npm install --omit=optional`이 Windows rollup 네이티브 바이너리를 제외. 로컬에서는 `@rollup/rollup-win32-x64-msvc`가 `node_modules/@rollup/` 자체가 생성되지 않음 (npm bug #4828)
- **임시 해결**: TypeScript 타입 검사 (`npx tsc --noEmit`) 로 테스트 대체
- **완전 해결 방법**: 
  1. `Remove-Item -Recurse -Force node_modules` 후 `npm install` (package-lock 삭제 포함)
  2. 또는 `npm_config_optional=true npm install` 환경변수 방식
- **방지**: vitest 실행 전에 `Test-Path node_modules/@rollup` 확인. False이면 위 해결법 적용 후 실행
- **관련 파일**: `vercel.json`, `package.json`, `vitest.config.ts`, `vitest.logic.config.ts`

### ERR-L002 | 상태: ❌ 미해결
- **날짜**: 2026-07-13
- **발생 AI**: Claude (Opus 4.8)
- **증상**: `docs/01-team/engineering/setup.md`가 `file` 기준으로는 정상 UTF-8(BOM)로 판정되지만, 실제 한글 내용이 전부 깨진 문자로 표시됨 (예: `# ?렞 ?쒖옉?섍린 - 吏湲?諛붾줈!`). E-002/ERR-L001과 달리 **유효하지 않은 UTF-8이 아니라, 유효한 UTF-8인데 코드포인트 자체가 깨진** 이중 인코딩 손상이라 `grep -P '\xef\xbf\xbd'`(U+FFFD 탐지)로는 잡히지 않음.
- **근본 원인(추정)**: git blame 상 커밋 `23b1642`(feat: upgrade tarot UI...)에서 이 파일이 함께 수정됐는데, 그 시점에 원본 UTF-8 바이트가 CP949로 잘못 디코딩된 뒤 다시 UTF-8로 저장된 것으로 보임(원인 커밋은 무관한 작업이라 우발적 도구/에디터 인코딩 사고로 추정).
- **복구 시도**: `text.encode('cp949', errors='replace').decode('utf-8', errors='replace')` 역변환으로 약 90%+ 텍스트가 읽을 수 있는 한글로 복원되나, 이모지 등 4바이트 UTF-8 문자가 있던 자리(파일 내 92곳, `\x80` 등 단독 바이트)는 손실되어 완전 복구 불가. 손상과 정상 텍스트가 섞인 상태로 덮어쓰면 오히려 더 혼란스러워 **적용하지 않음**.
- **임시 상태**: 파일은 현재 커밋 상태(깨진 원문) 그대로 둠. 앱 빌드/기능에는 영향 없음(순수 문서 파일).
- **완전 해결 방법**: 이 문서의 초기 커밋(23b1642 이전) 히스토리에서 손상되지 않은 버전을 `git log -p -- docs/01-team/engineering/setup.md`로 찾아 그 버전을 기준으로 복원하거나, 손실된 이모지 구간만 수동으로 원문 대조 후 재입력.
- **방지**: 이 파일을 대량 검색/치환 도구로 편집할 때 반드시 편집 전후 `file <path>` + 몇 줄 육안 확인. CP949/EUC-KR 코드페이지가 기본인 도구(구형 Windows 에디터 등)로 열지 말 것.
- **관련 파일**: `docs/01-team/engineering/setup.md`

### ERR-L003 | 상태: ❌ 미해결 (복구 불가능, 참고용 기록)
- **날짜**: 2026-07-13
- **발생 AI**: Claude (Opus 4.8)
- **증상**: `docs/archive/decision-history/admin-audit-priority-plan.md`의 한글 텍스트 약 25%(10612자 중 2647자)가 리터럴 `?`(0x3F, 정상 ASCII 물음표) 문자로 치환되어 있음.
- **근본 원인**: ERR-L002(이중 인코딩)와 달리 이 파일은 **생성 시점에 이미 손실**됨 — 한글을 표현할 수 없는 코드페이지/콘솔로 이 감사 리포트를 자동 생성한 스크립트가 매핑 불가 문자를 `?`로 대체한 것으로 추정. 원본 바이트가 애초에 존재하지 않으므로 인코딩 역변환으로 복구 불가능.
- **조치**: 복구 시도하지 않음(내용을 추측 재구성하면 과거 감사 기록을 왜곡하게 됨). 파일은 `docs/archive/`(과거 의사결정 히스토리) 소속이라 빌드/기능/현재 문서 체계에 영향 없음.
- **완전 해결 방법**: 없음(원본 데이터 손실). 필요 시 이 파일을 참고용으로만 사용하고, 신뢰 가능한 최신 정보는 `NEXT_ACTIONS.md`/`docs/02-technical/FREE_LAUNCH_RUNBOOK.md`를 사용할 것.
- **방지**: 감사/리포트 자동 생성 스크립트가 한글을 출력할 때는 반드시 UTF-8로 파일에 직접 씀(콘솔 codepage 경유 금지). `scripts/qa/` 계열 리포트 생성기 점검 권장.
- **관련 파일**: `docs/archive/decision-history/admin-audit-priority-plan.md`

### ERR-L004 | 상태: ✅ 해결 (옵션 1 채택)
- **날짜**: 2026-07-13 발견 / 2026-07-14 해결
- **발생 AI**: Claude (Opus 4.8) — OPS-315 QA 감사 중 발견
- **증상**: 서버 세션 쿠키(`user_data`)가 만료/삭제된 뒤에도, `localStorage`에 남아있는 예전 캐시가 있으면 `getUserFromCookie()`가 이를 그대로 신뢰하여 로그인 상태로 렌더링함. 즉 세션이 만료된 사용자가 브라우저를 새로고침해도 계속 "로그인된 것처럼" 자신의 프로필/지갑/추천 카드가 보임 — 재로그인 유도 UI가 전혀 뜨지 않음.
- **재현**: `/mypage` 방문 → 쿠키 `user_data`만 제거하고 `localStorage['user_data']`는 유지 → 새로고침 → 여전히 로그인 대시보드 표시(로그아웃 버튼까지 정상 렌더).
- **근본 원인**: `src/lib/auth/kakao-auth.ts`(약 141~184줄) `getUserFromCookie()`의 폴백 로직 — 쿠키 부재 시 `localStorage` 캐시를 무조건 신뢰. 별도로 `McpAuthRefresher.tsx`는 MCP OAuth 토큰만 갱신할 뿐 이 Kakao 세션 캐시는 검증하지 않음.
- **해결법(사용자 결정: 옵션 1 — TTL)**: `getUserFromCookie()`에서 쿠키로 사용자 정보를 읽어올 때마다 `localStorage`에 `user_data_cached_at` 타임스탬프(`Date.now()`)를 함께 기록. 쿠키가 없어 `localStorage` 캐시로 폴백할 때는 이 타임스탬프가 **1시간(`USER_DATA_CACHE_TTL_MS`) 이내**인 경우에만 신뢰하고, TTL을 넘겼거나 타임스탬프 자체가 없으면(이 수정 이전에 저장된 구 캐시 포함) 캐시를 즉시 폐기하고 로그아웃 상태로 처리. `clearUserSession()`에도 타임스탬프 키 정리 추가.
- **검증**: `npx tsc --noEmit` 0 / lint 0 / 테스트 68/68 통과.
- **미채택 옵션(향후 강화 여지)**: 옵션 2(서버 세션 핑), 옵션 3(401 전역 인터셉터) — 지금은 옵션 1로 충분하다고 판단, 필요 시 추가 검토.
- **관련 파일**: `src/lib/auth/kakao-auth.ts`

## 형식
```
### [E-XXX] 에러 제목
- 상태: ❌ 미해결 / ✅ 해결
- 발생일: YYYY-MM-DD
- 발생 위치: 파일 경로
- 증상: 무엇이 발생했는가
- 원인: 왜 발생했는가
- 해결법: 어떻게 고쳤는가
- 재발 방지: 앞으로 무엇을 주의해야 하는가
```

---

## 에러 기록

### [E-001] ResultCard JSX 닫힘 태그 미비
- 상태: ✅ 해결
- 발생일: 2026-03-03
- 발생 위치: `src/components/ResultCard.tsx`
- 증상: 빌드 실패, JSX fragment unclosed 에러
- 원인: 여러 AI가 같은 파일을 다른 세션에서 수정하며 태그 구조가 깨짐
- 해결법: `view_file`로 전체 구조 확인 후 닫힘 태그 정리
- 재발 방지: **ResultCard 수정 시 반드시 전체 JSX 트리를 먼저 확인**

### [E-002] 한글 인코딩 깨짐 (garbled Korean)
- 상태: ✅ 해결
- 발생일: 2026-03-01
- 발생 위치: `encyclopedia/page.tsx`, `my-saju/add/page.tsx`, `mypage/page.tsx`, `tarot/page.tsx`
- 증상: 한글이 깨진 문자로 표시, TypeScript 에러
- 원인: 서로 다른 AI/세션에서 파일을 덮어쓰며 인코딩 불일치 발생
- 해결법: UTF-8로 파일 재생성
- 재발 방지: **파일 전체 덮어쓰기(Overwrite) 시 인코딩 확인 필수**

### [E-003] Sparkles / lucide-react import 누락
- 상태: ✅ 해결
- 발생일: 2026-03-03
- 발생 위치: `src/components/ResultCard.tsx`
- 증상: `Cannot find name 'Sparkles'` 컴파일 에러
- 원인: JSX에서 Sparkles 아이콘을 사용하면서 import를 추가하지 않음
- 해결법: `import { Sparkles } from "lucide-react"` 추가
- 재발 방지: **컴포넌트 추가 시 import 구문을 반드시 함께 추가**

### [E-004] getElementColor 함수 미정의
- 상태: ✅ 해결
- 발생일: 2026-03-03
- 발생 위치: `src/components/ResultCard.tsx`
- 증상: `Cannot find name 'getElementColor'` 에러
- 원인: PillarVisualizer에 색상 매핑을 전달하면서 헬퍼 함수 정의를 빠뜨림
- 해결법: 컴포넌트 외부에 `getElementColor` 함수 정의
- 재발 방지: **새 함수 참조 시 반드시 같은 파일 내 정의 확인**

### [E-005] spawn cmd.exe ENOENT (빌드 실패)
- 상태: ✅ 해결
- 발생일: 2026-03-02
- 발생 위치: 빌드 프로세스
- 증상: `Error: spawn cmd.exe ENOENT` during build
- 원인: Windows 환경에서 PATH 문제
- 해결법: 셸 환경 재설정
- 재발 방지: **빌드 명령은 pwsh에서 직접 실행**

### [E-006] CI Quality workflow — `npm config set optional false` 하드 실패
- 상태: ✅ 해결
- 발생일: 2026-07-13
- 발생 위치: `.github/workflows/deploy.yml` (Quality job, Install dependencies), `agent-autopilot.yml`, `vercel.json` (`installCommand`)
- 증상: CI "Quality" 체크가 의존성 설치 단계에서 `npm error The 'optional' option is deprecated, and can not be set in this way` 로 exit 1. tsc/lint/test 는 실행조차 되지 않음. (npm 10.x, 로컬 재현 완료)
- 원인: npm 7+ 에서 `npm config set optional false` 는 폐기됨. 또한 optional 을 끄면 Next.js 의 `@next/swc-linux-x64-gnu` 등 **네이티브 optional 바이너리 34개**가 제외되어 빌드가 오히려 깨짐 (ERR-L001 과 동일 계열).
- 해결법: `deploy.yml` 의 `npm config set optional false` 줄 **삭제**. optional 은 기본값(install)로 두고 `npm ci` 로 올바른 네이티브 바이너리를 설치. `vercel.json` 의 `installCommand` 도 `npm install --omit=optional` → `npm ci` 로 교체(무료 런칭 배포 블로커).
- 재발 방지: **`npm config set optional ...` / `npm install --omit=optional` 를 CI/vercel.json 어디에도 쓰지 말 것.** 네이티브 optional deps 는 반드시 설치되어야 함. 제외가 필요하면 `--omit=optional` 문법을 쓰되 native 바이너리 영향 먼저 확인. (연관: ERR-L001)
- **후속(2026-07-14, 같은 PR 재실패)**: `optional false` 옆에 있던 `npm config set platform linux` / `npm config set arch x64` 도 동일하게 npm 10에서 **무효한 config 키**(`npm error 'platform' is not a valid npm option`)라 처음 수정 때 놓쳤음. 로컬 재현 확인 후 `deploy.yml`·`agent-autopilot.yml` 양쪽에서 두 줄 모두 추가 삭제(네이티브 바이너리는 `npm ci`가 현재 OS/arch 기준으로 알아서 설치하므로 이 줄들 자체가 불필요했음). **재발 방지 갱신**: `npm config set <optional|platform|arch> ...` 세 키 전부 CI/vercel.json 어디에도 쓰지 말 것 — 수정 시 세 줄을 한 번에 확인.

### [E-007] CI workflow summary — escape 안 된 백틱으로 shell EOF 에러
- 상태: ✅ 해결
- 발생일: 2026-07-13
- 발생 위치: `.github/workflows/deploy.yml` (Publish quality summary / diagnostics summary 스텝)
- 증상: `$GITHUB_STEP_SUMMARY` 작성 스텝이 `unexpected EOF while looking for matching \`\`'` 로 exit 2. (로컬 `bash -n` 으로 재현/수정 확인 완료)
- 원인: `echo "- ref: \`${{ github.ref_name }}\`"` 에서 여는 백틱이 escape 안 됨(`\``) → bash 가 명령 치환으로 해석하고 닫는 백틱을 못 찾음.
- 해결법: literal 백틱은 모두 `\`` 로 escape (다른 줄의 `\`${{ ... }}\`` 패턴과 통일). line 126, 193, 194 수정.
- 재발 방지: **heredoc/echo 안에서 마크다운 코드 백틱을 넣을 때는 반드시 `\`` 로 escape.** 워크플로 shell 블록 변경 시 로컬에서 `bash -n` 문법 검사 후 커밋.

---

## 할루시네이션 방지 체크리스트 (모든 AI 필독)

> [!CAUTION]
> 아래 항목은 이 프로젝트에서 반복 발생한 실수 패턴입니다. 작업 전 반드시 확인하세요.

- [ ] **파일 수정 전 `view_file`로 현재 상태를 확인했는가?** (가정 금지)
- [ ] **import 구문을 새로 사용하는 모든 심볼에 대해 추가했는가?**
- [ ] **JSX 구조가 올바르게 닫혀 있는가?** (중첩 div/section/motion.div 확인)
- [ ] **한글 문자열이 깨지지 않았는가?** (UTF-8 확인)
- [ ] **다른 AI가 최근 수정한 파일인가?** (DEEP_HISTORY.md 확인)
- [ ] **이 파일의 ❌ 미해결 에러 중 관련된 것이 있는가?**
### ERR-D001 | status: mitigated
- date: 2026-03-06
- agent: Codex
- symptom: after reboot/local dev restart, `next dev` could fail on `/login` with
  `TypeError: __webpack_modules__[moduleId] is not a function`, followed by `_next/static` 404s.
- likely cause: corrupted `.next/cache/webpack` pack files on Windows; log also shows
  `PackFileCacheStrategy` rename failures with `EPERM`.
- mitigation applied: `scripts/dev-safe.js` now removes `.next/cache/webpack` before starting dev.
- recovery options:
  1. `npm run dev:safe`
  2. `npm run dev:safe:quick`
  3. `npm run dev:safe -- --clean-full` if the whole `.next` directory must be rebuilt
