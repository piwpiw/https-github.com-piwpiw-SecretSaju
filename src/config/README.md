# Configuration System README

## ?뱰 媛쒖슂

`src/config/` ?붾젆?좊━??**紐⑤뱺 ?섍꼍 蹂?섏? ?ㅼ젙媛믪쓣 以묒븰?먯꽌 愿由?*?섎뒗 ?쒖뒪?쒖엯?덈떎.

### ??以묒슂?쒓??

??**Before (臾몄젣??**:
- ?섍꼍 蹂?섍? ?щ윭 ?뚯씪??遺꾩궛
- ????덉젙???놁쓬
- 寃利?濡쒖쭅 ?꾨씫
- ??먮쭏???ㅻⅨ 諛⑹떇?쇰줈 ?묎렐

??**After (?닿껐梨?**:
- ??怨녹뿉???듯빀 愿由?
- TypeScript ???蹂댁옣
- ?먮룞 寃利?
- ?쇨????ъ슜 諛⑹떇

---

## ?뱚 ?뚯씪 援ъ“

```
src/config/
?쒋?? index.ts       # ?듯빀 export (?ш린?쒕쭔 import)
?쒋?? env.ts         # ?섍꼍 蹂??(????덉쟾, 寃利?
?붴?? constants.ts   # ???곸닔 (鍮꾨?媛??뺣낫)
```

---

## ?? ?ъ슜踰?

### 湲곕낯 ?ъ슜

```typescript
// ??Correct: 以묒븰?붾맂 ?ㅼ젙 ?ъ슜
import { KAKAO_CONFIG, STORAGE_KEYS } from '@/config';

const kakaoKey = KAKAO_CONFIG.JS_KEY;
localStorage.setItem(STORAGE_KEYS.THEME, 'mystic');

// ??Wrong: 吏곸젒 process.env ?묎렐
const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
localStorage.setItem('theme', 'mystic');
```

### 寃利??ъ슜

```typescript
import { KAKAO_CONFIG, FEATURES } from '@/config';

// Feature flag 泥댄겕
if (!FEATURES.KAKAO_LOGIN) {
  return <div>濡쒓렇??湲곕뒫???ㅼ젙?섏? ?딆븯?듬땲??/div>;
}

// Configuration 寃利?
if (!KAKAO_CONFIG.isConfigured) {
  console.error(KAKAO_CONFIG.error);
  // "NEXT_PUBLIC_KAKAO_JS_KEY is not configured"
}
```

---

## ?벀 二쇱슂 Export

### `env.ts` - ?섍꼍 蹂??

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

### `constants.ts` - ???곸닔

```typescript
// Business info
export const BUSINESS_INFO = {
  NAME: '990 ?ъ＜留덈?',
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
  SAJU_PROFILES: 'secret_saju_profiles',
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

## ?뵩 寃利??쒖뒪??

### ?먮룞 寃利?(?쒕쾭 ?쒖옉 ??

?쒕쾭媛 ?쒖옉????`validateEnvironment()`媛 ?먮룞 ?ㅽ뻾?⑸땲??

```
?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺
?뵩 ENVIRONMENT CONFIGURATION
?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺
Environment: development
Base URL: http://localhost:3000

Features:
  ??Kakao Login: ??
  ??Payment: ??
  ??Database: ??
?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺
?좑툘  WARNINGS:
  - Payment gateway is not configured
?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺?곣봺
```

### ?섎룞 寃利?

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

## ?렞 ?ъ슜 ?덉떆

### 而댄룷?뚰듃?먯꽌

```typescript
import { KAKAO_CONFIG, FEATURES } from '@/config';

export default function LoginPage() {
  if (!FEATURES.KAKAO_LOGIN) {
    return (
      <div className="error">
        濡쒓렇??湲곕뒫???ㅼ젙?섏? ?딆븯?듬땲??
        <br />
        愿由ъ옄?먭쾶 臾몄쓽?섏꽭??
      </div>
    );
  }

  return <KakaoLoginButton />;
}
```

### API ?쇱슦?몄뿉??

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

### Storage ?ъ슜

```typescript
import { STORAGE_KEYS } from '@/config';

// ??Type-safe, no typos
localStorage.setItem(STORAGE_KEYS.THEME, 'mystic');
const theme = localStorage.getItem(STORAGE_KEYS.THEME);

// ??String literals - prone to typos
localStorage.setItem('theme', 'mystic'); // ?ㅻⅨ 怨녹뿉??'theem'?쇰줈 ?????덉쓬
```

---

## ?뵏 蹂댁븞 媛?대뱶

### Git 蹂댁븞

- ??`.env.local`? `.gitignore`???ы븿
- ???쒗뵆由??뚯씪留?而ㅻ컠 (`.env.local.template`)
- ???ㅼ젣 ?ㅻ뒗 ?덈? 而ㅻ컠?섏? ?딄린

### ?댁쁺 ?섍꼍

```typescript
// ?먮룞 寃쎄퀬 ?쒖뒪??
if (PAYMENT_CONFIG.isTestMode && ENV.IS_PROD) {
  // ?좑툘 CRITICAL ERROR 諛쒖깮
  throw new Error('PRODUCTION ENVIRONMENT USING TEST PAYMENT KEYS!');
}
```

---

## ?뱷 留덉씠洹몃젅?댁뀡 媛?대뱶

### 湲곗〈 肄붾뱶 ?낅뜲?댄듃

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

## ?넊 臾몄젣 ?닿껐

### "Cannot find module '@/config'"

**?닿껐**:
```json
// tsconfig.json ?뺤씤
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### ?섍꼍 蹂???곸슜 ?덈맖

**?닿껐**:
1. `.env.local` ?뚯씪 ????뺤씤
2. **?쒕쾭 ?ъ떆??* (`npm run dev`)
3. ?대씪?댁뼵??蹂?섎뒗 `NEXT_PUBLIC_` ?묐몢???꾩닔

---

## ?뱴 異붽? 臾몄꽌

- [SECURITY.md](../../../SECURITY.md) - ?꾩쟾??蹂댁븞 媛?대뱶
- [.env.local.template](../../../.env.local.template) - 媛쒕컻 ?섍꼍 ?쒗뵆由?
- [.env.production.template](../../../.env.production.template) - ?댁쁺 ?섍꼍 ?쒗뵆由?


Legacy compatibility note: profile storage supports both 'secret_saju_profiles' and legacy 'secret_paws_saju_profiles'.
