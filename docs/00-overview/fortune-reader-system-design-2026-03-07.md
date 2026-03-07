# Fortune Reader System Design (2026-03-07)

## 1. 목적

SecretSaju의 결과 시스템을 다음 2축으로 고도화한다.

1. 같은 결과를 `전문 해설`과 `쉬운 설명`으로 동시에 제공한다.
2. 사용자가 `역술가 캐릭터`를 선택해 같은 원국을 서로 다른 해석 스타일로 읽을 수 있게 한다.

이 문서는 감성 기획 문서가 아니라, 현재 코드 구조에 바로 연결 가능한 제품/기술 설계 문서다.

---

## 2. 현재 상태 점검

현재 코드에는 이미 이 시스템의 씨앗이 있다.

- `src/components/saju/AdvancedInterpretationPanel.tsx`
  - `쉬운 해석 / 전문 근거` 토글이 이미 존재한다.
- `src/core/ai-routing.ts`
  - 사용자 연령/성향 기반 persona routing이 있다.
- `src/lib/persona-matrix.ts`
  - 연령대와 성향별 system prompt 매트릭스가 있다.
- `src/app/api/persona/route.ts`
  - LLM narrative 생성 경로가 있다.
- `src/components/result/AINarrativeSection.tsx`
  - 결과 화면의 AI 서사 섹션이 있다.
- `src/lib/archetypes.ts`
  - 60갑자 archetype 자산과 표시용 hook/secret preview가 있다.

즉, 지금 필요한 것은 완전 신설이 아니라 `persona routing`을 `reader system`으로 승격하는 작업이다.

현재 구조의 한계는 명확하다.

- 지금의 persona는 사실상 `프롬프트 톤` 수준이다.
- 사용자가 직접 `역술가`를 선택하는 경험이 없다.
- `전문 해설`과 `쉬운 설명`이 같은 엔티티로 관리되지 않는다.
- `같은 원국인데 왜 말이 조금 다르지?`를 설명하는 메타데이터가 부족하다.
- `등급/레벨/카테고리/전문 분야`가 데이터 모델로 정의되지 않았다.

---

## 3. 외부 리서치 요약

### 3.1 시장에서 확인되는 패턴

공식 페이지 기준으로, 대형 점성/상담 서비스는 대부분 아래 패턴을 쓴다.

1. `상담사 선택형`
- Keen은 점성가별로 채팅/메일, 경력, 별점, 가격, 전문 분야를 노출한다.
- Kasamba도 점성가별 읽기 수, 활동 기간, 전문 카테고리를 전면에 둔다.
- AskNebula/Nebula는 실시간 대화형 점술가와 카테고리별 전문 영역을 강조한다.

2. `전문 분야 분화형`
- 연애, 커리어, 재정, 타이밍, 꿈, 타로, 호환성처럼 카테고리를 쪼갠다.
- 사용자는 "누가 더 정확한가"보다 "어떤 분야에 강한가"로 선택한다.

3. `초보자 친화형`
- Astro Sanctuary는 자기이해, 개인 여정, 멤버 포털, 교육형 콘텐츠를 함께 묶는다.
- 즉, 결과는 단순 예측보다 `이해 + 반복 방문` 구조로 설계된다.

4. `윤리/신뢰 장치`
- ISAR는 윤리 기준과 안전한 점성 실무를 별도 포털로 관리한다.
- 해석 다양성은 허용하되, 소비자 신뢰와 안전이 핵심이라는 점이 분명하다.

### 3.2 UX 관점에서 확인되는 패턴

공식 가이드 기준으로, 복잡한 정보를 한 번에 전부 보여주면 학습성과 전환율이 모두 떨어진다.

- U.S. Digital.gov의 plain language 가이드는 공공 대상 콘텐츠가 분명하고 이해하기 쉬워야 한다고 본다.
- Nielsen Norman Group은 progressive disclosure를 핵심 옵션만 먼저 보여주고, 고급 옵션은 요청 시 노출하는 구조로 설명한다.

이 기준은 SecretSaju에 그대로 들어맞는다.

- 첫 화면: 쉬운 설명
- 다음 레벨: 전문 해설
- 그다음: 근거 로그
- 마지막: 프리미엄/비교 리더/정기구독

