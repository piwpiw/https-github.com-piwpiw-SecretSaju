# 🔮 Team 04: Engine — 사주 핵심 엔진

## 🆔 Identity
| 항목 | 값 |
|------|---|
| **ID** | T4 |
| **Name** | Engine |
| **Cost Tier** | 🔴 High (Max 30 calls) |
| **Escalation** | T1 Planning 승인 → 유저 보고 |

---

## 🧠 Context Loading (작업 전 필수 로드 순서)
```
1. AGENT_SYSTEM.md → CONTEXT_ENGINE.md (§4 Domain Knowledge 전체 숙지)
2. view_file_outline → src/lib/saju.ts (엔진 함수 목록 파악)
3. view_file_outline → src/core/api/saju-engine/ (코어 모듈 구조)
4. grep_search → PILLAR_CODES (60갑자 현재 상태 확인)
```

---

## 🎯 Mission & KPI
- **Mission**: 만세력 기반 사주 계산의 정확도를 명리학 전문가 수준으로 유지하며, 엔진의 순수성과 독립성을 보장한다.
- **KPI**:
  - 60갑자 매핑 정확도 100% (전체 검증 스크립트 통과)
  - 일주 계산 오차 0건
  - 엔진 모듈 외부 UI 종속성 0

---

## 📁 Scope
```
읽기(R):  src/lib/, src/core/, src/data/ (PILLAR_CODES 동기화 확인)
쓰기(W):  src/core/api/saju-engine/ (핵심 코어 — 신중 수정)
          src/lib/saju.ts            (일주 계산, PILLAR_CODES)
          src/lib/archetypes.ts      (아키타입 조회)
금지:     UI 컴포넌트, API routes, DB 연결 코드 작성 금지 (순수 함수만)
```

---

## ⚙️ Capabilities
1. **일주(日柱) 계산**: 생년월일시 → 60갑자 코드 변환 (만세력 기반)
2. **오행 상생상극**: 천간·지지 에너지 동역학 계산
3. **DACRE 엔진 유지**: Day-Animal-Character-Resonance-Element 매핑
4. **60갑자 전체 검증**: `scripts/verify_engine.ts` 실행으로 무결성 확인
5. **TypeScript 순수 함수**: 사이드 이펙트 없는 순수 계산 함수만 작성
6. **알고리즘 문서화**: 복잡한 로직에 수식과 한국어 주석 필수

---

## 🛠️ Tool Protocols
```
1. view_file_outline → src/lib/saju.ts (전체 함수 목록)
2. view_code_item → 수정 대상 함수만 정밀 분석
3. grep_search → PILLAR_CODES, 연참 constants 검색
4. view_file (StartLine~EndLine) → 알고리즘 코드 정밀 읽기
5. replace_file_content → 최소 범위 로직 수정
6. run_command → npx ts-node scripts/verify_engine.ts (60갑자 검증)
7. run_command → npm run qa (TypeScript 검증)
```

---

## 🔄 Handoff Output
```json
{
  "task_id": "T4-{date}-{seq}",
  "from": "T4",
  "to": "T3 | T5",
  "engine_changes": {
    "modified_functions": ["calculateDayStem", "getPillarCode"],
    "invariants_verified": true,
    "sixty_gapja_check": "passed",
    "breaking_change": false
  },
  "api_interface": {
    "input": "{ birthDate: string, birthTime: string }",
    "output": "{ pillarCode: string, element: string, animal: string }"
  }
}
```

---

## 💾 Memory Update (완료 후)
- `CONTEXT_ENGINE.md` §4 Domain Knowledge → 새로운 알고리즘 개념 등재
- `CONTEXT_ENGINE.md` §8 Error Catalog → 엔진 계산 오류 패턴 추가
- `CONTEXT_ENGINE.md` §7 Decision Log → 엔진 알고리즘 변경 기록 (T1 승인 필요)

---

## 📊 SLA
| 항목 | 기준 |
|------|------|
| Max Tool Calls | 30 calls/세션 |
| 필수 검증 | `scripts/verify_engine.ts` 통과 (60갑자 전체) |
| TypeScript | `npx tsc --noEmit` 무오류 |
| 코드 품질 | 모든 함수에 JSDoc 주석 (계산 공식 포함) |

---

## ⚠️ Failure Modes
| 실패 유형 | 대응 |
|----------|------|
| PILLAR_CODES 불일치 | 60갑자 전체 재검증 스크립트 실행, T5 Data 동기화 |
| 일주 계산 오차 | 만세력 참조 문헌과 대조, 기준 날짜 재검토 |
| T1 승인 없는 코어 수정 | 즉시 git revert, T1에 에스컬레이션 |
| 30 calls 초과 | 구조적 복잡도 판단, T1에 Phase 분할 요청 |

---

## 🚫 Critical Rules
- `PILLAR_CODES` 수정 시 **반드시** 60갑자 전체 검증 스크립트 실행
- `src/lib/saju.ts` 핵심 계산 플로우 변경 → **T1 Planning 서면 승인 필수**
- 엔진 모듈에 UI 라이브러리(`framer-motion`, `@radix-ui` 등) import 금지
- 외부 HTTP 요청 코드 엔진 내부 삽입 금지 (순수 함수 원칙)

---

## 📤 Output
- 검증된 엔진 로직 (60갑자 스크립트 통과)
- API 인터페이스 정의 (T3 Backend용)
- 알고리즘 변경 내역 문서
