# Supabase ?ㅼ젙 媛?대뱶

## 1. Supabase ?꾨줈?앺듃 ?뺤씤

?꾨줈?앺듃 URL: https://supabase.com/dashboard/project/jyrdihklwkbeypfxbiwp

## 2. ?섍꼍 蹂??媛?몄삤湲?

1. Supabase Dashboard ??Settings ??API
2. ?ㅼ쓬 媛믩뱾??蹂듭궗:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret**: `SUPABASE_SERVICE_ROLE_KEY`

## 3. 留덉씠洹몃젅?댁뀡 ?ㅽ뻾

### 諛⑸쾿 1: Supabase Dashboard (沅뚯옣 - 臾대즺)

1. Supabase Dashboard ??SQL Editor
2. ?ㅼ쓬 ?뚯씪?ㅼ쓣 ?쒖꽌?濡??ㅽ뻾:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_add_orders_table.sql`

### 諛⑸쾿 2: Supabase CLI

```bash
# Supabase CLI ?ㅼ튂
npm install -g supabase

# 濡쒓렇??
supabase login

# ?꾨줈?앺듃 ?곌껐
supabase link --project-ref jyrdihklwkbeypfxbiwp

# 留덉씠洹몃젅?댁뀡 ?ㅽ뻾
supabase db push
```

## 4. 臾대즺 ?뚮옖 理쒖쟻???ㅼ젙

### Row Level Security (RLS) ?쒖꽦???뺤씤
- 紐⑤뱺 ?뚯씠釉붿뿉 RLS媛 ?쒖꽦?붾릺???덈뒗吏 ?뺤씤
- `supabase/schema.sql`??RLS ?뺤콉???ы븿?섏뼱 ?덉쓬

### ?곗씠?곕쿋?댁뒪 ?몃뜳???뺤씤
- ?몃뜳?ㅺ? ?쒕?濡??앹꽦?섏뿀?붿? ?뺤씤
- 荑쇰━ ?깅뒫 理쒖쟻?붾줈 API ?몄텧 媛먯냼

### ?곌껐 ? ?ㅼ젙 (怨쇨툑 ?덇컧)
- Supabase Dashboard ??Settings ??Database
- Connection Pooling ?쒖꽦??
- Transaction 紐⑤뱶 ?ъ슜 (臾대즺 ?뚮옖 理쒖쟻??

## 5. API Rate Limiting ?ㅼ젙

Supabase Dashboard ??Settings ??API:
- Rate Limiting ?쒖꽦??
- 臾대즺 ?뚮옖: 500 requests/second

## 6. ?섍꼍 蹂???ㅼ젙

濡쒖뺄 媛쒕컻:
```bash
# .env.local ?뚯씪??異붽?
NEXT_PUBLIC_SUPABASE_URL=https://jyrdihklwkbeypfxbiwp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Render 諛고룷:
- Render Dashboard ??Settings ??Environment Variables
- ?꾩쓽 3媛?蹂??異붽?

## 7. ?뚯뒪??

```bash
# ?섍꼍 蹂??寃利?
npm run verify:env

# 濡쒖뺄?먯꽌 ?뚯뒪??
npm run dev
```

## 臾대즺 ?뚮옖 ?쒗븳?ы빆

- **Database**: 500MB ??κ났媛?
- **API Requests**: 500 requests/second
- **Bandwidth**: 5GB/month
- **Edge Functions**: 2M invocations/month

## 怨쇨툑 ?덇컧 ??

1. **罹먯떛 ?쒖슜**: API ?묐떟 罹먯떛?쇰줈 ?붿껌 ??媛먯냼
2. **?몃뜳??理쒖쟻??*: 荑쇰━ ?깅뒫 ?μ긽?쇰줈 泥섎━ ?쒓컙 媛먯냼
3. **Connection Pooling**: ?곌껐 ?ъ궗?⑹쑝濡?由ъ냼???덉빟
4. **RLS ?뺤콉 理쒖쟻??*: 遺덊븘?뷀븳 荑쇰━ 諛⑹?



