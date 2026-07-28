// 로딩·빈 데이터 상태 감사
//
// 다른 가드는 "다 불러온 뒤"의 화면만 본다. 실제로 사람들이 불평하는 건
// 그 전후다:
//  - 느린 네트워크에서 화면이 그냥 하얗게/까맣게 비어 있는가 (스켈레톤 없음)
//  - 저장된 데이터가 하나도 없을 때 안내 없이 텅 비어 있는가 (빈 상태 없음)
//  - API 가 실패했을 때 아무 말 없이 멈춰 있는가
//
// Usage: node scripts/qa/state-audit.mjs [baseUrl] [--update-baseline]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const BASE = args.find((a) => !a.startsWith('--')) || 'http://localhost:3000';
const UPDATE = args.includes('--update-baseline');
const BASELINE = path.join(dir, 'state-audit-baseline.json');

const ROUTES = JSON.parse(fs.readFileSync(path.join(dir, 'menu-routes.json'), 'utf8'));

/** 사용자가 저장한 데이터를 보여주는 화면들 — 빈 상태 안내가 있어야 한다 */
const DATA_ROUTES = [
  '/analysis-history',
  '/history',
  '/my-saju/list',
  '/mypage',
  '/dashboard',
  '/relationship',
];

const findings = [];
const add = (route, kind, detail) => findings.push(`${route} | ${kind} | ${detail}`);

/** 화면에 실제로 보이는 글자 수 (숨김 요소 제외) */
const VISIBLE_TEXT = () => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let total = 0;
  let node = walker.nextNode();
  while (node) {
    const parent = node.parentElement;
    if (parent) {
      const style = getComputedStyle(parent);
      const rect = parent.getBoundingClientRect();
      const hidden =
        style.display === 'none'
        || style.visibility === 'hidden'
        || parseFloat(style.opacity) === 0
        || parent.closest('[aria-hidden="true"]')
        || rect.width === 0
        || rect.height === 0;
      if (!hidden) total += (node.textContent || '').trim().length;
    }
    node = walker.nextNode();
  }
  return total;
};

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PW_CHROMIUM || undefined,
});

// ── 1. 느린 네트워크: 데이터가 도착하기 전에 뭔가 보여주는가 ──────────────
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  // 앱 자체 API 응답만 3초씩 늦춘다. 정적 자산은 그대로 둬야 화면은 그려진다.
  await page.route('**/api/**', async (route) => {
    await new Promise((resolve) => { setTimeout(resolve, 3000); });
    await route.continue();
  });

  for (const route of ROUTES) {
    try {
      await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    } catch {
      continue;
    }
    // 정적 렌더는 끝났지만 API 는 아직 오는 중인 시점
    await page.waitForTimeout(1500);

    const state = await page.evaluate((visibleTextFn) => {
      // eslint-disable-next-line no-new-func
      const count = new Function(`return (${visibleTextFn})()`)();
      const hasSkeleton = !!document.querySelector(
        '[class*="skeleton"], [class*="animate-pulse"], [role="status"], [aria-busy="true"], [class*="spinner"], [class*="loading"]'
      );
      return { count, hasSkeleton };
    }, VISIBLE_TEXT.toString());

    // 글자가 거의 없고 로딩 표시도 없으면 사용자 입장에서는 그냥 빈 화면이다
    if (state.count < 40 && !state.hasSkeleton) {
      add(route, 'slow-network-blank', `보이는 글자 ${state.count}자, 로딩 표시 없음`);
    }
  }

  await context.close();
}

// ── 2. 빈 데이터: 저장된 게 없을 때 안내가 있는가 ────────────────────────
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  // 저장소를 비운 상태로 진입시킨다
  await page.addInitScript(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      /* 접근 불가면 그대로 둔다 */
    }
  });

  for (const route of DATA_ROUTES) {
    if (!ROUTES.includes(route)) continue;
    try {
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 30000 });
    } catch {
      continue;
    }
    await page.waitForTimeout(1500);

    // 처음에는 "없습니다|아직|먼저…" 같은 한국어 문구를 찾아 판정했는데,
    // /mypage 의 "로그인해 주세요"와 /analysis-history 의 안내문을 둘 다 놓쳐
    // 오탐이 났다. 문구를 맞히려 들 게 아니라, 진짜 결함 조건 —
    // 본문이 사실상 비어 있고 다음 행동도 없음 — 만 본다.
    const state = await page.evaluate((visibleTextFn) => {
      const scope = document.querySelector('main') || document.body;
      // eslint-disable-next-line no-new-func
      const totalVisible = new Function(`return (${visibleTextFn})()`)();
      const mainText = (scope.innerText || '').trim();

      const ctas = Array.from(scope.querySelectorAll('a, button')).filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && (el.textContent || '').trim().length > 1;
      });

      return { totalVisible, mainLength: mainText.length, ctaCount: ctas.length };
    }, VISIBLE_TEXT.toString());

    // 본문 글자가 40자 미만이면 사람 눈에는 그냥 빈 화면이다.
    if (state.mainLength < 40) {
      add(route, 'empty-state-missing', `저장 데이터 0건일 때 본문이 사실상 비어 있음 (본문 ${state.mainLength}자)`);
    }
    if (state.ctaCount === 0) {
      add(route, 'empty-state-no-cta', '빈 화면에서 다음에 뭘 할지 누를 것이 없음');
    }
  }

  await context.close();
}

// ── 3. API 실패: 아무 말 없이 멈추지 않는가 ──────────────────────────────
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.route('**/api/**', (route) => route.abort('failed'));

  for (const route of DATA_ROUTES) {
    if (!ROUTES.includes(route)) continue;
    try {
      await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    } catch {
      continue;
    }
    await page.waitForTimeout(2500);

    const stuck = await page.evaluate(() => {
      const body = document.body.innerText || '';
      const stillSpinning = !!document.querySelector(
        '[class*="animate-pulse"], [role="status"], [aria-busy="true"], [class*="spinner"]'
      );
      const saysSomething = /실패|오류|다시|없습니다|없어요|문제|잠시/.test(body);
      return stillSpinning && !saysSomething;
    });

    if (stuck) add(route, 'api-failure-stuck-spinner', 'API 실패 후에도 로딩 표시만 계속됨');
  }

  await context.close();
}

await browser.close();

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
  `상태 감사(로딩/빈데이터/실패): 라우트 ${ROUTES.length}개 → `
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
console.log('신규 상태 결함 없음.');
