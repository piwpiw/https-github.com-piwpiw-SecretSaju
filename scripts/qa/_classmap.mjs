// 라이트 테마에서 저대비인 요소를 "어떤 Tailwind 클래스 때문인지"로 집계한다.
// 648건을 하나씩 고칠 수는 없으니, 반복되는 원인 클래스를 찾아 거기서 고친다.
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.argv[2] || 'http://127.0.0.1:3210';
const THEME = process.argv[3] || 'light';
const ROUTES = JSON.parse(fs.readFileSync('scripts/qa/menu-routes.json', 'utf8'));

const COLLECT = () => {
  const pc = (v) => {
    const m = /rgba?\(([^)]+)\)/.exec(v || '');
    if (!m) return null;
    const p = m[1].split(',').map(parseFloat);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const cv = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  const L = (c) => 0.2126 * cv(c.r) + 0.7152 * cv(c.g) + 0.0722 * cv(c.b);
  const bl = (f, b) => {
    const a = f.a + b.a * (1 - f.a);
    if (!a) return { r: 0, g: 0, b: 0, a: 0 };
    return {
      r: (f.r * f.a + b.r * b.a * (1 - f.a)) / a,
      g: (f.g * f.a + b.g * b.a * (1 - f.a)) / a,
      b: (f.b * f.a + b.b * b.a * (1 - f.a)) / a,
      a,
    };
  };
  const eb = (el) => {
    let n = el; let acc = { r: 0, g: 0, b: 0, a: 0 };
    while (n && n !== document.documentElement.parentElement) {
      const l = pc(getComputedStyle(n).backgroundColor);
      if (l && l.a > 0) { acc = bl(acc, l); if (acc.a >= 0.99) return acc; }
      n = n.parentElement;
    }
    return null;
  };

  const out = [];
  for (const el of document.querySelectorAll('p,span,a,button,h1,h2,h3,h4,li,label,td,th,div')) {
    const own = Array.from(el.childNodes).filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim()).join('').trim();
    if (own.length < 2) continue;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) continue;
    if (el.closest('[disabled],[aria-disabled="true"],[aria-hidden="true"]')) continue;
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none' || +s.opacity === 0) continue;
    if (s.webkitTextFillColor === 'rgba(0, 0, 0, 0)') continue;
    if (s.backgroundClip === 'text' || s.webkitBackgroundClip === 'text') continue;
    const f = pc(s.color); const b = eb(el);
    if (!f || !b) continue;
    const fg = bl({ ...f, a: f.a * (+s.opacity) }, b);
    const l1 = L(fg); const l2 = L(b);
    const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
    const ratio = (hi + 0.05) / (lo + 0.05);
    const size = parseFloat(s.fontSize);
    const weight = parseInt(s.fontWeight, 10) || 400;
    const required = (size >= 24 || (size >= 18.66 && weight >= 700)) ? 3 : 4.5;
    if (ratio >= required) continue;

    // 글자색을 정하는 Tailwind 클래스만 골라낸다
    const cls = (typeof el.className === 'string' ? el.className : '').split(/\s+/)
      .filter((c) => /^(text-|placeholder:text-)/.test(c) && !/^text-(xs|sm|base|lg|xl|\[|left|right|center|justify)/.test(c));
    out.push({ cls: cls.join(' ') || '(클래스 없음)', ratio: Math.round(ratio * 100) / 100, color: s.color });
  }
  return out;
};

const browser = await chromium.launch({ headless: true, executablePath: process.env.PW_CHROMIUM });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.addInitScript((v) => { try { localStorage.setItem('theme', v); } catch { /* noop */ } }, THEME);
const page = await ctx.newPage();

const byClass = new Map();
for (const route of ROUTES) {
  try {
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 30000 });
  } catch { continue; }
  await page.waitForTimeout(1200);
  for (const item of await page.evaluate(COLLECT)) {
    const cur = byClass.get(item.cls) || { n: 0, worst: 99, color: item.color };
    cur.n += 1;
    cur.worst = Math.min(cur.worst, item.ratio);
    byClass.set(item.cls, cur);
  }
}
await browser.close();

const rows = [...byClass.entries()].sort((a, b) => b[1].n - a[1].n);
console.log(`테마 ${THEME} — 저대비 원인 클래스 (상위 25개)\n`);
for (const [cls, v] of rows.slice(0, 25)) {
  console.log(`${String(v.n).padStart(4)}회  최악 ${String(v.worst).padStart(5)}:1  ${v.color.padEnd(20)} ${cls}`);
}
console.log(`\n총 ${rows.reduce((s, [, v]) => s + v.n, 0)}건 / 서로 다른 클래스 조합 ${rows.length}개`);
