---
name: zero-shot-fix
description: 버그 수정 및 핫픽스를 단 1회의 턴(Turn)만에 무결점으로 처리하는 초극단적 과금 방어 스킬
---

# 🎯 Zero-Shot Fix Skill

이 스킬은 "에러가 발생했을 때 어떻게 대처해야 하는가"에 대한 **가장 엄격하고 극단적인 단일 턴(Single-Turn) 해결 가이드**입니다.
이 스킬이 호출되면 모든 에이전트는 무조건 아래의 규칙을 *예외 없이* 따라야 합니다.

## 1. 사전 원칙 (Absolute Rules)
- **MAX_TURNS = 1**: 문제를 발견하고 수정하는 루프를 단 1회로 제한합니다. (테스트-실패-수정 반복 절대 금지)
- **NO CHATTER**: 수정 후 "무엇을 왜 고쳤는지" 구구절절 설명하지 마세요. 한 줄(1 Sentence) 요약만 보고합니다.
- **SURGICAL STRIKE**: 불필요한 전체 파일 읽기(`view_file` StartLine/EndLine 누락)를 절대 금지합니다.

## 2. 실행 프로세스 (Execution Flow)

1. **에러 지점 확정 (Targeting)**
   - 터미널 에러 로그나 `qa.mjs` 실패 로그에서 문제가 발생한 **정확한 파일 경로와 라인 번호**를 파악합니다.
   - 확신이 서지 않는다면 `grep_search`를 통해 원인 변수/함수명만 검색하세요.

2. **최소 범위 읽기 (Minimal Context)**
   - `view_file` 호출 시, 에러가 발생한 라인 기준 **위아래 10줄 (StartLine: N-10, EndLine: N+10)**만 읽으세요.
   - 전체 코드의 컨텍스트 파악이 정말 필요하다면 `view_file_outline`만 허용됩니다.

3. **원샷 수정 (Single-Shot Replace)**
   - `replace_file_content` 도구를 사용하여 정확히 한 번에 문제를 고칩니다.
   - 연쇄적으로 터질 수 있는 문제(Blast Radius)가 예상된다면, 해당 파일 내에서 `multi_replace_file_content`로 한 번에 묶어서 수정하세요.

4. **단일 검증 (One-Time Verification)**
   - 스크립트 기반 통합 테스트 1회만 실행합니다.
   - `npm run qa`를 실행하여 린트/타입 에러가 없는지 최종 확인합니다. 

## 3. 탈출 조건 (Fallback)
- 1회의 수정 후 `npm run qa`가 다시 실패한다면, 코드 복잡도가 에이전트 자동 해결 범위를 넘어선 것입니다.
- 이때는 **하드 코딩을 즉시 중지**하고, 유저에게 "구조적 결함이 있어 원샷 픽스 실패 (Mock 데이터 우회 권장)" 상태만을 보고하세요.
