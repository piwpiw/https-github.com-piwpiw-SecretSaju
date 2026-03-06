import fs from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';

function argValue(flag, fallback = '') {
    const idx = process.argv.indexOf(flag);
    if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
    return fallback;
}

const BASE_URL = argValue('--base-url', 'http://127.0.0.1:3002').replace(/\/+$/, '');
const EMAIL = argValue('--email', 'piwpiw@naver.com');
const PASSWORD = argValue('--password', 'admin');
const CDP_URL = argValue('--cdp-url', process.env.CHROME_CDP_URL || '');
const BASE_DIR = process.cwd();
const LOG_DIR = path.resolve('logs');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const REPORT_ID = `${TIMESTAMP}`;
const REPORT_PATH_JSON = path.join(LOG_DIR, `smoke-full-${REPORT_ID}.json`);
const REPORT_PATH_MD = path.join(LOG_DIR, `smoke-full-${REPORT_ID}.md`);

const forceLaunch = process.argv.includes('--local');
const forceCdp = process.argv.includes('--cdp') || !!CDP_URL;
const runParallel = !process.argv.includes('--serial');

function runCommand(command, args, env = {}) {
    const startAt = new Date();

    return new Promise((resolve) => {
        const proc = spawn(process.execPath, args, {
            cwd: BASE_DIR,
            env: { ...process.env, ...env },
            stdio: 'inherit',
        });

        proc.on('error', (error) => {
            resolve({
                command,
                args,
                status: 'failed',
                error: String(error),
                startedAt: startAt.toISOString(),
                endedAt: new Date().toISOString(),
                durationMs: Date.now() - startAt.getTime(),
            });
        });

        proc.on('exit', (code) => {
            const result = {
                command,
                args,
                status: code === 0 ? 'passed' : 'failed',
                exitCode: code,
                startedAt: startAt.toISOString(),
                endedAt: new Date().toISOString(),
                durationMs: Date.now() - startAt.getTime(),
            };
            if (code === 0) {
                resolve(result);
            } else {
                resolve({
                    ...result,
                    error: `Exited with code ${code}`,
                });
            }
        });
    });
}

function buildReport(results, options) {
    const failures = results.filter((entry) => entry.status !== 'passed');
    const passed = results.length - failures.length;

    return {
        metadata: {
            startedAt: options.startedAt,
            finishedAt: options.finishedAt,
            durationMs: options.durationMs,
            baseUrl: BASE_URL,
            email: EMAIL,
            runParallel,
            useCdp: forceCdp,
            cdpUrlUsed: options.cdpUrlUsed,
        },
        checks: results,
        summary: {
            total: results.length,
            passed,
            failed: failures.length,
            status: failures.length === 0 ? 'passed' : 'failed',
        },
    };
}

function writeMarkdownReport(report) {
    const lines = [];
    lines.push(`# Smoke Full Report`);
    lines.push(`- Start: ${report.metadata.startedAt}`);
    lines.push(`- End: ${report.metadata.finishedAt}`);
    lines.push(`- Base URL: ${report.metadata.baseUrl}`);
    lines.push(`- Parallel run: ${report.metadata.runParallel}`);
    lines.push(`- CDP mode: ${report.metadata.useCdp ? 'on' : 'off'}`);
    if (report.metadata.cdpUrlUsed) {
        lines.push(`- CDP URL: ${report.metadata.cdpUrlUsed}`);
    }
    lines.push('');
    lines.push(`## Summary`);
    lines.push(`- Total: ${report.summary.total}`);
    lines.push(`- Passed: ${report.summary.passed}`);
    lines.push(`- Failed: ${report.summary.failed}`);
    lines.push(`- Result: ${report.summary.status}`);
    lines.push('');
    lines.push(`## Checks`);
    for (const item of report.checks) {
        lines.push(`- ${item.command}: ${item.status} (${item.durationMs}ms, exit ${item.exitCode ?? 0})`);
        if (item.error) lines.push(`  - Error: ${item.error}`);
    }
    if (report.summary.failed > 0) {
        lines.push('');
        lines.push('## Failed Commands');
        for (const item of report.checks.filter((entry) => entry.status !== 'passed')) {
            lines.push(`- ${item.command}: ${item.error || `exit ${item.exitCode}`}`);
        }
    }

    return `${lines.join('\n')}\n`;
}

