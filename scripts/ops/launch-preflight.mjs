#!/usr/bin/env node
/**
 * launch-preflight.mjs — 유료 판매 개시 전 점검
 *
 * 런북(docs/00-overview/launch-runbook.md)의 운영자 항목을 기계가 확인할 수
 * 있는 만큼 확인한다. 사람이 대시보드에서 해야 하는 일은 대신 해 줄 수 없지만,
 * "무엇이 아직 안 됐는지"는 정확히 알려 준다.
 *
 *   node scripts/ops/launch-preflight.mjs           # 현재(무료 오픈) 기준 점검
 *   node scripts/ops/launch-preflight.mjs --paid    # 유료 전환 기준 점검(엄격)
 *
 * 종료 코드: 차단 항목이 하나라도 있으면 1.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PAID_MODE = process.argv.includes('--paid');

const C = {
    reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m',
    yellow: '\x1b[33m', dim: '\x1b[2m', bold: '\x1b[1m',
};

/** 판매 개시를 막는 결함 */
const blockers = [];
/** 지금은 아니지만 유료 전환 시 막는 것 */
const warnings = [];
const passes = [];

// ─────────────────────────────────────────────────────────────
// 1. 사업자 정보 (전자상거래법 표기)
// ─────────────────────────────────────────────────────────────

/** 템플릿에 들어 있던 명백한 자리표시자 값 */
const PLACEHOLDER_PATTERNS = [
    /^123-45-67890$/,           // 사업자등록번호 예시값
    /^Admin$/,                  // 대표자명
    /Seoul,\s*Korea\s*\d+/,     // 주소
    /070-1234-5678/,            // 전화
    /example\.com/,
];

function checkBusinessInfo() {
    const src = readFileSync(join(ROOT, 'src/config/constants.ts'), 'utf8');
    const block = src.match(/export const BUSINESS_INFO = \{([\s\S]*?)\} as const;/);
    if (!block) {
        blockers.push('BUSINESS_INFO 블록을 찾지 못했습니다 (constants.ts 구조 변경?)');
        return;
    }

    const found = [];
    for (const line of block[1].split('\n')) {
        const m = line.match(/^\s*(\w+):\s*'([^']*)'/);
        if (!m) continue;
        const [, key, value] = m;
        if (PLACEHOLDER_PATTERNS.some((re) => re.test(value))) {
            found.push(`${key} = '${value}'`);
        }
    }

    if (found.length > 0) {
        const msg = `사업자 정보가 자리표시자입니다 (${found.length}건): ${found.join(', ')}`;
        // 유료 판매 시에는 법적 필수 표기라 차단, 무료 기간에는 경고
        (PAID_MODE ? blockers : warnings).push(msg);
    } else {
        passes.push('사업자 정보에 자리표시자 없음');
    }
}

// ─────────────────────────────────────────────────────────────
// 2. 환경변수
// ─────────────────────────────────────────────────────────────

const ENV_GROUPS = [
    {
        name: '코어 (미설정 시 mock 동작)',
        blocking: true,
        vars: [
            'NEXT_PUBLIC_SUPABASE_URL',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY',
            'SUPABASE_SERVICE_ROLE_KEY',
            'NEXT_PUBLIC_BASE_URL',
        ],
    },
    {
        name: '결제 (유료 전환 시 필수)',
        blocking: PAID_MODE,
        vars: [
            'NEXT_PUBLIC_TOSS_CLIENT_KEY',
            'TOSS_SECRET_KEY',
            'NEXT_PUBLIC_TOSS_SUCCESS_URL',
            'NEXT_PUBLIC_TOSS_FAIL_URL',
        ],
    },
    {
        name: '인증 (카카오 로그인)',
        blocking: false,
        vars: ['NEXT_PUBLIC_KAKAO_JS_KEY', 'KAKAO_REST_API_KEY', 'KAKAO_CLIENT_SECRET'],
    },
    {
        name: '인증 (네이버 로그인 — 선택)',
        blocking: false,
        vars: ['NAVER_CLIENT_ID', 'NAVER_CLIENT_SECRET', 'NEXT_PUBLIC_NAVER_LOGIN_ENABLED'],
    },
    {
        name: '운영 보조',
        blocking: false,
        vars: ['CRON_SECRET', 'NEXT_PUBLIC_POSTHOG_KEY'],
    },
];

