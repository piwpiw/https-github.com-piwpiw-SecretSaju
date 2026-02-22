# Configuration System README

## 📖 개요

`src/config/` 디렉토리는 **모든 환경 변수와 설정값을 중앙에서 관리**하는 시스템입니다.

### 왜 중요한가?

❌ **Before (문제점)**:
- 환경 변수가 여러 파일에 분산
- 타입 안정성 없음
- 검증 로직 누락
- 팀원마다 다른 방식으로 접근

✅ **After (해결책)**:
- 한 곳에서 통합 관리
- TypeScript 타입 보장
- 자동 검증
- 일관된 사용 방식

---

## 📁 파일 구조

```
src/config/
├── index.ts       # 통합 export (여기서만 import)
├── env.ts         # 환경 변수 (타입 안전, 검증)
└── constants.ts   # 앱 상수 (비민감 정보)
```

---

## 🚀 사용법

### 기본 사용

```typescript
// ✅ Correct: 중앙화된 설정 사용
import { KAKAO_CONFIG, STORAGE_KEYS } from '@/config';

const kakaoKey = KAKAO_CONFIG.JS_KEY;
localStorage.setItem(STORAGE_KEYS.THEME, 'mystic');

// ❌ Wrong: 직접 process.env 접근
const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
localStorage.setItem('theme', 'mystic');
```

### 검증 사용

```typescript
import { KAKAO_CONFIG, FEATURES } from '@/config';

// Feature flag 체크
if (!FEATURES.KAKAO_LOGIN) {
  return <div>로그인 기능이 설정되지 않았습니다</div>;
}

// Configuration 검증
if (!KAKAO_CONFIG.isConfigured) {
  console.error(KAKAO_CONFIG.error);
  // "NEXT_PUBLIC_KAKAO_JS_KEY is not configured"
}
```

---

## 📦 주요 Export

### `env.ts` - 환경 변수

```typescript
// Environment info
export const ENV = {
  NODE_ENV: 'development' | 'production' | 'test',
  IS_DEV: boolean,
  IS_PROD: boolean,
};

// App config
export const APP_CONFIG = {
  BASE_URL: string,
  API_BASE_URL: string,
};

// Kakao
export const KAKAO_CONFIG = {
  JS_KEY: string,
  REST_API_KEY: string,
  REDIRECT_URI: string,
  isConfigured: boolean,
  error: string | null,
};

// Payment
export const PAYMENT_CONFIG = {
  CLIENT_KEY: string,
  SECRET_KEY: string,
  isConfigured: boolean,
  isTestMode: boolean,
};

// Feature flags
export const FEATURES = {
  KAKAO_LOGIN: boolean,
  PAYMENT: boolean,
  DATABASE: boolean,
};
```

### `constants.ts` - 앱 상수

```typescript
// Business info
export const BUSINESS_INFO = {
  NAME: '990 사주마미',
  REGISTRATION_NUMBER: string,
  // ...
};

// Pricing
export const JELLY_PRICING = {
  TIERS: Array<{
    id: string,
    jellies: number,
    price: number,
  }>,
};

// Storage keys
export const STORAGE_KEYS = {
  KAKAO_TOKEN: 'kakao_token',
  USER_DATA: 'user_data',
  SAJU_PROFILES: 'secret_paws_saju_profiles',
  // ...
};

// API routes
export const API_ROUTES = {
  AUTH: { KAKAO_CALLBACK: string },
  PAYMENT: { INITIALIZE: string },
  // ...
};
```

---

## 🔧 검증 시스템

### 자동 검증 (서버 시작 시)

서버가 시작될 때 `validateEnvironment()`가 자동 실행됩니다:

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
⚠️  WARNINGS:
  - Payment gateway is not configured
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 수동 검증

```typescript
import { validateEnvironment } from '@/config';

const validation = validateEnvironment();

if (!validation.isValid) {
  console.error('Configuration errors:', validation.errors);
}

if (validation.warnings.length > 0) {
  console.warn('Warnings:', validation.warnings);
}
```

---

## 🎯 사용 예시

### 컴포넌트에서

```typescript
import { KAKAO_CONFIG, FEATURES } from '@/config';

export default function LoginPage() {
  if (!FEATURES.KAKAO_LOGIN) {
    return (
      <div className="error">
        로그인 기능이 설정되지 않았습니다.
        <br />
        관리자에게 문의하세요.
      </div>
    );
  }

  return <KakaoLoginButton />;
}
```

### API 라우트에서

```typescript
import { PAYMENT_CONFIG, ENV } from '@/config';

export async function POST(request: Request) {
  if (!PAYMENT_CONFIG.isConfigured) {
    return Response.json(
      { error: 'Payment system not configured' },
      { status: 503 }
    );
  }

  if (PAYMENT_CONFIG.isTestMode && ENV.IS_PROD) {
    return Response.json(
      { error: 'Cannot use test keys in production' },
      { status: 500 }
    );
  }

  // Payment processing...
}
```

### Storage 사용

```typescript
import { STORAGE_KEYS } from '@/config';

// ✅ Type-safe, no typos
localStorage.setItem(STORAGE_KEYS.THEME, 'mystic');
const theme = localStorage.getItem(STORAGE_KEYS.THEME);

// ❌ String literals - prone to typos
localStorage.setItem('theme', 'mystic'); // 다른 곳에서 'theem'으로 쓸 수 있음
```

---

## 🔒 보안 가이드

### Git 보안

- ✅ `.env.local`은 `.gitignore`에 포함
- ✅ 템플릿 파일만 커밋 (`.env.local.template`)
- ❌ 실제 키는 절대 커밋하지 않기

### 운영 환경

```typescript
// 자동 경고 시스템
if (PAYMENT_CONFIG.isTestMode && ENV.IS_PROD) {
  // ⚠️ CRITICAL ERROR 발생
  throw new Error('PRODUCTION ENVIRONMENT USING TEST PAYMENT KEYS!');
}
```

---

## 📝 마이그레이션 가이드

### 기존 코드 업데이트

**Before**:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
localStorage.setItem('user-theme', theme);
```

**After**:
```typescript
import { APP_CONFIG, KAKAO_CONFIG, STORAGE_KEYS } from '@/config';

const apiUrl = APP_CONFIG.BASE_URL;
const kakaoKey = KAKAO_CONFIG.JS_KEY;
localStorage.setItem(STORAGE_KEYS.THEME, theme);
```

---

## 🆘 문제 해결

### "Cannot find module '@/config'"

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

### 환경 변수 적용 안됨

**해결**:
1. `.env.local` 파일 저장 확인
2. **서버 재시작** (`npm run dev`)
3. 클라이언트 변수는 `NEXT_PUBLIC_` 접두사 필수

---

## 📚 추가 문서

- [SECURITY.md](../../../SECURITY.md) - 완전한 보안 가이드
- [.env.local.template](../../../.env.local.template) - 개발 환경 템플릿
- [.env.production.template](../../../.env.production.template) - 운영 환경 템플릿
