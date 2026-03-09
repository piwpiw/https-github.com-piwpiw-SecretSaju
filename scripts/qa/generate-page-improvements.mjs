import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const APP_DIR = path.join(ROOT, 'src', 'app');
const OUT_FILE = path.join(ROOT, 'docs', 'page-improvements-admin-audit.md');

function walkPageFiles(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkPageFiles(fullPath, out);
      continue;
    }
    if (entry.isFile() && entry.name === 'page.tsx') {
      out.push(fullPath);
    }
  }
  return out;
}

function routeFromFile(filePath) {
  const rel = path.relative(APP_DIR, filePath).replace(/\\/g, '/');
  if (rel === 'page.tsx') return '/';
  return `/${rel.replace(/\/page\.tsx$/, '')}`;
}

function hasAny(source, patterns) {
  return patterns.some((p) => p.test(source));
}

function deriveItems(route, source) {
  const flags = {
    isAdminRoute: route.startsWith('/admin'),
    hasForm: hasAny(source, [/<form\b/, /onSubmit=/, /input\b/, /textarea\b/, /select\b/]),
    hasAsyncData: hasAny(source, [/fetch\(/, /await\s+.*\.from\(/, /useEffect\(/, /searchParams/]),
    hasLoadingState: hasAny(source, [/isLoading/, /loading/, /Skeleton/, /skeleton/, /Suspense/]),
    hasErrorState: hasAny(source, [/catch\s*\(/, /setError/, /error\b/, /ErrorBoundary/]),
    hasAria: hasAny(source, [/aria-/, /role=/]),
    hasH1: hasAny(source, [/<h1\b/]),
    hasAnalytics: hasAny(source, [/track/i, /analytics/i, /gtag/i]),
    hasButton: hasAny(source, [/<button\b/]),
    hasList: hasAny(source, [/<ul\b/, /map\(/, /Table/, /List/, /Card/]),
  };

  const items = [];

  if (flags.isAdminRoute) {
    items.push('`P1` 관리자 RBAC 가드 강화: 비관리자 접근 시 즉시 리다이렉트 + 감사 로그를 남기도록 보강.');
    items.push('`P1` 관리자 주요 액션에 확인 단계 추가: 실수 클릭 방지를 위해 확인 모달과 취소 경로를 명확화.');
  } else {
    items.push('`P1` 인증 상태 분기 고도화: 로그인/비로그인 상태에서 CTA를 분리해 잘못된 진입을 줄이기.');
  }

  if (!flags.hasLoadingState) {
    items.push('`P1` 로딩 상태 명시: 첫 진입/재요청 시 Skeleton 또는 Progress UI를 추가.');
  } else {
    items.push('`P2` 로딩 UX 정교화: 지연 500ms 이상 구간에 단계형 로딩 메시지를 노출.');
  }

  if (!flags.hasErrorState) {
    items.push('`P1` 오류 상태 UI 추가: 네트워크 실패/권한 실패/빈 응답을 각각 안내.');
  } else {
    items.push('`P2` 오류 복구 액션 개선: 재시도 버튼과 지원 채널 링크를 오류 박스에 통합.');
  }

  if (flags.hasForm) {
    items.push('`P1` 폼 검증 강화: 필수값/형식/길이 검증을 클라이언트와 서버 양쪽에서 일치시키기.');
    items.push('`P2` 폼 접근성 개선: 입력마다 `label`, `aria-describedby`, 오류 포커스 이동 지원.');
  } else {
    items.push('`P2` 주요 CTA 검증: 클릭 후 성공/실패 토스트 및 상태 변화를 일관되게 표시.');
  }

  if (!flags.hasAria) {
    items.push('`P2` 접근성 속성 보강: 핵심 인터랙션 요소에 `aria-label`과 landmark role 부여.');
  } else {
    items.push('`P3` 키보드 탐색 개선: 탭 순서와 포커스 링 대비를 WCAG 기준으로 정리.');
  }

  if (!flags.hasH1) {
    items.push('`P2` 문서 구조 개선: 페이지당 단일 `h1`을 두고 섹션 계층을 재정렬.');
  } else {
    items.push('`P3` 헤딩 카피 최적화: 검색 의도와 일치하는 제목/서브카피로 개선.');
  }

  if (flags.hasAsyncData) {
    items.push('`P2` 데이터 요청 캐시 정책 정리: 중복 fetch를 줄이고 stale 상태를 명확히 처리.');
  } else {
    items.push('`P3` 초기 데이터 프리패치 검토: 사용 빈도가 높은 경로에 선로딩 적용.');
  }

  if (flags.hasList) {
    items.push('`P2` 빈 목록 UX 추가: 데이터가 없을 때 다음 액션으로 연결되는 Empty State 제공.');
  } else {
    items.push('`P3` 정보 밀도 개선: 카드/배지/요약문으로 핵심 정보를 빠르게 훑도록 구성.');
  }

  if (!flags.hasAnalytics) {
    items.push('`P2` 이벤트 계측 추가: 진입, CTA 클릭, 이탈 지점을 페이지 단위로 수집.');
  } else {
    items.push('`P3` 이벤트 네이밍 통일: 분석 대시보드에서 페이지 비교가 가능하도록 스키마 정리.');
  }

  items.push('`P2` 모바일 최적화 점검: 360px 뷰포트 기준으로 터치 타겟 44px 이상 유지.');
  items.push('`P2` E2E 회귀 테스트 추가: 관리자 로그인 상태에서 핵심 플로우를 자동 검증.');

  // Ensure exactly 10 actionable items per page.
  return items.slice(0, 10);
}

function main() {
  const pageFiles = walkPageFiles(APP_DIR).sort((a, b) => routeFromFile(a).localeCompare(routeFromFile(b)));
  const lines = [];
  const generatedAt = new Date().toISOString();

  lines.push('# Page Improvements (Admin Audit)');
  lines.push('');
  lines.push(`- Generated at: \`${generatedAt}\``);
  lines.push(`- Scope: \`${pageFiles.length}\` pages under \`src/app/**/page.tsx\``);
  lines.push('- Rule: each page includes exactly 10 improvement items.');
  lines.push('');

  for (const filePath of pageFiles) {
    const route = routeFromFile(filePath);
    const relPath = path.relative(ROOT, filePath).replace(/\\/g, '/');
    const source = fs.readFileSync(filePath, 'utf8');
    const items = deriveItems(route, source);

    lines.push(`## ${route}`);
    lines.push(`- File: \`${relPath}\``);
    lines.push('1. ' + items[0]);
    lines.push('2. ' + items[1]);
    lines.push('3. ' + items[2]);
    lines.push('4. ' + items[3]);
    lines.push('5. ' + items[4]);
    lines.push('6. ' + items[5]);
    lines.push('7. ' + items[6]);
    lines.push('8. ' + items[7]);
    lines.push('9. ' + items[8]);
    lines.push('10. ' + items[9]);
    lines.push('');
  }

  fs.writeFileSync(OUT_FILE, lines.join('\n'), 'utf8');
  console.log(`[improvement] generated ${OUT_FILE}`);
  console.log(`[improvement] pages=${pageFiles.length} items=${pageFiles.length * 10}`);
}

main();