function readLocalEnv() {
    // 로컬 검증 편의용. 프로덕션 판정은 Vercel 대시보드가 정본이다.
    const out = {};
    for (const file of ['.env.local', '.env']) {
        const p = join(ROOT, file);
        if (!existsSync(p)) continue;
        for (const line of readFileSync(p, 'utf8').split('\n')) {
            const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
            if (m && m[2].trim() !== '') out[m[1]] = true;
        }
    }
    return out;
}

function checkEnv() {
    const local = readLocalEnv();
    const has = (k) => Boolean(process.env[k]) || Boolean(local[k]);

    for (const group of ENV_GROUPS) {
        const missing = group.vars.filter((v) => !has(v));
        if (missing.length === 0) {
            passes.push(`환경변수 · ${group.name} — 전부 설정됨`);
            continue;
        }
        const msg = `환경변수 · ${group.name} — 미설정 ${missing.length}건: ${missing.join(', ')}`;
        (group.blocking ? blockers : warnings).push(msg);
    }
}

// ─────────────────────────────────────────────────────────────
// 3. DB 마이그레이션 — 적용은 사람이, 목록은 기계가
// ─────────────────────────────────────────────────────────────

function checkMigrations() {
    const dir = join(ROOT, 'supabase/migrations');
    const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
    passes.push(`마이그레이션 파일 ${files.length}건 (001~${files.at(-1).slice(0, 3)})`);
    warnings.push(
        `Supabase 적용 여부는 코드가 확인할 수 없습니다 — ` +
        `scripts/ops/verify-db.sql 을 SQL Editor 에 붙여 넣어 확인하세요 (미적용분만 실행)`
    );
}

// ─────────────────────────────────────────────────────────────
// 4. FREE_LAUNCH 상태
// ─────────────────────────────────────────────────────────────

function checkFreeLaunch() {
    const src = readFileSync(join(ROOT, 'src/config/constants.ts'), 'utf8');
    const m = src.match(/export const FREE_LAUNCH\s*=\s*(true|false)/);
    if (!m) {
        blockers.push('FREE_LAUNCH 상수를 찾지 못했습니다');
        return;
    }
    const isFree = m[1] === 'true';
    if (PAID_MODE && isFree) {
        blockers.push('유료 기준 점검인데 FREE_LAUNCH 가 아직 true 입니다 (전환 전 Toss 실결제 테스트 필수)');
    } else {
        passes.push(`FREE_LAUNCH = ${m[1]} (${isFree ? '무료 오픈' : '유료 운영'})`);
    }
}

// ─────────────────────────────────────────────────────────────

console.log(`\n${C.bold}🚀 판매 개시 전 점검${C.reset} ${C.dim}(${PAID_MODE ? '유료 전환 기준 · 엄격' : '현재 무료 오픈 기준'})${C.reset}\n`);

checkBusinessInfo();
checkEnv();
checkMigrations();
checkFreeLaunch();

for (const p of passes) console.log(`  ${C.green}✅${C.reset} ${p}`);
for (const w of warnings) console.log(`  ${C.yellow}⚠️${C.reset}  ${w}`);
for (const b of blockers) console.log(`  ${C.red}❌${C.reset} ${b}`);

console.log(
    `\n  통과 ${passes.length} · 주의 ${warnings.length} · ${C.bold}차단 ${blockers.length}${C.reset}\n`
);

if (blockers.length > 0) {
    console.log(`${C.red}판매 개시를 막는 항목이 있습니다.${C.reset} 절차: docs/00-overview/launch-runbook.md\n`);
    process.exit(1);
}
console.log(`${C.green}차단 항목 없음.${C.reset}${PAID_MODE ? '' : ` ${C.dim}유료 전환 기준으로 보려면 --paid${C.reset}`}\n`);
