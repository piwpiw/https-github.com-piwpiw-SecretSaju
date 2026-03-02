# 🚀 Cursor / AI Coding Guidelines

> [!IMPORTANT]
> **Secret Paws (시크릿사쥬)** 프로젝트를 수정하거나 확장할 때 AI가 반드시 지켜야 할 최상위 행동 지침입니다.

---

## 🏗️ 1. Architecture Blueprint
새 기능 추가 시, **[docs/MASTER_PRD.md](../MASTER_PRD.md)** 와 **[docs/BLUEPRINT.md](../BLUEPRINT.md)** 를 벗어나는 구조 변경을 절대 금지합니다.
* 예외(Exception)와 에러는 **[docs/ERROR_CATALOG.md](../ERROR_CATALOG.md)** 에 한 줄로 요약해 기록하세요.
* 새로운 프로세스 도입 시, 단독 행동하지 말고 Representative(대표 에이전트)의 Workflow를 따릅니다.

## ⚡ 2. Minimum Viable Functionality (절대 유지 영역)
아래 핵심 로직은 어떠한 리팩토링 중에도 **정상 동작**이 보장되어야 합니다.
- `src/lib/saju.ts`: 일주 계산 / 60갑자 매핑 로직
- `src/components/SecretPawsFlow.tsx`: 메인 깔때기 (생년월일 입력 ➔ 결과 ➔ 추천 ➔ 공유/결제)
- DB Schema (`supabase/schema.sql`): `users`, `animal_archetypes`, `jelly_transactions` 구조 변경 주의

## 🤖 3. Multi-Agent Ecosystem (운영 수칙)
> [!CAUTION]
> 과금 폭발을 막기 위한 **극단적 효율성 시스템**이 가동 중입니다. 모든 AI는 다음을 준수하십시오.

1. **[AGENT_SYSTEM.md](../../.agent/AGENT_SYSTEM.md)**: 소속 팀의 Scope 내에서만 파일 접근(Read/Write)을 혀용합니다. 대상에 맞게 디스패치하세요.
2. **[COST_RULES.md](../../.agent/COST_RULES.md)**: 반복 에러 루프, 무임승차 파일 읽기, 장황한 Summary를 물리적으로 차단합니다.
   - 단일 원샷(`Zero-Shot Fix`) 픽스 원칙
   - `view_file` 전체 조회 벤(Ban): 라인 `Start/End` 엄수
   - 요약 및 대화(Yapping) 전면 금지

## 🛠️ 4. Action Registry
- 단순 에러 핫픽스는 `.agent/skills/zero-shot-fix/SKILL.md` 체계로 단 1턴 내에 종료.
- 자동 린트 및 통합 테스트는 개별 `npm test`가 아닌, 단일 스크립트 **`npm run qa`** 로 검증합니다.


