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
const BASE_DIR = process.cwd();

function runNodeScript(label, scriptPath, extraArgs = [], env = {}) {
    const startAt = Date.now();

    return new Promise((resolve) => {
        const proc = spawn(process.execPath, [scriptPath, ...extraArgs], {
            cwd: BASE_DIR,
            env: { ...process.env, ...env },
            stdio: 'inherit',
        });

        proc.on('error', (error) => {
            resolve({
                label,
                status: 'failed',
                durationMs: Date.now() - startAt,
                error: String(error),
            });
        });

        proc.on('exit', (code) => {
            resolve({
                label,
                status: code === 0 ? 'passed' : 'failed',
                durationMs: Date.now() - startAt,
                exitCode: code ?? 1,
                error: code === 0 ? null : `Exited with code ${code}`,
            });
        });
    });
}

async function assertServerAvailable() {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(`${BASE_URL}/api/health`, {
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(`Server unavailable: ${BASE_URL} (${response.status})`);
        }
    } finally {
        clearTimeout(timer);
    }
}

async function main() {
    console.log(`[smoke-fast] start baseUrl=${BASE_URL}`);
    await assertServerAvailable();

    const sharedEnv = {
        SMOKE_BASE_URL: BASE_URL,
    };

    const checks = await Promise.all([
        runNodeScript(
            'smoke-admin',
            path.join('scripts', 'smoke-admin-mode.mjs'),
            ['--base-url', BASE_URL, '--email', EMAIL, '--password', PASSWORD],
            sharedEnv
        ),
        runNodeScript(
            'smoke-browser',
            path.join('scripts', 'mcp-browser-smoke.mjs'),
            [],
            sharedEnv
        ),
    ]);

    for (const check of checks) {
        console.log(`[smoke-fast] ${check.label} ${check.status} ${check.durationMs}ms`);
    }

    const failed = checks.filter((check) => check.status !== 'passed');
    if (failed.length > 0) {
        process.exitCode = 1;
        return;
    }

    console.log('[smoke-fast] SUCCESS');
}

main().catch((error) => {
    console.error(`[smoke-fast] FAIL ${error.message}`);
    process.exit(1);
});
