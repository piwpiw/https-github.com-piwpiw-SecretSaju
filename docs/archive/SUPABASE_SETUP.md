# Supabase Setup Guide

## 🚀 Quick Start

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

1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)

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

## 📊 Database Schema Overview

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
users (1) ─── (1) jelly_wallets
  │
  ├─── (N) jelly_transactions
  ├─── (N) saju_profiles
  ├─── (N) unlocks
  └─── (N) inquiries
```

---

## 🔒 Row Level Security (RLS)

All tables have RLS enabled. Users can only:

- **View** their own data
- **Insert** their own data (profiles, inquiries)
- **Update** their own data
- **Delete** their own data

**Wallet & Transaction** operations require **service role** (API routes only) to prevent client-side manipulation.

---

## 🧪 Testing

### 1. Test Database Connection

Create a test file: `scripts/test-supabase.ts`

```typescript
import { getSupabaseClient } from '@/lib/supabase';

async function testConnection() {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    console.error('❌ Supabase not configured');
    return;
  }

  const { data, error } = await supabase
    .from('users')
    .select('count');

  if (error) {
    console.error('❌ Connection failed:', error);
  } else {
    console.log('✅ Supabase connected!', data);
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

## 🚨 Troubleshooting

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

## 📈 Next Steps

After Supabase is set up:

1. ✅ Sync Kakao users to `users` table
2. ✅ Migrate localStorage to Supabase
3. ✅ Integrate Jelly purchases with database
4. ✅ Build API endpoints

See [phase10_implementation_plan.md](../active-dispatch.md) for details.