---

## 4. 핵심 판단

### 4.1 `다양한 역술가 시스템`은 도입 가치가 높다

이유:

- 같은 원국도 학파, 질문 의도, 상담 스타일에 따라 강조점이 달라질 수 있다.
- 사용자는 `정답 1개`보다 `내게 맞는 해석 스타일`을 선택하고 싶어 한다.
- 캐릭터 선택은 체류시간, 재방문, 컬렉션, 멤버십과 잘 연결된다.
- 현재 엔진은 이미 evidence 기반으로 가고 있기 때문에, `해석 스타일만 다르게 얹는 구조`가 가능하다.

### 4.2 단, `가짜 권위 시스템`은 금지해야 한다

중요:

- AI 캐릭터의 `레벨`, `등급`, `마스터`, `명인` 같은 표현을 실제 자격처럼 보이게 하면 신뢰 리스크가 생긴다.
- 실제 검증되지 않은 경우에는 `콘텐츠 등급`, `해설 깊이`, `추천도`, `스타일`로 표기해야 한다.
- 실제 자격/경력처럼 보이는 필드는 `검증된 데이터`가 있을 때만 사용한다.

권장 표기:

- `등급`: Bronze / Silver / Gold / Master
- 의미: `해설 깊이`, `카테고리 전문화`, `근거 밀도`, `프리미엄 범위`
- 금지 의미: 실제 국가 공인 자격, 실제 상담 경력, 실제 학회 인증

---

## 5. 제품 원칙

### 5.1 모든 결과는 2층으로 제공한다

각 해석 블록은 반드시 아래 2개를 동시에 가진다.

- `Expert Layer`
  - 전문 용어를 유지한다.
  - 예: 용신, 희신, 월령, 격국 후보, 형충합해, 통관
- `Easy Layer`
  - 같은 내용을 쉬운 말로 다시 쓴다.
  - 예: "지금은 불필요한 확장보다 중심을 잡는 편이 유리합니다."

### 5.2 쉬운 설명은 전문 설명의 번역본이어야 한다

금지:

- 쉬운 설명만 따로 생성
- 전문 설명과 다른 결론

권장:

- 같은 evidence를 보고
- 같은 결론을 유지하되
- 어휘만 낮춰 다시 표현

### 5.3 리더 캐릭터는 `사실 엔진`을 바꾸지 않고 `해석 스타일`을 바꾼다

바뀌면 안 되는 것:

- 원국 계산
- 오행 점수
- 십성 분포
- 대운/세운 계산
- evidence

바뀔 수 있는 것:

- 어떤 근거를 먼저 말할지
- 말투
- 쉬운 비유
- 행동 조언 방식
- 카테고리 집중도

---

## 6. 리더 캐릭터 시스템 개요

### 6.1 시스템 정의

`Fortune Reader`는 아래 4개가 합쳐진 엔티티다.

1. `Identity`
- 이름
- 캐릭터 소개
- 시각 자산
- 세계관/성격

2. `Interpretation Policy`
- 어떤 근거를 우선시하는지
- 어떤 카테고리를 강조하는지
- 쉬운 설명 비율
- 조언 강도

3. `Presentation Style`
- 직설형 / 상담형 / 멘토형 / 냉정형 / 감성형
- 이모지 밀도
- 전문 용어 허용량

4. `Monetization Role`
- 무료 기본 리더
- 카테고리 특화 리더
- 프리미엄 리더
- 시즌/이벤트 리더

### 6.2 추천 캐릭터 구조

최초 버전은 8명으로 시작하는 것이 적당하다.

1. `정통 명리 해석가`
- 역할: 기본 메인 리더
- 특화: 원국, 격국, 용신, 강약
- 말투: 단정하지만 과장 없음
- 대상: 사주에 익숙한 사용자

2. `쉬운 번역 해설가`
- 역할: 초보자 기본값
- 특화: 쉬운 설명, 입문형 비유
- 말투: 친절, 짧은 문장
- 대상: 신규 유저

3. `연애 흐름 상담가`
- 특화: 관계, 감정선, 케미, 갈등 패턴
- 대상: `/compatibility`, `/relationship/*`

