---
description: 빠른 성능 검증 — 빌드 + 타입 + 번들 체크를 한번에 실행
---

# Performance Check Workflow

// turbo-all

## 1. TypeScript 타입 검증
```
npx tsc --noEmit
```

## 2. 빌드 검증
```
npx next build
```

## 3. 번들 크기 확인
빌드 출력에서 페이지별 사이즈 확인:
- First Load JS는 250KB 이하 유지
- 큰 페이지 발견 시 dynamic import 검토

## 4. 결과 보고
- 에러 있으면 `/quick-fix` 스킬로 즉시 수정
- 클린이면 완료 보고
