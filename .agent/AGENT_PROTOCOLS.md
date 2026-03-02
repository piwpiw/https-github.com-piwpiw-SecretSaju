# ⚙️ Agent Protocols — Engineering Standards (Enhanced Automation)

> [!NOTE]
> 이 문서는 Team Agent의 **협업 자동화 파이프라인(Trigger & Handoff)** 및 **최소 토큰 비용**을 규정하는 핵심 표준입니다.

---

## 1. 🤖 Automation Trigger Rules (무개입 협업 봇 체인)

에이전트는 작업이 끝난 뒤 수동으로 보고하지 않고, **자동으로 연관 팀의 Handoff 스키마를 생성하고 다음 팀을 즉시 트리거(Trigger)** 해야 합니다. (Chain of Agents)

| 이벤트 (Trigger Event) | 즉각 발동 조건 | 자동 호출 Target | 실행 규약 |
|----------------------|--------------|----------------|----------|
| **API_GENERATED** | `src/app/api/` 경로 내 새로운 `.ts` 생성 완료 | **T2 Frontend** | 즉시 API 계약서 전송 후 연동 UI 생성 개시 |
| **TEST_QA_FAILED** | `npm run qa` 실패 혹은 `vitest` 에러 감지 | **해당 개발팀 + T7 QA** | 로그 추출 → 원샷 픽스(`zero-shot-fix`) 강제 호출 |
| **UI_COMPILED** | `src/components/` 내에 신규 UI/레이아웃 생성 | **T6 Design + T10 Growth** | 렌더링 확인 후 CSS 토큰/로깅 이벤트 자동 부착 |
| **DATA_MODIFIED** | `src/data/`의 JSON 및 상수 배열 수정 | **T4 Engine** | T4의 데이터 검증 스크립트 백그라운드 무조건 실행 |
| **PHASE_COMPLETED**| PRD상 하나의 기능 모듈 코딩/QA 완료 | **T8 DevOps** | 다음 단계인 `perf-check` 및 Vercel 배포 체크리스트 가동 |

---

## 2. ⚡ MCP Tool Chain Sequence (기능 고도화)

모든 Skill 동작은 단일 툴 실행이 아닌 **"절대적 순서"를 갖는 체인(Chain) 형태**로 작동되어야 합니다. 이것은 허상(Hallucination) 없는 코딩을 만듭니다.

### 🔍 Research Chain
1. `grep_search` (함수·변수명 사용처 전수 조사 대상 라인 획득)
2. `view_file_outline` (조사 대상 파일의 전체 스켈레톤 파악)
3. `view_code_item` (지목된 메소드의 작동 로직 픽업)
4. *→ 여기서부터 계획 수립 (Thought)*

### 🛠️ Execution & Memory Chain
1. *수정 대상 분석 완료*
2. `replace_file_content` 또는 `multi_replace_file_content` (코드 적용)
3. **[의무 사항]** `run_command` → `npm run qa` (빌드 테스트)
4. 성공 시, `CONTEXT_ENGINE.md` 내 `.agent` 스냅샷 업데이트
5. Handoff Trigger 발생

---

## 3. 📁 Context Indexing Efficiency (부분 조회 강제)

토큰 비용의 막대한 누수를 막기 위해, 에이전트는 **전체 파일 읽기를 절대로 금지**당합니다.

- **스마트 해시태그 캐싱**: `CONTEXT_ENGINE.md`를 로드할 때 전체 뷰를 돌리지 마십시오.
  `grep_search`를 통해 대상 해시태그(예: `#design`, `#errors`)가 존재하는 라인 번호를 알아내고, 그 범위 안의 지식만 **부분 로드(Partial Load)** 하십시오.

---

## 4. 📦 Standard Handoff Schema

팀 간 이관(Handoff) 시 반드시 아래 JSON을 생성하고 다음 팀에게 전달하며 턴을 종료합니다. 구두 Yapping은 무시됩니다.

```json
{
  "chain_id": "AUTO-T2-to-T6-9912",
  "from_team": "T2",
  "to_team": "T6",
  "trigger_event": "UI_COMPILED",
  "payload": {
    "files": ["src/components/NewCard.tsx"],
    "missing_tokens": ["primary highlight cyan"],
    "action_required": "신규 컴포넌트에 대한 디자인 토큰 부여 및 QA"
  }
}
```
