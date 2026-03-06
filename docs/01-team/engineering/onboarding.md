# Developer Onboarding - Secret Saju

**Welcome! Let's get you productive in 3 days** 🚀

---

## 📋 Pre-Onboarding Checklist

Before Day 1, make sure you have:

- [ ] GitHub account with repo access
- [ ] Slack workspace invitation
- [ ] Company email account
- [ ] Development machine setup (Mac/Windows/Linux)

## 🧪 Wave 20 신입 검증 체크리스트 (2026-03-02)

- [ ] `/onboarding`
  - 로그인/로그아웃 플로우를 한 번씩 실행해 사용자 상태 전파를 확인한다.
- [ ] `/mypage`
  - 미로그인/로그인 UI 분기를 확인하고, 프로필 배지 표시를 점검한다.
- [ ] `/payment/success`, `/payment/fail`
  - 실패/성공 진입 시 상태 메시지와 보조 CTA(충전/홈/복귀)가 표시되는지 확인한다.
- [ ] `/admin` 경로 제외 규칙
  - 푸터/네비게이션 노출 조건이 일관되게 동작하는지 확인한다.

---

## 🎯 Day 1: Setup & Orientation

### Morning: Environment Setup (3-4 hours)

#### 1. Clone Repository
```bash
git clone https://github.com/secret-paws/SecretSaju.git
cd SecretSaju
```

#### 2. Install Dependencies
```bash
# Node.js 18+ required
npm install
```

#### 3. Environment Variables
Follow the **[QUICK_START.md](../../archive/QUICK_START.md)** guide:

**Required for Development**:
- `NEXT_PUBLIC_KAKAO_JS_KEY` - Kakao JavaScript Key
- `KAKAO_REST_API_KEY` - Kakao REST API Key  
- `KAKAO_CLIENT_SECRET` - Kakao Client Secret
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase Anon Key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase Service Role Key

**Optional** (for full features):
- `NEXT_PUBLIC_TOSS_CLIENT_KEY` - Toss Payments Client Key
- `TOSS_SECRET_KEY` - Toss Payments Secret Key

#### 4. Run Development Server
```bash
npm run dev:safe -- --port 3000 --auto-port
```

**Expected Output**:
```
✓ Ready on http://localhost:3000
✓ Kakao Login: ✅
✓ Database: ✅
```

#### 5. Verify Build
```bash
npm run build
```

Should complete without errors.

### Afternoon: Explore Codebase

#### Read These Documents (in order):
1. [Project README](../../../README.md) - Overview
2. [Architecture Overview](../../02-technical/architecture/overview.md) - System design
3. [API Documentation](../../02-technical/api/README.md) - API structure
4. [Coding Standards](./coding-standards.md) - Code conventions

Documentation priority:
- Source-of-Truth for deployment: `./deployment-guide.md`
- Source-of-Truth for testing: `./testing-guide.md`
- For detailed checklists or command tips, use `docs/guides/deployment.md`
- If details and SOT differ, follow SOT first; for drift, check `Last Updated` and `Next Review`.

#### Key Files to Understand:
```
src/
├── core/api/saju-engine.ts       # 🔥 Core calculation engine
├── app/page.tsx                  # Main landing page
├── app/api/saju/calculate/       # Saju calculation API
├── components/SecretPawsFlow.tsx # Main user flow
└── lib/
    ├── kakao-auth.ts             # Authentication
    ├── jelly-wallet.ts           # Payment system
    └── errors.ts                 # Error handling
```

---

## 🎯 Day 2: First Contribution

### Morning: Understand the Flow

#### 1. User Journey Walkthrough
1. Open `http://localhost:3000`
2. Enter birthdate (1990-01-01), time (12:00), gender (M)
3. Click "사주 보기"
4. Observe the calculation flow
5. Try Kakao login at `/mypage`

#### 2. Code Flow Tracing
Follow this path in your editor:
```
User Input (BirthInputForm.tsx)
  → POST /api/saju/calculate (route.ts)
  → calculateHighPrecisionSaju() (saju-engine.ts)
  → Return FourPillars + analysis
  → Display in ResultCard.tsx
```

### Afternoon: Make Your First PR

#### 1. Pick a "Good First Issue"
Check GitHub Issues tagged with `good-first-issue`:
- Documentation updates
- UI tweaks
- Simple bug fixes

#### 2. Create a Branch
```bash
git checkout -b feat/your-name/issue-description
```

#### 3. Make Changes
Follow [Coding Standards](./coding-standards.md):
- Use TypeScript strict mode
- Add types for all functions
- Write descriptive commit messages
- Run `npm run lint` before committing

#### 4. Submit PR
```bash
git add .
git commit -m "feat: add user profile avatar support"
git push origin feat/your-name/issue-description
```

Create PR on GitHub with:
- **Title**: Clear, concise description
- **Description**: What changed and why
- **Screenshots**: If UI change
- **Checklist**: Tests pass, lint clean

---

## 🎯 Day 3: Deep Dive

### Morning: Choose Your Focus Area

Pick ONE area to specialize in:

