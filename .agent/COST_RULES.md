# 💰 Cost Optimization Rules

모든 에이전트 호출에 적용되는 과금 최소화 규칙.

---

## 5대 원칙

### 1. Scope Bounding (범위 제한)
- 각 팀은 지정된 파일/디렉토리만 읽기·수정
- 불필요한 `view_file`, `list_dir` 호출 금지
- **첫 접근 시 `view_file_outline` 우선 사용** → 필요한 부분만 `view_file`

### 2. Cache-First (캐시 우선)
- 이미 읽은 파일은 같은 세션 내 재읽기 금지
- 반복 패턴 질의 → 이전 결과 참조
- 동일 구조 파일 템플릿화 → 한 번 읽고 재사용

### 3. Batch Processing (일괄 처리)
- 관련 파일 변경은 `multi_replace_file_content`로 한 번에
- 독립적 tool call은 병렬 실행
- 순차 의존성 있는 경우만 `waitForPreviousTools: true`

### 4. Model Tier (모델 등급)
```
🟢 Low  : 포맷팅, 린트, 단순 텍스트 수정, 문서 업데이트
🟡 Mid  : 컴포넌트 수정, API 변경, 테스트 작성
🔴 High : 알고리즘 설계, 보안 검증, 아키텍처 변경
```

### 5. Incremental Context (점진적 컨텍스트)
- 전체 파일 대신 관련 함수/클래스만 `view_code_item`
- 변경 범위를 최소화하여 `StartLine`~`EndLine` 정밀 지정
- 대용량 파일은 `view_file_outline` → 필요 범위만 읽기

---

| ❌ 금지 | ✅ 대안 |
|---------|---------|
| 전체 프로젝트 `find_by_name` | 팀 scope 내 디렉토리만 탐색 |
| 같은 파일 반복 읽기 | 한 번 읽고 컨텍스트 유지 |
| 파일 전체 덮어쓰기 (`Overwrite: true`) | `replace_file_content`로 부분 수정 |
| 불필요한 빌드/테스트 전체 실행 | 변경 관련 테스트만 실행 |
| 탐색 없이 추측성 코딩 | outline → 구조 확인 후 작업 |
| 테스트-수정-에러 확인의 무한 반복 | 한 번에 완벽한 코드 작성 (max_iterations, max_turns 등 자체 상한 부여) |
| 파일 전체(`StartLine`, `EndLine` 생략) 구조 파악 | `grep` 및 에러 로그 기반 최소 범위 탐색 후 수정 |
| 코드/문서 전체 내용을 다시 요약 | 전체 요약 금지. "해결 포인트"만 1문장 요약 |

---

## 🛑 B. 자동 루프 제한 (Auto-Loop Breaker)
- **에러 반복 금지**: 테스트 ➔ 실패 ➔ 수정의 루틴이 2회를 넘어가면 즉시 멈추고 자체 상한선(`max_turns=2`)에 도달한 것으로 간주합니다. 무한 반복으로 인한 컨텍스트 및 토큰 비용 폭발을 물리적으로 막아야 합니다.
- **테스트는 자체 QA 스크립트(`npm run qa`) 하나로 통합**하며 산발적 에러 테스트는 시도하지 마세요.

## 🛑 C. "큰 파일 / 전체 코드" 읽기 금지 (Strict Range Read)
- **에이전트는 절대로 `view_file` 호출 시 인자 없는 전체 파일 읽기를 수행해서는 안 됩니다.**
- 항상 `view_file_outline`이나 에러가 난 라인 주변만(`StartLine: N-10, EndLine: N+10`) 읽어서 수정하세요.
- **문서 전체 요약 행위 자체를 금지합니다.** 리포트를 작성할 때는 단답형, 혹은 한 문장으로 끝내세요.

---

## Team별 Cost Tier 기준

| Tier | 호출 예산(세션당) | 팀 |
|------|-------------------|-----|
| 🟢 Low | ~10 tool calls | T1, T5, T6, T8, T10 |
| 🟡 Mid | ~20 tool calls | T2, T3, T7 |
| 🔴 High | ~30 tool calls | T4, T9 |
