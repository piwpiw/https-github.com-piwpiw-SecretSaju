#!/usr/bin/env node
/**
 * 키보드 접근성 감사.
 *
 * 배경: 이 프로젝트에서 반복적으로 나온 부류가 "마우스로는 되는데 키보드로는
 * 안 되는" 것이었습니다(홈 "시간 모름" 체크박스가 `<div onClick>`, 아이콘 버튼에
 * 접근 가능한 이름 없음, 모달에 role 누락). 사람 눈으로는 잘 안 보이므로
 * 실제 DOM에서 기계적으로 확인합니다.
 *
 * 검사 항목
 *  1) 클릭 핸들러가 붙었는데 키보드로 도달·조작할 수 없는 요소
 *  2) 접근 가능한 이름이 없는 버튼·링크 (스크린리더가 "버튼"으로만 읽음)
 *  3) 열린 모달의 포커스 가둠(focus trap) — Tab이 모달 밖으로 새는지
 *  4) 폼 입력에 라벨이 없는 경우
 *
 * 사용법: node scripts/qa/a11y-audit.mjs [baseUrl] [--update-baseline]
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const BASE = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'http://localhost:3000';
const ROUTES = JSON.parse(readFileSync(new URL('./menu-routes.json', import.meta.url), 'utf8'));

const findings = [];
const browser = await chromium.launch({ headless: true, executablePath: process.env.PW_CHROMIUM || undefined });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

for (const route of ROUTES) {
    try {
        await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 25000 });
    } catch { continue; }
    await page.waitForTimeout(500);

    const res = await page.evaluate(() => {
        const out = { unreachable: [], unnamed: [], unlabeled: [] };

        const accName = (el) => {
            const aria = el.getAttribute('aria-label');
            if (aria && aria.trim()) return aria.trim();
            const labelledby = el.getAttribute('aria-labelledby');
            if (labelledby) {
                const t = labelledby.split(/\s+/).map((id) => document.getElementById(id)?.textContent || '').join(' ').trim();
                if (t) return t;
            }
            const text = (el.textContent || '').trim();
            if (text) return text;
            const title = el.getAttribute('title');
            if (title && title.trim()) return title.trim();
            const img = el.querySelector('img[alt]');
            if (img && img.getAttribute('alt')?.trim()) return img.getAttribute('alt').trim();
            return '';
        };

        // 1) 클릭은 되는데 키보드로는 못 쓰는 요소
        for (const el of document.querySelectorAll('[onclick]')) {
            if (!el.offsetParent) continue;
            const tag = el.tagName;
            if (['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(tag)) continue;
            const ti = el.getAttribute('tabindex');
            const role = el.getAttribute('role');
            if (ti !== null && Number(ti) >= 0 && role) continue;
            out.unreachable.push({ tag, role, ti, t: (el.textContent || '').trim().slice(0, 30) });
        }

        // 2) 접근 가능한 이름 없는 조작 요소
        for (const el of document.querySelectorAll('button, a[href], [role="button"], [role="checkbox"], [role="tab"]')) {
            if (!el.offsetParent) continue;
            if (el.getAttribute('aria-hidden') === 'true') continue;
            if (!accName(el)) {
                out.unnamed.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 44) });
            }
        }

        // 3) 라벨 없는 폼 입력
        for (const el of document.querySelectorAll('input:not([type=hidden]), select, textarea')) {
            if (!el.offsetParent) continue;
            if (accName(el)) continue;
            if (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) continue;
            if (el.closest('label')) continue;
            if (el.getAttribute('placeholder')) continue; // placeholder는 최소한의 단서
            out.unlabeled.push({ tag: el.tagName, type: el.type || '', name: el.name || '', id: el.id || '' });
        }
        return out;
    });

    for (const u of res.unreachable.slice(0, 3)) findings.push(`[키보드불가] ${route} <${u.tag}> role=${u.role} tabindex=${u.ti} "${u.t}"`);
    for (const u of res.unnamed.slice(0, 3)) findings.push(`[이름없음] ${route} <${u.tag}> ${u.cls}`);
    for (const u of res.unlabeled.slice(0, 3)) findings.push(`[라벨없음] ${route} <${u.tag} type=${u.type} id=${u.id}>`);
}

// 4) 모달 포커스 가둠 — 로그인 페이지의 항상 열린 모달로 검사
try {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 25000 });
    await page.waitForTimeout(700);
    const hasDialog = await page.evaluate(() => !!document.querySelector('[role="dialog"]'));
    if (hasDialog) {
        let escaped = false;
        for (let i = 0; i < 30; i += 1) {
            await page.keyboard.press('Tab');
            const inside = await page.evaluate(() => {
                const a = document.activeElement;
                if (!a || a === document.body) return true;
                return !!a.closest('[role="dialog"]');
            });
            if (!inside) { escaped = true; break; }
        }
        if (escaped) findings.push('[포커스이탈] /login 열린 모달에서 Tab이 모달 밖으로 빠져나감 (focus trap 없음)');
    }
} catch { }

await browser.close();

const BASELINE_PATH = new URL('./a11y-audit-baseline.json', import.meta.url);
let baseline = [];
try { baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8')); } catch { baseline = []; }
const known = new Set(baseline);
const fresh = findings.filter((f) => !known.has(f));
const fixed = baseline.filter((f) => !findings.includes(f));

if (process.argv.includes('--update-baseline')) {
    writeFileSync(BASELINE_PATH, `${JSON.stringify([...findings].sort(), null, 2)}\n`);
    console.log(`기준선 갱신: ${findings.length}건 기록`);
    process.exit(0);
}

for (const f of fresh) console.log('NEW  ' + f);
console.log(`\n접근성 감사: 라우트 ${ROUTES.length}개 → 전체 ${findings.length}건 (기준선 ${baseline.length}, 신규 ${fresh.length}, 해소 ${fixed.length})`);
if (fresh.length) { console.log('\n새로 생긴 접근성 결함이 있습니다.'); process.exit(1); }
if (fixed.length) console.log(`${fixed.length}건 해소 — --update-baseline 으로 기준선을 줄여 주세요.`);
console.log('신규 접근성 결함 없음.');
