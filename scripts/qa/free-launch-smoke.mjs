#!/usr/bin/env node
/**
 * 무료 오픈 게이트 스모크.
 *
 * 배경: `FREE_LAUNCH`는 "표시/해금" 쪽 7곳에서만 참조되고, 정작 **젤리를 차감하는
 * 10곳**은 아무도 확인하지 않았습니다. 게스트 잔액은 0이라 무료 오픈 중인데도
 * 사주·궁합·토정비결·작명·신살 등 핵심 기능이 전부 "젤리가 부족합니다"로 막혔습니다.
 * 화면 문구는 무료라고 안내하는데 실제로는 열리지 않는, 조용한 종류의 장애였습니다.
 *
 * 이 스크립트는 실제 브라우저로 각 화면의 1차 CTA를 눌러 보고, 잔액 부족 문구나
 * 결제 유도가 뜨는지 확인합니다. 소스 검사로는 잡히지 않는 종류라 런타임으로 봅니다.
 *
 * 사용법: node scripts/qa/free-launch-smoke.mjs [baseUrl]
 * 전제: 프로덕션 빌드가 떠 있어야 합니다 (`node .next/standalone/server.js`).
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://localhost:3000';

/** 나오면 안 되는 문구 — 무료 오픈 중 잔액/결제로 막혔다는 신호. */
const BLOCKED_PATTERNS = [
    /젤리가\s*부족/,
    /젤리를\s*충전/,
    /잔액이\s*부족/,
];

/** 1차 CTA에 남아 있으면 안 되는 가격 표기. */
const PRICED_CTA = /\d+\s*젤리로/;

const TARGETS = [
    { path: '/saju', cta: /사주 분석 시작|사주 실행/ },
    { path: '/compatibility', cta: /궁합 계산/ },
    { path: '/shinsal', cta: /신살 요약/ },
    { path: '/tojeong', cta: /토정비결|운세 보기|확인/ },
    { path: '/naming', cta: /이름|작명/ },
    { path: '/luck', cta: /의식 시작|부적/ },
    { path: '/healing', cta: /힐링|시작/ },
];

const failures = [];
const notes = [];

// 다른 QA 스크립트와 동일하게 PW_CHROMIUM으로 실행 파일을 지정할 수 있게 둔다
// (설치된 브라우저 리비전이 playwright 패키지의 기대값과 어긋날 때 필요).
const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PW_CHROMIUM || undefined,
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

for (const target of TARGETS) {
    const url = `${BASE}${target.path}`;
    try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    } catch {
        failures.push(`${target.path} — 페이지 로드 실패`);
        continue;
    }

    const body = () => page.evaluate(() => document.body.innerText);

    // 1) 진입 직후부터 잔액 부족 문구가 떠 있으면 안 된다.
    let text = await body();
    for (const pattern of BLOCKED_PATTERNS) {
        if (pattern.test(text)) {
            failures.push(`${target.path} — 진입 직후 잔액 차단 문구: ${pattern}`);
        }
    }

    // 2) 1차 CTA 라벨에 가격이 남아 있으면 안 된다.
    const pricedCta = await page.evaluate(
        (src) =>
            Array.from(document.querySelectorAll('button, a'))
                .map((el) => el.innerText?.trim() || '')
                .filter((t) => new RegExp(src).test(t)),
        PRICED_CTA.source,
    );
    if (pricedCta.length) {
        failures.push(`${target.path} — 가격이 붙은 CTA: ${JSON.stringify(pricedCta.slice(0, 3))}`);
    }

    // 3) CTA를 실제로 눌러 본 뒤에도 차단 문구가 없어야 한다.
    const clicked = await page.evaluate((src) => {
        const re = new RegExp(src);
        const el = Array.from(document.querySelectorAll('button')).find(
            (b) => re.test(b.innerText || '') && !b.disabled,
        );
        if (!el) return false;
        el.click();
        return true;
    }, target.cta.source);

    if (!clicked) {
        // 입력이 선행되어야 눌리는 화면이 있다. 차단 문구 검사만으로도 의미가 있으므로 기록만.
        notes.push(`${target.path} — CTA를 누를 수 있는 상태가 아님(입력 선행 필요), 문구 검사만 수행`);
        continue;
    }

    await page.waitForTimeout(1500);
    text = await body();
    for (const pattern of BLOCKED_PATTERNS) {
        if (pattern.test(text)) {
            failures.push(`${target.path} — CTA 클릭 후 잔액 차단: ${pattern}`);
        }
    }
}

await browser.close();

for (const note of notes) console.log(`NOTE     ${note}`);
for (const failure of failures) console.log(`BLOCKED  ${failure}`);

console.log(`\n무료 오픈 게이트 점검: 대상 ${TARGETS.length}개 → 차단 ${failures.length}건`);

if (failures.length) process.exit(1);
console.log('무료 오픈 정상: 잔액 때문에 막히는 화면이 없습니다.');
