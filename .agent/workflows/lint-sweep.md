---
description: 안티 패턴 탐색 — 프로젝트 전체에서 품질 위반 사항 자동 탐색
---

# Lint Sweep Workflow

프로젝트 전체 안티 패턴을 한번에 탐색.

// turbo-all

## 1. any 타입 탐색
```
grep -rn ": any" src/ --include="*.ts" --include="*.tsx" | head -20
```

## 2. 미사용 import 탐색
```
grep -rn "^import" src/ --include="*.ts" --include="*.tsx" | wc -l
```

## 3. console.log 잔류 탐색
```
grep -rn "console.log" src/ --include="*.ts" --include="*.tsx" | head -10
```

## 4. TODO/FIXME 미완료 탐색
```
grep -rn "TODO\|FIXME\|HACK\|XXX" src/ --include="*.ts" --include="*.tsx"
```

## 5. 하드코딩 URL 탐색
```
grep -rn "http://localhost\|127.0.0.1" src/ --include="*.ts" --include="*.tsx"
```

## 6. 결과 보고
- Critical: `: any`, hardcoded URLs → 즉시 수정
- Warning: console.log, TODO → 보고
- Info: import 수 → 참고
