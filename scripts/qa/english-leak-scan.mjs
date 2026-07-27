#!/usr/bin/env node
/**
 * 화면에 남은 영문 라벨 탐지.
 *
 * 배경: 한국어 서비스인데 결과 화면에 `DAEWUN`, `yearStem · currentSaewunBranch`,
 * `Month branch hidden stem 경 protrudes into visible stems.`,
 * `Calendar Boundary Snapshot` 같은 **내부 식별자와 영어 원문**이 그대로 노출되고
 * 있었습니다. 소스 grep으로는 브랜드명·기술용어와 구분이 안 돼 놓치기 쉬워서,
 * 실제로 렌더된 화면의 텍스트만 검사합니다.
 *
 * 사용법: node scripts/qa/english-leak-scan.mjs [baseUrl]
 * 전제: 프로덕션 빌드가 떠 있어야 합니다 (`node .next/standalone/server.js`).
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

// 플래그가 baseUrl 자리로 새어 들어가지 않도록 `--`로 시작하는 인자는 걸러낸다.
const BASE = process.argv.slice(2).find((arg) => !arg.startsWith('--')) || 'http://localhost:3000';

/**
 * 영문이어도 괜찮은 것들 — 브랜드, 표준 약어, 사주 로마자 표기 등.
 * 새 항목을 추가할 때는 "한국어 사용자가 읽고 이해하는가"를 기준으로 판단하세요.
 */
const ALLOWED = [
    /^(AI|API|PDF|OK|SNS|UI|UX|QR|SMS|CS|FAQ|GPT|LLM|MBTI|VIP|CEO)$/i,
    /^(SecretSaju|Secret Saju|Bohemian Studio|Kakao|Google|Toss|Naver|Vercel|Notion)$/i,
    /^(Tarot|Oracle|Saju)$/i,
];

const ROUTES = JSON.parse(
    readFileSync(new URL('./menu-routes.json', import.meta.url), 'utf8'),
);

function allowed(word) {
    return ALLOWED.some((re) => re.test(word));
}

const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PW_CHROMIUM || undefined,
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

const findings = [];

for (const route of ROUTES) {
    try {
        await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 30000 });
    } catch {
        findings.push({ route, word: '(로드 실패)', context: '' });
        continue;
    }
    await page.waitForTimeout(300);

    const leaks = await page.evaluate(() => {
        const out = [];
        const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walk.nextNode())) {
            const parent = node.parentElement;
            if (!parent) continue;
            // 화면에 보이지 않는 텍스트는 대상이 아니다.
            if (!parent.offsetParent && parent.tagName !== 'BODY') continue;
            const text = (node.textContent || '').trim();
            if (!text || text.length > 400) continue;
            // 한글이 섞이지 않은 영어 단어 나열만 후보로 본다.
            const words = text.match(/\b[A-Za-z][A-Za-z'-]{2,}\b/g) || [];
            if (!words.length) continue;
            for (const word of words) out.push({ word, context: text.slice(0, 120) });
        }
        return out;
    });

    for (const leak of leaks) {
        if (allowed(leak.word)) continue;
        findings.push({ route, ...leak });
    }
}

await browser.close();

// 같은 문구가 여러 라우트에 반복되므로 문구 기준으로 묶는다.
const grouped = new Map();
for (const f of findings) {
    const key = f.context;
    if (!grouped.has(key)) grouped.set(key, { context: key, words: new Set(), routes: new Set() });
    grouped.get(key).words.add(f.word);
    grouped.get(key).routes.add(f.route);
}

const rows = [...grouped.values()].sort((a, b) => b.routes.size - a.routes.size);

/**
 * 기준선(baseline).
 *
 * 한 번에 다 번역하기 어려운 잔여 항목(타로 카드 영문 원명, 장식용 영문 헤더 등)이
 * 남아 있어서, 전부 실패시키면 가드로 쓸 수 없습니다. 그래서 **이미 알고 있는 문구는
 * 통과시키고, 새로 생긴 영문 노출만 실패**시킵니다. 잔여 항목을 번역했다면
 * `--update-baseline` 으로 기준선을 줄여 주세요. 기준선은 늘리지 말고 줄이세요.
 */
const BASELINE_PATH = new URL('./english-leak-baseline.json', import.meta.url);
const updating = process.argv.includes('--update-baseline');

let baseline = [];
try {
    baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
} catch {
    baseline = [];
}
const baselineSet = new Set(baseline);

const fresh = rows.filter((row) => !baselineSet.has(row.context));
const fixed = baseline.filter((context) => !grouped.has(context));

if (updating) {
    writeFileSync(BASELINE_PATH, `${JSON.stringify(rows.map((r) => r.context).sort(), null, 2)}\n`);
    console.log(`기준선 갱신: ${rows.length}건 기록`);
    process.exit(0);
}

for (const row of fresh) {
    console.log(
        `NEW LEAK  [${[...row.routes].slice(0, 3).join(', ')}${row.routes.size > 3 ? ` 외 ${row.routes.size - 3}곳` : ''}]  ${JSON.stringify(row.context)}`,
    );
}

console.log(
    `\n영문 라벨 스캔: 라우트 ${ROUTES.length}개 → 전체 ${rows.length}건 ` +
        `(기준선 ${baseline.length}건, 신규 ${fresh.length}건, 해소 ${fixed.length}건)`,
);

if (fresh.length) {
    console.log('\n새로 생긴 영문 노출이 있습니다. 한국어로 바꾸거나, 의도한 것이면 ALLOWED에 추가하세요.');
    process.exit(1);
}
if (fixed.length) {
    console.log(`잔여 ${rows.length}건은 기준선으로 관리 중입니다. ${fixed.length}건이 해소되었으니 --update-baseline 으로 기준선을 줄여 주세요.`);
}
console.log('신규 영문 노출 없음.');
