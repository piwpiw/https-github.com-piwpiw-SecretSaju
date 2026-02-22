# 🎨 디자이너 스펙

## 프로젝트 컨셉

**브랜드**: Secret Paws (멍냥의 이중생활)  
**톤앤매너**: 귀엽지만 팩폭하는, 프리미엄한데 재미있는  
**차별점**: 사주아이(단순)와 달리 **"복사 불가능한 시각적 아이덴티티"** 필요

---

## 1. 비주얼 아이덴티티

### 1.1 Color Palette

**Primary**:
```
Yellow/Amber (Jelly 컬러)
- Primary: #FACC15 (yellow-400)
- Accent: #F59E0B (amber-500)
- Dark: #D97706 (amber-600)
```

**Background**:
```
Dark Theme (기본)
- BG: #09090B (zinc-950)
- Surface: #18181B (zinc-900)
- Card: #27272A (zinc-800)
```

**Semantic**:
```
- Success: #22C55E (green-500)
- Warning: #EF4444 (red-500)
- Info: #3B82F6 (blue-500)
```

---

### 1.2 Typography

**Font Family**:
```css
/* Korean */
font-family: 'Pretendard', -apple-system, sans-serif;

/* Weight System */
- Headline: 700 (Bold)
- Body: 500 (Medium)
- Caption: 400 (Regular)
```

**Type Scale**:
```
H1: 32px / 700
H2: 24px / 700
H3: 20px / 700
Body: 16px / 500
Small: 14px / 400
Caption: 12px / 400
```

---

### 1.3 Icon System

**스타일**: Lucide React (이미 사용 중)

**주요 아이콘**:
- `Candy` - Jelly 표시
- `Sparkles` - 프리미엄/특별
- `Lock` - 잠김 콘텐츠
- `TrendingUp` - 인기/추천
- `AlertCircle` - 주의사항

---

## 2. 핵심 UI 컴포넌트

### 2.1 Jelly Shop Modal

**레이아웃**:
```
┌────────────────────────────┐
│    [X]                     │
│  ✨ 젤리 충전소 ✨         │
│  지금 충전하고 비밀 확인!   │
├────────────────────────────┤
│                            │
│  [카드 1: 맛보기]           │
│   1개 젤리                 │
│   990원                    │
│                            │
│  [카드 2: 똑똑이] 25% 할인  │
│   3+1 젤리                 │
│   2,900원                  │
│                            │
│  [카드 3: 프로] ⭐인기1위   │
│   10+3 젤리                │
│   9,900원    가장 가성비!  │
│                            │
│  [충전하기 버튼]            │
└────────────────────────────┘
```

**디자인 포인트**:
- 프로 팩에 **ring-2 ring-yellow-400** (강조)
- 보너스는 **text-green-400** ("+3 보너스!")
- 인기 뱃지는 floating absolute 배치

**애니메이션**:
```
Framer Motion
- 카드 진입: stagger effect (0.1s delay)
- 선택: scale(1.02) + shadow
- 구매 성공: confetti effect
```

---

### 2.2 Relationship Dashboard

**비주얼 컨셉**: 관계도 (Network Graph)

```
           [나]
          /  |  \
        /    |    \
     엄마   애인   상사
     23%   78%   45%
     🔥    💕    ⚠️
```

**디자인 스펙**:
- 중앙 "나" 프로필: 크고 강조 (120px circle)
- 관계 프로필: 작은 카드 (80px circle)
- 선(line): gradient stroke, 궁합도에 따른 컬러
  - 80%+: green
  - 50-80%: yellow
  - 50% 이하: red
- Hover 시: 상세 tooltip

**Material**:
- Glassmorphism 효과
  ```css
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  ```

---

### 2.3 VS Mode Comparison Card

**레이아웃**:
```
┌─────────────────────────────┐
│      나  VS  전남친          │
├─────────────┬───────────────┤
│   [프로필1]  │   [프로필2]   │
│   갑자일주   │   병인일주     │
│             │               │
│   궁합: 12%  (💔 낮음)       │
│                             │
│   복연 가능성: 너무 낮음     │
│   싸우는 이유: 불-물 상극    │
│                             │
│ [인스타 공유] [다운로드]     │
└─────────────────────────────┘
```

**공유용 이미지 스펙**:
- Size: 1080 x 1920 (Instagram Story)
- Format: PNG (투명 배경 지원)
- Watermark: 우측 하단 "Secret Paws"
- Font: Bold, high contrast

**Canvas 생성 로직** (개발자 협업):
```typescript
// 디자이너가 Figma로 템플릿 제공
// 개발자가 Canvas API로 동적 생성
```

---

## 3. 캐릭터 비주얼 (60개)

### 3.1 스타일 가이드

