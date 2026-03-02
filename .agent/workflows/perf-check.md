---
description: 빠른 성능 검증 — 빌드 + 타입 + 번들 + Core Web Vitals 체크를 한 번에
---

# Performance Check Workflow

빌드·타입·번들 상태를 한 번에 검증하는 통합 성능 체크.

// turbo-all

## Step 1 — TypeScript 타입 검사
```powershell
npx tsc --noEmit
```
**기준**: 에러 0건. 경고도 모두 확인.

## Step 2 — ESLint 검사
```powershell
npm run lint
```
**기준**: Error 0건, 가능하면 Warning도 0건.

## Step 3 — 프로덕션 빌드
```powershell
npm run build
```
**기준**: 빌드 성공. 번들 사이즈 경고 없음.

## Step 4 — 번들 사이즈 분석
```powershell
ANALYZE=true npm run build
```
**기준**:
- 단일 JS 청크 < 500KB (경고 기준)
- First Load JS < 200KB (권장)

## Step 5 — 이미지 최적화 확인
```powershell
grep -rn "<img" src/ --include="*.tsx" | grep -v "next/image"
```
**기준**: `<img>` 태그 0건 (모두 `next/image`로 교체)

## Step 6 — 결과 보고

| 항목 | 기준 | 상태 |
|------|------|------|
| TypeScript | 에러 0건 | — |
| ESLint | Error 0건 | — |
| 빌드 | 성공 | — |
| 번들 | < 500KB/청크 | — |
| 이미지 | `next/image` 100% | — |

실패 항목 → `zero-shot-fix` 스킬 또는 해당 팀에 Handoff.
