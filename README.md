# 🐾 Secret Paws - 990 사주마미

> **프리미엄 사주 플랫폼 - 완전한 기능 구현 가이드**

<p align="center">
  <strong>이 프로젝트는 10명의 팀원이 협업할 수 있도록 설계되었습니다.</strong><br>
  모든 설정, 코드, 문서가 명확하고 체계적으로 관리됩니다.
</p>

---

## 📚 필수 문서 (READ THIS FIRST!)

### 🔴 신규 팀원이라면 반드시 읽어야 할 문서

| 문서 | 목적 | 읽는 순서 |
|------|------|-----------|
| **[이 README](#)** | 프로젝트 전체 개요 | 1️⃣ |
| **[SECURITY.md](./SECURITY.md)** | 환경 변수 및 보안 키 관리 | 2️⃣ |
| **[KAKAO_SETUP.md](./KAKAO_SETUP.md)** | 카카오 로그인 설정 가이드 | 3️⃣ |
| **[integration_guide.md](C:/Users/piwpi/.gemini/antigravity/brain/ebdc03af-68d7-408a-88f9-293cc05fe8a6/integration_guide.md)** | API 통합 가이드 | 4️⃣ |

### 🔷 개발 중 참고 문서

| 문서 | 설명 |
|------|------|
| [`src/config/README.md`](#configuration-system) | 설정 시스템 사용법 |
| [`task.md`](C:/Users/piwpi/.gemini/antigravity/brain/ebdc03af-68d7-408a-88f9-293cc05fe8a6/task.md) | 현재 작업 진행 상황 |
| [`walkthrough.md`](C:/Users/piwpi/.gemini/antigravity/brain/ebdc03af-68d7-408a-88f9-293cc05fe8a6/walkthrough.md) | 완료된 기능 상세 설명 |

---

## 🎯 프로젝트 현재 상태

### ✅ 완료된 Phase (Phases 1-7)

- ✅ **Phase 1-2**: 코어 기능 (60갑자 기반 사주 계산, 유명인 매칭)
- ✅ **Phase 3**: 테마 시스템 (Mystic, Minimal, Cyber)
- ✅ **Phase 4**: 글로벌 통합 (사업자 정보, 컴플라이언스)
- ✅ **Phase 5**: 사주 프로필 관리 (CRUD, localStorage)
- ✅ **Phase 6**: My Page & Wallet (츄르/냥 시스템)
- ✅ **Phase 7**: Jelly 경제 시스템
- ✅ **Phase 8**: 카카오 로그인 통합
- ✅ **Phase 9**: 중앙화된 환경 변수 관리

### 🚧 진행 중 (Next Steps)

- [ ] **실제 결제 시스템 연동** (토스페이먼츠)
- [ ] **Backend API 구축** (Supabase/Custom)
- [ ] **운세 콘텐츠 생성** (GPT API 또는 DB)
- [ ] **배포 준비** (Vercel/AWS)

---

## 🏗️ 프로젝트 구조 (핵심만 표시)

```
SecretSaju/
├── 📄 환경 설정 파일
│   ├── .env.local.template       ⭐ 개발 환경 템플릿
│   ├── .env.production.template  ⭐ 운영 환경 템플릿
│   └── .env.local                (Git 제외, 직접 생성)
│
├── 📚 문서
│   ├── README.md                 ⭐ 이 파일
│   ├── SECURITY.md               ⭐ 보안 및 환경 변수 가이드
│   ├── KAKAO_SETUP.md            ⭐ 카카오 로그인 설정
│   └── docs/                     추가 문서
│
├── 🎨 src/
│   ├── config/                   ⭐ 중앙화된 설정 관리
│   │   ├── env.ts               환경 변수 (타입 안전, 검증)
│   │   ├── constants.ts         앱 전역 상수
│   │   └── index.ts             통합 export
│   │
│   ├── lib/
│   │   ├── kakao-auth.ts         ⭐ 카카오 인증
│   │   ├── jelly-wallet.ts       ⭐ 젤리 경제
│   │   ├── storage.ts            사주 프로필 관리
│   │   ├── saju.ts              사주 계산 엔진
│   │   └── themes.ts            테마 시스템
│   │
│   ├── components/
│   │   ├── KakaoLoginButton.tsx  ⭐ 로그인 버튼
│   │   ├── shop/                젤리샵 관련
│   │   ├── WalletProvider.tsx   츄르/냥 지갑
│   │   └── ...
│   │
│   └── app/
│       ├── mypage/              마이페이지
│       ├── my-saju/             사주 관리
│       ├── inquiry/             문의하기
│       ├── compatibility/       궁합
│       └── api/
│           └── auth/kakao/      ⭐ 카카오 OAuth
│
└── data/
    ├── characters.json          60갑자 데이터
    └── celebrities.ts           유명인 DB
```

---

## 🚀 빠른 시작 가이드

### 1️⃣ 프로젝트 클론 및 설치

```bash
# 저장소 클론
git clone <repository-url>
cd SecretSaju

# 의존성 설치
npm install
```

### 2️⃣ 환경 변수 설정 ⭐

```bash
# 템플릿 복사
cp .env.local.template .env.local

# .env.local 편집 (VS Code 사용)
code .env.local
```

#### 필수 설정 항목:

```bash
# 카카오 로그인 (필수)
NEXT_PUBLIC_KAKAO_JS_KEY=your_key_here
KAKAO_REST_API_KEY=your_key_here

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

> ⚠️ **카카오 키 발급 방법**: [KAKAO_SETUP.md](./KAKAO_SETUP.md) 참고

### 3️⃣ 개발 서버 실행

```bash
npm run dev
```

🎉 **http://localhost:3000** 접속

---

## 🔑 환경 변수 완전 가이드

### 계층 구조

| 우선순위 | 카테고리 | 변수 | 상태 |
|---------|---------|------|------|
| **🔴 필수** | 카카오 로그인 | `NEXT_PUBLIC_KAKAO_JS_KEY` | 구현 완료 |
| **🔴 필수** | 카카오 로그인 | `KAKAO_REST_API_KEY` | 구현 완료 |
| 🟡 중요 | 결제 | `NEXT_PUBLIC_TOSS_CLIENT_KEY` | 준비 완료 |
| 🟡 중요 | 결제 | `TOSS_SECRET_KEY` | 준비 완료 |
| 🟢 선택 | DB | `NEXT_PUBLIC_SUPABASE_URL` | - |
| 🟢 선택 | 분석 | `NEXT_PUBLIC_GA_ID` | - |

### 자동 검증 시스템

서버 시작 시 자동으로 검증:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 ENVIRONMENT CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Environment: development
Base URL: http://localhost:3000

Features:
  ✓ Kakao Login: ✅
  ✓ Payment: ❌
  ✓ Database: ❌
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

> 📖 **상세 가이드**: [SECURITY.md](./SECURITY.md)

---

## 💡 핵심 기능 설명

### 1. 중앙화된 설정 관리 (`src/config/`)

**왜 중요한가?**
10명의 팀원이 협업할 때 환경 변수가 여러 파일에 분산되면 혼란스럽고 오류가 발생합니다.

**해결책 - 한 곳에서 관리:**

```typescript
// ❌ Before: 여러 파일에서 직접 접근
const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

// ✅ After: 중앙화된 설정 사용
import { KAKAO_CONFIG } from '@/config';
const kakaoKey = KAKAO_CONFIG.JS_KEY;

// 자동 검증
if (!KAKAO_CONFIG.isConfigured) {
  console.error(KAKAO_CONFIG.error);
}
```

**파일 구조:**

- **`env.ts`**: 환경 변수 + 검증 로직
- **`constants.ts`**: 비즈니스 로직 상수
- **`index.ts`**: 통합 export

### 2. 카카오 로그인 (`lib/kakao-auth.ts`)

**완전 구현 완료:**

1. **SDK 초기화**: `initKakao()`
2. **로그인**: `loginWithKakao()`
3. **로그아웃**: `clearUserSession()`
4. **세션 확인**: `getUserFromCookie()`

**API 플로우:**

```
사용자 로그인 버튼 클릭
  → Kakao OAuth 페이지
  → 로그인 성공
  → /api/auth/kakao/callback (서버)
  → 쿠키 저장 (kakao_token, user_data)
  → /mypage 리다이렉트
```

### 3. Jelly 경제 시스템 (`lib/jelly-wallet.ts`)

**3단계 가격 정책:**

| Tier | 젤리 | 보너스 | 가격 | 특징 |
|------|------|--------|------|------|
| 맛보기 | 1 | 0 | 990원 | - |
| 똑똑이 | 3 | +1 | 2,900원 | 25% 할인 |
| **프로** | 10 | +3 | 9,900원 | **최고 가성비** ⭐ |

**사용처:**

- 프로필 추가 (첫 번째 무료, 이후 1젤리)
- 섹션 잠금 해제 (1젤리)
- 프리미엄 운세 (3젤리)

### 4. 사주 프로필 관리 (`lib/storage.ts`)

**CRUD 완전 구현:**

- `getProfiles()`: 전체 조회
- `saveProfile()`: 신규 저장
- `deleteProfile()`: 삭제
- `updateProfile()`: 수정

**Schema:**

```typescript
{
  id: string;
  name: string;
  relationship: '본인' | '배우자' | '자녀' | ...;
  birthdate: 'YYYY-MM-DD';
  birthTime: 'HH:mm';
  isTimeUnknown: boolean;
  calendarType: 'solar' | 'lunar';
  gender: 'female' | 'male';
}
```

---

## 🎨 테마 시스템

3가지 테마 지원:

1. **Mystic** (기본): 신비로운 남색/금색
2. **Minimal**: 깔끔한 흰색/초록
3. **Cyber**: 네온 보라/청록

**사용법:**

```typescript
import { useTheme } from '@/components/ThemeProvider';

const { theme, setTheme } = useTheme();
setTheme('mystic'); // or 'minimal', 'cyber'
```

---

## 🧪 테스트 가이드

### 로컬 테스트 체크리스트

```bash
# 1. 카카오 로그인
✅ /mypage 접속 → 로그인 버튼 클릭
✅ 카카오 로그인 성공 → 닉네임/이메일 표시 확인

# 2. 사주 프로필
✅ /my-saju/add → 프로필 추가
✅ /my-saju/list → 목록 확인
✅ 삭제 기능 작동

# 3. Jelly 시스템
✅ 젤리샵 모달 오픈
✅ 프로필 추가 시 젤리 소비 (2번째부터)

# 4. 테마
✅ 테마 전환 (Mystic ↔ Minimal ↔ Cyber)
```

---

## 📦 배포 가이드

### 빠른 배포 (권장)

```bash
# 1. 환경 변수 설정
npm run setup:env

# 2. 환경 변수 검증
npm run verify:env

# 3. 데이터베이스 마이그레이션
npm run migrate:db
# Supabase Dashboard에서 SQL 실행 또는: supabase db push

# 4. 배포 전 검증
npm run pre-deploy

# 5. 배포
npm run deploy
```

자세한 내용은 [`QUICK_DEPLOY.md`](./QUICK_DEPLOY.md) 참고

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

### ⚠️ 운영 배포 전 체크리스트

- [ ] 환경 변수 설정 완료 (`npm run verify:env`)
- [ ] 데이터베이스 마이그레이션 실행 완료
- [ ] 로컬 빌드 성공 (`npm run build`)
- [ ] 테스트 통과 (`npm test`)
- [ ] `.env.local` 파일이 Git에 **절대** 커밋되지 않았는지 확인
- [ ] 카카오 Redirect URI를 실제 도메인으로 변경
- [ ] Test 키를 Live 키로 교체 (결제)
- [ ] `validateEnvironment()` 에러 없음 확인

---

## 👥 팀 협업 가이드

### Git 브랜치 전략

```
main (운영)
  ↑
develop (개발)
  ↑
feature/기능명 (각 팀원 작업)
```

### 코드 리뷰 체크리스트

- [ ] **환경 변수**: `process.env` 직접 사용 ❌ → `@/config` 사용 ✅
- [ ] **타입 안전**: `any` 사용 최소화
- [ ] **에러 처리**: try-catch 적절히 사용
- [ ] **보안**: 민감한 키 콘솔 출력 금지

### 컨벤션

**파일명:**
- 컴포넌트: `PascalCase.tsx`
- 유틸: `camelCase.ts`
- 설정: `kebab-case.ts`

**Import 순서:**
```typescript
// 1. External
import { useState } from 'react';

// 2. Internal - Config
import { KAKAO_CONFIG } from '@/config';

// 3. Internal - Components
import KakaoLoginButton from '@/components/KakaoLoginButton';

// 4. Internal - Lib
import { loginWithKakao } from '@/lib/kakao-auth';

// 5. Styles
import './styles.css';
```

---

## 🐛 문제 해결 (FAQ)

### Q1: "Kakao SDK not loaded" 에러

**원인**: Kakao SDK 스크립트가 로드되지 않음
**해결**:
1. 브라우저 콘솔에서 `window.Kakao` 확인
2. `src/app/layout.tsx`에 SDK script 태그 존재 확인
3. 네트워크 탭에서 스크립트 로드 확인

### Q2: "Redirect URI mismatch" 에러

**원인**: 카카오 개발자 콘솔 설정 불일치
**해결**:
- 카카오 콘솔 → Redirect URI: `http://localhost:3000/api/auth/kakao/callback`
- 운영: `https://your-domain.com/api/auth/kakao/callback`

### Q3: 환경 변수가 적용 안됨

**해결**:
1. `.env.local` 파일 저장 확인
2. **서버 재시작** (`npm run dev` 다시 실행)
3. 클라이언트 변수는 `NEXT_PUBLIC_` 접두사 필수

### Q4: "Cannot find module '@/config'" 에러

**원인**: TypeScript 경로 설정 문제
**해결**:
```json
// tsconfig.json 확인
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 📞 연락처 및 리소스

### 핵심 담당자

| 역할 | 담당 영역 | 연락처 |
|------|----------|--------|
| Tech Lead | 아키텍처, 보안 | - |
| Frontend | UI/UX 구현 | - |
| Backend | API 통합 | - |
| DevOps | 배포, 인프라 | - |

### 외부 리소스

- [Kakao Developers](https://developers.kakao.com/)
- [Toss Payments Docs](https://developers.tosspayments.com/)
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Vercel 배포 가이드](https://vercel.com/docs)

---

## 📝 변경 이력

| 날짜 | Phase | 주요 변경 사항 |
|------|-------|---------------|
| 2026-01-31 | Phase 9 | 중앙화된 환경 설정 시스템 구축 |
| 2026-01-31 | Phase 8 | 카카오 로그인 완전 통합 |
| 2026-01-30 | Phase 7 | Jelly 경제 시스템 구현 |
| 2026-01-30 | Phase 5-6 | 사주 관리 + My Page 구현 |

---

## 🎯 다음 마일스톤

### Sprint 1 (1-2주)
- [ ] 토스페이먼츠 실제 결제 연동
- [ ] Supabase 데이터베이스 설정
- [ ] 사용자 인증 강화 (JWT)

### Sprint 2 (3-4주)
- [ ] 운세 콘텐츠 GPT API 통합
- [ ] 관리자 대시보드 구축
- [ ] 푸시 알림 시스템

### Sprint 3 (5-6주)
- [ ] 운영 배포
- [ ] 모니터링 설정
- [ ] 성능 최적화

---

<p align="center">
  <strong>Made with ❤️ by Secret Paws Team</strong><br>
  <sub>Version 1.0.0 | Last Updated: 2026-01-31</sub>
</p>
