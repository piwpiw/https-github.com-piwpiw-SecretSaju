# SecretSaju Error Ledger
# 발생한 에러와 해결법을 기록합니다. 모든 AI는 작업 전 이 파일을 확인하여 같은 실수를 반복하지 않습니다.
# ↔ 코드 레벨 에러 패턴은 `docs/ERROR_CATALOG.md` 참조 (상호 연동)

---

## 역할 분담
- **ERROR_LEDGER.md** (이 파일): AI 세션 간 발생하는 에러 이력과 재발 방지. "어떤 AI가 무슨 실수를 했고 어떻게 고쳤나."
- **docs/ERROR_CATALOG.md**: 코드 패턴 에러와 표준 해결법. "이런 증상이 나오면 이렇게 고쳐라."
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
