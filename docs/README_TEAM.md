# Secret Paws 팀 가이드 📚

## 개요

**프로젝트**: Secret Paws (멍냥의 이중생활)  
**목표**: 사주아이(20만 유저)를 넘어서는 복사 불가능한 바이럴 사주 서비스  
**핵심 차별점**: 개인 사주 → **관계 지도** (엄마, 애인, 상사 등 다중 분석)

---

## 빠른 시작

### 당신의 역할은?

| 역할 | 문서 보기 |
|-----|----------|
| **기획자/PM** | [TEAM_SPEC_기획자.md](./TEAM_SPEC_기획자.md) |
| **개발자** | [TEAM_SPEC_개발자.md](./TEAM_SPEC_개발자.md) |
| **디자이너** | [TEAM_SPEC_디자이너.md](./TEAM_SPEC_디자이너.md) |
| **콘텐츠 팀** | [TEAM_SPEC_콘텐츠.md](./TEAM_SPEC_콘텐츠.md) |

---

## 핵심 컨셉 (30초 요약)

### 비즈니스 모델
- **가상 화폐**: "젤리" (990원 = 1젤리, 최대 9,900원 팩)
- **수익 구조**: 첫 프로필 무료 → 이후 1젤리/프로필
- **목표 AOV**: 5,500원 (사주아이 990원의 5.5배)

### 킬러 피처
1. **관계 대시보드**: 엄마, 애인, 상사 등 모든 관계를 한눈에
2. **VS 모드**: "나 vs 전남친" 비교 → 인스타 공유 → 바이럴
3. **오늘의 팩폭**: 매일 새로운 인사이트 → DAU 30%

### 경쟁 우위
- 사주아이: 1회 체험 → Secret Paws: **매일 오는 필수 앱**
- 사주아이: JSON 복사 가능 → Secret Paws: **5중 방어막** (복사 비용 수천만원)

---

## 프로젝트 현황

### 완료 ✅
- Jelly 가상 화폐 시스템
- 관계 분석 알고리즘 (오행 이론 기반)
- 프로필 추가 플로우 (첫 무료, 이후 Jelly 소비)
- UI 컴포넌트 (Shop, Balance, Unlock 모달)
- 캐릭터 데이터 3개 (갑자, 을축, 병인)

### 진행 중 🚧
- 관계 대시보드 UI
- VS 모드 비교 기능
- Daily Secret 시스템

### 대기 중 ⏳
- 3D 캐릭터 60개 제작
- API 보안 강화
- 저작권/상표 등록

---

## 일정

| 주차 | 목표 | 담당 |
|-----|------|------|
| **Week 1-2** | 관계 대시보드 + VS 모드 | 개발+디자인 |
| **Week 3-4** | Daily Secret + 공유 기능 | 개발+콘텐츠 |
| **Week 5-8** | 캐릭터 60개 제작 | 디자인+콘텐츠 |
| **Week 9-12** | 보안 강화 + 법적 보호 | 개발+PM |

---

## KPI 목표 (첫 3개월)

| 지표 | 목표 | 현황 |
|-----|------|-----|
| 가입자 | 50,000명 | 0 (MVP) |
| 유료 전환율 | 15% | - |
| 평균 구매액 | 5,500원 | - |
| DAU/MAU | 30% | - |
| Viral K-factor | 1.2+ | - |

---

## 기술 스택

**Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion  
**Storage**: localStorage (MVP) → IndexedDB → Firebase  
**Deploy**: GCP + Firebase Hosting  
**Analytics**: GA4 (예정)

---

## 디렉토리 구조

```
SecretSaju/
├── docs/
│   ├── README_TEAM.md             ← 지금 보고 있는 파일
│   ├── TEAM_SPEC_기획자.md
│   ├── TEAM_SPEC_개발자.md
│   ├── TEAM_SPEC_디자이너.md
│   └── TEAM_SPEC_콘텐츠.md
├── src/
│   ├── app/                       # Next.js pages
│   ├── components/                # React 컴포넌트
│   ├── lib/                       # 비즈니스 로직
│   └── types/                     # TypeScript 타입
├── data/
│   └── characters.json            # 60개 캐릭터 데이터
└── thema/                         # 테마/디자인 시스템
```

---

## 팀 협업 규칙

### 개발 플로우
```
main (production)
└── develop (staging)
    ├── feature/relationship-dashboard  
    ├── feature/vs-mode
    └── feature/daily-secret
```

### 커밋 메시지
```
feat: 관계 대시보드 UI 추가
fix: Jelly 잔액 업데이트 버그 수정
docs: 디자이너 스펙 문서 작성
content: 갑자일주 validation hook 추가
```

### 회의 일정
- **Daily Standup**: 매일 10:00 (15분)
- **Weekly Review**: 매주 금요일 15:00
- **Sprint Planning**: 격주 월요일 10:00

---

## Quick Links

### 전략 문서
- [전체 구현 계획](file:///C:/Users/piwpi/.gemini/antigravity/brain/5b7851a9-2613-4a8a-8a1c-6ece358187ed/implementation_plan.md)
- [경쟁 우위 전략](file:///C:/Users/piwpi/.gemini/antigravity/brain/5b7851a9-2613-4a8a-8a1c-6ece358187ed/competitive_moat_strategy.md)
- [관계 대시보드 상세](file:///C:/Users/piwpi/.gemini/antigravity/brain/5b7851a9-2613-4a8a-8a1c-6ece358187ed/relationship_dashboard_plan.md)

### 개발 자료
- [Walkthrough (구현 내역)](file:///C:/Users/piwpi/.gemini/antigravity/brain/5b7851a9-2613-4a8a-8a1c-6ece358187ed/walkthrough.md)
- [Task 체크리스트](file:///C:/Users/piwpi/.gemini/antigravity/brain/5b7851a9-2613-4a8a-8a1c-6ece358187ed/task.md)

---

## 연락처

**프로젝트 오너**: [담당자 이름]  
**Slack**: #secret-paws-team  
**Figma**: [디자인 시스템 링크]  
**Notion**: [프로젝트 대시보드]

---

## FAQ

**Q: 사주아이와 뭐가 다른가요?**  
A: 개인 사주만 보던 것에서 → **내 인생의 모든 관계를 분석**하는 필수 앱으로 진화

**Q: 정말 복사 못 하나요?**  
A: 5중 방어 (기술+디자인+콘텐츠+법적+심리) → 복사 비용 수천만원

**Q: 왜 Jelly 시스템을 쓰나요?**  
A: 990원 → 9,900원 패키지 유도 → AOV 5배 상승

**Q: DAU는 어떻게 확보하나요?**  
A: "오늘의 팩폭" 매일 업데이트 → 매일 아침 확인 습관

---

**Last Updated**: 2026-01-31  
**Version**: MVP 1.0
