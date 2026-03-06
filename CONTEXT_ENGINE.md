# SecretSaju Context Engine & Project Map (Master Index)

This is the **Central Nervous System** of the SecretSaju project. It maps logical features to physical files, ensuring that any AI or Human developer can accurately modify, secure, and integrate components even as the codebase scales to thousands of files.

---

## 🗺️ 1. Logical Feature Map

### 🌌 1.1 Cosmic Calculation Engine (The Heart)
- **Primary Logic**: `src/lib/astrologyEngine.ts`, `src/lib/tojeongEngine.ts`, `src/lib/saju.ts`
- **Core API**: `src/core/api/saju-engine.ts`
- **Astronomy/Time**: `src/core/astronomy/true-solar-time.ts`, `src/core/calendar/ganji.ts`
- **Myeongni Modules**: `src/core/myeongni/` (elements, daewun, gyeokguk, sinsal, sipsong)
- **Relationship/Tarot**: `src/data/tarotDeck.ts`, `src/lib/relationship.ts`

### 💎 1.2 Premium Sensory UI (The Skin)
- **Design System**: `src/app/globals.css` (Neumorphic tokens), `tailwind.config.ts`
- **Visual Atoms**: `src/components/ui/` (SkeletonPulse, LuxuryToast, AmbientSoundPortal, ReadingProgressBar, AIIntelligenceBadge, TransitTicker, ProfileWallet)
- **Interaction Molecules**: 
  - **Results**: `src/components/ResultCard.tsx`, `src/components/result/` (OhaengRadiantChart, KeywordChips, PillarVisualizer, ShareCard, AINarrativeSection)
  - **Analytics**: `src/components/daily/` (WaveChart, CosmicCompass), `src/components/compatibility/` (RelationshipRadar, LoveScoreCounter)
  - **Mystical**: `src/app/tarot/page.tsx`, `src/components/mysaju/` (RelationshipMap, LifeTimeline)

### 🤖 1.4 AI Intelligence Layer (The Brain) — Wave 11+
- **Persona Matrix**: `src/lib/persona-matrix.ts` (5 age groups × 6 tendencies = 30 configs)
- **AI Routing**: `src/core/ai-routing.ts` (GPT-4o/Claude/Gemini orchestration)
- **Persona API**: `src/app/api/persona/route.ts`

### 💳 1.3 Economy & User Context (The Blood)
- **Wallet/Payment**: `src/lib/repositories/jelly-wallet.repository.ts`, `src/app/api/payment/`
- **User Data**: `src/lib/repositories/saju-profile.repository.ts`, `src/lib/analysis-history.ts`
- **Auth**: `src/lib/auth-mcp.ts`, `src/app/api/auth/`

---

## 🛠️ 2. Architectural Guidelines (The Law)

1. **Strict Context Sync**: Any major architecture change must be recorded in `docs/00-overview/DEEP_HISTORY.md`.
2. **Prop Drilling Prevention**: Use repositories (`src/lib/repositories/`) for data persistence.
3. **Atomic Independence**: Components in `src/components/ui/` must be pure and free of side-effects.
4. **Viral Consistency**: All result-oriented pages must include `ShareCard` and `KeywordChips`.

---

## 📈 3. Maintenance Index (Scalability Guard)

- **Total Page Entry Points**: 47 (See `src/app/` directories)
- **Active Waves**: 11.5 (Full history in `DEEP_HISTORY.md`)
- **Key Documentation**:
  - `AI_BOOTSTRAP.md`: 압축 컨텍스트 — AI 온보딩 진입점
  - `NEXT_ACTIONS.md`: **진짜 해야 할 작업 목록** (P0/P1/P2, 유일한 SSOT)
  - `ERROR_LEDGER.md`: 에러 이력 & 할루시네이션 방지 (↔ `docs/ERROR_CATALOG.md` 연동)
  - `docs/ARCHITECTURE.md`: High-level system design.
  - `docs/00-overview/DEEP_HISTORY.md`: Perpetual implementation log.
  - `docs/ERROR_CATALOG.md`: Structured error patterns (코드 레벨 에러).

---

## 🧠 4. Multi-AI Context Efficiency Protocol

이 프로젝트는 사용자가 **상황에 따라 Claude, Gemini, Codex를 전환**하며 개발합니다.
역할이 고정된 것이 아닙니다. **어떤 AI든 모든 작업을 할 수 있습니다.**

### 4.1 작업 시작 시 (필수 읽기 순서)

| 순서 | 파일 | 이유 | 토큰 |
|------|------|------|------|
| ① | `AI_BOOTSTRAP.md` | 프로젝트 전체 상태 압축 | ~2K |
| ② | `ERROR_LEDGER.md` | 알려진 에러/해결법 (같은 실수 방지) | ~2K |
| ③ | 작업 대상 파일 `view_file` | 현재 실제 코드 상태 확인 | 가변 |

> [!CAUTION]
> **절대 금지**: 파일 내용을 "기억"이나 "추측"으로 수정. 반드시 `view_file`로 확인 후 수정.

### 4.2 할루시네이션 연쇄 방지 규칙

1. **수정 전 확인**: 대상 파일을 `view_file`로 읽는다. 예외 없음.
2. **에러 기록**: 에러 발생/해결 시 반드시 `ERROR_LEDGER.md`에 기록한다.
3. **import 확인**: 새 심볼 사용 시 import 구문이 존재하는지 확인한다.
4. **JSX 구조 확인**: React 컴포넌트 수정 시 열림/닫힘 태그 완결성을 확인한다.
5. **인코딩 주의**: 파일 전체 덮어쓰기 시 한글 인코딩(UTF-8)을 확인한다.

### 4.3 작업 종료 시 체크포인트 (Handoff)

작업을 마칠 때 **반드시** 다음을 수행한다:

1. **`AI_BOOTSTRAP.md`의 `Last Checkpoint`** 섹션을 갱신한다:
   ```
   시각: YYYY-MM-DDTHH:MM
   작업자: Claude/Gemini/Codex
   작업 내용: (한 줄 요약)
   다음 작업: (다음 AI가 이어받을 내용)
   ```
2. 새 파일을 만들었으면 이 문서의 **§1 File Map**에 등록한다.
3. 에러가 있었으면 **`ERROR_LEDGER.md`**에 기록한다.

### 4.4 각 모델 강점 참고 (강제 아님)

| Model | 특히 잘하는 것 | 상대적 약점 |
|-------|-------------|-----------|
| Claude | 복잡한 UI 로직, 보안 코드, 감성 서사, 에지케이스 | 매우 긴 파일 한번에 생성 |
| Gemini | 대규모 리팩토링, 긴 파일 분석, 아키텍처 정리 | 세밀한 UI 디테일 |
| Codex/GPT | API 보일러플레이트, 테스트 배치 생성, 빠른 패치 | 깊은 도메인 추론 |

이것은 **참고 사항**입니다. 유저가 어떤 AI에게든 모든 작업을 지시할 수 있습니다.

### 4.5 공유 파일 규칙

- `globals.css`, `layout.tsx`, `schema.sql`: **추가(append)만** 허용
- 삭제/구조변경은 유저 승인 후에만 진행
- `ResultCard.tsx` 수정 시: 반드시 전체 JSX 트리를 먼저 확인 (571줄, 복잡)

---

**Last Indexed**: 2026-03-05
**Integrity Status**: 100% Synced
