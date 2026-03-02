# Tech Stack - Secret Saju

**Complete Technology Stack Overview**

---

## 🎯 Stack at a Glance

```
Frontend (Client)
├── Next.js 14 (React 18, App Router)
├── TypeScript 5
├── TailwindCSS + Shadcn/ui
└── Framer Motion

Backend (Server + DB)
├── Next.js API Routes (Serverless)
├── Supabase (PostgreSQL + Auth + Storage)
└── Vercel Edge Functions

Core Engine (Custom)
├── Astronomy Module (True Solar Time)
├── Calendar Module (60-Ganji, Lunar/Solar)
└── Myeongni Logic (Elements, Sipsong, Sinsal)

Integrations
├── Kakao Login (Social Auth)
├── Toss Payments (Payment Gateway)
└── Google Analytics (Tracking)
```

---

## 🎨 Frontend Stack

### Framework: **Next.js 14**
- **Why**: Industry-standard React framework with built-in SSR, routing, and optimization
- **Key Features**:
  - App Router (file-based routing)
  - Server Components (performance)
  - Server Actions (form handling)
  - Image Optimization

**Docs**: https://nextjs.org/docs

### Language: **TypeScript 5**
- **Why**: Type safety, better DX, fewer runtime errors
- **Configuration**: Strict mode enabled
- **Usage**: 100% of codebase is TypeScript

**Docs**: https://www.typescriptlang.org

### Styling: **TailwindCSS 3 + Shadcn/ui**
- **TailwindCSS**: Utility-first CSS framework
- **Shadcn/ui**: Unstyled, accessible component library
- **Custom Design System**: 3 themes (Mystic, Minimal, Cyber)

**Docs**:
- https://tailwindcss.com
- https://ui.shadcn.com

### Animation: **Framer Motion**
- **Why**: Declarative animations, spring physics
- **Usage**: Page transitions, micro-interactions
- **Example**: `SecretPawsFlow.tsx` fade-in animations

**Docs**: https://www.framer.com/motion

### State Management
- **React State**: `useState`, `useContext` for local state
- **Zustand** (Future): Global state management
- **No Redux**: Over-engineering for current scale

---

## 🔧 Backend Stack

### API Layer: **Next.js API Routes**
- **Architecture**: Serverless functions
- **Location**: `src/app/api/**/route.ts`
- **Deployment**: Vercel Edge Network

**Key Endpoints**:
```
/api/saju/calculate    # Saju calculation
/api/saju/create       # Save profile
/api/saju/list         # Get user profiles
/api/auth/kakao/*      # OAuth flow
/api/payment/verify    # Payment verification
/api/wallet/balance    # Jelly balance
```

### Database: **Supabase (PostgreSQL 15)**
- **Why**: Managed Postgres + Auth + Storage in one
- **Features**:
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Automatic API generation

**Schema**:
```sql
users           # Kakao user accounts
saju_profiles   # User's saved saju profiles
jelly_wallets   # User jelly balance
jelly_transactions # Transaction history
unlocks         # Feature unlock tracking
inquiries       # Customer inquiries
```

**Docs**: https://supabase.com/docs

### Authentication: **Kakao Login + Supabase Auth**
- **Flow**: Kakao OAuth 2.0 → Supabase JWT
- **Session**: HTTP-only cookies
- **Expiry**: 7 days (configurable)

**Implementation**: `src/lib/kakao-auth.ts`

---

## 🧮 Core Engine (Custom)

### Astronomy Module
- **Purpose**: Calculate true solar time, solar terms
- **Language**: TypeScript
- **Accuracy**: ±1 minute precision
- **Location**: `src/core/astronomy/`

**Key Functions**:
```typescript
getTrueSolarTime(date, location) // Adjust for longitude
getSolarTerm(date)                // Get 24 solar terms
isSummerTime(date)                // Korea 1948-1988
```

### Calendar Module
- **Purpose**: 60-Ganji calculation, lunar/solar conversion
- **Algorithm**: Sexagenary cycle (갑자, 을축, 병인...)
- **Location**: `src/core/calendar/`

**Key Functions**:
```typescript
get60Ganji(date)           // Year/Month/Day/Hour pillars
lunarToSolar(lunar)        // Lunar → Solar
solarToLunar(solar)        // Solar → Lunar
```

### Myeongni Logic (명리학)
- **Purpose**: Saju analysis (elements, relationships, fortune)
- **Layers**:
  1. **Five Elements** (오행): Wood, Fire, Earth, Metal, Water
  2. **Ten Gods** (십성): Relationships (비견, 겁재, etc.)
  3. **Special Stars** (신살): Unique abilities
  4. **Formations** (격국): Saju patterns
  5. **Luck Periods** (대운/세운): 10-year cycles

**Location**: `src/core/myeongni/`

**Core API**: `SajuEngine.calculate(input)`

---

## 🔗 External Integrations

### Kakao Developers
- **Service**: Social Login
- **APIs Used**:
  - JavaScript SDK (for login button)
  - REST API (for token exchange)
  - OAuth 2.0 (for authentication)

**Keys Needed**:
- `NEXT_PUBLIC_KAKAO_JS_KEY`
- `KAKAO_REST_API_KEY`
- `KAKAO_CLIENT_SECRET`

**Docs**: https://developers.kakao.com

### Toss Payments
- **Service**: Payment Gateway
- **Integration**: Widget SDK + REST API
- **Pricing**: 3.3% transaction fee

**Keys Needed**:
- `NEXT_PUBLIC_TOSS_CLIENT_KEY`
- `TOSS_SECRET_KEY`

**Docs**: https://docs.tosspayments.com

