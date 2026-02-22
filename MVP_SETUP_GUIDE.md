# MVP 핵심 설정 가이드

오늘 밤 완성을 위한 필수 설정 체크리스트입니다.

---

## 1️⃣ Supabase 데이터베이스 설정

### SQL 실행
1. Supabase 대시보드 → SQL Editor
2. `supabase/schema.sql` 파일 내용 전체 복사
3. 실행 (Run)

⚠️ **주의**: 기존 테이블과 충돌 가능. 필요 시 기존 데이터 백업 후 DROP TABLE먼저 실행.

---

## 2️⃣ 환경 변수 설정

`.env.local` 파일에 추가:

```bash
# ============================================
# Toss Payments
# ============================================
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_XXXXXXXXXX
TOSS_SECRET_KEY=test_sk_XXXXXXXXXX

# ============================================
# Kakao OAuth
# ============================================
NEXT_PUBLIC_KAKAO_JS_KEY=XXXXXXXXXXXXXXXXXXXXXX
KAKAO_REST_API_KEY=XXXXXXXXXXXXXXXXXXXXXX

# ============================================
# Reward Policies (젤리 수량)
# ============================================
NEXT_PUBLIC_REFERRAL_REWARD_REFERRER=2  # 초대한 사람
NEXT_PUBLIC_REFERRAL_REWARD_REFERRED=1  # 초대받은 사람
NEXT_PUBLIC_SIGNUP_BONUS=1              # 회원가입 보너스
NEXT_PUBLIC_FIRST_SAJU_REWARD=0         # 첫 사주 계산 (0 = 없음)
NEXT_PUBLIC_PROFILE_SAVE_REWARD=0       # 프로필 저장 (0 = 없음)

# ============================================
# App URL
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000  # 개발
# NEXT_PUBLIC_APP_URL=https://yourdomain.com  # 프로덕션
```

---

## 3️⃣ NPM 패키지 설치

```bash
npm install @tosspayments/payment-sdk
```

---

## 4️⃣ 테스트 순서

### 4.1 데이터베이스 확인
```sql
-- Supabase SQL Editor에서 실행
SELECT * FROM users LIMIT 1;
SELECT * FROM jelly_wallets LIMIT 1;
```

### 4.2 API 테스트 (순서대로)

1. **회원가입/로그인**  
   → Kakao OAuth 연동 확인

2. **지갑 생성**  
   → `/api/wallet/balance` 호출 (자동 생성됨)

3. **초대 코드 생성**  
   → `/api/referrals/create` 호출

4. **결제 테스트**  
   → `/api/payment/initialize` → Toss 위젯 → `/api/payment/verify`

5. **보상 지급**  
   → `/api/rewards/claim` 호출

---

## 5️⃣ 카카오 개발자 설정 확인

1. **Redirect URI 등록**
   - 개발: `http://localhost:3000/auth/callback/kakao`
   - 프로덕션: `https://yourdomain.com/auth/callback/kakao`

2. **활성화된 API**
   - 카카오 로그인 ✅
   - 카카오톡 메시지 (공유용) ✅

3. **동의 항목**
   - 이메일 (선택)
   - 닉네임 (선택)
   - 프로필 이미지 (선택)

---

## 6️⃣ Toss Payments 설정 확인

1. **테스트 키 vs 실제 키**
   - 처음엔 테스트 키로 시작
   - `test_ck_...`, `test_sk_...`

2. **Webhook URL 설정 (선택사항)**
   - `https://yourdomain.com/api/payment/webhook`

---

## 7️⃣ Vercel 배포 준비

1. **환경 변수 복사**
   - `.env.local` → Vercel Dashboard → Settings → Environment Variables

2. **Build 테스트**
   ```bash
   npm run build
   ```

3. **배포**
   ```bash
   vercel --prod
   ```

---

## 8️⃣ 최종 체크리스트

- [ ] Supabase SQL 실행 완료
- [ ] `.env.local` 모든 변수 설정
- [ ] `npm install` 완료
- [ ] Kakao Redirect URI 등록
- [ ] Toss API 키 발급
- [ ] 로컬에서 전체 플로우 테스트
- [ ] Vercel 환경 변수 설정
- [ ] 프로덕션 배포

---

## 🆘 문제 발생 시

### Database Error
→ Supabase SQL Editor에서 에러 확인  
→ 기존 테이블 DROP 필요 시: `DROP TABLE IF EXISTS referrals CASCADE;`

### Payment Error
→ Toss API 키 확인  
→ Webhook URL 설정 확인  
→ Cors 문제 시 도메인 허용 목록 확인

### Kakao Login Error
→ Redirect URI 정확히 일치하는지 확인  
→ JavaScript 키 vs REST API 키 구분  
→ 개발자 콘솔에서 로그 확인

---

**준비되면 알려주세요!** 🚀