4. `커리어 전략가`
- 특화: 직업, 실행력, 승진/이직, 일의 리듬
- 대상: `/saju`, `/fortune`

5. `재물/실전 플래너`
- 특화: 소비 습관, 현금흐름, 기회/리스크

6. `타이밍 분석가`
- 특화: 대운/세운/월운/일운
- 대상: `/daily`, `/calendar`, `/tojeong`

7. `심리 번역가`
- 특화: 감정, 방어기제, 심리 모듈, 꿈
- 대상: `/psychology`, `/dreams`

8. `의식/서사형 리더`
- 특화: 세계관, 몰입감, 프리미엄 롱폼
- 대상: 프리미엄/정기구독 콘텐츠

---

## 7. 데이터 모델

### 7.1 ReaderProfile

```ts
type ReaderProfile = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  avatarStyle: string;
  category: "general" | "love" | "career" | "wealth" | "timing" | "psychology" | "dream" | "tarot";
  tier: "starter" | "plus" | "pro" | "signature";
  difficulty: "easy" | "balanced" | "expert";
  lineageTag: "balanced_modern" | "traditionalist" | "timing_focus" | "counseling_focus";
  tone: {
    warmth: number;
    directness: number;
    jargonDensity: number;
    emojiDensity: number;
    actionBias: number;
  };
  specialties: string[];
  supportedQueryTypes: Array<"result" | "daily" | "compatibility" | "chat" | "dream" | "tarot">;
  premiumOnly: boolean;
  unlockCostJelly?: number;
  subscriptionIncluded: boolean;
  active: boolean;
};
```

### 7.2 ReaderPromptPolicy

```ts
type ReaderPromptPolicy = {
  readerId: string;
  systemPromptBase: string;
  expertStylePrompt: string;
  easyStylePrompt: string;
  evidencePriority: Array<"strength" | "gyeokguk" | "yongshin" | "interactions" | "transits" | "sinsal">;
  prohibitedPatterns: string[];
  disclaimerTemplate: string;
};
```

### 7.3 InterpretationBlock

```ts
type InterpretationBlock = {
  id: string;
  topic: string;
  expertText: string;
  easyText: string;
  actionText: string;
  evidenceIds: string[];
  confidence: number;
  readerId: string;
  lineageProfileId?: string;
  category: "core" | "love" | "career" | "wealth" | "timing" | "psychology";
};
```

### 7.4 UserReaderState

```ts
type UserReaderState = {
  userId: string;
  favoriteReaderIds: string[];
  selectedReaderByCategory: Record<string, string>;
  unlockedReaderIds: string[];
  lastReaderId?: string;
};
```

---

## 8. 등급/레벨/성향 설계

### 8.1 등급

`등급`은 전문가 자격이 아니라 제품 깊이다.

- `Starter`
  - 무료
  - 쉬운 설명 중심
  - 핵심 3블록만
- `Plus`
  - 젤리 소모형
  - 카테고리 특화
  - 행동 조언 강화
- `Pro`
  - 심화 근거, 긴 해설, 비교 해석
- `Signature`
  - 구독 전용
  - 월운/일운/비교 리더/심층 Q&A

### 8.2 레벨

`레벨`은 캐릭터의 권위가 아니라 사용자 관계도다.

- LV1: 첫 해금
- LV2: 3회 이상 사용
- LV3: 즐겨찾기
- LV4: 프리미엄 리포트 3회 이상
- LV5: 정기구독 연동

레벨이 올라가면:

- 캐릭터 소개가 확장됨
- 더 긴 템플릿 사용 가능
- 카테고리별 추천 정확도 개선

### 8.3 성향 태그

성향 태그는 선택 UX에 직접 노출한다.

- `따뜻한 설명`
- `직설적 해석`
- `근거 중심`
- `연애 특화`
- `커리어 특화`
- `타이밍 특화`
- `초보자 친화`
- `전문 용어 많음`

---

## 9. UX 설계

### 9.1 첫 진입 기본값

기본값은 `사용자 자유 선택`이 아니라 `추천 + 변경 가능` 구조가 맞다.

첫 진입 흐름:

1. 시스템이 기본 리더 1명을 추천
2. 추천 이유를 짧게 노출
3. `다른 역술가 보기` 버튼 제공
4. 사용자가 변경 가능

