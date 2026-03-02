## 인증 흐름 다이어그램

- MCP/Kakao 로그인 -> 콜백 인증 -> 지갑 업서트 -> 쿠키 정리 순서를 검증 기준으로 추가

## Auth and Payment Flow (Ops)
- Auth: Kakao/MCP callback -> profile sync -> wallet upsert -> session cookies
- Payment: initialize -> order pending -> verify -> wallet credit -> receipt mail
- Failure handling: error_code response + Notion log + ops runbook link
