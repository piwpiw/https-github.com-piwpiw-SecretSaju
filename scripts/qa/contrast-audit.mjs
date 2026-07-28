// 명암비 감사 — 다크/라이트 두 테마에서 글자가 읽히는지 본다.
//
// 이 앱에는 테마 토글이 있는데, 색은 대부분 다크 기준으로 골라져 있다.
// 라이트로 바꾸면 연한 회색 글자가 흰 배경 위에 얹히는 식으로 조용히
// 안 보이게 되는 곳이 생긴다. 예외도 안 나고 스크린샷도 그럴듯해서
// 눈으로는 놓치기 쉽다.
//
// WCAG 2.1 AA: 본문 4.5:1, 큰 글자(18.66px 이상 굵거나 24px 이상) 3:1
//
// Usage: node scripts/qa/contrast-audit.mjs [baseUrl] [--update-baseline]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const BASE = args.find((a) => !a.startsWith('--')) || 'http://localhost:3000';
const UPDATE = args.includes('--update-baseline');
const BASELINE = path.join(dir, 'contrast-audit-baseline.json');

const ROUTES = JSON.parse(fs.readFileSync(path.join(dir, 'menu-routes.json'), 'utf8'));

const findings = [];
const add = (route, kind, detail) => findings.push(`${route} | ${kind} | ${detail}`);

/**
 * 페이지 안에서 실행되는 검사기.
 * 실제로 칠해지는 배경색을 찾기 위해 조상을 거슬러 올라간다.
 */
const CHECK = () => {
  const parseColor = (value) => {
    const m = /rgba?\(([^)]+)\)/.exec(value || '');
    if (!m) return null;
    const parts = m[1].split(',').map((n) => parseFloat(n));
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
  };

  const relLuminance = ({ r, g, b }) => {
    const conv = (c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * conv(r) + 0.7152 * conv(g) + 0.0722 * conv(b);
  };

  const ratio = (fg, bg) => {
    const l1 = relLuminance(fg);
    const l2 = relLuminance(bg);
    const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
    return (hi + 0.05) / (lo + 0.05);
  };

  /**
   * fg 를 bg 위에 얹는다 (source-over).
   *
   * 결과 알파를 1 로 못박아 뒀다가 크게 틀렸다. 반투명 레이어 두 장을 겹치면
   * 두 번째에서 알파가 1 이 돼 버려 탐색이 멈췄고, 어두운 페이지인데 배경이
   * 흰색으로 잡혀 흰 글자가 1.05:1 로 보고됐다. 알파도 제대로 합성한다.
   */
  const blend = (fg, bg) => {
    const a = fg.a + bg.a * (1 - fg.a);
    if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
    return {
      r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a,
      g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a,
      b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a,
      a,
    };
  };

  /**
   * 조상을 거슬러 실제로 칠해지는 배경을 찾는다.
   * 불투명해질 때까지 레이어를 차곡차곡 합성한다.
   */
  const effectiveBg = (el) => {
    let node = el;
    let acc = { r: 0, g: 0, b: 0, a: 0 };
    while (node && node !== document.documentElement.parentElement) {
      const layer = parseColor(getComputedStyle(node).backgroundColor);
      if (layer && layer.a > 0) {
        acc = blend(acc, layer);
        if (acc.a >= 0.99) return acc;
      }
      node = node.parentElement;
    }
    // 끝까지 불투명해지지 않으면 판정할 수 없다 (배경 이미지·그라데이션 등).
    return null;
  };

  const out = [];
  const seen = new Set();

  for (const el of Array.from(document.querySelectorAll('p, span, a, button, li, h1, h2, h3, h4, label, td, th'))) {
    // 자기 자신이 직접 가진 텍스트만 본다 (자식 텍스트 중복 방지)
    const own = Array.from(el.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent.trim())
      .join('')
      .trim();
    if (own.length < 2) continue;

    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) continue;
    if (rect.bottom < 0 || rect.top > window.innerHeight * 3) continue;

    // 비활성 컨트롤은 WCAG 1.4.3 명시적 예외다. 흐리게 보이는 게 의도다.
    if (el.closest('[disabled], [aria-disabled="true"]')) continue;

    const style = getComputedStyle(el);
    if (style.visibility === 'hidden' || style.display === 'none') continue;
    const opacity = parseFloat(style.opacity);
    if (opacity === 0) continue;
    if (el.closest('[aria-hidden="true"]')) continue;
    // 장식용 그라데이션 텍스트는 색이 배경 클립이라 계산이 무의미하다
    if (style.webkitTextFillColor === 'rgba(0, 0, 0, 0)') continue;
    if (style.backgroundClip === 'text' || style.webkitBackgroundClip === 'text') continue;

    const fgRaw = parseColor(style.color);
    if (!fgRaw) continue;
    const bg = effectiveBg(el);
    // 배경을 확정할 수 없으면 판정하지 않는다. 추측해서 보고하면 오탐이 된다.
    if (!bg) continue;
    // 부모의 opacity 도 사실상 전경을 흐리게 한다
    const fg = blend({ ...fgRaw, a: fgRaw.a * opacity }, bg);

    const size = parseFloat(style.fontSize);
    const weight = parseInt(style.fontWeight, 10) || 400;
    const isLarge = size >= 24 || (size >= 18.66 && weight >= 700);
    const required = isLarge ? 3 : 4.5;

    const value = ratio(fg, bg);
    if (value >= required) continue;

    // 같은 색·크기 조합은 한 번만 보고한다
    const key = `${style.color}|${Math.round(size)}|${weight}`;
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({
      text: own.slice(0, 24),
      ratio: Math.round(value * 100) / 100,
      required,
      size: Math.round(size),
      color: style.color,
    });
    // 라우트당 상한. 6 으로 두었더니 모든 라우트가 상한에 걸려서, 총합이
    // "실제 결함 수"가 아니라 "상한 × 라우트 수"가 됐다. 고쳐도 숫자가 안
    // 움직이거나, 하나 고치면 가려져 있던 게 튀어나와 신규로 잡혔다.
    // 색·크기 조합으로 이미 중복을 걸러내므로 넉넉히 둬도 폭발하지 않는다.
    if (out.length >= 40) break;
  }
  return out;
};

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PW_CHROMIUM || undefined,
});