추천 기준:

- queryType
- insightFocus
- user age/tendency
- 이전 선택
- 결제 상태

### 9.2 결과 화면 배치

권장 순서:

1. 핵심 결과 요약
2. 선택된 리더의 `쉬운 설명`
3. `전문 해설 보기` 토글
4. `다른 역술가 해석 보기`
5. 근거 로그
6. 프리미엄 CTA

### 9.3 리더 선택 화면

카드에 최소한 아래가 있어야 한다.

- 이름
- 대표 한 줄
- 특화 카테고리
- 쉬운/전문 성향
- 추천 배지
- 무료/프리미엄 여부

사용자는 한 번에 2명까지만 비교하게 하는 것이 좋다.

이유:

- 3명 이상은 인지 부하가 커진다.
- NN/G 기준 progressive disclosure에도 맞지 않는다.

---

## 10. 결과 생성 규칙

### 10.1 전문 해설과 쉬운 설명 동시 생성

`/api/persona`는 앞으로 단일 narrative가 아니라 아래 구조를 반환해야 한다.

```ts
type ReaderNarrativeResponse = {
  reader: {
    id: string;
    name: string;
    tier: string;
    category: string;
  };
  blocks: InterpretationBlock[];
  summary: {
    expert: string;
    easy: string;
    action: string;
  };
  disclaimer: string;
};
```

### 10.2 생성 프롬프트 규칙

반드시 포함:

- 동일 evidence 기반
- expert/easy 결론 일치
- easy는 쉬운 표현, expert는 전문 용어 허용
- 행동 조언은 1~3개
- 공포 조장 금지
- 무근거 단정 금지

### 10.3 해석 차이 표시 규칙

같은 원국을 두 리더가 다르게 말해도 시스템은 그 이유를 표시해야 한다.

예시:

- `정통 명리 해석가`: 월령과 강약을 우선
- `연애 흐름 상담가`: 관계 축과 감정 패턴을 우선

즉, `결론 충돌`이 아니라 `우선순위 차이`로 보여줘야 한다.

---

## 11. 랭킹 및 추천 로직

### 11.1 추천 점수

```ts
readerScore =
  0.30 * categoryFit +
  0.20 * userPreferenceFit +
  0.15 * difficultyFit +
  0.15 * premiumEligibility +
  0.10 * satisfactionScore +
  0.10 * freshnessBoost
```

### 11.2 categoryFit 계산

- `/compatibility`, `/relationship/*` -> love 계열 우선
- `/daily`, `/calendar`, `/tojeong` -> timing 계열 우선
- `/psychology`, `/dreams` -> psychology 계열 우선
- `/saju`, `/fortune` -> general / career / wealth 혼합

### 11.3 difficultyFit 계산

- 신규 유저 -> easy/balanced 우선
- 재방문/프리미엄 경험자 -> balanced/expert 우선

---

## 12. 안전/신뢰 정책

ISAR의 윤리 기준과 현재 엔진 문서 기준을 결합하면, 리더 시스템은 아래를 반드시 지켜야 한다.

1. `해석 다양성 허용`
- 여러 학파와 관점을 지원한다.

2. `공포 조장 금지`
- 질병, 사망, 파국 같은 단정형 문장 금지

3. `출처 없는 권위 금지`
- 검증되지 않은 AI 캐릭터를 실제 명인처럼 포장 금지

4. `근거 연결 필수`
- 모든 프리미엄 해설은 evidence reference를 가져야 한다.

5. `차이 설명 필수`
- 리더별 차이는 왜 생기는지 보여줘야 한다.

표시 문구 예시:

`같은 사주라도 역술가의 관점과 강조점에 따라 해석 포인트가 달라질 수 있습니다. SecretSaju는 계산 결과는 동일하게 유지하고, 설명 방식과 집중 영역만 다르게 제공합니다.`

---

## 13. 현재 코드에 필요한 리팩터

### 13.1 Persona Matrix 분리

현재:

- `age + tendency -> systemPrompt`

변경:

- `user profile -> recommended reader ids`
- `reader profile -> prompt policy`
- `model routing -> reader independent`

