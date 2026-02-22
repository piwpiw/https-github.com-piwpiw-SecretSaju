# Glossary - Secret Saju Terms

**Complete terminology guide for all team members**

---

## 🎯 Product & Business Terms

### Jelly (젤리)
In-app currency used to unlock premium features. Users purchase jelly packages (990원/2,900원/9,900원) and spend them on detailed saju reports, compatibility analysis, etc.

### DACRE
**D**iscover → **A**nalyze → **C**onnect → **R**ecommend → **E**volve    
The core user journey framework for Secret Saju.

### Freemium Model
Business model where basic saju calculation is free, but advanced features require jelly (payment).

### MAU (Monthly Active Users)
Number of unique users who visit the app at least once in a 30-day period.

### ARPU (Average Revenue Per User)
Total revenue divided by total users. We track ARPU separately for all users and paying users only.

---

## 🔮 명리학 (Myeongni / Saju) Terms

### 사주팔자 (Saju Palja / Four Pillars of Destiny)
Traditional Korean fortune-telling system based on birth year, month, day, and hour. Each "pillar" consists of a Heavenly Stem (천간) and Earthly Branch (지지).

### 60갑자 (60 Ganji / Sexagenary Cycle)
The 60 combinations of 10 Heavenly Stems and 12 Earthly Branches. Cycles every 60 years.  
Example: 갑자 (甲子), 을축 (乙丑), 병인 (丙寅)...

### 천간 (Cheongan / Heavenly Stems)
The 10 stems: 갑(甲), 을(乙), 병(丙), 정(丁), 무(戊), 기(己), 경(庚), 신(辛), 임(壬), 계(癸)

### 지지 (Jiji / Earthly Branches)
The 12 branches (zodiac): 자(子), 축(丑), 인(寅), 묘(卯), 진(辰), 사(巳), 오(午), 미(未), 신(申), 유(酉), 술(戌), 해(亥)

### 오행 (Ohaeng / Five Elements)
목(木 Wood), 화(火 Fire), 토(土 Earth), 금(金 Metal), 수(水 Water)

### 십성 (Sipsong / Ten Gods)
Relationship analysis based on element interactions:
- 비견 (Bgyeon): Shoulder-to-shoulder (same element, same polarity)
- 겁재 (Geopjae): Robbing wealth (same element, opposite polarity)
- 식신 (Siksin): Eating god
- 상관 (Sanggwan): Hurting officer
- 편재 (Pyeonjae): Indirect wealth
- 정재 (Jeongjae): Direct wealth
- 편관 (Pyeongwan): Indirect officer
- 정관 (Jeonggwan): Direct officer
- 편인 (Pyeonin): Indirect resource
- 정인 (Jeongin): Direct resource

### 신살 (Sinsal / Special Stars)
Special indicators of abilities or characteristics in a saju chart. Examples: 천을귀인 (heavenly noble), 도화살 (peach blossom star).

### 십이운성 (Sibiwoonseong / Twelve Life Stages)
12 stages of energy cycle: 장생 (embryo), 목욕 (bathing), 관대 (crown belt), etc.

### 격국 (Gyeokguk / Formations)
Saju patterns/structures that determine overall chart quality. Examples: 종격 (following formation), 화격 (transformation formation).

### 대운 (Daewun / Major Luck Periods)
10-year cycles of fortune that change throughout life. Calculated from the month pillar.

### 세운 (Saewun / Annual Luck)
Yearly fortune cycle. Each year has a different 60-Ganji code.

### 진태양시 (True Solar Time)
Adjustment of clock time based on longitude to accurately determine hour pillar. Korea Standard Time (KST) is based on 135°E, so locations west/east need correction.

### 음력 (Lunar Calendar)
Traditional calendar based on moon cycles. Many Koreans still记录 birthdays in lunar dates.

### 절기 (Jeolgi / Solar Terms)
24 divisions of the solar year. Important for determining month pillar (e.g., 입춘 Ipchun marks the start of the lunar new year in saju).

---

## 💻 Technical Terms

### App Router
Next.js 13+ routing system using the `/app` directory. Server Components by default.

### Server Component
React component that renders on the server. Cannot use hooks like `useState`.

### Client Component
React component marked with `'use client'` that runs in the browser. Can use hooks.

