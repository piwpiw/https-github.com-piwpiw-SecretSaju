# SecretSaju Deep History (압축 요약)
> 상세 이력은 `docs/archive/ai-logs/` 참조. 이 파일은 AI 작업용 요약본.

---

## Phase 1: Core Foundation (Waves 1-5)
| Wave | 성취 |
|------|------|
| 1 | 사주 계산 엔진 — 60갑자, 음력/양력 변환, 한국 시간대 보정 (1948-1988) |
| 2 | 카카오 OAuth + 세션 관리 |
| 3 | 젤리 경제 — 서버 크레딧 시스템 + 트랜잭션 로그 |
| 4 | 1세대 해석 — 4기둥, 12동물, 오행 분포 → 내러티브 |
| 5 | 전체 라우트 구조 (/daily, /tarot, /encyclopedia) |

## Phase 2: Hyper-Premium UI (Waves 6-9)
| Wave | 성취 |
|------|------|
| 6 | 글라스모피즘, 노이즈 텍스처, 마이크로 애니메이션 |
| 7 | 운세 파형 차트, 5각형 공명 다각형, Background Drift |
| 8 | AI Dream Parser UI, 운명 웹 관계도 |
| 9 | 궁합 점수 카운터, ME vs YOU 레이더, 소셜 프루프 티커 |

## Phase 3: Final Polish (Wave 10)
- 캘리그라피 기둥 시각화, Ambient Sound Portal, Reading Progress Bar
- Multi-LLM 도입 결정 (GPT-4o + Claude 3.5 + Gemini 1.5)

## Phase 4: AI Intelligence (Waves 11-12)
| Wave | 성취 | 핵심 파일 |
|------|------|-----------|
| 11 | MPPS — persona-matrix × ai-routing × AIIntelligenceBadge | `src/lib/persona-matrix.ts`, `src/core/ai-routing.ts` |
| 11.5 | Anti-hallucination 3중 시스템 | `AI_BOOTSTRAP.md`, `ERROR_LEDGER.md`, `CONTEXT_ENGINE.md §4` |
| 11.6 | P0/P1 전체 구현 — LLM 체인, TransitTicker, ProfileWallet, 테스트 40개 | `src/app/api/persona/route.ts` |
| 11.7 | 프리미엄 UI 배치 2 — mypage/daily/fortune 전면 재설계 | `src/app/mypage/`, `daily/`, `fortune/` |
| 12 | Lineage/Evidence 기반 신뢰 시스템 | `src/core/api/saju-lineage.ts`, `saju-canonical.ts` |
| 12+ | Fortune Reader System — 5종 리더 × 3 AI 모델 라우팅 | `src/lib/fortune-readers.ts` |

---

## 주요 기술 결정 이력
| 날짜 | 결정 | 이유 |
|------|------|------|
| 2026-03-05 | `vercel.json --omit=optional` | 배포 안정화 → Windows rollup 바이너리 제외 (ERR-L001 발생 원인) |
| 2026-03-06 | `dev-safe.js` webpack 캐시 자동 정리 | Windows EPERM `.next/cache` 손상 방지 |
| 2026-03-06 | `NEXT_ACTIONS.md` SSOT 수립 | task.md/implementation_plan 불일치 해소 |
| 2026-03-07 | `fortune-readers.ts` 도입 | persona 시스템 → reader 시스템으로 승격 |
| 2026-03-08 | `_temp/` 임시파일 격리 | 루트 오염 방지, AI 에이전트 파일 배치 규칙 수립 |
| 2026-03-08 | `docs/` 구조 고도화 | 부유 파일 정리, archive/ai-logs/ 격리, 중복 폴더 통합 |

## 품질 스코어 (2026-03-06 기준)
- **현재**: 40/100 | build ✅ lint ✅ tsc ✅ | test ❌(ERR-L001) | admin audit 부분 실패
- **Phase A 목표**: 55 — test 복구, admin 500 제거, route contract 동기화
- **Phase B 목표**: 70 — 보안 취약점 해소 (critical×1, high×4)

---
**Last Updated**: 2026-03-08
