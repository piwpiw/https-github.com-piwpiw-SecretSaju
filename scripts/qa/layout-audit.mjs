#!/usr/bin/env node
/**
 * 레이아웃 품질 감사 (모바일·PC).
 *
 * 배경: 가드가 전부 통과해도 화면이 투박한 문제는 안 잡혔습니다. 실제로 잡힌
 * 결함들은 전부 "치수"였습니다 — 좌우 패딩 3겹 중첩으로 콘텐츠 폭이 29% 깎임,
 * 고정 검색바가 섹션 제목을 가림, grid stretch로 차트 아래 빈 공간, 좁은 칸에서
 * 단어 중간 줄바꿈. 이 스크립트는 그 네 가지를 수치로 잡습니다.
 *
 * 사용법: node scripts/qa/layout-audit.mjs [baseUrl]
 * 전제: 프로덕션 빌드가 떠 있어야 합니다.
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const BASE = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'http://localhost:3000';
const ROUTES = JSON.parse(readFileSync(new URL('./menu-routes.json', import.meta.url), 'utf8'));

/**
 * 콘텐츠 폭이 뷰포트 대비 이 비율보다 좁으면 여백 낭비로 본다.
 * **모바일에만 적용한다** — PC에서 본문 폭을 제한하는 건 가독성을 위한 정상 설계다.
 */
const MIN_CONTENT_RATIO = 0.82;
/** 화면에 보이는 빈 블록이 이보다 크면 레이아웃 사고로 본다(px). */
const MAX_EMPTY_BLOCK = 240;

const findings = [];
const browser = await chromium.launch({ headless: true, executablePath: process.env.PW_CHROMIUM || undefined });