### Server Action
Server-side function callable from client components. Used for form submissions.

### MDX
Markdown + JSX. Allows React components inside Markdown files.

### RLS (Row Level Security)
Supabase feature that enforces data access rules at the database level. Users can only access their own data.

### Edge Function
Serverless function running on edge nodes (close to users) for lower latency.

### SSR (Server-Side Rendering)
Rendering HTML on the server before sending to client. Better SEO and initial load.

### SSG (Static Site Generation)
Pre-rendering pages at build time. Fastest option but not dynamic.

### ISR (Incremental Static Regeneration)
Revalidate static pages periodically without full rebuild.

---

## 🎨 Design Terms

### Mystic Theme
Dark purple theme with mystical/spiritual vibes. Default for serious saju seekers.

### Minimal Theme
Clean white theme with simple typography. For users who prefer modern, simple aesthetics.

### Cyber Theme
Neon/futuristic theme with high contrast. For trendy/millennial users.

### Glassmorphism
Design style with frosted glass effect (`backdrop-blur`). Used in result cards.

### Micro-interactions
Small animations that provide feedback (hover effects, button clicks).

---

## 📊 Analytics Terms

### Conversion Rate
Percentage of visitors who become paying users. Target: 10-15%.

### Retention (D7, D30)
Percentage of users who return after 7 or 30 days. Target: 40% D30.

### CAC (Customer Acquisition Cost)
Average cost to acquire one user through marketing. Target: < $5.

### LTV (Lifetime Value)
Total revenue expected from one user over their lifetime. Target: $30-50.

### Churn Rate
Percentage of users who stop using the app. Lower is better.

---

## 🏢 Team & Process Terms

### Standup
Daily 15-minute meeting where each person shares: what they did yesterday, what they're doing today, and any blockers.

### Sprint
2-week development cycle. Ends with a demo and retrospective.

### PR (Pull Request)
Proposal to merge code changes. Requires review before merging.

### Good First Issue
GitHub issue tagged for new contributors. Usually simple bugs or documentation updates.

### Backlog
List of features/bugs not yet prioritized for a sprint.

### Story Points
Relative measure of effort (1, 2, 3, 5, 8). Used for sprint planning.

---

## 🔐 Security Terms

### OAuth
Open standard for authorization. Used for Kakao Login.

### JWT (JSON Web Token)
Secure way to transmit user identity between client and server.

### CSRF (Cross-Site Request Forgery)
Attack where unauthorized commands are transmitted from a user's browser. Mitigated by Next.js automatically.

### RLS (Row Level Security)
See Technical Terms above.

---

## 💰 Financial Terms

### MRR (Monthly Recurring Revenue)
Predictable revenue earned every month from subscriptions/jellies.

### ARR (Annual Recurring Revenue)
MRR × 12. Used for valuation (ARR × 10-20x = company value).

### Burn Rate
Monthly cash spending. With $500K funding and $40K/month burn, we have 12.5 months runway.

### Runway
Months until company runs out of cash. Calculated as: Cash ÷ Burn Rate.

### EBITDA
Earnings Before Interest, Taxes, Depreciation, and Amortization. Measure of profitability.

### Valuation
Company's estimated worth. Pre-money valuation = before investment. Post-money = after.

---

## 🌍 External Terms

### IR (Investor Relations)
Communication with current and potential investors. Includes pitch decks, financial reports.

### B2B (Business-to-Business)
Selling to other companies (e.g., white-label API to wellness brands).

### B2C (Business-to-Consumer)
Selling directly to end users (our primary model).

### TAM / SAM / SOM
- **TAM** (Total Addressable Market): Total market size ($1.4B)
- **SAM** (Serviceable Addressable Market): Market we can reach ($120M)
- **SOM** (Serviceable Obtainable Market): Market we'll actually capture in Year 1 ($540K)

---

## 📱 Platform Terms

### PWA (Progressive Web App)
Web app that can be installed on mobile home screen. Works offline.

### WebView
Component that displays web content inside a native mobile app.

### Responsive Design
UI that adapts to different screen sizes (mobile, tablet, desktop).

---

**Last Updated**: 2026-01-31  
**Maintained by**: Product Team  
**Suggestions**: Open a PR or message #product
