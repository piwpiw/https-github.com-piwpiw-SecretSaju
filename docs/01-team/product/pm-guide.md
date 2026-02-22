# PM/PO Guide - Secret Saju

**Product Management Handbook**

---

## 🎯 Product Vision

**"사회적 가면 뒤에 숨겨진 본능을 밈과 데이터로 폭로한다"**

Build the **most accurate and delightful** saju platform that combines:
- Enterprise-grade precision (like offline masters)
- Consumer-grade simplicity (like social apps)
- Viral mechanics (like games)

---

## 📊 Product Strategy

### Target Audience

| Segment | Age | Motivation | Conversion |
|---------|-----|------------|------------|
| **Curious Teens** | 15-19 | Fun, sharing | Low (5%) |
| **Young Adults** | 20-34 | Self-discovery, relationships | **High (20%)** |
| **Midlife Seekers** | 35-49 | Career, family decisions | Medium (12%) |
| **Traditional** | 50+ | Deep analysis, trust | Low (8%) |

**Primary Focus**: 20-34 (highest LTV + viral potential)

### User Personas

#### Persona 1: "밈 Lover Min-ji" (23, Office Worker)
- **Goals**: Fun content to share on Kakao/Insta
- **Pain**: Boring traditional saju sites
- **Solution**: Meme-style results + shareability
- **Willingness to Pay**: Low → social unlock works

#### Persona 2: "실용주의 Seo-jun" (29, Startup PM)
- **Goals**: Real insights for career/relationship decisions
- **Pain**: Inconsistent accuracy across apps
- **Solution**: Enterprise-grade precision + data-driven
- **Willingness to Pay**: High (values quality)

#### Persona 3: "궁합 Curious Ha-na" (26, Designer)
- **Goals**: Check compatibility with boyfriend
- **Pain**: Can't trust free apps
- **Solution**: Scientific calculation + beautiful UX
- **Willingness to Pay**: Medium (pays for important decisions)

---

## 🗺️ Product Roadmap (2026)

### ✅ Q1: Launch MVP (Current)

**Goal**: 10K MAU, validate product-market fit

**Features**:
- ✅ High-precision saju calculation
- ✅ Profile management (save multiple people)
- ✅ Compatibility analysis
- ✅ Jelly economic system
- 🚧 Real payment (Toss)
- 🚧 Daily fortune

**Success Metrics**:
- D7 Retention: > 30%
- Conversion Rate: > 10%
- Viral Coefficient: > 0.5

---

### Q2: Viral Growth

**Goal**: 50K MAU through social features

**Features**:
- [ ] Share-to-unlock mechanics
- [ ] Referral system (give 1 jelly, get 1 jelly)
- [ ] Celebrity matching (viral potential)
- [ ] Kakao/Insta story templates

**Success Metrics**:
- Viral Coefficient: > 1.2
- Share Rate: > 30%
- CAC: < $3 (via organic/viral)

---

### Q3: AI Personalization

**Goal**: 100K MAU, increase ARPU

**Features**:
- [ ] GPT-4 powered fortune telling
- [ ] Personalized recommendations (food, career, dating)
- [ ] Daily AI-written horoscopes
- [ ] Smart notifications (auspicious days)

**Success Metrics**:
- ARPU: $3 → $5/month
- Retention (D30): 40% → 60%
- NPS: > 50

---

### Q4: Platform Expansion

**Goal**: 200K MAU, B2B revenue

**Features**:
- [ ] Public API (for partners)
- [ ] Mobile app (React Native)
- [ ] B2B dashboard (wellness brands)
- [ ] International (English/Japanese)

**Success Metrics**:
- MAU: 200K
- B2B ARR: $100K
- App Store rating: > 4.5

---

## 📋 Feature Prioritization Framework

### RICE Scoring

```
Score = (Reach × Impact × Confidence) / Effort

Reach: # users affected per quarter
Impact: 0.25 (minimal) → 3 (massive)
Confidence: 0% → 100%
Effort: Person-weeks
```

