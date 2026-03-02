---
description: SecretSaju 아키텍처 및 유지보수 가이드라인
---
// turbo-all

# 🚀 SecretSaju 개발 전술 지침서 (Architecture & Maintenance)

본 문서는 무한 확장 가능한 구조와 효율적인 수정을 위한 **전체 에이전트 공용 기준서**입니다.

---

## 1. Directory Structure Rule (구조적 기준)

| 경로 | 규칙 |
|------|------|
| `src/core/api/saju-engine/` | 엔진 코어 — 외부 UI 종속성 없는 **순수 함수**만 허용 |
| `src/lib/` | DB·인증·결제·공통 에러핸들링 유틸리티 |
| `src/components/ui/` | 글래스모피즘 + 럭셔리 마이크로 인터랙션 재사용 컴포넌트 |
| `src/app/api/` | Next.js API Routes — `api-gen` 스킬로만 생성 |
| `src/data/` | 순수 데이터 파일 — 로직 삽입 금지 |
| `.agent/` | 에이전트 시스템 — 코드팀 수정 금지 (T1 Planning만) |

---

## 2. Mock & Testing Mode

```bash
# 환경변수 설정 (로컬 개발)
NEXT_PUBLIC_USE_MOCK_DATA=true
```

- `true`: 외부 인증(Kakao OAuth), Supabase, Toss 결제 전부 우회
- 즉시 9999젤리 보유 테스트 유저로 자동 로그인
- 무한 로딩 방지 — 토큰 검증 단계 자동 스킵
- **Production 배포 시 반드시 `false`** (T8 DevOps 체크리스트)

---

## 3. Database Deployment

```bash
npx supabase init
npx supabase db push   # supabase/schema.sql 내용 자동 배포
```

환경변수 설정 후 Mock 모드 해제:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## 4. UI/UX Modification Guide

### 신규 화면·컴포넌트 추가
```tsx
// 필수: Framer Motion 페이드인 (생략 불가)
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* 필수: 글래스모피즘 래퍼 */}
  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
    {/* content */}
  </div>
</motion.div>
```

### 수정
- 기존 `<div>` → `bg-white/5 backdrop-blur-md`로 통일
- 하드코딩 컬러 → CSS 변수 또는 Tailwind 토큰

### 삭제
- 루트 트리 셰이킹 확인
- `npm run lint && npx tsc --noEmit && next build` 실행

---

## 5. Token Optimization (다중 에이전트 최적화)

```
원칙 1: 에이전트 간 메시지 교환 최소화
원칙 2: CONTEXT_ENGINE.md를 공유 메모리로 활용 (재질의 방지)
원칙 3: 팀별 단독 실행 후 notify_user 보고
원칙 4: 동일 세션 내 로드한 파일 재조회 금지
원칙 5: grep_search → outline → 범위 읽기 순서 엄수
```

---

## 6. 아키텍처 결정 업데이트

새로운 아키텍처 결정 발생 시:
1. `CONTEXT_ENGINE.md` §7 Decision Log 즉시 업데이트
2. 이 문서(architecture.md) 관련 섹션 업데이트
3. 영향받는 팀 파일 Scope/Critical Rules 업데이트
