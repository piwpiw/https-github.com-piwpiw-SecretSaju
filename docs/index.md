# 📚 SecretSaju Documentation Index (Knowledge Base)

이 문서는 AI 에이전트 다중 협업 환경에서 모든 컨텍스트와 기획, 아키텍처 규칙을 빠르게 인덱싱하기 위한 최상위 목차(Root Index)입니다.

## 🌀 개발 방법론 및 규칙 (Methodology & Rules)
- **[AI Collaboration Cycle](../.agent/workflows/ai-collaboration.md)**: 전체 개발 프로세스, 지식 트리 구조, 10분 마이크로 타임박싱 및 다중 에이전트 협업 기준.
- **[Architecture & Maintenance](../.agent/workflows/architecture.md)**: 폴더 구조, Mocking 바이패스, Next.js 컴포넌트 추가/삭제 규칙, 토큰 최적화 방안.
- **[Zero Script QA](../scripts/zero-script-qa.mjs)**: 코드 커밋 전 자동으로 코드 퀄리티를 통제하여 중복 에러 발생을 근본적으로 차단하는 스크립트.

## 📖 기획 및 설계서 (Planning & Specifications)
- **[MASTER PRD](./MASTER_PRD.md)**: 전체 서비스의 제품 요구사항 정의서 (Phase 1 ~ Phase 3 로드맵 포함).
- **[UI/UX DESIGN SPEC](./UI_UX_DESIGN_SPEC.md)**: 글래스모피즘(Glassmorphism) 및 SVG Stitch 기반 동적 차트 등 프론트엔드 디자인 원칙 가이드.
- **[BLUEPRINT](./BLUEPRINT.md)**: 10단계 초격차 럭셔리 플랫폼 구축을 위한 마일스톤 안내서.
- **[GitHub Issues (Tasks)](./GITHUB_ISSUES.md)**: 백로그 관리 및 Phase 2 고도화 체크리스트 명세서.

## 🛠 아키텍처 및 코어 상세 (Technical Details)
- **[Saju Layers](./SAJU_LAYERS.md)**: 사주 코어 명리학 엔진(DACRE)의 레이어 구조 및 알고리즘 해설 문서.
- **[Error Catalog](./ERROR_CATALOG.md)**: 프로젝트 내에서 식별되어 관리되는 에러 카탈로그 및 대처 매뉴얼 (Zoro QA에 의해 검증됨).
- **[User Verification](./USER_VERIFICATION.md)**: 사용자 입장에서 E2E (End-to-End) 테스트를 검증하기 위한 시나리오 리스트.

## 👥 팀 명세서 (Team Specifics)
- **기획 팀 (Planning)**: `01-team/TEAM_SPEC_기획자.md`
- **디자인 팀 (Design)**: `01-team/TEAM_SPEC_디자이너.md`
- **단일 기능 개발 팀 (Feature Dev)**: `01-team/TEAM_SPEC_개발자.md`
- **콘텐츠 및 운세 데이터 팀 (Content)**: `01-team/TEAM_SPEC_콘텐츠.md`

---
> ⚠️ **에이전트 행동 강령**: 새로운 모듈 개발 전 반드시 이 Index를 읽고 관련 문서를 `grep_search` 또는 `view_file`로 확인한 후, 설계 동기화를 거쳐 작업을 시작하십시오.
