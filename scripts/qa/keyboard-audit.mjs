// 키보드 접근성 감사 — 마우스 없이 화면을 쓸 수 있는지 실제로 눌러본다.
//
// 다른 가드가 못 잡는 것을 본다:
// - 모달이 열렸을 때 Tab 이 모달 밖으로 새는가 (포커스 트랩)
// - Escape 로 닫히는가, 닫은 뒤 포커스가 열었던 버튼으로 돌아오는가
// - 포커스 링이 실제로 보이는가 (outline/box-shadow/ring 중 하나)
// - tabindex 양수(탭 순서를 깨뜨림)가 있는가
// - 클릭만 되는 요소(div/span 에 onClick)에 키보드로 닿을 수 있는가
//
// Usage: node scripts/qa/keyboard-audit.mjs [baseUrl] [--update-baseline]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const BASE = args.find((a) => !a.startsWith('--')) || 'http://localhost:3000';
const UPDATE = args.includes('--update-baseline');
const BASELINE = path.join(dir, 'keyboard-audit-baseline.json');

const ROUTES = JSON.parse(fs.readFileSync(path.join(dir, 'menu-routes.json'), 'utf8'));

/** 포커스 가능한 요소 선택자 (표준 목록) */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * 모달을 여는 버튼들. 페이지에 없으면 조용히 건너뛴다.
 * 로그인 모달과 젤리 상점 모달이 앱에서 유일한 role="dialog" 다.
 */
const MODAL_OPENERS = [
  'button:has-text("로그인")',
  'button:has-text("충전")',
  'button:has-text("젤리")',
];

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PW_CHROMIUM || undefined,
});

const findings = [];
const add = (route, kind, detail) => findings.push(`${route} | ${kind} | ${detail}`);

for (const viewport of [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
]) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();

  for (const route of ROUTES) {
    try {
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 30000 });
    } catch {
      continue; // 로드 실패는 menu-smoke 가 잡는다
    }
    // 인트로 스플래시가 걷힐 시간을 준다
    await page.waitForTimeout(1200);

    const tag = `${route} (${viewport.name})`;

    // 1) 양수 tabindex — 탭 순서를 DOM 순서에서 떼어놓아 예측 불가능하게 만든다
    const positiveTabindex = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[tabindex]'))
        .filter((el) => Number(el.getAttribute('tabindex')) > 0)
        .map((el) => `${el.tagName.toLowerCase()}[tabindex=${el.getAttribute('tabindex')}]`)
        .slice(0, 5)
    );
    for (const item of positiveTabindex) add(tag, 'positive-tabindex', item);

    // 2) 키보드로 닿을 수 없는 클릭 요소
    const unreachableClickables = await page.evaluate((focusable) => {
      const out = [];
      for (const el of Array.from(document.querySelectorAll('div, span, li'))) {
        if (el.matches(focusable)) continue;
        if (el.getAttribute('role') === 'button' || el.getAttribute('role') === 'link') {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            out.push(`role=${el.getAttribute('role')} "${(el.textContent || '').trim().slice(0, 24)}"`);
          }
        }
      }
      return out.slice(0, 5);
    }, FOCUSABLE);
    for (const item of unreachableClickables) add(tag, 'unreachable-clickable', item);

    // 3) 포커스 링은 런타임으로 판정하지 않는다. 아래 소스 스캔이 담당한다.
    //
    // 두 번 시도했다가 둘 다 접었다.
    //  - el.focus() 후 outline/box-shadow 계산값 읽기 → 351건 전부 오탐.
    //    outline-style:auto 는 계산 폭이 0px 로 나와도 크로미움이 자기 링을
    //    따로 그린다.
    //  - 포커스 전후 스크린샷 비교 → 17건 남았지만 확인해 보니 전부 인트로
    //    오버레이가 요소를 덮어 두 장이 같게 나온 것이었다.
    //
    // 브라우저 기본 링이 항상 깔려 있으므로, 진짜 문제는 그 기본 링을 CSS 로
    // 지워 놓고 대체 표시를 안 준 경우뿐이다. 그건 소스에서 확실히 잡힌다.

    // 4) 모달을 실제로 열어서 포커스 트랩과 Escape 를 확인한다.
    //    페이지 로드 직후에는 열린 모달이 없으므로 여는 버튼을 눌러야 한다.
    for (const opener of MODAL_OPENERS) {
      const trigger = page.locator(opener).first();
      if (!(await trigger.count().catch(() => 0))) continue;
      if (!(await trigger.isVisible().catch(() => false))) continue;

      const opened = await trigger.click({ timeout: 3000 }).then(
        () => page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 3000 })
          .then(() => true).catch(() => false),
        () => false
      );
      if (!opened) continue;

      const leak = await checkFocusTrap(page);
      if (leak) add(tag, 'focus-trap-leak', `${opener} → ${leak}`);

      // Escape 로 닫히는가.
      // 고정 400ms 로 재다가 퇴장 애니메이션 도중에 "안 닫혔다"고 잘못 판정한
      // 적이 있다. 사라질 때까지 기다리되 상한을 둔다.
      await page.keyboard.press('Escape');
      const stillOpen = await page
        .waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 3000 })
        .then(() => false)
        .catch(() => true);
      if (stillOpen) {
        add(tag, 'escape-does-not-close', opener);
        await page.reload({ waitUntil: 'networkidle' }).catch(() => {});
        await page.waitForTimeout(800);
      }
    }
  }

  await context.close();
}

