# 🚀 Secret Saju - 5분 빠른 시작 가이드

**목표**: 최소한의 설정으로 개발 서버 실행까지

---

## ✅ Step 1: 필수 계정 생성 (10분)

### 1-1. Kakao Developers

1. **회원가입**: https://developers.kakao.com/
2. **앱 생성**: 
   - 내 애플리케이션 → 애플리케이션 추가하기
   - 앱 이름: `SecretSaju` (또는 원하는 이름)
3. **앱 키 확인**:
   - 앱 선택 → 요약 정보
   - `JavaScript 키` 복사 → 메모장에 저장
   - `REST API 키` 복사 → 메모장에 저장
4. **플랫폼 등록**:
   - 앱 설정 → 플랫폼 → Web 플랫폼 등록
   - 사이트 도메인: `http://localhost:3000`
5. **Kakao Login 활성화**:
   - 제품 설정 → Kakao Login → 활성화 ON
   - Redirect URI: `http://localhost:3000/api/auth/kakao/callback`
6. **Client Secret 생성** (보안 강화):
   - 제품 설정 → Kakao Login → 보안
   - Client Secret 코드 생성 → 활성화
   - 생성된 키 복사 → 메모장에 저장
7. **동의 항목 설정**:
   - 제품 설정 → Kakao Login → 동의 항목
   - 닉네임: 필수 동의
   - 이메일: 선택 동의

### 1-2. Supabase

1. **회원가입**: https://supabase.com/
2. **프로젝트 생성**:
   - New Project 클릭
   - Name: `secret-saju`
   - Database Password: 강력한 비밀번호 생성 → **반드시 저장**
   - Region: `Northeast Asia (Seoul)`
   - Pricing Plan: Free
3. **API 키 확인**:
   - 프로젝트 선택 → Settings → API
   - `Project URL` 복사 → 메모장
   - `anon` `public` 키 복사 → 메모장
   - `service_role` 키 복사 → 메모장 (**절대 공개 금지**)
4. **데이터베이스 스키마 생성**:
   - 좌측 메뉴 → SQL Editor
   - 우측 상단 → New Query
   - 파일 `supabase/schema.sql` 내용 전체 복사
   - 붙여넣기 후 Run 버튼 클릭
   - 성공 메시지 확인

### 1-3. Toss Payments (선택)

> **결제 기능을 당장 사용하지 않는다면 건너뛰세요**

1. **회원가입**: https://developers.tosspayments.com/
2. **테스트 키 발급**:
   - 대시보드 → API 키
   - 테스트 모드 → 클라이언트 키 복사
   - 테스트 모드 → 시크릿 키 복사

---

## ✅ Step 2: 환경 변수 설정 (2분)

1. **파일 확인**:
   - 프로젝트 루트에 `.env.local` 파일이 이미 생성되어 있습니다
   
2. **키 값 입력**:
   - `.env.local` 파일을 에디터로 열기
   - 메모장에 저장한 키 값들을 해당 위치에 붙여넣기

   ```bash
   # Kakao
   NEXT_PUBLIC_KAKAO_JS_KEY=abc123xyz  # JavaScript 키
   KAKAO_REST_API_KEY=def456uvw        # REST API 키
   KAKAO_CLIENT_SECRET=ghi789rst       # Client Secret

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

   # Toss (선택)
   NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_...
   TOSS_SECRET_KEY=test_sk_...
   ```

3. **저장**: Ctrl+S (또는 Cmd+S)

---

## ✅ Step 3: 개발 서버 실행 (1분)

```bash
# 1. 의존성 설치 (최초 1회만)
npm install

# 2. 개발 서버 시작
npm run dev
```

**예상 출력**:
```
  ▲ Next.js 14.2.18
  - Local:        http://localhost:3000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 ENVIRONMENT CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Environment: development
Base URL: http://localhost:3000

Features:
  ✓ Kakao Login: ✅
  ✓ Database: ✅
  ✓ Payment: ✅ (또는 ❌)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ✅ Step 4: 동작 확인 (2분)

### 4-1. 메인 페이지
1. 브라우저에서 http://localhost:3000 접속
2. 생년월일 입력 폼 확인
3. 테스트 입력:
   - 생년월일: `1990-01-01`
   - 출생 시간: `12:00`
   - 성별: `남성`
   - 음력/양력: `양력`
4. "사주 보기" 버튼 클릭
5. **예상 결과**: 60갑자 결과 + 동물 타입 + 추천 음식/제품 표시

### 4-2. 로그인 테스트
1. http://localhost:3000/mypage 접속
2. "카카오 로그인" 버튼 클릭
3. Kakao 로그인 페이지로 이동 확인
4. 카카오 계정으로 로그인
5. **예상 결과**: 마이페이지로 리다이렉트 + 닉네임 표시

---

## 🐛 문제 해결

### ❌ "Kakao SDK not loaded"
- **원인**: Kakao JS 키가 잘못되었거나 입력되지 않음
- **해결**: `.env.local`에서 `NEXT_PUBLIC_KAKAO_JS_KEY` 확인
- **재시작**: 서버 중지(Ctrl+C) 후 `npm run dev` 다시 실행

### ❌ "Redirect URI mismatch"
- **원인**: Kakao 개발자 콘솔에 Redirect URI 미등록
- **해결**: Kakao 콘솔 → Kakao Login → Redirect URI에 `http://localhost:3000/api/auth/kakao/callback` 추가

### ❌ "Supabase connection failed"
- **원인**: Supabase URL 또는 키가 잘못됨
- **해결**: Supabase 대시보드 → Settings → API에서 URL과 키 재확인

### ❌ 서버가 시작되지 않음
- **원인**: 3000 포트가 이미 사용 중
- **해결**: 
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID번호> /F
  
  # Mac/Linux
  lsof -ti:3000 | xargs kill
  ```

---

## 📚 다음 단계

설정이 완료되면:

1. **개발 시작**: `implementation_plan.md` 참고
2. **테스트 실행**: `npm run test`
3. **관리자 페이지**: http://localhost:3000/admin (전체 기능 검증)
4. **문서 확인**:
   - `README.md` - 전체 프로젝트 개요
   - `docs/MASTER_PRD.md` - 상세 요구사항
   - `SECURITY.md` - 보안 가이드

---

## 🆘 도움말

- **Kakao 설정 상세**: `KAKAO_SETUP.md`
- **Supabase 설정 상세**: `SUPABASE_SETUP.md`
- **보안 가이드**: `SECURITY.md`
- **전체 README**: `README.md`

**문제가 계속되면**: 에러 메시지 전체를 복사해서 질문해주세요!
