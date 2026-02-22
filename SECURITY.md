# Security & Configuration Guide

## 🔐 보안 설정 관리 가이드

이 문서는 Secret Paws 프로젝트의 **모든 보안 키와 설정값**을 체계적으로 관리하기 위한 가이드입니다.

---

## 📁 설정 파일 구조

```
SecretSaju/
├── .env.local              # 로컬 개발 환경 (Git 제외)
├── .env.production         # 운영 환경 (Git 제외, 배포 플랫폼에서 관리)
├── .env.local.template     # 개발 환경 템플릿
├── .env.production.template # 운영 환경 템플릿
├── .env.example            # 레거시 템플릿 (호환성)
└── src/
    └── config/
        ├── index.ts        # 설정 통합 export
        ├── env.ts          # 환경 변수 관리 (검증, 타입 안정성)
        └── constants.ts    # 앱 상수 (비민감 정보)
```

---

## 🎯 중앙화된 설정 시스템

### **왜 중앙화가 필요한가?**

❌ **Before (문제점)**:
```typescript
// 여러 파일에서 직접 process.env 접근
const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
const apiUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
```

- 타입 안정성 없음
- 검증 없이 사용
- 오타 가능성
- 설정값 분산

✅ **After (해결책)**:
```typescript
// src/config/index.ts를 통한 중앙 관리
import { KAKAO_CONFIG, APP_CONFIG } from '@/config';

const kakaoKey = KAKAO_CONFIG.JS_KEY;
const apiUrl = APP_CONFIG.BASE_URL;

// 자동 검증
if (!KAKAO_CONFIG.isConfigured) {
  console.error(KAKAO_CONFIG.error);
}
```

---

## 🔑 환경 변수 계층 구조

### **Level 1: 필수 (Critical)**
앱이 동작하지 않음
- `NEXT_PUBLIC_BASE_URL`
- `NEXT_PUBLIC_KAKAO_JS_KEY`
- `KAKAO_REST_API_KEY`

### **Level 2: 중요 (Important)**
특정 기능 제한
- `NEXT_PUBLIC_TOSS_CLIENT_KEY`
- `TOSS_SECRET_KEY`

### **Level 3: 선택 (Optional)**
기능 향상
- `NEXT_PUBLIC_GA_ID`
- `NEXT_PUBLIC_KAKAO_PIXEL_ID`

---

## ⚙️ 설정 파일 사용법

### **1. 로컬 개발 환경 설정**

```bash
# 1. 템플릿 복사
cp .env.local.template .env.local

# 2. .env.local 편집
NEXT_PUBLIC_KAKAO_JS_KEY=your_actual_key_here
KAKAO_REST_API_KEY=your_actual_key_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# 3. 서버 재시작
npm run dev
```

### **2. 운영 환경 배포 (Vercel 예시)**

```bash
# Vercel Dashboard → Settings → Environment Variables

# Production 환경에 추가:
NEXT_PUBLIC_BASE_URL=https://secretpaws.com
NEXT_PUBLIC_KAKAO_JS_KEY=production_js_key
KAKAO_REST_API_KEY=production_rest_key
KAKAO_CLIENT_SECRET=production_secret

# ⚠️ 주의: Test 키 사용 금지!
NEXT_PUBLIC_TOSS_CLIENT_KEY=live_ck_...  # NOT test_ck_!
```

---

## 🛡️ 보안 체크리스트

### **Git 보안**
- [ ] `.env.local`이 `.gitignore`에 포함되어 있는지 확인
- [ ] `.env.production`이 Git에 커밋되지 않았는지 확인
- [ ] 실수로 커밋된 키가 있다면 **즉시 키 재발급**

### **환경 분리**
- [ ] 개발 환경: `test_` 접두사 키 사용
- [ ] 운영 환경: `live_` 실제 키 사용
- [ ] 환경별 Redirect URI 정확히 설정

### **키 관리**
- [ ] 카카오 앱 키: 개발/운영 별도 앱 생성
- [ ] 토스 PG 키: 테스트키/실제키 혼동 방지
- [ ] Client Secret: httpOnly 쿠키 또는 서버에서만 사용

---

## 🔍 검증 시스템

### **자동 검증 (서버 시작 시)**

