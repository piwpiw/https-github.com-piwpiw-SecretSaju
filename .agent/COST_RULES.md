# 💰 Cost Optimization & Max-Loop Rules

> [!CAUTION]
> **과금 폭주 방지 절대 수칙**
> 테스트 ➔ 실패 ➔ 수정 루틴이 2회를 넘어가면 즉시 멈추고 `MAX_TURNS` 도달로 간주합니다. 
> 무한 에러 핑퐁(Hallucination loop)을 절대 허용하지 않습니다.

---

## 1. ⚙️ Auto-Loop Breaker (루프 강제 절단)
- **단일 검증 원칙**: 모든 테스트는 개별 실행을 금지하고, `npm run qa` 통합 스크립트 단 1회로 갈음합니다.
- **원샷 원킬**: 에러 분석 후 수많은 파일을 건드리지 마세요. 에러 로그가 지목한 단 하나의 함수만 고칩니다.

## 2. 🎯 Strict Range Read (전체 파일 읽기 금지)
> [!WARNING]
> `view_file` 호출 시 인자 없는 전체 파일 읽기를 수행하는 에이전트는 즉각 차단됩니다.

- **탐색**: `view_file_outline` 혹은 `grep_search`를 통해 목표 위치의 라인 번호를 먼저 확보하세요.
- **조회**: 문제가 발생한 라인 주변부 (`StartLine: N-10`, `EndLine: N+10`)만 읽어 컨텍스트를 파악합니다.

## 3. 💣 Blast Radius Analysis (영향도 사전 분석)
- 코드 수정 전, 해당 모듈을 Import 하거나 의존 중인 다른 파일이 있는지 `grep`으로 조회하세요.
- 연쇄 에러가 발생할 곳을 미리 찾아내, `multi_replace_file_content`로 한 번의 턴(Turn)에 일괄 수정합니다.

## 4. 🔇 Zero Summary (요약 및 Yapping 금지)
- 작업 완료 후, 문서 전체 내용을 재요약하여 늘어놓지 마세요.
- **Output Token 최소화**: "해결 포인트" 단 한 문장만 보고합니다. (예: "결제 모듈의 OS 종속성 에러를 제거했습니다.")

---

## 5. Team별 비용 한도 (Cost Tier)

| Tier | 예산 (세션당 Tool Calls) | 소속 팀 |
|------|-----------------------|---------|
| 🟢 Low | ~10 calls | Planning, Data, Design, DevOps, Growth |
| 🟡 Mid | ~20 calls | Frontend, Backend, QA |
| 🔴 High | ~30 calls | Engine(Saju), Security |
