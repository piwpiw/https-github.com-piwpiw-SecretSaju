# 🎨 SecretSaju UI/UX Design Specification (v5.0)

## 1. Design Concept: "Modern Stitch & Hyper-Luxury Glassmorphism"
본 프로젝트는 단순한 사주 웹앱을 넘어 컴포넌넌트 기반의 우아하고 초개인화된 시각적 경험을 제공합니다. 

### 1.1 핵심 트렌드 적용 (Stitch Trend)
* **초정밀 벡터 레이어 (Advanced SVG)**: 단순 이미지 파일이 아닌, 스크롤과 데이터에 반응하여 선이 그려지는(Stitch) 애니메이션 형태의 SVG 차트 및 아이콘 전면 도입.
* **글래스모피즘(Glassmorphism) 고도화**: 다중 레이어 블러, 부드러운 하이라이트 투명도를 조합한 깊이감 있는 UI.
* **마이크로 인터랙션**: 모든 상태 변화(Hover, Click, Load)에 물리 엔진 기반(Spring) 애니메이션 적용.

## 2. Component Design Guidelines

### 2.1 SVG Data Visualizations
* **만세력 매트릭스**: 사용자의 사주 팔자(8글자)를 동적인 SVG 육각형 또는 방사형 그래프로 시각화.
* **오행(Five Elements) 밸런스 차트**: 물, 불, 나무, 흙, 쇠의 에너지를 생동감 있게 변하는 SVG 폴리곤(Polygon)으로 표현.

### 2.2 Typography & Structure
* **글로벌 폰트**: Noto Sans KR (본문) + Do Hyeon (강조 타이포그래피)
* **간격 및 그리드**: 8pt 베이스의 마진/패딩 통일, 12-Column Responsive Grid.

## 3. Screen Specs (Phase 2 Focus)
1. **메인 페이지 (Home)**: 우주적 느낌의 WebGL/SVG 애니메이션 배경과 프리미엄 인풋 폼.
2. **사주 결과 및 대시보드 (Dashboard)**: 사용자의 사주 정보를 아름다운 SVG 대시보드 형태로 출력.
3. **결제 및 비밀 해금 모달**: 블러 처리된 신비로운 뒷배경과 반짝이는 파티클 라인(Stitch) 액션.

## 4. Interaction Map
* Click -> Spring Scale (0.95 -> 1.05) & Ripple effect
* Scroll -> Parallax SVG Drawing & Fade-ins
* Wait -> Subtle ambient background shifting (GlowCursor 연계)
