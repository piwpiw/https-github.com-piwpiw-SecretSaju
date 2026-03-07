# Kakao Login Setup Guide

## 利됱떆 ?댁빞 ???묒뾽

### 1. 移댁뭅??媛쒕컻?????깅줉

1. [Kakao Developers](https://developers.kakao.com/) ?묒냽 諛?濡쒓렇??
2. **???좏뵆由ъ??댁뀡** > **?좏뵆由ъ??댁뀡 異붽??섍린** ?대┃
3. ???대쫫: "Secret Paws" (?먮뒗 ?먰븯???대쫫)
4. **?뚮옯???ㅼ젙** > **Web ?뚮옯???깅줉**:
   - ?ъ씠???꾨찓?? `http://localhost:3000`
5. **Redirect URI ?ㅼ젙**:
   - ???ㅼ젙 > 移댁뭅??濡쒓렇??
   - Redirect URI: `http://localhost:3000/api/auth/kakao/callback` 異붽?
   - **?쒖꽦???ㅼ젙 ON** 泥댄겕

### 2. ??蹂듭궗?섍린

**????* 硫붾돱?먯꽌:
- **JavaScript ??* 蹂듭궗
- **REST API ??* 蹂듭궗

### 3. ?섍꼍 蹂???ㅼ젙

?꾨줈?앺듃 猷⑦듃??`.env.local` ?뚯씪 ?앹꽦:

```bash
# Kakao Keys
NEXT_PUBLIC_KAKAO_JS_KEY=蹂듭궗??JavaScript_??
KAKAO_REST_API_KEY=蹂듭궗??REST_API_??

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. 媛쒕컻 ?쒕쾭 ?ъ떆??

?섍꼍 蹂???곸슜???꾪빐 npm run dev ?ъ떆??

### 5. ?뚯뒪??

1. http://localhost:3000/mypage ?묒냽
2. "移댁뭅??濡쒓렇?? 踰꾪듉 ?대┃
3. 移댁뭅??濡쒓렇???섏씠吏?먯꽌 濡쒓렇??
4. 濡쒓렇???깃났 ??MyPage濡?由щ떎?대젆??
5. ?ъ슜???됰꽕?꾧낵 ?대찓???쒖떆 ?뺤씤

## 臾몄젣 ?닿껐

### "Redirect URI mismatch" ?먮윭
- 移댁뭅??媛쒕컻??肄섏넄?먯꽌 Redirect URI媛 ?뺥솗??`http://localhost:3000/api/auth/kakao/callback`?몄? ?뺤씤

### "Invalid app key" ?먮윭
- `.env.local` ?뚯씪???ㅺ? ?щ컮瑜몄? ?뺤씤
- ?쒕쾭 ?ъ떆???뺤씤

### 移댁뭅??SDK 濡쒕뱶 ?덈맖
- 釉뚮씪?곗? 肄섏넄?먯꽌 `window.Kakao` ?뺤씤
- ?ㅽ듃?뚰겕 ??뿉??Kakao SDK ?ㅽ겕由쏀듃 濡쒕뱶 ?뺤씤

## MCP OAuth Configuration (Server + Client)

### Purpose

Set environment variables for MCP OAuth 2.1 PKCE flow:

```bash
# MCP OAuth client (public)
NEXT_PUBLIC_MCP_CLIENT_ID=your_mcp_client_id
NEXT_PUBLIC_MCP_AUTH_URL=https://provider.example.com/oauth/authorize
NEXT_PUBLIC_MCP_TOKEN_URL=https://provider.example.com/oauth/token
NEXT_PUBLIC_MCP_USERINFO_URL=https://provider.example.com/oauth/userinfo
NEXT_PUBLIC_MCP_SCOPE=openid profile email
NEXT_PUBLIC_MCP_REDIRECT_URI=https://your-domain.com/api/auth/mcp/callback

# MCP OAuth server secret (private)
MCP_CLIENT_SECRET=your_mcp_client_secret
```

### Required checks

- CLIENT_ID, AUTH_URL, TOKEN_URL, REDIRECT_URI should be set.
- USERINFO_URL is required for profile sync. If missing, login will still exchange token but user metadata sync may fail.
- MCP OAuth artifact cookies (`MCP_STATE`, `MCP_CODE_VERIFIER`) are intentionally short-lived (10 minutes).
- Keep `MCP_CLIENT_SECRET` server-only.

### Runtime note

- `process.env.NEXT_PUBLIC_USE_MOCK_DATA=true` bypasses MCP network calls in local mock mode.
# Supabase Setup Guide

## ?? Quick Start

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com/)
2. Sign in with GitHub
3. Click **"New Project"**
4. Fill in:
   - **Name**: `Secret Paws`
   - **Database Password**: (save this securely!)
   - **Region**: `Northeast Asia (Seoul)` or closest