async function runChecks(sharedEnv) {
    const checks = [
        {
            name: 'smoke-admin',
            command: path.join('scripts', 'smoke-admin-mode.mjs'),
            args: [
                path.join('scripts', 'smoke-admin-mode.mjs'),
                '--base-url',
                BASE_URL,
                '--email',
                EMAIL,
                '--password',
                PASSWORD,
            ],
            env: sharedEnv,
        },
        {
            name: 'smoke-home',
            command: path.join('scripts', 'mcp-home-smoke.mjs'),
            args: [path.join('scripts', 'mcp-home-smoke.mjs')],
            env: sharedEnv,
        },
        {
            name: 'smoke-browser',
            command: path.join('scripts', 'mcp-browser-smoke.mjs'),
            args: [path.join('scripts', 'mcp-browser-smoke.mjs')],
            env: sharedEnv,
        },
    ];

    if (runParallel) {
        const runners = checks.map((check) => runCommand(check.name, check.args, check.env));
        return Promise.all(runners);
    }

    const results = [];
    for (const check of checks) {
        results.push(await runCommand(check.name, check.args, check.env));
    }
    return results;
}

async function assertServerAvailable(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    try {
        const response = await fetch(`${url}/api/health`, {
            signal: controller.signal,
        }).catch((error) => {
            if (error?.name === 'AbortError') {
                return null;
            }
            return null;
        });
        clearTimeout(timer);
        if (!response || !response.ok) {
            throw new Error(`Server unavailable: ${url}`);
        }
    } finally {
        clearTimeout(timer);
    }
}

function buildCommandEnv() {
    const sharedEnv = {
        SMOKE_BASE_URL: BASE_URL,
        BASE_URL,
    };

    if (forceCdp && CDP_URL) {
        sharedEnv.CHROME_CDP_URL = CDP_URL;
    }

    if (forceLaunch) {
        sharedEnv.CHROME_FORCE_LAUNCH = 'true';
    }

    return sharedEnv;
}

async function main() {
    const startedAt = new Date().toISOString();
    const runId = REPORT_ID;
    const sharedEnv = buildCommandEnv();

    fs.mkdirSync(LOG_DIR, { recursive: true });
    const cdpUrlUsed = sharedEnv.CHROME_CDP_URL || '';

    console.log(`[smoke-full] start run=${runId} baseUrl=${BASE_URL}`);
    console.log(`[smoke-full] parallel=${runParallel} cdp=${forceCdp ? 'on' : 'off'}`);
    try {
        await assertServerAvailable(BASE_URL);
    } catch (error) {
        console.error(`[smoke-full] ERROR: ${error.message}`);
        console.error('[smoke-full] Run dev server first: npm run dev -- --port 3002');

        const result = buildReport([
            {
                command: 'health-check',
                args: [`${BASE_URL}/api/health`],
                status: 'failed',
                exitCode: 1,
                startedAt: new Date().toISOString(),
                endedAt: new Date().toISOString(),
                durationMs: 0,
                error: String(error.message),
            },
        ], {
            startedAt,
            finishedAt: new Date().toISOString(),
            durationMs: Date.now() - new Date(startedAt).getTime(),
            cdpUrlUsed,
        });
        fs.writeFileSync(REPORT_PATH_JSON, JSON.stringify(result, null, 2));
        fs.writeFileSync(REPORT_PATH_MD, writeMarkdownReport(result));
        console.error(`[smoke-full] report saved: ${REPORT_PATH_JSON}`);
        process.exit(1);
    }

    const results = await runChecks(sharedEnv);
    const elapsed = Date.now() - new Date(startedAt).getTime();
    const report = buildReport(results, {
        startedAt,
        finishedAt: new Date().toISOString(),
        durationMs: elapsed,
        cdpUrlUsed,
    });
    fs.writeFileSync(REPORT_PATH_JSON, JSON.stringify(report, null, 2));
    fs.writeFileSync(REPORT_PATH_MD, writeMarkdownReport(report));

    const failed = results.filter((result) => result.status !== 'passed');
    if (failed.length > 0) {
        console.error(`[smoke-full] FAIL (${failed.length}/${results.length})`);
        for (const item of failed) {
            console.error(`[smoke-full] failed=${item.command}: ${item.error}`);
        }
        console.log(`[smoke-full] report=${REPORT_PATH_JSON}`);
        process.exit(1);
    }

    console.log('[smoke-full] SUCCESS');
    console.log(`[smoke-full] report=${REPORT_PATH_JSON}`);
}

main().catch((error) => {
    console.error(`[smoke-full] FAIL: ${error.message}`);
    process.exit(1);
});