**현재 상태**: [characters.json](file:///d:/Project/SecretSaju/data/characters.json)에 프롬프트만 존재

**타겟 스타일**:
- 3D Clay Render
- Cute + Sassy 표정
- Neon/Cyberpunk lighting
- 일관된 사이즈 (512x512)

**예시 프롬프트**:
```
"3d clay render of a rat wearing a royal crown,
holding a golden scepter, dark purple neon lighting,
cinematic texture, cute but arrogant expression"
```

---

### 3.2 제작 프로세스

**도구**:
- Midjourney / DALL-E 3 / Adobe Firefly
- Blender (수정 필요 시)
- Photoshop (후처리)

**단계**:
1. AI 생성 (batch 10개씩)
2. 일관성 체크 (컬러, 사이즈, 스타일)
3. 후처리 (배경 제거, 정렬)
4. WebP 최적화 (용량 축소)
5. 파일명 규칙: `GAP_JA.webp`

**예산**:
- AI 구독: $20-50/월
- 외주 시: 개당 3-5만원 (total 180-300만원)

---

### 3.3 저작권 보호

**절차**:
1. AI 생성 이미지도 **저작권 등록 가능** (창작성 인정)
2. 한국저작권위원회 온라인 등록
3. 비용: 60개 묶음 등록 약 50만원
4. PSD/원본 파일 보관 (증거용)

---

## 4. 애니메이션 가이드

### 4.1 Framer Motion 사용 패턴

**공통 규칙**:
```typescript
// Fade In
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3 }}

// Scale Hover
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
```

**Jelly 구매 성공**:
```typescript
// Sparkle 회전
animate={{ rotate: 360 }}
transition={{ duration: 1, repeat: Infinity }}
```

---

### 4.2 Micro-interactions

**예시**:
- Jelly 아이콘 클릭 → bounce
- 잔액 업데이트 → count-up 애니메이션
- 카드 언락 → slide + fade
- VS 결과 → sequential reveal

---

## 5. 디자이너 작업물

### 5.1 우선순위 1 (즉시 필요)

**관계 대시보드 Mockup**:
- [ ] 관계도 레이아웃 (Figma)
- [ ] 궁합별 컬러 가이드
- [ ] 카드 호버 상태
- [ ] Mobile responsive (320px-768px)

**VS Mode Share Card**:
- [ ] Instagram Story 템플릿 (1080x1920)
- [ ] 워터마크 위치/스타일
- [ ] 궁합별 비주얼 variant (high/mid/low)

---

### 5.2 우선순위 2 (2주 내)

**캐릭터 제작**:
- [ ] 샘플 10개 (테스트용)
- [ ] 스타일 가이드 확정
- [ ] 나머지 50개 batch 작업

**Daily Secret UI**:
- [ ] 푸시 알림 디자인
- [ ] 타이머 표시 UI
- [ ] "오늘의 팩폭" 카드

---

### 5.3 우선순위 3 (장기)

**브랜딩**:
- [ ] 로고 디자인 (등록용)
- [ ] Favicon (multiple sizes)
- [ ] App Icon (iOS / Android)
- [ ] Sonic Branding (사운드 로고 - 외주)

---

## 6. 디자인 시스템 (Figma)

### 구조

```
Secret Paws Design System
├── Colors
├── Typography
├── Components
│   ├── Buttons
│   ├── Cards
│   ├── Modals
│   └── Icons
├── Templates
│   ├── Shop Modal
│   ├── Dashboard
│   └── Share Card
└── Characters
    └── 60 sprites
```

### 공유 링크
- Figma URL: (TODO - 디자이너가 생성 후 팀 공유)

---

## 7. 디자이너 TODO

### 이번 주
- [ ] 관계 대시보드 Mockup (Figma)
- [ ] VS Mode Share Card 템플릿
- [ ] 캐릭터 샘플 10개 제작

### 다음 주
- [ ] 전체 디자인 시스템 Figma 정리
- [ ] Daily Secret UI 디자인
- [ ] 애니메이션 스펙 문서화

### 보안/법적
- [ ] 로고 상표 등록 신청
- [ ] 캐릭터 저작권 등록 준비
- [ ] PSD 원본 파일 아카이빙

---

## 8. 협업 포인트

**개발자와**:
- Figma → Code 자동 변환 (Tailwind CSS)
- 애니메이션 타이밍 조율
- Canvas 이미지 생성 협력

**콘텐츠 팀과**:
- 캐릭터 표정 가이드
- UI 카피 길이 제한
- 톤앤매너 일관성

---

## 9. 벤치마크

**참고 서비스**:
- 사주아이: 단순하지만 깔끔
- 띵스플로우: 프리미엄 다크 테마
- Flo (생리 앱): 데이터 시각화

**차별화 포인트**:
- Secret Paws만의 **3D Clay 캐릭터**
- Glassmorphism + Neon accent
- 게임같은 애니메이션
