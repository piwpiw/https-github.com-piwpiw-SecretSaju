# 💰 Cost Rules — 과금 제어 & 루프 방지

> [!CAUTION]
> **과금 폭주 방지 절대 수칙**
> 이 규칙은 `AGENT_PROTOCOLS.md`의 SLA Enforcement와 연동됩니다.
> 테스트 → 실패 → 수정 루틴이 **2회를 넘으면 즉시 중단** — `MAX_TURNS` 도달로 간주합니다.

---

## 1. ⚙️ Auto-Loop Breaker (루프 강제 절단)

- **단일 검증 원칙**: 모든 테스트는 `npm run qa` 통합 스크립트 **단 1회**로 갈음합니다.
- **원샷 원킬**: 에러 로그가 지목한 단 하나의 함수·라인만 수정합니다.
- **무한 핑퐁 금지**: 같은 에러가 2회 반복되면 `zero-shot-fix` → Level 3 에스컬레이션.

---

## 2. 🎯 Strict Range Read (전체 파일 읽기 금지)

> [!WARNING]
> `view_file` 인자 없는 호출은 **즉각 차단**됩니다. 항상 `StartLine`+`EndLine` 필수.

```
탐색: grep_search → view_file_outline → 라인 번호 확보
조회: view_file(StartLine: N-10, EndLine: N+10) 만 허용
```

---

## 3. 💣 Blast Radius Analysis (영향도 사전 분석)

코드 수정 전 반드시:
1. `grep_search`로 해당 함수/심볼을 Import 중인 파일 탐색
2. 연쇄 에러 대상 파일 사전 확보
3. `multi_replace_file_content` 1회 호출로 일괄 수정

---

## 4. 🔇 Zero Summary (요약 금지)

- 작업 완료 후 문서 전체 재요약 금지
- `notify_user`에 **핵심 1~3문장만** 보고
- 예시: `"결제 모듈 OS 종속성 에러 제거 완료. npm run qa 통과."`

---

## 5. 📊 Team별 비용 한도 (Cost Tier)

| Tier | 세션당 Max Calls | 소속 팀 | SLA 초과 시 |
|------|-----------------|--------|------------|
| 🟢 Low | 10 calls | T1 Planning, T5 Data, T6 Design, T8 DevOps, T10 Growth | 즉시 중단 + 유저 보고 |
| 🟡 Mid | 20 calls | T2 Frontend, T3 Backend, T7 QA | zero-shot-fix 강제 전환 |
| 🔴 High | 30 calls | T4 Engine, T9 Security | 구조적 결함 판단 + 에스컬레이션 |

---

## 6. 🔗 SLA 연동 규칙

- `AGENT_PROTOCOLS.md` §6 SLA Enforcement와 동일하게 적용
- **Handoff 토큰 비용**: 팀 이관 시 Handoff Schema만 전달 (전체 컨텍스트 재전달 금지)
- **병렬 실행 절약**: `AGENT_PROTOCOLS.md` §5 허용 조합에서만 병렬 실행
- **Context 재사용**: 동일 세션 내 이미 로드한 파일 재조회 금지

---

## 7. ⚡ Quick Reference

```
grep_search    → 무제한 (저비용)
view_file_outline → 무제한 (저비용)
view_code_item → 팀 Scope 내 자유
view_file      → 반드시 범위 지정, SLA 한도 내
write_to_file  → 신규 파일만
replace_file_content / multi_replace → 수정 시
run_command    → npm run qa (1회), npm run build (T8만)
```
