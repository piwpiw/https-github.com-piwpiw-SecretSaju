# 💻 개발자 기술 스펙

## 아키텍처 개요

**Stack**: Next.js 14, TypeScript, Framer Motion, localStorage (MVP)  
**배포**: GCP + Firebase (예정)

---

## 1. 구현 완료 사항 ✅

### 1.1 Jelly 가상 화폐 시스템

#### 파일: `src/lib/jelly-wallet.ts`

**기능**:
- 잔액 관리 (localStorage)
- 3-tier 가격 정책
- 거래 내역 추적
- 언락 로직

**주요 함수**:
```typescript
getBalance(): number
purchaseJellies(tierId: string): Promise<PurchaseResult>
consumeJelly(amount: number, purpose: string): ConsumptionResult
unlockContent(profileId: string, sectionId?: string): ConsumptionResult
isUnlocked(profileId: string, sectionId?: string): boolean
```

**Storage Keys**:
- `secret_paws_jelly_wallet` - 지갑 데이터
- `secret_paws_unlocks` - 언락 기록

---

### 1.2 관계 분석 알고리즘

#### 파일: `src/lib/compatibility.ts`

**업그레이드 내역**:
- ✅ 오행(五行) 이론 기반 점수 계산
- ✅ 관계 타입별 modifiers (엄마, 연인, 상사 등)
- ✅ 갈등 포인트 분석
- ✅ 액션 아이템 생성

**핵심 함수**:
```typescript
getCompatibility(
  pillarIndexA: number,
  pillarIndexB: number
): CompatibilityResult

analyzeRelationship(
  pillarIndexA: number,
  pillarIndexB: number,
  relationshipType: RelationshipType
): RelationshipAnalysis
```

**오행 상생상극 테이블**:
```typescript
{
  '목-화': 85, // 상생
  '금-목': 30, // 상극
  // ... 25개 조합
}
```

---

### 1.3 UI 컴포넌트

#### `src/components/shop/JellyShopModal.tsx`
- 3-tier 가격 카드
- 인기 상품 뱃지
- 구매 애니메이션
- Props:
  ```typescript
  interface JellyShopModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPurchaseSuccess?: (jellies: number) => void;
    highlightTier?: 'taste' | 'smart' | 'pro';
  }
  ```

#### `src/components/shop/JellyBalance.tsx`
- 실시간 잔액 표시
- 자동 업데이트 (storage event)
- Low balance warning

#### `src/components/shop/UnlockPrompt.tsx`
- 잠금 콘텐츠 blur 처리
- 언락 비용 표시
- 잔액 부족 시 샵 유도

---

### 1.4 프로필 추가 플로우

#### 파일: `src/app/my-saju/add/page.tsx`

**로직**:
```typescript
// 첫 프로필 체크
const profiles = getProfiles();
const isFirst = profiles.length === 0;

if (isFirst) {
  // 무료로 저장
  saveProfile(data);
} else {
  // Jelly 확인
  if (hasSufficientBalance(1)) {
    showConfirmModal(); // "1 젤리 사용하시겠습니까?"
  } else {
    showShopModal(); // 충전 유도
  }
}
```

**Modal States**:
- `showShopModal` - Jelly 구매
- `showConfirmModal` - 사용 확인

---

## 2. 데이터 구조

### 2.1 Character Schema (Enhanced)

#### 파일: `data/characters.json`

**추가된 필드**:
```json
{
  "persona": {
    "validation_hook": {
      "desc": "너 남한테 무시당한 거 같으면 며칠씩 곱씹지 않아?",
      "purpose": "Cold reading for trust building"
    }
  },
  "wealth_analysis": {
    "action_item": {
      "mission": "주식 앱 3일간 삭제",
      "reason": "너의 뇌는 장기 승부에 최적화됨"
    }
  }
}
```

**현재 상태**: 3개 캐릭터 완료 (갑자, 을축, 병인)  
**TODO**: 나머지 57개 작성

---

### 2.2 TypeScript Types

#### `src/types/jelly.ts`

```typescript
interface JellyWallet {
  balance: number;
  totalPurchased: number;
  totalConsumed: number;
  history: Transaction[];
  lastUpdated: number;
}

interface Transaction {
  id: string;
  type: 'purchase' | 'consume' | 'refund';
  amount: number;
  jellies: number;
  purpose?: string;
  metadata?: { profileId?: string; tierId?: string };
  timestamp: number;
}

interface UnlockRecord {
  profileId: string;
  sections: string[];
  unlockedAt: number;
}
```

---