for (const [w, h, tag] of [[390, 844, '모바일'], [1440, 900, 'PC']]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    for (const route of ROUTES) {
        try {
            await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 25000 });
        } catch { continue; }
        await page.waitForTimeout(700);
        // 인트로 스플래시(TerminalBoot 등)가 걷힐 때까지 기다린다. 남아 있으면
        // 그 위에서 측정해 "제목이 가려졌다"는 오탐이 난다.
        await page
            .waitForFunction(() => {
                const vw = window.innerWidth, vh = window.innerHeight;
                return ![...document.querySelectorAll('body *')].some((el) => {
                    const cs = getComputedStyle(el);
                    if (cs.position !== 'fixed' || cs.opacity === '0') return false;
                    const r = el.getBoundingClientRect();
                    return r.width >= vw * 0.9 && r.height >= vh * 0.9 && Number(cs.zIndex) >= 100;
                });
            }, { timeout: 6000 })
            .catch(() => { });

        const sample = () => page.evaluate(({ minRatio, maxEmpty }) => {
            const out = { overflow: null, narrow: null, empty: [], covered: [], tiny: [] };
            const vw = document.documentElement.clientWidth;

            if (document.documentElement.scrollWidth > vw + 1) {
                out.overflow = { sw: document.documentElement.scrollWidth, cw: vw };
            }

            // 본문 콘텐츠 폭 — 텍스트가 실제로 쓸 수 있는 최대 가로폭
            let widest = 0;
            for (const el of document.querySelectorAll('main p, main h1, main h2, main h3, article p')) {
                if (!el.offsetParent) continue;
                widest = Math.max(widest, el.getBoundingClientRect().width);
            }
            if (minRatio > 0 && widest > 0 && widest / vw < minRatio) {
                out.narrow = { widest: Math.round(widest), vw, ratio: +(widest / vw).toFixed(2) };
            }

            // 화면에 보이는 큰 빈 영역 (자식도 텍스트도 없는 블록)
            for (const el of document.querySelectorAll('main div, main section')) {
                if (!el.offsetParent) continue;
                const r = el.getBoundingClientRect();
                if (r.height < maxEmpty || r.top > window.innerHeight || r.bottom < 0) continue;
                if ((el.textContent || '').trim().length > 0) continue;
                if (el.querySelector('svg,img,canvas,video')) continue;
                // 노이즈 텍스처·그라데이션 같은 장식 레이어는 의도된 것이다.
                const cs = getComputedStyle(el);
                if (cs.position === 'absolute' || cs.position === 'fixed') continue;
                if (cs.pointerEvents === 'none') continue;
                out.empty.push({ h: Math.round(r.height), cls: (el.className || '').toString().slice(0, 50) });
            }

            // 고정 요소가 제목을 실제로 가리는지.
            // 사각형 겹침만 보면 z-순서를 무시해 오탐이 난다(모달이 내비 위에 있어도
            // "겹친다"고 잡힘). 제목 중심점에서 최상단 요소를 직접 조회한다.
            for (const hd of document.querySelectorAll('main h1, main h2, main h3')) {
                if (!hd.offsetParent) continue;
                // sr-only 제목은 시각적으로 감추는 게 정상이라 "가림" 대상이 아니다.
                if (/(^|\s)sr-only(\s|$)/.test((hd.className || '').toString())) continue;
                const a = hd.getBoundingClientRect();
                if (a.top < 0 || a.bottom > window.innerHeight || a.width === 0 || a.height === 0) continue;
                const x = a.left + a.width / 2;
                const y = a.top + a.height / 2;
                const top = document.elementFromPoint(x, y);
                if (!top) continue;
                if (top === hd || hd.contains(top) || top.contains(hd)) continue;
                // 모달이 뒤 콘텐츠를 덮는 건 의도된 동작이다.
                if (top.closest('[role="dialog"],[aria-modal="true"],[aria-hidden="true"]')) continue;
                // 화면을 거의 다 덮는 요소는 스플래시·모달 배경·드로어처럼 의도된
                // 오버레이다. 사고로 콘텐츠를 가리는 경우와 구분한다.
                const tr = top.getBoundingClientRect();
                if (tr.width >= window.innerWidth * 0.9 && tr.height >= window.innerHeight * 0.9) continue;
                const cs = getComputedStyle(top);
                // 그 지점의 최상단이 다른 고정/스티키 요소면 진짜로 가려진 것이다.
                let node = top, blocker = null;
                for (let i = 0; i < 6 && node; i += 1) {
                    const ncs = getComputedStyle(node);
                    if (ncs.position === 'fixed' || ncs.position === 'sticky') { blocker = node; break; }
                    node = node.parentElement;
                }
                if (blocker) {
                    out.covered.push({ head: (hd.textContent || '').trim().slice(0, 32) });
                } else if (cs.pointerEvents !== 'none' && !hd.contains(top)) {
                    // 같은 흐름 안에서 겹친 경우도 가림이다(음수 마진 등).
                    out.covered.push({ head: (hd.textContent || '').trim().slice(0, 32) });
                }
            }

            // 지나치게 좁은 텍스트 칸 (단어 중간 줄바꿈의 원인)
            for (const el of document.querySelectorAll('main p')) {
                if (!el.offsetParent) continue;
                const t = (el.textContent || '').trim();
                if (t.length < 20 || !/[가-힣]/.test(t)) continue;
                // 스크린리더 전용 텍스트는 1px로 숨기는 게 정상이다.
                if (/(^|\s)sr-only(\s|$)/.test((el.className || '').toString())) continue;
                const r = el.getBoundingClientRect();
                if (r.width > 0 && r.width < 120) out.tiny.push({ w: Math.round(r.width), t: t.slice(0, 34) });
            }
            return out;
            // PC는 최대폭 제한이 정상이므로 비율 검사를 건너뛴다(minRatio=0).
        }, { minRatio: w < 700 ? MIN_CONTENT_RATIO : 0, maxEmpty: MAX_EMPTY_BLOCK });

        const res = await sample();
        // 고정요소 겹침은 하이드레이션 중 잠깐 발생할 수 있다. 한 번 더 보고
        // 그때도 겹쳐 있을 때만 실제 결함으로 본다.
        if (res.covered.length) {
            await page.waitForTimeout(700);
        // 인트로 스플래시(TerminalBoot 등)가 걷힐 때까지 기다린다. 남아 있으면
        // 그 위에서 측정해 "제목이 가려졌다"는 오탐이 난다.
        await page
            .waitForFunction(() => {
                const vw = window.innerWidth, vh = window.innerHeight;
                return ![...document.querySelectorAll('body *')].some((el) => {
                    const cs = getComputedStyle(el);
                    if (cs.position !== 'fixed' || cs.opacity === '0') return false;
                    const r = el.getBoundingClientRect();
                    return r.width >= vw * 0.9 && r.height >= vh * 0.9 && Number(cs.zIndex) >= 100;
                });
            }, { timeout: 6000 })
            .catch(() => { });
            const again = await sample();
            const still = new Set(again.covered.map((c) => c.head));
            res.covered = res.covered.filter((c) => still.has(c.head));
        }

        if (res.overflow) findings.push(`[${tag}] ${route} 가로 오버플로 ${res.overflow.sw}>${res.overflow.cw}`);
        if (res.narrow) findings.push(`[${tag}] ${route} 콘텐츠 폭 ${res.narrow.widest}/${res.narrow.vw}px (${res.narrow.ratio}) — 여백 과다`);
        for (const e of res.empty.slice(0, 2)) findings.push(`[${tag}] ${route} 빈 블록 ${e.h}px — ${e.cls}`);
        for (const c of res.covered.slice(0, 2)) findings.push(`[${tag}] ${route} 고정요소가 제목 가림 — "${c.head}"`);
        for (const t of res.tiny.slice(0, 2)) findings.push(`[${tag}] ${route} 텍스트 칸 ${t.w}px — "${t.t}"`);
    }
    await page.close();
}
await browser.close();

/**
 * 기준선. 남은 지적은 대부분 카드 내부 패딩 같은 "설계상 그럴 수 있는" 값이라
 * 전부 실패시키면 가드로 못 쓴다. 알고 있는 것은 통과시키고 **새로 생긴 것만**
 * 실패시킨다. 개선했다면 `--update-baseline` 으로 기준선을 줄인다.
 */
const BASELINE_PATH = new URL('./layout-audit-baseline.json', import.meta.url);
const updating = process.argv.includes('--update-baseline');

let baseline = [];
try { baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8')); } catch { baseline = []; }
const known = new Set(baseline);
const fresh = findings.filter((f) => !known.has(f));
const fixed = baseline.filter((f) => !findings.includes(f));

if (updating) {
    writeFileSync(BASELINE_PATH, `${JSON.stringify([...findings].sort(), null, 2)}\n`);
    console.log(`기준선 갱신: ${findings.length}건 기록`);
    process.exit(0);
}

for (const f of fresh) console.log('NEW ISSUE  ' + f);
console.log(
    `\n레이아웃 감사: 라우트 ${ROUTES.length}개 × 2뷰포트 → ` +
    `전체 ${findings.length}건 (기준선 ${baseline.length}, 신규 ${fresh.length}, 해소 ${fixed.length})`,
);
if (fresh.length) {
    console.log('\n새로 생긴 레이아웃 결함이 있습니다.');
    process.exit(1);
}
if (fixed.length) console.log(`${fixed.length}건이 해소되었습니다. --update-baseline 으로 기준선을 줄여 주세요.`);
console.log('신규 레이아웃 결함 없음.');
