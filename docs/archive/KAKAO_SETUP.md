# Kakao Login Setup Guide

## 즉시 해야 할 작업

### 1. 카카오 개발자 앱 등록

1. [Kakao Developers](https://developers.kakao.com/) 접속 및 로그인
2. **내 애플리케이션** > **애플리케이션 추가하기** 클릭
3. 앱 이름: "Secret Paws" (또는 원하는 이름)
4. **플랫폼 설정** > **Web 플랫폼 등록**:
   - 사이트 도메인: `http://localhost:3000`
5. **Redirect URI 설정**:
   - 앱 설정 > 카카오 로그인
   - Redirect URI: `http://localhost:3000/api/auth/kakao/callback` 추가
   - **활성화 설정 ON** 체크

### 2. 키 복사하기

**앱 키** 메뉴에서:
- **JavaScript 키** 복사
- **REST API 키** 복사

### 3. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일 생성:

```bash
# Kakao Keys
NEXT_PUBLIC_KAKAO_JS_KEY=복사한_JavaScript_키
KAKAO_REST_API_KEY=복사한_REST_API_키

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. 개발 서버 재시작

환경 변수 적용을 위해 npm run dev 재시작

### 5. 테스트

1. http://localhost:3000/mypage 접속
2. "카카오 로그인" 버튼 클릭
3. 카카오 로그인 페이지에서 로그인
4. 로그인 성공 시 MyPage로 리다이렉트
5. 사용자 닉네임과 이메일 표시 확인

## 문제 해결

### "Redirect URI mismatch" 에러
- 카카오 개발자 콘솔에서 Redirect URI가 정확히 `http://localhost:3000/api/auth/kakao/callback`인지 확인

### "Invalid app key" 에러
- `.env.local` 파일의 키가 올바른지 확인
- 서버 재시작 확인

### 카카오 SDK 로드 안됨
- 브라우저 콘솔에서 `window.Kakao` 확인
- 네트워크 탭에서 Kakao SDK 스크립트 로드 확인
