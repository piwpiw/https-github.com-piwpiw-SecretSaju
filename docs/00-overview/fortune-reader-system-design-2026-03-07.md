# Fortune Reader System Design (압축 요약)
> 상세 원문은 docs/archive/decision-history/ 참조. 이 파일은 AI 작업용 요약본.

## 목적
결과 시스템 2축 고도화:
1. 모든 결과를 `전문 해설(Expert)` + `쉬운 설명(Easy)` 2층으로 제공
2. 사용자가 `역술가 캐릭터(Reader)`를 선택해 같은 원국을 다른 스타일로 읽음

## 핵심 원칙
- 리더는 **계산 결과를 바꾸지 않음** — 원국/오행/십성/대운은 동일
- 리더는 **어떤 근거를 먼저 말할지 + 말투 + 카테고리 집중도**만 다름
- Expert/Easy는 **항상 같은 결론** (쉬운 표현 차이만 허용)
- 등급(tier)은 자격 권위가 아닌 **제품 깊이** (Starter/Plus/Pro/Signature)

## 구현 현황 (2026-03-08)

| 항목 | 상태 |
|------|------|
| `src/lib/reader/fortune-readers.ts` — 5개 리더 프로필 | ✅ 완료 |
| `AINarrativeSection.tsx` — 리더 선택 UI | ✅ 완료 |
| `/api/persona` dual narrative 응답 shape | ✅ 완료 |
| `ai-routing.ts` — reader-aware routing | ✅ 완료 |
| `ResultCard.tsx` — 결과 화면 연결 | ✅ 완료 |
| 리더 unlock 경제 (젤리 소모) | ⏳ Phase 2 |
| 즐겨찾기/최근 선택 영구 저장 (DB) | ⏳ Phase 2 |
| 2명 비교 해석 side-by-side | ⏳ Phase 3 |
| 카테고리 전체 롤아웃 (daily/compatibility 등) | ⏳ Phase 3 |

## 5개 기본 리더 (현재 구현)

| ID | 이름 | 모델 | 티어 | 카테고리 |
|----|------|------|------|----------|
| classic_balance | 정통 명리 해석가 | GPT-4O | starter | general |
| easy_translator | 비유의 마법사 | CLAUDE-3.5 | starter | general |
| love_counselor | 관계 리듬 컨설턴트 | CLAUDE-3.5 | plus | love |
| career_strategist | 프로페셔널 전략가 | GPT-4O | plus | career |
| timing_signal | 운 흐름의 지휘자 | GEMINI-1.5 | pro | timing |
| signature_master | 운명의 아키텍트 | GEMINI-1.5 | signature | general |

## 핵심 타입 (요약)

```ts
type FortuneReaderProfile = {
  id: ReaderId; name: string; tier: ReaderTier; category: ReaderCategory;
  recommendedModel: "GPT-4O" | "CLAUDE-3.5" | "GEMINI-1.5";
  warmth: number; directness: number; jargonDensity: number;
  easyBias: number; actionBias: number; specialties: string[];
};

type DualNarrative = { easy: string; expert: string; action: string; hook: string; disclaimer: string; };
```

## 롤아웃 순서

| Phase | 내용 |
|-------|------|
| 1 ✅ | 기본 리더 5명, expert/easy 2층, reader-aware routing |
| 2 | 카테고리별 추천, 즐겨찾기 DB 저장, 프리미엄 리더 unlock |
| 3 | 2명 비교 해석, signature 구독 전용, 월운/질문형 follow-up |
| 4 | 리더 만족도 피드백, 랭킹 학습, A/B 테스트 |

## 안전/신뢰 정책
- 질병/사망/파국 단정형 문장 금지
- AI 캐릭터를 실제 명인처럼 포장 금지
- 프리미엄 해설은 evidence reference 필수
- 리더별 차이는 "결론 충돌"이 아닌 "우선순위 차이"로 표시

Last Updated: 2026-03-08
