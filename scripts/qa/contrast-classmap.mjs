// 저대비 요소를 "어떤 클래스·어떤 배경 때문인지"로 집계하는 진단 도구.
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

    // 배경이 밝은지 어두운지가 고칠 대상을 가른다.
    // - 밝은 배경 + 밝은 글자 → 글자를 토큰으로 바꾼다
    // - 어두운 배경 + 어두운 글자 → 배경이 테마를 안 따르는 것이다(배경을 고친다)
    const bgLum = L(b);
    const bgKind = bgLum > 0.5 ? '밝은배경' : '어두운배경';
    // 배경을 칠한 조상의 클래스도 남긴다
    let owner = el; let bgCls = '(?)';
    while (owner && owner !== document.documentElement.parentElement) {
      const lay = pc(getComputedStyle(owner).backgroundColor);
      if (lay && lay.a > 0.5) {
        bgCls = (typeof owner.className === 'string' ? owner.className : '')
          .split(/\s+/).filter((c) => /^(bg-|from-|to-)/.test(c)).join(' ') || '(인라인/상속)';
        break;
      }
      owner = owner.parentElement;
    }

    out.push({
      cls: cls.join(' ') || '(클래스 없음)',
      ratio: Math.round(ratio * 100) / 100,
      color: s.color,
      bgKind,
      bgCls,
    });
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
    const key = `${item.bgKind} | ${item.cls}`;
    const cur = byClass.get(key) || { n: 0, worst: 99, color: item.color, bgs: new Map() };
    cur.n += 1;
    cur.worst = Math.min(cur.worst, item.ratio);
    cur.bgs.set(item.bgCls, (cur.bgs.get(item.bgCls) || 0) + 1);
    byClass.set(key, cur);
  }
}
await browser.close();

const rows = [...byClass.entries()].sort((a, b) => b[1].n - a[1].n);
console.log(`테마 ${THEME} — 저대비 원인 (상위 20개)\n`);
for (const [key, v] of rows.slice(0, 20)) {
  const topBg = [...v.bgs.entries()].sort((a, b) => b[1] - a[1])[0];
  console.log(`${String(v.n).padStart(4)}회 최악 ${String(v.worst).padStart(5)}:1  ${key}`);
  console.log(`        글자 ${v.color} / 배경클래스 ${topBg ? topBg[0].slice(0, 60) : '?'}`);
}

const dark = rows.filter(([k]) => k.startsWith('어두운배경')).reduce((s, [, v]) => s + v.n, 0);
const light = rows.filter(([k]) => k.startsWith('밝은배경')).reduce((s, [, v]) => s + v.n, 0);
console.log(`\n밝은 배경 위(글자를 고칠 것): ${light}건`);
console.log(`어두운 배경 위(배경이 테마를 안 따름): ${dark}건`);
