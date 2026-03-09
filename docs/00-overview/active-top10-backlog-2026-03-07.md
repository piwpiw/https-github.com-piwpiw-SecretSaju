# Active Top 10 Backlog (2026-03-07)

목적: 대량 반복 체크리스트를 실제 개발 우선순위로 압축한다.

기준 문서:
- `docs/00-overview/execution-backlog-ko.md`
- `docs/00-overview/enterprise-upgrade-daily-plan-2026-03-03.md`
- `docs/archive/decision-history/active-dispatch.md`
- 현재 코드 상태 (`lint`, `test`, `build` 통과 기준)

판정 원칙:
- 이미 완료된 구조 개선, 테스트 정리, 결과 리포트 고도화 항목은 제외
- 문서에 반복되는 동일 패턴 항목은 하나의 실행 항목으로 압축
- 지금 바로 사용자 영향이 큰 순서대로 정렬

## Active 10

1. `/`, `/saju`, `/fortune` 결과 카피와 실화면 스모크를 하나의 품질 묶음으로 운영
- 이유: 첫 분석 완료율과 결제 전환에 직접 영향
- 현재 상태: 결과 카피/엔진/빌드는 정리됨, 실브라우저 smoke만 미완료
- 상세 설계: `docs/00-overview/result-output-design-spec-2026-03-07.md`
- 완료 기준: 홈 입력부터 결과 카드, 프리미엄 CTA, 결제 진입까지 수동/자동 검증 기록

2. `/shop`, `/payment/loading`, `/payment/success`, `/payment/fail` 결제 흐름을 단일 상거래 체인으로 관리
- 이유: 문서상 분산됐지만 실제로는 한 체인
- 현재 상태: API 안정화와 기본 UX는 반영됨
- 완료 기준: 실패/재시도/성공/복귀 동선과 로그 추적이 한 시나리오로 검증됨

3. `/login`, `/signup`, `/auth/callback` 인증 경로의 스모크와 오류 카피 최종 정리
- 이유: 진입 차단 시 전체 funnel이 멈춤
- 현재 상태: 코드와 에러 분기는 정리됨
- 완료 기준: auth smoke 통과 또는 대체 수동 검수 기록

4. `/mypage`, `/my-saju/*`, `/history`, `/analysis-history/*` 자산 보관 흐름 정합성 점검
- 이유: 재방문과 유료 가치의 핵심
- 현재 상태: 기능은 존재하나 서버 동기화/빈 상태/문장 품질은 더 볼 여지 있음
- 완료 기준: 생성, 저장, 목록, 상세, 빈 상태가 한 흐름으로 검증됨

5. `/compatibility`, `/relationship/*` 관계 분석 화면 품질 상향
- 이유: 공유성과 체류시간이 높음
- 현재 상태: 관리자 디버그 마커는 제거됨
- 완료 기준: 관계 결과 카피, CTA, 공유 컨텍스트, 모바일 접근성 점검

6. `/daily`, `/calendar`, `/tojeong` 반복 방문형 화면의 데이터 신뢰도 표기 강화
- 이유: 리텐션 기능이지만 신뢰도 문구와 캐시 전략이 아직 분산됨
- 현재 상태: 기능은 존재
- 완료 기준: 갱신 시점, 데이터 기준, 빈 상태, 재방문 CTA가 일관됨

7. `/dreams`, `/tarot`, `/psychology/*` 보조 콘텐츠의 결과 문장 품질 통일
- 이유: 주력 funnel은 아니지만 브랜드 인상을 좌우함
- 현재 상태: 일부 화면은 기본 카피가 짧거나 모듈별 편차가 큼
- 완료 기준: 결과 카드/요약/프리미엄 유도 문장이 공통 톤을 따름

8. `/support`, `/faq`, `/inquiry`, `/legal`, `/privacy`, `/refund` 신뢰/지원 화면 정리
- 이유: 결제와 계정 이슈의 마찰 비용을 줄임
- 현재 상태: 기본 경로는 존재
- 완료 기준: 문의 전환, 정책 링크, 응답 기대치 문구가 정리됨

9. `/admin`, `/api/health` 운영 가시성 보강
- 이유: 실제 운영 품질의 핵심
- 현재 상태: health와 admin은 기본형
- 완료 기준: 핵심 의존성 상태, 샘플 검증, 운영 메타데이터가 한 화면에서 보임

10. 문서 backlog 정리 체계 재편
- 이유: `enterprise-upgrade-daily-plan-2026-03-03.md`는 반복 항목이 너무 많아 실행력이 낮음
- 현재 상태: 대량 체크리스트가 유지됨
- 완료 기준: 앞으로는 이 문서와 `active-dispatch`만 active set으로 사용하고, 대량 문서는 archive/reference로 취급

## Immediate Blockers

- 브라우저 smoke 자동화는 현재 셸 정책상 로컬 서버 백그라운드 기동이 막혀 있음
- 따라서 자동 smoke를 돌리려면 실행 환경 제약이 풀리거나, 외부 실행 중 서버가 필요함

## Excluded as Already Handled

- 결과 리포트 시각화 고도화
- 인터랙티브 차트
- WCAG/시맨틱 보강의 1차 정리
- lint/test/build 체계 정리
- 사주 엔진 canonical/evidence/candidate 1차 구조화

## Owner Rule

- 실제 active set은 본 문서 10개만 사용
- `enterprise-upgrade-daily-plan-2026-03-03.md`의 반복 체크리스트는 참조용으로만 사용

Last Updated: 2026-03-07
