// Interaction-level smoke test: goes beyond "does the page load" by actually
// filling the primary inputs and clicking the primary action on each page,
// then checking that something happened and nothing broke.
//
// Usage: ROUTES="/dreams,/naming" node scripts/qa/interaction-smoke.mjs [baseUrl]
//
// Safety: never clicks destructive or payment-triggering controls (see DENY).
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://localhost:3100';
const ROUTES = (process.env.ROUTES || '/').split(',').map((s) => s.trim()).filter(Boolean);

// Console/request noise that is environmental, not an app defect.
const IGNORE = [
  /Download the React DevTools/i,
  /\[PWA\]/i,
  /favicon/i,
  /ERR_TUNNEL_CONNECTION_FAILED/i,
  /Failed to load resource/i,
  /api\.open-meteo\.com/i,
  /assets\.mixkit\.co/i,
  /ERR_ABORTED/i, // RSC prefetch cancellation on navigation
];

// Never click these — destructive, payment, or navigation-away actions.
const DENY = /삭제|탈퇴|로그아웃|결제|구매|충전|해금|멤버십|취소|나가기|로그인|회원가입|공유|저장|다운로드/;

// Buttons that represent "run the main feature".
const ACTION = /분석|시작|확인|제출|보기|뽑기|계산|해석|검색|찾기|생성|실행|다음|조회/;

function ignorable(t) {
  return IGNORE.some((re) => re.test(t));
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

  page.on('console', (m) => {
    if (m.type() === 'error' && !ignorable(m.text())) consoleErrors.push(m.text().slice(0, 200));
  });
  page.on('pageerror', (e) => {
    const s = String(e?.message || e);
    if (!ignorable(s)) pageErrors.push(s.slice(0, 200));
  });

  const r = { route, filled: 0, clicked: null, changed: false, consoleErrors, pageErrors, note: '' };

  try {
    await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(800);

    const before = (await page.evaluate(() => document.body.innerText)) || '';

    // 1) Fill visible text inputs / textareas with plausible sample data.
    r.filled = await page.evaluate(() => {
      const setVal = (el, v) => {
        const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement : HTMLInputElement;
        const setter = Object.getOwnPropertyDescriptor(proto.prototype, 'value').set;
        setter.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      const visible = (el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && !el.disabled && !el.readOnly;
      };
      let n = 0;
      for (const el of document.querySelectorAll('input, textarea')) {
        if (!visible(el)) continue;
        const type = (el.getAttribute('type') || 'text').toLowerCase();
        if (['checkbox', 'radio', 'file', 'submit', 'button', 'hidden'].includes(type)) continue;
        const ph = ((el.placeholder || '') + ' ' + (el.getAttribute('aria-label') || '')).toLowerCase();
        let v = '테스트';
        if (type === 'email' || /이메일|email|@/.test(ph)) v = 'test@example.com';
        else if (type === 'number' || /\d/.test(ph)) {
          if (/1~12|월/.test(ph)) v = '5';
          else if (/1~31|일/.test(ph)) v = '15';
          else if (/19|연도|년/.test(ph)) v = '1990';
          else v = '10';
        } else if (/꿈|내용|상세|메시지|문의/.test(ph)) v = '큰 나무 아래에서 맑은 물을 마시는 꿈을 꿨습니다.';
        else if (/한자/.test(ph)) v = '金';
        else if (/이름|성함|홍길동/.test(ph)) v = '홍길동';
        else if (/검색|용어|찾기/.test(ph)) v = '사주';
        setVal(el, v);
        n++;
      }
      return n;
    });

    await page.waitForTimeout(400);

    // 2) Click the primary action button (safe ones only).
    const clicked = await page.evaluate(
      ({ actionSrc, denySrc }) => {
        const ACTION = new RegExp(actionSrc);
        const DENY = new RegExp(denySrc);
        const visible = (el) => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && !el.disabled;
        };
        const btns = Array.from(document.querySelectorAll('button')).filter(visible);
        const target = btns.find((b) => {
          const t = (b.textContent || '').trim();
          return t && ACTION.test(t) && !DENY.test(t);
        });
        if (!target) return null;
        const label = (target.textContent || '').trim().slice(0, 40);
        target.click();
        return label;
      },
      { actionSrc: ACTION.source, denySrc: DENY.source },
    );
    r.clicked = clicked;

    if (clicked) {
      await page.waitForTimeout(3500);
      const after = (await page.evaluate(() => document.body.innerText)) || '';
      r.changed = after !== before;
      if (!r.changed) r.note = 'clicked but page content did not change';
    } else {
      r.note = 'no safe primary action button found (informational page?)';
    }
  } catch (e) {
    r.pageErrors.push('NAV/DRIVE: ' + String(e?.message || e).slice(0, 200));
  }

  results.push(r);
  await page.close();
}

await browser.close();

let bad = 0;
for (const r of results) {
  const broken = r.pageErrors.length > 0 || r.consoleErrors.length > 0;
  if (broken) bad++;
  const status = broken ? 'ERROR' : r.clicked ? (r.changed ? 'WORKS' : 'NOCHG') : 'STATIC';
  console.log(`${status.padEnd(6)} ${r.route}  [inputs:${r.filled}]${r.clicked ? ` click:"${r.clicked}"` : ''}`);
  if (r.note) console.log(`         note: ${r.note}`);
  r.pageErrors.forEach((e) => console.log(`         pageError: ${e}`));
  r.consoleErrors.forEach((e) => console.log(`         consoleError: ${e}`));
}
console.log(`\n=== ${results.length - bad}/${results.length} clean, ${bad} with errors ===`);
process.exit(bad > 0 ? 1 : 0);
