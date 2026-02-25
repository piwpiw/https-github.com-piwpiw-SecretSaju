---
description: [문서 기반 AI 협업 사이클 (AI Collaboration Methodology)]
---

# 🌀 AI Collaboration Cycle (문서 기반 AI 협업 방법론)

본 프로젝트는 AI 에이전트 다중 협업을 극대화하기 위해 다음과 같은 5단계 개발 방법론을 엄격하게 준수합니다.

## 1. 개발방법론 : 문서 기반 AI 협업 사이클
모든 개발의 시작과 끝은 코드가 아닌 문서(Documentation)에 기록되어야 합니다. 문서가 곧 에이전트의 컨텍스트이자 진실의 원천(Source of Truth)입니다.

## 2. 문서화 > 설계 먼저 > AI 코드 생성 > 자동 동기화
- **문서화(Documentation)**: 요구사항 발생 시 `MASTER_PRD.md` 또는 `task.md` 에 기록.
- **설계 먼저(Design First)**: `implementation_plan.md` 및 `UI_UX_DESIGN_SPEC.md`로 화면과 컴포넌트를 설계하고 사용자(USER) 승인을 받음.
- **AI 코드 생성**: 설계 기반으로 코딩 (`write_to_file`, `replace_file_content`).
- **자동 동기화**: `npm run build` 및 코드 완료 후 문서(task.md) 체크리스트 즉각 동기화.

## 3. 품질검증 > Zero Script QA (로그기반 자동분석) > 중복이슈 원천차단
- 코딩이 끝난 후, 발생 가능한 에러를 런타임 이전에 모니터링할 수 있는 **Zero Script QA** 시스템을 가동합니다.
- `npm run lint`, `tsc`, `next build` 과정의 로그를 자동 분석하고, 오류 발견 시 원인을 `ERROR_CATALOG.md`에 등재하여 동일한 이슈가 다시 발생하지 않도록 원천 차단합니다.

## 4. 지식공유 > 구조화된 트리 구조로 빠른 인덱싱 및 업데이트
- 프로젝트의 모든 지식은 `docs/`, `.agent/workflows/` 등의 디렉터리에 트리 구조로 명확히 분리합니다.
- 에이전트는 파일 브라우징(`list_dir`, `grep_search`)을 통해 필요한 문맥을 1초 이내에 빠르게 가져와 컨텍스트로 삼습니다.

## 5. 온보딩 > 마이크로 타임박싱 (10분 단위) 작업 및 프로세스 개선 업데이트
- 매우 긴급하고 고도화된 작업을 수행하므로, 작업을 **10분 단위 마이크로 타임박스(Timebox)** 로 분할하여 수행합니다.
- 각 단위 작업이 끝날 때마다, 수행 과정에서 겪은 비효율 또는 개선점을 `architecture.md` 또는 이 워크플로우 문서에 다시 업데이트(자가 발전)합니다.
