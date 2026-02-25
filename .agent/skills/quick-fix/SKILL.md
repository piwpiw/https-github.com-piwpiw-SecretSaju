---
description: 빠른 버그 수정 — 에러 메시지 기반 즉시 진단 및 수정
---

# Quick Fix Skill

에러 메시지 또는 빌드 실패를 받았을 때 최소 비용으로 즉시 수정.

## Flow
```
에러 메시지 수신 → 파일:줄 추출 → 해당 줄 읽기 → 수정 → 빌드 검증
```

## Steps

### 1. 에러 분석
// turbo
- 에러 메시지에서 파일명, 줄번호, 에러 타입 추출
- TypeScript: `TS2xxx` 에러 코드별 대응
- Build: `next build` 에러는 보통 import/export 문제

### 2. 최소 범위 읽기
// turbo
- `view_file`로 에러 줄 ±10줄만 읽기 (`StartLine`, `EndLine` 지정!)
- 전체 파일 읽기 금지

### 3. 수정
- `replace_file_content`로 정밀 수정
- 한 파일에 여러 수정 → `multi_replace_file_content`

### 4. 검증
// turbo
- `run_command`: `npx tsc --noEmit 2>&1 | Select-Object -Last 10`
- 추가 에러 나오면 Step 1 반복 (최대 3회)

## 에러 타입별 빠른 대응표

| 에러 | 원인 | 수정 |
|------|------|------|
| `TS2307` | 모듈 못 찾음 | import 경로 확인/수정 |
| `TS2322` | 타입 불일치 | 타입 캐스팅 또는 인터페이스 수정 |
| `TS2345` | 인자 타입 에러 | 함수 시그니처 확인 |
| `TS7006` | 암시적 any | 타입 명시 |
| `Build Error` | 서버/클라이언트 혼합 | 'use client' 추가 |

## Cost Rules
- **예산**: 최대 8 tool calls
- **원칙**: 에러 줄만 읽기, 전체 파일 읽기 금지
