# Secret Saju (멍냥의 이중생활) - Project Overview

**프리미엄 사주 플랫폼 - Enterprise-Grade Fortune Telling Platform**

---

## 🎯 What is Secret Saju?

Secret Saju는 전통 사주명리학과 현대 기술을 결합한 **프리미엄 사주 플랫폼**입니다.

### Core Value Proposition
> "사회적 가면 뒤에 숨겨진 본능을 밈과 데이터로 폭로한다"

### Target Audience
- **10대**: 재미와 공유 중심
- **20-30대**: 현실적인 고민 해결 + 결제 의향
- **40대+**: 깊이 있는 분석과 신뢰성

---

## ✨ Key Features

### 1. 고정밀 사주 계산 (Enterprise-Grade)
- ✅ 60갑자 기반 정확한 계산
- ✅ 진태양시(True Solar Time) 보정
- ✅ 음력/양력 자동 변환
- ✅ 한국 Summer Time 보정 (1948-1988)

### 2. 다층 분석 시스템
| 계층 | 내용 | 상태 |
|------|------|------|
| **오행(五行)** | 목·화·토·금·수 균형 분석 | ✅ 구현 |
| **십성(十星)** | 관계 분석 (비견, 겁재, 식신 등) | ✅ 구현 |
| **신살(神煞)** | 특수 능력/운명 분석 | ✅ 구현 |
| **격국(格局)** | 사주 패턴 분류 | ✅ 구현 |
| **대운/세운** | 10년 주기 운세 + 연간 운세 | ✅ 구현 |

### 3. 소셜 기능
- 🤝 **궁합 분석**: 60×60 = 3,600가지 관계 매트릭스
- 🆚 **VS 모드**: 두 사람 사주 비교 (Radar Chart)
- 👥 **유명인 매칭**: 당신과 비슷한 사주를 가진 유명인

### 4. 프리미엄 수익 모델
- 💎 **Jelly 시스템**: 990원부터 시작하는 마이크로 결제
- 🔓 **단계적 해금**: 무료 맛보기 → 공유 해금 → 프리미엄 결제
- 🎁 **선물하기**: 친구에게 익명으로 사주 선물

---

## 🏗️ Technology Stack

### Frontend
```
Next.js 14 (App Router)
├── React 18
├── TypeScript
├── TailwindCSS + Shadcn/ui
└── Framer Motion (Animations)
```

### Backend & Infrastructure
```
Supabase (PostgreSQL)
├── Authentication (Kakao Social Login)
├── Database (User profiles, transactions)
├── Storage (User-generated content)
└── Edge Functions (Serverless APIs)
```

### Core Engine
```
Custom Saju Calculation Engine
├── Astronomy Module (True Solar Time, Solar Terms)
├── Calendar Module (60-Ganji, Lunar/Solar conversion)
└── Myeongni Logic (Elements, Sipsong, Sinsal, Gyeokguk)
```

### Integrations
- **Kakao Login**: Social authentication
- **Toss Payments**: Payment gateway
- **Vercel**: Hosting & CI/CD
- **Google Analytics**: User analytics

**Full Details**: [Tech Stack](./tech-stack.md)

---

## 📈 Product Status

### Current Version: **1.0 (MVP Ready)**

| Feature | Status | Completion |
|---------|--------|------------|
| Saju Calculation Engine | ✅ Done | 100% |
| User Authentication | ✅ Done | 95% |
| Profile Management | ✅ Done | 100% |
| Compatibility Analysis | ✅ Done | 100% |
| Payment System | ⚠️ Stub | 70% |
| Admin Dashboard | ⚠️ Partial | 60% |

**Next Milestone**: Real payment integration + Production deployment

---

## 🎯 Vision & Mission

> **Full Details**: [Vision & Mission](./vision-mission.md)

### Vision
한국 최고의 프리미엄 사주 플랫폼이 되어, 전통 명리학을 현대적으로 재해석하고 전 세계에 알린다.

### Mission
1. **정확성**: Enterprise-grade 정밀도로 신뢰 확보
2. **접근성**: 누구나 쉽게 이해할 수 있는 UX
3. **재미**: 밈과 게임화로 바이럴 유도
4. **수익성**: 건강한 비즈니스 모델 (Jelly System)

---

## 👥 Team Structure

```
Secret Paws Team
├── C-Level
│   ├── CEO - Business Strategy & Vision
│   ├── CTO - Technical Architecture
│   └── CFO - Financial Management
├── Product Team
│   ├── PM/PO - Product Planning
│   └── Designer - UI/UX Design
├── Engineering Team
│   ├── Frontend Engineers
│   ├── Backend Engineers
│   └── DevOps Engineer
├── QA Team
│   └── Quality Assurance
└── Operations Team
    ├── CS (Customer Support)
    └── Marketing

```

**Team Guides**: [01-team](../01-team/)

---

## 📊 Key Metrics (Target)

| Metric | Target (3 Months) | Target (1 Year) |
|--------|-------------------|-----------------|
| **MAU** | 10,000 | 100,000 |
| **Paying Users** | 1,000 (10%) | 15,000 (15%) |
| **Revenue** | $10K MRR | $150K MRR |
| **Retention (D30)** | 40% | 60% |

**Financial Details**: [CFO Overview](../01-team/c-level/cfo-financial-overview.md)

---

## 🗺️ Roadmap

### ✅ Phase 1-7: Foundation (Completed)
- ✅ Core Saju calculation engine
- ✅ User authentication (Kakao)
- ✅ Profile management
- ✅ Jelly economic system
- ✅ Theme system (Mystic, Minimal, Cyber)

### 🚧 Phase 8-9: Integration (In Progress)
- ⚠️ Real payment integration (Toss Payments)
- ⚠️ Database migration (Supabase)
- [ ] Admin dashboard enhancement

### 📅 Phase 10+: Growth (Q2 2026)
- [ ] AI-powered personalized content
- [ ] Community features
- [ ] PWA / Mobile app
- [ ] International expansion

**Full Roadmap**: [Roadmap](./roadmap.md)

---

## 🔗 Quick Links

### For Team Members
- [Developer Onboarding](../01-team/engineering/onboarding.md)
- [API Documentation](../02-technical/api/README.md)
- [Design System](../01-team/product/design-system.md)

### For External Stakeholders
- [Investor Materials](../05-external/investors/)
- [Partnership Overview](../05-external/partners/partnership-overview.md)
- [Press Kit](../05-external/press/press-kit.md)

### Resources
- [Glossary (용어집)](./glossary.md)
- [Troubleshooting](../02-technical/troubleshooting/)
- [Templates](../06-resources/templates/)

---

## 📞 Contact

- **General Inquiries**: [Email](mailto:contact@secretsaju.com)
- **Partnership**: [Email](mailto:partnership@secretsaju.com)
- **Press**: [Email](mailto:press@secretsaju.com)
- **Support**: [Help Center](https://help.secretsaju.com)

---

**Last Updated**: 2026-01-31  
**Document Owner**: CEO  
**Next Review**: 2026-02-28