5. Wait 2-3 minutes for provisioning

### Step 2: Get Connection Credentials

In your Supabase project dashboard:

1. Go to **Settings** ??**API**
2. Copy the following:
   - **Project URL** ??`NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** ??`NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** ??`SUPABASE_SERVICE_ROLE_KEY` (?좑툘 Keep secret!)

### Step 3: Update Environment Variables

Add to `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # SERVER ONLY - DO NOT EXPOSE
```

### Step 4: Run Database Migrations

#### Option A: Supabase SQL Editor (Recommended)

1. Go to **SQL Editor** in Supabase dashboard
2. Click **"New query"**
3. Copy contents of `supabase/migrations/001_initial_schema.sql`
4. Click **"Run"**
5. Repeat for `002_rls_policies.sql`

#### Option B: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Step 5: Verify Setup

1. Go to **Table Editor**
2. You should see 6 tables:
   - `users`
   - `jelly_wallets`
   - `jelly_transactions`
   - `saju_profiles`
   - `unlocks`
   - `inquiries`

---

## ?뱤 Database Schema Overview

### Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **users** | User accounts | `kakao_id`, `nickname`, `email` |
| **jelly_wallets** | Jelly balances | `user_id`, `balance`, `total_purchased` |
| **jelly_transactions** | Transaction history | `type`, `amount`, `jellies`, `payment_id` |
| **saju_profiles** | Saved profiles | `user_id`, `name`, `birthdate`, `gender` |
| **unlocks** | Unlocked content | `user_id`, `profile_id`, `section_id` |
| **inquiries** | Customer support | `category`, `subject`, `message`, `status` |

### Relationships

```
users (1) ??? (1) jelly_wallets
  ??
  ?쒋??? (N) jelly_transactions
  ?쒋??? (N) saju_profiles
  ?쒋??? (N) unlocks
  ?붴??? (N) inquiries
```

---

## ?뵏 Row Level Security (RLS)

All tables have RLS enabled. Users can only:

- **View** their own data
- **Insert** their own data (profiles, inquiries)
- **Update** their own data
- **Delete** their own data

**Wallet & Transaction** operations require **service role** (API routes only) to prevent client-side manipulation.

---

## ?㎦ Testing

### 1. Test Database Connection

Create a test file: `scripts/test-supabase.ts`

```typescript
import { getSupabaseClient } from '@/lib/supabase';

async function testConnection() {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    console.error('??Supabase not configured');
    return;
  }

  const { data, error } = await supabase
    .from('users')
    .select('count');

  if (error) {
    console.error('??Connection failed:', error);
  } else {
    console.log('??Supabase connected!', data);
  }
}

testConnection();
```

### 2. Test User Creation

```sql
-- In Supabase SQL Editor
INSERT INTO users (kakao_id, nickname, email)
VALUES (12345, 'Test User', 'test@example.com')
RETURNING *;

-- Check wallet was auto-created
SELECT * FROM jelly_wallets WHERE user_id = (
  SELECT id FROM users WHERE kakao_id = 12345
);
```

---

## ?슚 Troubleshooting

### "relation does not exist"

**Cause**: Migrations not run  
**Fix**: Run migrations in SQL Editor

### "permission denied for table"

**Cause**: RLS blocking access  
**Fix**: Use service role client for privileged operations

### "JWT expired" or "Invalid API key"

**Cause**: Wrong or expired keys  
**Fix**: Regenerate keys from Supabase dashboard

---

## ?뱢 Next Steps

After Supabase is set up:

1. ??Sync Kakao users to `users` table
2. ??Migrate localStorage to Supabase
3. ??Integrate Jelly purchases with database
4. ??Build API endpoints

See [phase10_implementation_plan.md](../active-dispatch.md) for details.

## 가이드 업데이트

- 카카오/MCP 동작별 에러 대응: provider_error 케이스와 사용자 가이드 문구 매칭