### Example Features (Q2)

| Feature | Reach | Impact | Confidence | Effort | **SCORE** |
|---------|-------|--------|------------|--------|-----------|
| Referral system | 10K | 3 | 80% | 2 | **120** |
| Celebrity match | 30K | 2 | 90% | 1 | **540** ✅ |
| AI horoscope | 5K | 1 | 50% | 4 | **6** |
| Dark mode | 50K | 0.5 | 100% | 1 | **250** |

**Decision**: Prioritize Celebrity Match → Referral → Dark mode

---

## 📊 Key Product Metrics

### North Star Metric: **Active Paying Users (APU)**

**Why**: Balances growth + monetization

### Supporting Metrics

```
Acquisition
├─ MAU
├─ Sign-ups
└─ CAC

Activation
├─ First saju completed
├─ Profile saved
└─ Time to value (< 3 min)

Retention
├─ D7, D30 Retention
├─ WAU/MAU ratio
└─ Churn rate

Revenue
├─ ARPU
├─ Conversion rate
├─ LTV
└─ Payback period

Referral
├─ Viral coefficient
├─ Share rate
└─ K-factor
```

### Targets (End of 2026)

| Metric | Q1 | Q2 | Q3 | Q4 |
|--------|----|----|----|----|
| MAU | 10K | 50K | 100K | 200K |
| APU | 1.5K | 7.5K | 15K | 30K |
| Conversion | 15% | 15% | 15% | 15% |
| ARPU | $3 | $3.5 | $4.5 | $5 |
| D30 Retention | 35% | 45% | 55% | 60% |

---

## 🎨 Product Principles

### 1. **Accuracy First**
Never compromise calculation precision for speed or simplicity.

**Example**: We show "calculating..." for 2 seconds rather than instant but wrong results.

### 2. **Progressive Disclosure**
Don't overwhelm users. Reveal complexity gradually.

```
Step 1: Input (birthdate only)
  ↓
Step 2: Basic saju (4 pillars)
  ↓  
Step 3: Share to unlock full analysis
  ↓
Step 4: Pay for advanced features
```

### 3. **Meme-Worthy UX**
Every screen should be shareable and generate stories.

**Example**: Instead of "Your element is Wood," say "You're a 🌲 Forest Guardian (목 element)"

### 4. **Freemium Done Right**
Free tier must provide real value. Paid tier must feel premium.

**Free**:
- Basic saju (enough to be useful)
- 1 compatibility check

**Paid**:
- Detailed analysis
- Unlimited profiles
- Celebrity matching
- AI insights

### 5. **Trust Through Transparency**
Show the calculation process, not just results.

**Example**: Display the 60-Ganji code, lunar conversion, true solar time adjustment.

---

## 📝 PRD Template

**Every feature needs a PRD**. Use this template:

```markdown
# [Feature Name] PRD

## Problem
[What user problem are we solving?]

## Solution
[How will this feature solve it?]

## User Stories
- As a [persona], I want to [action] so that [benefit]

## Success Metrics
- Metric 1: Target
- Metric 2: Target

## Design Mocks
[Link to Figma]

## Technical Considerations
[API changes, DB schema, etc.]

## Launch Plan
- Beta: [date]
- Full launch: [date]

## Rollback Plan
[If something goes wrong...]
```

**Location**: `docs/03-business/product-management/prd/`

---

## 🚀 Launch Process

### 1. **Internal Alpha** (1 week)
- Ship to team
- Collect feedback
- Fix critical bugs

### 2. **Beta** (2 weeks)
- Ship to 100-500 users
- Monitor metrics
- A/B test if applicable

### 3. **Full Launch**
- Ship to all users
- Monitor for 48 hours
- Announce on socials

### 4. **Post-Launch Review** (1 week later)
- Did we hit success metrics?
- What went well/wrong?
- What's next?

---

## 🎯 A/B Testing Guide

### When to A/B Test
- ✅ Pricing changes
- ✅ Onboarding flow
- ✅ Feature placement
- ❌ Small UI tweaks (just ship)