## 3. 다음 구현 항목

### 3.1 관계 대시보드 (우선순위 1)

#### 새 파일 생성 필요:

**Component**:
```
src/components/dashboard/
├── RelationshipDashboard.tsx
├── RelationshipCard.tsx
└── RelationshipInsight.tsx
```

**Page**:
```
src/app/dashboard/page.tsx
```

**필요 로직**:
```typescript
// Storage에 mainProfile 개념 추가
function setMainProfile(profileId: string): void
function getRelationships(): {
  profile: Profile;
  compatibility: CompatibilityResult;
  isUnlocked: boolean;
}[]
```

---

### 3.2 VS 모드 (우선순위 2)

#### 새 파일:
```
src/components/vs/
├── VSModeComparison.tsx
└── ShareCard.tsx (Canvas 기반 이미지 생성)
```

**Canvas Image Generation**:
```typescript
function generateShareImage(
  profile1: Profile,
  profile2: Profile,
  result: CompatibilityResult
): Blob {
  const canvas = createCanvas(1080, 1920); // Instagram story size
  // ... 렌더링 로직
  return canvas.toBlob();
}
```

---

### 3.3 Daily Secret System (우선순위 3)

#### 새 파일:
```
src/lib/daily-secret.ts
```

**로직**:
```typescript
function getDailySecret(characterCode: string): {
  insight: string;
  action: string;
  expiresAt: number;
} {
  const seed = `${characterCode}-${getCurrentDate()}`;
  // Deterministic 생성 (같은 날은 같은 결과)
  return generateFromSeed(seed);
}
```

---

## 4. API 보안 (향후)

### 4.1 암호화

```typescript
// characters.json을 서버 API로 이관
// GET /api/character/:code
// Response: 실시간 decrypt + 조합
```

### 4.2 Rate Limiting

```typescript
// Middleware
const rateLimit = new RateLimiter({
  windowMs: 60 * 1000,
  max: 100, // 분당 100 요청
});
```

### 4.3 Fingerprinting

```typescript
function getBrowserFingerprint(): string {
  return hash([
    navigator.userAgent,
    screen.width,
    screen.height,
    timezone,
    getCanvasSignature(),
  ]);
}
```

---

## 5. 성능 최적화

### 현재 고려사항

**localStorage 한계**:
- 5-10MB 제한
- 동기 I/O (blocking)

**마이그레이션 계획** (유저 10만+ 시):
```
localStorage → IndexedDB → Firebase/Supabase
```

**이미지 최적화**:
- 3D 캐릭터 WebP 포맷
- Lazy loading
- CDN 배포

---

## 6. 테스트

### 현재 상태
- ✅ TypeScript compile (no errors)
- ✅ Dev server running (port 3002)
- ⏸️ Browser E2E testing (pending)

### 테스트 시나리오

**Manual**:
1. 첫 프로필 추가 (무료) → 확인
2. 두 번째 프로필 시도 → Jelly 부족 확인
3. Jelly 구매 (각 tier) → 잔액 업데이트 확인
4. 프로필 추가 → Jelly 차감 확인
5. 언락 로직 → 중복 차감 방지 확인

**Unit Tests** (향후):
```bash
npm test
# jest + @testing-library/react
```

---

## 7. 배포

### MVP 체크리스트
- [ ] 환경 변수 설정 (.env.production)
- [ ] Firebase 프로젝트 생성
- [ ] GCP 설정
- [ ] 도메인 연결
- [ ] HTTPS 설정
- [ ] Analytics 연동 (GA4)

### 빌드 명령어
```bash
npm run build
npm run start

# 또는
firebase deploy
```

---

## 8. Git 구조

```
main (production)
└── develop (staging)
    ├── feature/relationship-dashboard
    ├── feature/vs-mode
    └── feature/daily-secret
```

---

## 9. 참고 문서

- [전체 구현 기록](./active-dispatch.md)
- [관계 대시보드 상세](./TEAM_SPEC_콘텐츠.md)

---

## 10. 개발자 TODO

### 즉시 착수
- [ ] 관계 대시보드 컴포넌트  (2-3일)
- [ ] VS 모드 UI (1-2일)
- [ ] Canvas 이미지 생성 (1일)

### 다음 주
- [ ] Daily Secret 로직 (1일)
- [ ] 푸시 알림 (Firebase Cloud Messaging)
- [ ] Admin 대시보드 (analytics)

### 보안 강화
- [ ] API 라우트 암호화
- [ ] Rate limiter 미들웨어
- [ ] Watermarking 시스템