#### Option A: Frontend (React/Next.js)
- **Focus**: UI components, user experience
- **Key Files**: `src/components/`, `src/app/*/page.tsx`
- **Learn**: [Design System](../product/design-system.md)

#### Option B: Backend (API/Database)
- **Focus**: API routes, database operations
- **Key Files**: `src/app/api/`, `src/lib/supabase.ts`
- **Learn**: [API Design](../../02-technical/api/design.md)

#### Option C: Core Engine (Algorithms)
- **Focus**: Saju calculation logic
- **Key Files**: `src/core/`, especially `saju-engine.ts`
- **Learn**: [Core Engine Documentation](../../02-technical/core-engine/algorithm-overview.md)

### Afternoon: Pair Programming

Schedule a 2-hour session with a senior engineer:
- Show your chosen focus area
- Ask questions
- Work on a real feature together

---

## 📚 Essential Reading

### Must-Read (Week 1)
- [ ] [README.md](../../../README.md)
- [ ] [MASTER_PRD.md](../../MASTER_PRD.md)
- [ ] [Architecture Overview](../../02-technical/architecture/overview.md)
- [ ] [Coding Standards](./coding-standards.md)
- [ ] [Git Workflow](./git-workflow.md)

### Should-Read (Week 2)
- [ ] [Design System](../product/design-system.md)
- [ ] [Testing Guide](./testing-guide.md)
- [ ] [Deployment Guide](./deployment-guide.md)
- [ ] [Troubleshooting Scenarios](../qa/test-scenarios.md)

### Nice-to-Read (Month 1)
- [ ] [Saju Layers](../../SAJU_LAYERS.md)
- [ ] [Business Model](../../03-business/strategy/business-model.md)
- [ ] [Product Roadmap](../../00-overview/roadmap.md)

---

## 🛠️ Tools & Resources

### Development Tools
- **IDE**: VS Code (recommended) with extensions:
  - ESLint
  - Prettier
  - TypeScript
  - Tailwind CSS IntelliSense
- **API Testing**: Postman or Thunder Client
- **Database**: Supabase Studio (web UI)

### Communication
- **Slack Channels**:
  - `#dev-frontend` - Frontend discussions
  - `#dev-backend` - Backend discussions
  - `#dev-support` - Ask for help
  - `#general` - Team updates
- **Meetings**:
  - Daily Standup: 10am (15 min)
  - Sprint Planning: Monday 2pm
  - Retro: Friday 4pm

### Documentation
- **Wiki**: This documentation site
- **Notion**: Product specs and meeting notes
- **GitHub**: Issues, PRs, project boards

When multiple docs describe the same process, use the SOT rule in each domain guide:
- Deployment: `./deployment-guide.md`
- Testing: `./testing-guide.md`

---

## 🎓 Learning Resources

### Next.js 14
- [Official Docs](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Type Challenges](https://github.com/type-challenges/type-challenges)

### Saju & Myeongni (Traditional Astrology)
- [Wikipedia: Saju](https://en.wikipedia.org/wiki/Four_Pillars_of_Destiny)
- [Korean Astrology Basics](https://www.youtube.com/watch?v=...)
- Internal: [Saju Layers](../../SAJU_LAYERS.md)

---

## ✅ Week 1 Checklist

- [ ] **Day 1**: Dev environment working, codebase explored
- [ ] **Day 2**: First PR submitted and reviewed
- [ ] **Day 3**: Chosen focus area, paired with senior dev
- [ ] **Day 4-5**: Working on real feature/bug fix
- [ ] **End of Week**: Team intro presentation (5 min)

---

## 🆘 Getting Help

### Stuck on Something?

**Try This Order**:
1. **Search Docs**: Check this wiki first
2. **Ask Slack**: `#dev-support` channel
3. **Pair Up**: Book 30min with a teammate
4. **Escalate**: Tag team lead if urgent

### Common Questions

**Q: Where do I find API credentials?**  
A: Ask your team lead for the `.env.local` file or see [SECURITY.md](../../archive/SECURITY.md)

**Q: How do I run tests?**  
A: `npm run test` (see [Testing Guide](./testing-guide.md))

**Q: My build is failing, what now?**  
A: Check [Troubleshooting Scenarios](../qa/test-scenarios.md)

**Q: Who reviews my PRs?**  
A: Auto-assigned, or tag `@frontend-team` or `@backend-team`

---

## 🎉 Welcome to the Team!

You're now part of building the future of premium saju services. Remember:

- **Ask questions** - No such thing as a dumb question
- **Share knowledge** - Update docs when you learn something
- **Have fun** - We're building something cool!

**Next**: Schedule your Week 2 1-on-1 with your manager

---

**Document Owner**: Engineering Team Lead  
**Last Updated**: 2026-01-31  
**Feedback**: Open a PR or message #dev-support




## Pipeline Start Checklist (Wave 21)
- Confirm `deploy:local` passes before first PR
- Confirm env validation (`npm run verify:env`) when touching auth/payment
- Run smoke on `/payment/success`, `/payment/fail`, `/auth/callback`
- Update `docs/active-dispatch.md` after each task batch