### Example Test: Pricing

**Hypothesis**: Lowering TRIAL price from 990원 to 499원 will increase conversion by 5%

**Variants**:
- A: 990원 (control)
- B: 499원 (test)

**Sample Size**: 1,000 users per variant  
**Duration**: 1 week  
**Success Metric**: Conversion rate

**Decision Rule**: If B is 5%+ better with 95% confidence, ship B.

---

## 📞 Stakeholder Management

### Weekly Sync (Every Monday 10am)

**Attendees**: CEO, CTO, PM, Designer

**Agenda**:
1. Last week recap (5 min)
2. Metrics review (10 min)
3. This week priorities (10 min)
4. Blockers (5 min)

### Monthly Business Review

**Attendees**: All team + advisors

**Agenda**:
1. Product metrics deep dive
2. User feedback highlights
3. Roadmap updates
4. Tech debt review

---

## 🗣️ User Research

### Methods

1. **User Interviews** (Monthly)
   - 5-10 users
   - 30-min video calls
   - Questions: What do you love? What frustrates you?

2. **Surveys** (Quarterly)
   - In-app NPS survey
   - Feature request voting
   - Satisfaction scores

3. **Analytics** (Daily)
   - Google Analytics (page views, funnels)
   - Hotjar (heatmaps, session recordings)
   - Supabase (custom events)

4. **Support Tickets** (Ongoing)
   - Tag by theme (bug, feature request, confusion)
   - Monthly review

---

## 📊 Competitive Analysis

### Direct Competitors

| Product | Strength | Weakness | Our Advantage |
|---------|----------|----------|---------------|
| **Sajupal** | Large user base | Low accuracy | Better algorithm |
| **MannaeSaju** | Good algorithm | Old UI | Modern UX |
| **Offline Masters** | Trust | Not scalable | Digital + accurate |

### Indirect Competitors (Attention)

- Co-Star (Western astrology)
- Tarot apps
- MBTI/personality tests

**Our Differentiation**: Only platform with enterprise-grade Korean astrology + modern UX.

---

## 💡 Product Hypotheses to Test

### Q2 2026

1. **Hypothesis**: Adding celebrity matching will increase share rate by 20%
   - **Test**: Launch feature, measure social shares
   - **Success**: Share rate 15% → 18%+

2. **Hypothesis**: Referral bonuses will reduce CAC by 30%
   - **Test**: Give 1 jelly for each referral
   - **Success**: CAC $5 → $3.5

3. **Hypothesis**: Dark mode will increase retention by 5%
   - **Test**: Ship dark mode, measure D30 retention
   - **Success**: Retention 35% → 37%+

---

## 🎓 PM Skills & Resources

### Required PM Skills
- [ ] Data analysis (SQL, Excel)
- [ ] User research (interviews, surveys)
- [ ] Wireframing (Figma basics)
- [ ] Roadmap planning
- [ ] Stakeholder communication

### Recommended Reading
- **Books**:
  - "Inspired" by Marty Cagan
  - "Hooked" by Nir Eyal
  - "The Lean Startup" by Eric Ries
- **Blogs**:
  - Lenny's Newsletter
  - Product Coalition
  - Mind the Product

---

## 📞 PM Office Hours

**When**: Wednesday 3-4pm  
**Where**: Zoom or office  
**Topics**: Feature ideas, user feedback, roadmap questions

---

## ✅ PM Weekly Checklist

**Every Monday**:
- [ ] Review weekend metrics
- [ ] Prepare for weekly sync
- [ ] Update roadmap status

**Every Wednesday**:
- [ ] Check user feedback/tickets
- [ ] 1-on-1 with designer
- [ ] 1-on-1 with eng lead

**Every Friday**:
- [ ] Write week review (what shipped, what learned)
- [ ] Plan next week priorities
- [ ] Update stakeholders

---

**Document Owner**: PM/PO  
**Last Updated**: 2026-01-31  
**Next Review**: 2026-04-30