### Google Analytics 4
- **Service**: User analytics
- **Implementation**: `@next/third-parties/google`
- **Tracking**: Page views, events, conversions

**Key Needed**: `NEXT_PUBLIC_GA_ID`

---

## 🚀 Infrastructure & DevOps

### Hosting: **Vercel**
- **Why**: Best-in-class Next.js hosting, zero config
- **Features**:
  - Automatic HTTPS
  - Global CDN
  - Instant rollbacks
  - Preview deployments for PRs

**Deployment**: Auto-deploy from `main` branch

### CI/CD Pipeline
```
GitHub Push → Vercel Build → Type Check → Lint → Test → Deploy
```

**Branches**:
- `main`: Production (auto-deploy to secretsaju.com)
- `dev`: Staging (auto-deploy to dev.secretsaju.com)
- `feat/*`: Preview URLs (auto-generated)

### Operational SOT for this stack

- Deployment process SOT: `../01-team/engineering/deployment-guide.md`
- Testing process SOT: `../01-team/engineering/testing-guide.md`
- If details differ in other guides, follow SOT and check `Last Updated`/`Next Review` before applying.

### Performance Monitoring
- **Vercel Analytics**: Speed insights, Web Vitals
- **Google Analytics**: User behavior
- **Sentry** (Future): Error tracking

---

## 📦 Key Dependencies

### Production Dependencies
```json
{
  "next": "^14.2.18",
  "react": "^18.3.1",
  "typescript": "^5",
  "tailwindcss": "^3.4.17",
  "framer-motion": "^11.15.0",
  "@supabase/supabase-js": "^2.49.7",
  "@toss/payment-sdk": "^latest"
}
```

### Development Dependencies
```json
{
  "vitest": "^3.0.4",
  "@testing-library/react": "^16.1.0",
  "eslint": "^9",
  "prettier": "^3.4.2",
  "@types/node": "^20",
  "typescript-eslint": "^8.18.2"
}
```

**Full List**: [`package.json`](../../package.json)

---

## 🧪 Testing Stack

### Unit Testing: **Vitest**
- **Why**: Faster than Jest, native ESM support
- **Coverage**: `npm run test:coverage`

### Component Testing: **React Testing Library**
- **Philosophy**: Test user behavior, not implementation
- **Location**: `*. test.tsx` files

### E2E Testing: **Playwright** (Future)
- **Planned**: Critical user flows
- **Not Yet Implemented**

**Guide**: [Testing Guide](../01-team/engineering/testing-guide.md)

---

## 🔐 Security

### Environment Variables
- **Storage**: `.env.local` (gitignored)
- **Production**: Vercel Environment Variables UI
- **Validation**: Runtime checks in `src/config/env.ts`

### Authentication
- **Method**: Kakao OAuth 2.0 + Supabase JWT
- **Session**: HTTP-only cookies (SecureREMINDER: The team member "Secret Paws" has been assigned to maintain documentation and keep this tech stack up-to-date.; SameSite=Lax)
- **CSRF**: Built-in Next.js protection

### Data Security
- **Database**: Supabase RLS policies
- **API**: All endpoints require authentication
- **Secrets**: Never committed to Git

**Full Guide**: [Security Architecture](../02-technical/architecture/security-architecture.md)

---

## 📊 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| **First Contentful Paint** | < 1.5s | 1.2s ✅ |
| **Largest Contentful Paint** | < 2.5s | 2.1s ✅ |
| **Time to Interactive** | < 3.5s | 3.0s ✅ |
| **Cumulative Layout Shift** | < 0.1 | 0.05 ✅ |
| **First Input Delay** | < 100ms | 80ms ✅ |

**Lighthouse Score**: 95+ (Desktop), 90+ (Mobile)

---

## 🔄 Technology Decisions & Rationale

### Why Next.js over Create React App?
- ✅ SSR/SSG for better SEO
- ✅ Built-in API routes (no separate backend)
- ✅ Automatic code splitting
- ✅ Image optimization

### Why Supabase over Firebase?
- ✅ PostgreSQL (SQL > NoSQL for our use case)
- ✅ Open source (no vendor lock-in)
- ✅ Better pricing ($0 for < 500 MB)
- ✅ Row Level Security (RLS)

### Why TypeScript over JavaScript?
- ✅ Catch errors at compile time
- ✅ Better IDE autocomplete
- ✅ Self-documenting code
- ✅ Easier refactoring

### Why TailwindCSS over CSS Modules?
- ✅ Faster development (no context switching)
- ✅ Smaller bundle size (purged CSS)
- ✅ Consistent design system
- ✅ Mobile-first defaults

---

## 🚧 Future Considerations

### Scalability
- **Current**: Handles ~10K MAU
- **Target**: 100K MAU by Q4 2026
- **Plan**:
  - Vercel auto-scales (no action needed)
  - Supabase: Upgrade to Pro ($25/mo)
  - CDN: Cloudflare for static assets

### AI/ML Features (Phase 10+)
- **LLM Integration**: OpenAI GPT-4 for personalized content
- **Vector DB**: Pinecone for semantic search
- **Recommendation Engine**: TensorFlow.js

### Mobile App (2027)
- **Framework**: React Native or Flutter
- **Backend**: Same Next.js API
- **Deployment**: App Store + Google Play

---

## 📚 Related Documentation

- [Architecture Overview](../02-technical/architecture/overview.md)
- [API Documentation](../02-technical/api/README.md)
- [Database Schema](../02-technical/architecture/database-schema.md)
- [Deployment Guide](../01-team/engineering/deployment-guide.md)

---

**Document Owner**: CTO  
**Last Updated**: 2026-01-31  
**Next Review**: Quarterly (or when major dependency updates)


