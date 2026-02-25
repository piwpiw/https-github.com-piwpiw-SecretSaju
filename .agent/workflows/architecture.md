---
description: [SecretSaju 아키텍처 및 유지보수 가이드라인]
---

# 🚀 SecretSaju 개발 전술 지침서 (Architecture & Maintenance)

본 문서는 무한 확장 가능한 구조와 효율적인 수정을 위해 프로젝트 전체 에이전트와 개발자가 반드시 참고해야 하는 기준입니다. 토큰 절약과 파편화 방지, 데드락 회피를 위한 마스터플랜입니다.

## 1. Directory Structure Rule (구조적 기준)
- `src/core/api/saju-engine/`: 사주 메인 엔진 코어. 절대 외부 UI 종속성을 가지지 않는 순수 함수형으로 유지.
- `src/lib/`: DB 연동, 인증, 공통 에러 핸들링 유틸리티.
- `src/components/ui/` & `src/components/shop/`: 글래스모피즘(Glassmorphism)과 럭셔리 마이크로 인터렉션이 적용된 재사용 가능한 시각적 레이어.

## 2. Mocking & E2E Testing Bypass
- **환경 변수**: `NEXT_PUBLIC_USE_MOCK_DATA=true`
- 위 환경 변수가 켜져 있을 경우 모든 로직(`src/lib/kakao-auth.ts`, `src/lib/api-auth.ts`, `src/app/api/wallet/balance/route.ts`)은 외부 인증을 우회하고 로컬 100% 동작 모드로 전환됩니다.
- 무한 로딩 방지를 위해 토큰 검증 단계는 자동으로 스킵되며 즉시 9999젤리를 보유한 테스트 유저로 로그인됩니다.

## 3. Database Deployment
데이터베이스 설정이 필요한 경우 다음 명령어를 통해 한 번에 셋팅을 완료할 수 있습니다:
```bash
npx supabase init
npx supabase db push # supabase/schema.sql 내용 자동 배포 완료
```
환경 변수 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) 세팅 후 `.env.local`의 Mock 모드를 `false`로 변경하세요.

## 4. UI/UX Modification Guide (추가/수정/삭제)
- **추가**: 화면이나 모델 추가 시 `framer-motion` 패키지를 이용한 `initial={{ opacity: 0 }}` 기반의 페이드인 트랜지션을 의무 적용해야 합니다.
- **수정**: 기존 `<div>`를 럭셔리 UI로 변경 시 `bg-white/5 backdrop-blur-md` 등의 클래스로 통일성을 유지합니다.
- **삭제**: 불필요 컴포넌트 삭제 시 루트 수준의 트리 셰이킹이 되는지 점검하고 `npm run lint && npx tsc --noEmit && next build`를 상시 실행해 잔여 레퍼런스로 인한 빌드 에러를 방지하세요.

## 5. Token Optimization (토큰 극대화)
다중 에이전트 환경에서 각 에이전트간의 메시지 교환은 최소화하고, 본 지침서에 기반한 명확한 역할을 기준으로 단독 실행 및 보고(`notify_user`)를 위주로 작업을 분배합니다. 
