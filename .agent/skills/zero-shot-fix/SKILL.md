---
name: zero-shot-fix
description: 버그 수정 및 핫픽스를 단 1회의 턴(Turn)만에 무결점으로 처리하는 초극단적 과금 방어 스킬
---

# 🎯 Zero-Shot Fix Skill (Chain Reactive)

에러 발생 시 **단 1턴(Single-Turn)** 만에 해결하는 원샷 수정 스킬이며, 수정 후 관련 팀을 깨웁니다.

---

## 🛑 Absolute Rules (절대 원칙)
- **NO CHATTER**: 보고는 1문장만, 과정 나열시 차단. (Token 최적화)
- **POST-MEMORY**: 완료 후 `CONTEXT_ENGINE.md` 내 `#errors` 위치를 `grep_search`로 단숨에 찾아 업데이트 필수.
- **SURVIVAL CHECK**: 동일 에러 발생 2회 초과 시 수정을 멈추고 **T7 QA** 및 **Architect**의 Rescue 요청을 쏠 것.

---

## 🚀 Execution Flow (ReAct + Automation)

### 1. THINK — 스마트 조준
- 터미널 에러 로그에서 **정확한 파일 경로 + 라인 번호** 추출
- 추적 대상 심볼 발견 즉시 `grep_search` 가동. (전체 파일 로드 100% 금지)

### 2. ACT — 외과수술 타격 (Surgical Strike)
- 에러 라인 기준 **위아래 딱 10줄만** 읽어들입니다. `view_file(StartLine: N-10, EndLine: N+10)`
- `multi_replace_file_content`을 사용하여 한 번에 문제 해결 코드를 치환합니다.
- (옵션) Import가 꼬였다면 해당 파일만 타겟하여 경로 최적화.

### 3. OBSERVE — Chain Validator
- 즉각 `npm run qa`. 
- **통과 실패**: 에러 양상이 바뀌었다면 로직 재타격. 그대로라면 즉시 롤백 명령어가 담긴 JSON 생성.

### 4. MEMORY & 🤖 AUTOMATION EVENT
- "에러 원인, 적용한 해결책, 파일명"을 `CONTEXT_ENGINE.md`의 최하단 Error Catalog(`#errors`) 블록을 부분 수정하여 주입.
- 이후 본 에러가 다른 계층에 여파를 미칠지 계산합니다. 
  - (예: UI 에러였다면 `T6 Design`에 "수정 후 이상 없는지 체크하라"는 Handoff Trigger 발생)

```json
{
  "chain_id": "HOTFIX-T2-to-T6-9922",
  "from_team": "ZeroShotFix_Executor",
  "to_team": "T6",
  "trigger_event": "TEST_QA_FAILED",
  "payload": {
    "action": "layout shift 에러 복구됨",
    "request": "변경된 Card 컴포넌트의 테마 일관성 검증 1회 실행 요망"
  }
}
```