/** THEMES 의 각 테마가 실제로 적용됐는지 확인할 때 쓰는 --background 값 */
const THEME_BACKGROUND = { dark: '#0a0a0f', light: '#f8fafc', readable: '#ffffff' };

for (const theme of Object.keys(THEME_BACKGROUND)) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    colorScheme: theme === 'dark' ? 'dark' : 'light',
  });
  await context.addInitScript((value) => {
    try {
      localStorage.setItem('theme', value);
    } catch {
      /* 접근 불가면 건너뛴다 */
    }
  }, theme);

  const page = await context.newPage();
  let verified = false;

  for (const route of ROUTES) {
    try {
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 30000 });
    } catch {
      continue;
    }
    await page.waitForTimeout(1400); // 인트로 스플래시가 걷힐 시간

    // 테마가 진짜 걸렸는지 한 번은 확인한다.
    // 예전엔 확인 없이 돌려서, 앱이 저장값을 덮어쓰는 바람에 다크를 두 번 재고
    // 그중 절반을 "라이트"라고 이름 붙여 보고했다.
    if (!verified) {
      const applied = await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--background').trim().toLowerCase()
      );
      if (applied !== THEME_BACKGROUND[theme]) {
        console.log(
          `  (건너뜀) ${theme} 테마가 적용되지 않았다: --background=${applied}, 기대 ${THEME_BACKGROUND[theme]}`
        );
        break;
      }
      verified = true;
    }

    const low = await page.evaluate(CHECK);
    for (const item of low) {
      // 시계·카운터처럼 숫자가 매번 바뀌는 텍스트가 있어 기준선이 흔들렸다
      // ("오전 03:01"). 숫자는 자리만 남긴다.
      const stableText = item.text.replace(/\d/g, '#');
      add(
        `${route} (${theme})`,
        'low-contrast',
        `"${stableText}" ${item.ratio}:1 (필요 ${item.required}:1, ${item.size}px, ${item.color})`
      );
    }
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
  `명암비 감사: 라우트 ${ROUTES.length}개 × 다크/라이트 → `
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
console.log('신규 명암비 결함 없음.');
