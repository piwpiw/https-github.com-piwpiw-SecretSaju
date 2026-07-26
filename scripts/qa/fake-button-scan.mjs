// Scans every route for elements that LOOK clickable (cursor:pointer + visible
// label text) but are not real interactive controls — i.e. not a button/link/
// input, no role=button, no tabindex, and no interactive ancestor.
//
// Such elements are either dead (a click does nothing at all — see the /shop
// "이 플랜 선택" case) or, at best, mouse-only: unreachable by keyboard and
// not announced as controls to screen readers. Both are real defects.
//
// Usage: ROUTES="/,/shop" node scripts/qa/fake-button-scan.mjs [baseUrl]
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://localhost:3000';
const ROUTES = (process.env.ROUTES || '/').split(',').map((s) => s.trim()).filter(Boolean);

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PW_CHROMIUM || undefined,
});
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });

const findings = [];

for (const route of ROUTES) {
  const page = await context.newPage();
  try {
    await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(1200);

    const hits = await page.evaluate(() => {
      const INTERACTIVE = 'a, button, input, select, textarea, summary, [role="button"], [role="link"], [role="tab"], [role="option"], [role="checkbox"], [role="radio"], [role="switch"], [tabindex]';
      const out = [];
      for (const el of document.querySelectorAll('*')) {
        // Must look clickable.
        if (getComputedStyle(el).cursor !== 'pointer') continue;
        // Must be visible and have its own short label text (a CTA, not a wrapper).
        const rect = el.getBoundingClientRect();
        if (rect.width < 24 || rect.height < 16) continue;
        const text = (el.textContent || '').trim();
        if (!text || text.length > 60) continue;
        // Real controls are fine.
        if (el.matches(INTERACTIVE)) continue;
        // Inside a real control is fine (the control handles click + keyboard).
        if (el.closest(INTERACTIVE)) continue;
        // A <label> bound to a control is fine.
        if (el.tagName === 'LABEL' && (el.getAttribute('for') || el.querySelector('input, select, textarea'))) continue;
        out.push({ tag: el.tagName, text: text.slice(0, 50) });
      }
      // De-duplicate nested reports of the same label.
      const seen = new Set();
      return out.filter((h) => {
        const k = h.tag + '|' + h.text;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
    });

    if (hits.length) findings.push({ route, hits });
    console.log(`${hits.length ? 'SUSPECT' : 'clean  '} ${route}${hits.length ? `  (${hits.length})` : ''}`);
    hits.forEach((h) => console.log(`          <${h.tag}> "${h.text}"`));
  } catch (e) {
    console.log(`ERROR   ${route}  ${String(e?.message || e).slice(0, 120)}`);
  }
  await page.close();
}

await browser.close();

const total = findings.reduce((n, f) => n + f.hits.length, 0);
console.log(`\n=== ${findings.length} route(s) with suspects, ${total} element(s) total ===`);
