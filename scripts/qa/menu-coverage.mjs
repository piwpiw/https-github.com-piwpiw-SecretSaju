#!/usr/bin/env node
/**
 * 메뉴 커버리지 검사.
 *
 * 배경: 구현된 화면이 54개인데 상단 내비게이션에는 6개만 있었고, 타로·토정비결·
 * 작명·손금 같은 기능이 홈 캐러셀 안에만 있어 "메뉴에 없다 = 없는 기능"처럼
 * 보였습니다. 이 스크립트는 실제 라우트와 메뉴 정본(src/config/site-menu.ts)을
 * 대조해, 어느 쪽에도 등록되지 않은 화면이 생기면 실패합니다.
 *
 * 사용법: node scripts/qa/menu-coverage.mjs
 */
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const APP_DIR = 'src/app';
const MENU_FILE = 'src/config/site-menu.ts';

function collectRoutes(dir, base = '') {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...collectRoutes(full, `${base}/${entry}`));
    } else if (entry === 'page.tsx') {
      out.push(base === '' ? '/' : base);
    }
  }
  return out;
}

const routes = collectRoutes(APP_DIR)
  // API 라우트, 관리자 화면, 동적 세그먼트는 사용자 메뉴 대상이 아니다.
  .filter((r) => !r.startsWith('/api') && !r.startsWith('/admin') && !r.includes('['))
  .sort();

const menuSource = readFileSync(MENU_FILE, 'utf8');
const declared = new Set(
  [...menuSource.matchAll(/href:\s*'([^']+)'/g)].map((m) => m[1]),
);
const nonMenu = new Set(
  [...menuSource.matchAll(/^\s*'(\/[^']*)',\s*$/gm)].map((m) => m[1]),
);

const missing = routes.filter((r) => !declared.has(r) && !nonMenu.has(r));
const stale = [...declared].filter((h) => !routes.includes(h));

for (const r of missing) console.log(`MISSING  ${r}  — 메뉴에 없음 (SITE_MENU 또는 NON_MENU_ROUTES에 등록 필요)`);
for (const h of stale) console.log(`STALE    ${h}  — 메뉴에는 있으나 실제 페이지가 없음`);

console.log(
  `\n라우트 ${routes.length}개 / 메뉴 등록 ${declared.size}개 / 메뉴 제외 ${nonMenu.size}개 ` +
    `→ 누락 ${missing.length}, 유령 ${stale.length}`,
);

if (missing.length || stale.length) process.exit(1);
console.log('메뉴 커버리지 정상: 모든 화면이 메뉴에 노출되거나 명시적으로 제외되어 있습니다.');