즉, `리더`와 `모델`을 분리해야 한다.

### 13.2 `/api/persona` 확장

추가 파라미터:

- `readerId`
- `explanationMode`
- `categoryFocus`
- `comparisonReaderIds?`

### 13.3 UI 반영 지점

- `src/components/ResultCard.tsx`
  - 메인 리더 선택/추천 배지
- `src/components/result/AINarrativeSection.tsx`
  - expert/easy 동시 출력
- `src/components/saju/AdvancedInterpretationPanel.tsx`
  - 쉬운 설명과 전문 근거를 같은 블록 기준으로 정렬
- `/compatibility`, `/fortune`, `/daily`
  - 카테고리 특화 리더 연결

---

## 14. 롤아웃 순서

### Phase 1

- ReaderProfile 정적 JSON 도입
- `/api/persona`가 `readerId` 받도록 변경
- 결과 화면에 `기본 리더 1명`만 노출
- expert/easy 2층 구조 표준화

### Phase 2

- 카테고리별 추천 리더
- 즐겨찾기/최근 선택 저장
- 프리미엄 리더 2명 추가

### Phase 3

- 2명 비교 해석
- 멤버십 전용 signature reader
- 월운/일운/질문형 follow-up

### Phase 4

- reader satisfaction feedback
- reader ranking learning
- A/B test

---

## 15. 우선 구현안

가장 효율적인 첫 구현은 이 조합이다.

1. 기본 리더 4명만 먼저 도입
- 정통 명리 해석가
- 쉬운 번역 해설가
- 연애 흐름 상담가
- 커리어 전략가

2. 모든 결과는 expert/easy/action 3행 구조로 통일

3. 리더별 차이는 `스타일 + 우선 카테고리`만 먼저 반영

4. 이후 실제 사용 데이터를 보고 8명으로 확장

이 접근이 좋은 이유:

- 현재 코드 변경량이 적다.
- 결과 품질이 바로 달라진다.
- 프리미엄/구독 연결이 쉽다.
- 과장된 세계관만 늘고 실제 가치가 비는 위험을 막을 수 있다.

---

## 16. 최종 판단

이 시스템은 도입 가치가 높다. 다만 성공 조건은 아래 3가지다.

1. `같은 원국, 다른 말투`가 아니라 `같은 근거, 다른 우선순위`여야 한다.
2. `전문 해설`과 `쉬운 설명`은 항상 같은 결론이어야 한다.
3. `등급/레벨`은 권위 포장이 아니라 제품 구조여야 한다.

즉, SecretSaju의 다중 역술가 시스템은 `가짜 점술가 쇼룸`이 아니라 `근거 기반 해석 인터페이스`로 설계되어야 한다.

---

## 17. 참고 소스

- Keen Astrology official landing page:
  - https://www.keen.com/landingpage/astrology
- Kasamba Astrology official page:
  - https://www.kasamba.com/astrology/
- AskNebula official FAQ:
  - https://www.asknebula.com/faq
- AskNebula official astrology reading page:
  - https://asknebula.com/astrology-reading
- Astro Sanctuary official home:
  - https://astro-sanctuary.com/
- ISAR official home and ethics portal:
  - https://www.isarastrology.com/
  - https://isarastrology.com/isar-ethical-standards-and-guidelines/
- U.S. Digital.gov Plain Language Guide:
  - https://digital.gov/guides/plain-language
- Nielsen Norman Group Progressive Disclosure:
  - https://www.nngroup.com/articles/progressive-disclosure/

---

## 18. Implementation Status Update (2026-03-08)

Phase 1 is partially implemented.

- Implemented:
  - `src/lib/fortune-readers.ts`
  - selectable reader UI in `src/components/result/AINarrativeSection.tsx`
  - dual narrative response shape from `src/app/api/persona/route.ts`
  - reader-aware routing in `src/core/ai-routing.ts`
  - result screen wiring in `src/components/ResultCard.tsx`
- Current scope:
  - 5 base readers
  - easy / expert / action narrative blocks
  - recommendation by query type and focus
- Not yet implemented:
  - reader unlock economy
  - user favorite / last selected persistence
  - multi-reader side-by-side compare
  - category-wide rollout outside the main result narrative layer
