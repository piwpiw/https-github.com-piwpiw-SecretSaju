# 무료 오픈 런칭 런북 (Free Open Launch)

대상 구성: **Vercel 배포 · Kakao 로그인 + Supabase 이력 저장 · 프리미엄 전부 무료 개방**

> 코드 측 준비는 이 저장소에서 완료. 아래 "사용자 조치"는 시크릿/외부 대시보드가 필요해 코드로 자동화할 수 없는 항목입니다.

---

## 1. 코드 준비 상태 (완료 ✅)

- **전부 무료 개방**: `FREE_LAUNCH` 플래그(`src/config/constants.ts`) 도입. 기본 ON.
  - `isUnlocked()`(jelly-wallet), `ResultCard`(secretUnlocked), `SecretBlur` 세 게이트가 모두 열림 → 결제 없이 모든 시크릿/프리미엄 콘텐츠 공개.
  - 나중에 유료 전환 시: Vercel 환경변수 `NEXT_PUBLIC_FREE_LAUNCH=false` 설정만 하면 원복.
- **배포 빌드 안정화**: `vercel.json` `installCommand` → `npm ci` (optional 네이티브 deps 정상 설치, ERR-L001/E-006 해소).
- **모바일 성능**: 홈 First Load JS 296→255 kB, 서드파티 텍스처 요청 제거.
- **CI**: `deploy.yml` Quality 워크플로 수정.
- 검증: 프로덕션 빌드 성공(105 페이지), tsc 0, lint 0, 테스트 68/68, guard 통과.

---

## 2. 사용자 조치 — Vercel

### 2-1. 프로젝트 연결
- Vercel 프로젝트에서 이 브랜치(또는 main)를 배포 소스로 연결. Framework: Next.js (자동).

### 2-2. 환경변수 (Vercel → Settings → Environment Variables)

**필수 (앱 기동/코어)**
| Key | 값 | 비고 |
|---|---|---|
| `NEXT_PUBLIC_BASE_URL` | `https://<실제도메인>` | OAuth redirect·공유 URL 기준 |

**로그인 + 이력 저장 (선택 스코프에 따라)**
| Key | 값 | 비고 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role | 서버 전용, 노출 금지 |
| `NEXT_PUBLIC_KAKAO_JS_KEY` | Kakao JS 키 | |
| `KAKAO_REST_API_KEY` | Kakao REST 키 | |
| `KAKAO_CLIENT_SECRET` | Kakao Client Secret | 서버 전용 |

**선택 (권장)**
| Key | 값 | 비고 |
|---|---|---|
| `NEXT_PUBLIC_GA_ID` | GA4 측정 ID | 런칭 지표 |
| `NEXT_PUBLIC_FREE_LAUNCH` | (미설정) | 기본 무료. 유료 전환 시 `false` |

> 결제(Toss) 키는 무료 런칭에서 **불필요**. 유료 전환 때 추가.

---

## 3. 사용자 조치 — Kakao 로그인

- Kakao Developers → 내 앱 → 카카오 로그인 활성화.
- Redirect URI 등록: `https://<도메인>/api/auth/kakao/callback`
- 동의 항목(닉네임/이메일 등) 설정.

---

## 4. 사용자 조치 — Supabase (이력 저장)

- `supabase/migrations`의 마이그레이션을 프로덕션 DB에 순서대로 적용.
  - 핵심: `jelly_wallets`(user_id unique), `users.mcp_user_id`, `005`/`006` 마이그레이션.
- 적용 후 `src/types/database.ts`가 스키마와 일치하는지 확인.

---

## 5. 사용자 조치 — Cloudflare Workers 정리

- 현재 저장소가 Cloudflare Workers Git 연동에 물려 있어 **매 커밋 빌드가 실패**합니다 (이 앱은 Workers용이 아님, 저장소에 wrangler 설정 없음 = 대시보드 연동).
- Cloudflare 대시보드 → Workers & Pages → 해당 프로젝트 → Git 연동 **해제** 또는 프로젝트 삭제.
- (Render를 안 쓸 경우 `render.yaml` autoDeploy도 필요 시 비활성화.)

---

## 6. 배포 후 스모크 체크

- [ ] 홈 `/` 정상 렌더, TerminalBoot → 입력 플로우 동작
- [ ] 생년월일 입력 → 사주 결과(ResultCard)에서 **프리미엄/시크릿이 잠금 없이 전부 표시**되는지 (무료 개방 확인)
- [ ] `/tarot`, `/dreams`, `/calendar`, `/compatibility` 진입 정상
- [ ] `/api/health` 200
- [ ] (로그인 스코프면) Kakao 로그인 왕복 → 이력 저장 확인
- [ ] 모바일 뷰포트(360~430px) 레이아웃 확인
- [ ] 법적 페이지 `/terms` `/privacy` `/refund` 접근 가능

---

**Last Updated**: 2026-07-13
**By**: Claude (free open-launch prep)
