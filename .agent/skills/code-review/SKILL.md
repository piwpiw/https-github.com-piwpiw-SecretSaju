---
description: 코드 리뷰 — 빠른 파일 품질 검증 및 개선점 식별
---

# Code Review Skill

파일 하나 또는 디렉토리 단위로 빠르게 품질 검증.

## Usage
에이전트가 코드 리뷰가 필요할 때 이 스킬을 로드.

## Steps

### 1. 구조 파악 (최소 비용)
// turbo
- `view_file_outline`으로 파일 구조 파악 (전체 읽기 금지!)
- 함수/클래스 목록 + 줄 수 확인

### 2. 핵심 함수만 정밀 분석
// turbo
- `view_code_item`으로 복잡한 함수만 읽기
- 단순 getter/setter는 스킵

### 3. 패턴 검색
// turbo
- `grep_search`로 안티 패턴 탐색:
  - `any` 타입 사용: `Query: ": any"`, `Includes: ["*.ts", "*.tsx"]`
  - console.log 남은것: `Query: "console.log"`, `Includes: ["*.ts", "*.tsx"]`
  - TODO 미완료: `Query: "TODO|FIXME|HACK"`, `IsRegex: true`

### 4. 개선 적용
- 발견 이슈를 우선순위별 분류: Critical > Warning > Info
- Critical만 즉시 수정 (scope-bounded)
- Warning/Info는 보고만

## Cost Rules
- **예산**: 최대 10 tool calls
- **금지**: 전체 파일 읽기, 불필요한 빌드
- **필수**: outline 먼저, code_item으로 정밀 분석