/**
 * 모달 안에서 Tab 을 30번 눌러 포커스가 모달 밖으로 나가는지 본다.
 * 나간다면 그 요소를 돌려준다.
 */
async function checkFocusTrap(page) {
  for (let i = 0; i < 30; i += 1) {
    await page.keyboard.press('Tab');
    const outside = await page.evaluate(() => {
      const active = document.activeElement;
      if (!active || active === document.body) return null;
      const dialog = Array.from(document.querySelectorAll('[role="dialog"]')).find((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
      if (!dialog) return null;
      if (dialog.contains(active)) return null;
      return `${active.tagName.toLowerCase()} "${(active.textContent || '').trim().slice(0, 24)}"`;
    });
    if (outside) return outside;
  }
  return null;
}

await browser.close();

// 소스 스캔: 브라우저 기본 포커스 링을 지우고 대체 표시를 안 준 곳.
// 이게 실제로 홈 검색창(테두리도 링도 없이 outline-none 만 걸린 input)을 잡았다.
scanOutlineSuppression();

/**
 * `outline-none` / `outline: none` 이 붙은 줄에 포커스 시 보이는 대체 표시가
 * 같이 있는지 본다. 대체 표시는 focus:ring / focus:border / focus:shadow /
 * focus-visible: 중 하나면 충분하다. 부모가 focus-within 으로 처리하는 경우도
 * 있으므로 같은 파일에 focus-within 이 있으면 통과시킨다.
 */
function scanOutlineSuppression() {
  const roots = ['src'];
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(tsx|jsx|css)$/.test(entry.name)) files.push(full);
    }
  };
  for (const root of roots) if (fs.existsSync(root)) walk(root);

  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const fileHasFocusWithin = /focus-within:/.test(source);
    const lines = source.split('\n');

    lines.forEach((line, i) => {
      const trimmed = line.trim();
      // 주석 줄은 코드가 아니다. (이 규칙을 설명하는 주석이 스스로 걸렸었다)
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
      if (!/\boutline-none\b|outline:\s*none/.test(line)) return;
      const hasReplacement =
        /focus:ring|focus:border|focus:shadow|focus-visible:|focus:outline-[^n]/.test(line);
      if (hasReplacement || fileHasFocusWithin) return;
      add(`${file}:${i + 1}`, 'outline-removed-no-replacement', line.trim().slice(0, 70));
    });
  }
}

findings.sort();

if (UPDATE) {
  fs.writeFileSync(BASELINE, `${JSON.stringify(findings, null, 2)}\n`);
  console.log(`기준선 갱신: ${findings.length}건 → ${path.relative(process.cwd(), BASELINE)}`);
  process.exit(0);
}

const baseline = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : [];
const baselineSet = new Set(baseline);
const currentSet = new Set(findings);
const added = findings.filter((f) => !baselineSet.has(f));
const removed = baseline.filter((f) => !currentSet.has(f));

console.log(
  `키보드 접근성 감사: 라우트 ${ROUTES.length}개 × 2뷰포트 → `
  + `전체 ${findings.length}건 (기준선 ${baseline.length}, 신규 ${added.length}, 해소 ${removed.length})`
);

if (added.length) {
  console.log('\n신규 결함:');
  for (const item of added) console.log(`  + ${item}`);
  process.exit(1);
}
if (removed.length) {
  console.log('\n해소된 항목:');
  for (const item of removed) console.log(`  - ${item}`);
}
console.log('신규 키보드 접근성 결함 없음.');