```typescript
// src/config/env.ts의 validateEnvironment() 자동 실행
// 콘솔 출력 예시:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 ENVIRONMENT CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Environment: development
Base URL: http://localhost:3000

Features:
  ✓ Kakao Login: ✅
  ✓ Payment: ❌
  ✓ Database: ❌
  ✓ Analytics: ❌
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  WARNINGS:
  - Payment gateway is not configured
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### **수동 검증 (코드에서)**

```typescript
import { validateEnvironment, KAKAO_CONFIG } from '@/config';

// 전체 환경 검증
const validation = validateEnvironment();
if (!validation.isValid) {
  console.error('Configuration errors:', validation.errors);
}

// 특정 기능 검증
if (!KAKAO_CONFIG.isConfigured) {
  // 로그인 기능 비활성화 UI 표시
}
```

---

## 🚨 운영 환경 주의사항

### **배포 전 필수 확인**

```bash
# ❌ 절대 금지
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_...  # Test 키 사용!

# ✅ 올바른 설정
NEXT_PUBLIC_TOSS_CLIENT_KEY=live_ck_...  # Live 키만!
```

### **환경 변수 암호화 (권장)**

#### **Vercel**
- 기본적으로 암호화됨
- Team 권한 설정 가능

#### **AWS**
```bash
# AWS Secrets Manager 사용
aws secretsmanager create-secret \
  --name secret-paws/kakao-keys \
  --secret-string '{"js":"...","rest":"..."}'
```

#### **Docker**
```yaml
# docker-compose.yml
services:
  app:
    env_file:
      - .env.production  # 파일은 서버에만 존재
    environment:
      - NODE_ENV=production
```

---

## 📚 사용 예시

### **컴포넌트에서 사용**

```typescript
import { KAKAO_CONFIG, FEATURES } from '@/config';

export default function LoginPage() {
  if (!FEATURES.KAKAO_LOGIN) {
    return <div>로그인 기능이 설정되지 않았습니다</div>;
  }

  return <KakaoLoginButton />;
}
```

### **API 라우트에서 사용**

```typescript
import { KAKAO_CONFIG, PAYMENT_CONFIG } from '@/config';

export async function POST(request: Request) {
  if (!PAYMENT_CONFIG.isConfigured) {
    return Response.json({ error: 'Payment not configured' }, { status: 503 });
  }

  // 토스 API 호출
  const response = await fetch('https://...', {
    headers: {
      Authorization: `Basic ${btoa(PAYMENT_CONFIG.SECRET_KEY + ':')}`,
    },
  });
}
```

### **Storage 키 사용**

```typescript
import { STORAGE_KEYS } from '@/config';

// ✅ 타입 안전
localStorage.setItem(STORAGE_KEYS.THEME, 'mystic');

// ❌ 오타 가능성
localStorage.setItem('theme', 'mystic'); // 다른 곳에서 'theem'으로 쓸 수 있음
```

---

## 🔄 마이그레이션 가이드

### **기존 코드 업데이트**

**Before:**
```typescript
const apiUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
```

**After:**
```typescript
import { APP_CONFIG, KAKAO_CONFIG } from '@/config';

const apiUrl = APP_CONFIG.BASE_URL;
const kakaoKey = KAKAO_CONFIG.JS_KEY;
```

---

## 📞 문제 해결

### "Kakao login is not configured" 경고

1. `.env.local` 파일 존재 확인
2. `NEXT_PUBLIC_KAKAO_JS_KEY`, `KAKAO_REST_API_KEY` 설정 확인
3. **서버 재시작** (`npm run dev`)

### "PRODUCTION ENVIRONMENT USING TEST PAYMENT KEYS"

- ⚠️ **심각한 보안 문제!**
- `.env.production`에서 `test_` 키를 `live_` 키로 교체
- 즉시 배포 환경 변수 업데이트

### 환경 변수가 적용되지 않음

- `NEXT_PUBLIC_` 접두사가 있는지 확인 (클라이언트에서 접근 시)
- 서버 재시작 확인
- Vercel/배포 플랫폼: 환경 변수 저장 후 **재배포** 필요

---

## ✅ 최종 체크리스트

배포 전 반드시 확인:

- [ ] `.env.local`과 `.env.production`이 Git에 커밋되지 않음
- [ ] 운영 환경에서 Test 키 미사용
- [ ] 카카오 Redirect URI가 실제 도메인과 일치
- [ ] `validateEnvironment()`에서 에러 없음
- [ ] 모든 중요 키가 배포 플랫폼 환경변수에 등록됨
- [ ] Client Secret이 서버에서만 사용됨
