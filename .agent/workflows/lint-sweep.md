---
description: 안티 패턴 탐색 — 프로젝트 전체에서 품질 위반 사항 자동 탐색 및 Error Catalog 등재
---

# Lint Sweep Workflow

프로젝트 전체 안티 패턴을 일괄 탐색하고 결과를 Error Catalog에 등재.

// turbo-all

## Step 1 — any 타입 탐색
```powershell
grep -rn ": any" src/ --include="*.ts" --include="*.tsx" | head -20
```

## Step 2 — console.log 잔류 탐색
```powershell
grep -rn "console\.log" src/ --include="*.ts" --include="*.tsx" | head -20
```

## Step 3 — TODO/FIXME 미완료 탐색
```powershell
grep -rn "TODO\|FIXME\|HACK\|XXX" src/ --include="*.ts" --include="*.tsx"
```

## Step 4 — 하드코딩 URL 탐색
```powershell
grep -rn "http://localhost\|127\.0\.0\.1" src/ --include="*.ts" --include="*.tsx"
```

## Step 5 — 환경변수 하드코딩 탐색
```powershell
grep -rn "secret\|password\|api_key\|apiKey" src/ --include="*.ts" --include="*.tsx" | grep -v ".env"
```

## Step 6 — 미사용 import 탐색
```powershell
npx tsc --noEmit 2>&1 | grep "is declared but"
```

## Step 7 — 결과 분류 및 처리
| 등급 | 조건 | 처리 |
|------|------|------|
| 🔴 Critical | `: any`, 하드코딩 URL, 환경변수 하드코딩 | **즉시 수정** |
| 🟡 Warning | `console.log`, TODO, FIXME | 보고 후 수정 |
| 🟢 Info | 미사용 import | 참고만 (tsc에서 잡힘) |

## Step 8 — Error Catalog 업데이트
- Critical 항목 발견 시 → `CONTEXT_ENGINE.md` §8 Error Catalog에 등재
- 형식: `ERR-XXX | 패턴 | 원인 | 해결책 | 담당팀`
