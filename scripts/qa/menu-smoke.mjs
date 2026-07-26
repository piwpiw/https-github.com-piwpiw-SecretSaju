// Runtime menu smoke test: visit each route at a mobile viewport, capture
// console errors, uncaught page exceptions, failed requests, and final status.
// Usage: node scripts/qa/menu-smoke.mjs [baseUrl]
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://localhost:3000';
const ROUTES = process.env.ROUTES
  ? process.env.ROUTES.split(',').map((s) => s.trim()).filter(Boolean)
  : ['/'];

const IGNORE = [
  /Download the React DevTools/i,
  /\[PWA\]/i,
  /Fast Refresh/i,
  /favicon/i,
  /transparenttextures/i, // legacy, already removed
  // Environmental: this sandbox has no outbound network to third-party hosts,
  // so external asset/API requests fail. Not an app bug — the app degrades.
  /ERR_TUNNEL_CONNECTION_FAILED/i,
  /Failed to load resource/i,
  /api\.open-meteo\.com/i,
  /assets\.mixkit\.co/i,
];

function ignorable(text) {
  return IGNORE.some((re) => re.test(text));
}

const results = [];

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PW_CHROMIUM || undefined,
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
});

for (const route of ROUTES) {
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedReqs = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error' && !ignorable(msg.text())) {
      consoleErrors.push(msg.text().slice(0, 300));
    }
  });
  page.on('pageerror', (err) => {
    if (!ignorable(String(err))) pageErrors.push(String(err.message || err).slice(0, 300));
  });
  page.on('requestfailed', (req) => {
    const f = req.failure();
    const url = req.url();
    if (!ignorable(url) && !url.startsWith('data:')) {
      failedReqs.push(`${req.method()} ${url.slice(0, 120)} — ${f?.errorText || ''}`);
    }
  });

  let status = 0;
  let navError = null;
  try {
    const resp = await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 45000 });
    status = resp ? resp.status() : 0;
    // let client render + effects settle
    await page.waitForTimeout(1500);
    // detect Next.js error overlay / error boundary text
    const bodyText = await page.evaluate(() => document.body?.innerText || '');
    const hasErrorOverlay = /Application error|Unhandled Runtime Error|This page could not be found|500 \|/i.test(
      bodyText,
    );
    if (hasErrorOverlay) pageErrors.push('ERROR_OVERLAY/BOUNDARY: ' + bodyText.slice(0, 160).replace(/\n/g, ' '));
  } catch (e) {
    navError = String(e.message || e).slice(0, 200);
  }

  const ok = status === 200 && pageErrors.length === 0 && consoleErrors.length === 0 && !navError;
  results.push({ route, status, ok, navError, pageErrors, consoleErrors, failedReqs });
  await page.close();
}

await browser.close();

let bad = 0;
for (const r of results) {
  const tag = r.ok ? 'OK  ' : 'FAIL';
  if (!r.ok) bad++;
  console.log(`${tag} ${r.status || '---'} ${r.route}`);
  if (r.navError) console.log(`      navError: ${r.navError}`);
  r.pageErrors.forEach((e) => console.log(`      pageError: ${e}`));
  r.consoleErrors.forEach((e) => console.log(`      consoleError: ${e}`));
  r.failedReqs.forEach((e) => console.log(`      reqFailed: ${e}`));
}
console.log(`\n=== ${results.length - bad}/${results.length} OK, ${bad} FAIL ===`);
process.exit(bad > 0 ? 1 : 0);
