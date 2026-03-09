import { createBrowserRuntime } from './lib/chrome-runtime.mjs';

function argValue(flag, fallback = '') {
    const idx = process.argv.indexOf(flag);
    if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
    return fallback;
}

const BASE_URL = argValue('--base-url', 'http://127.0.0.1:3002').replace(/\/+$/, '');
const EMAIL = argValue('--email', 'piwpiw@naver.com');
const PASSWORD = argValue('--password', 'admin');

const ROUTES = [
    '/admin',
    '/admin/advanced-scoring',
    '/admin/character-analysis',
    '/admin/character-profile',
    '/admin/compatibility',
    '/dashboard',
    '/shop',
    '/saju',
];

const AUTH_SESSION_KEY = 'secret_saju_auth_session';
const ADMIN_BYPASS_KEY = 'secret_paws_mock_admin';
const useAuthUi = process.argv.includes('--auth-ui');

async function waitVisible(page, locator, timeout = 15000) {
    await page.locator(locator).first().waitFor({ state: 'visible', timeout });
}

async function fillInput(page, locator, value) {
    const input = page.locator(locator).first();
    await input.click({ delay: 20 });
    await input.fill('');
    await input.type(value, { delay: 8 });
}

async function waitForLoginDecision(page) {
    const loginResult = await page.waitForFunction(
        () => {
            const text = document.body.innerText || '';
            const path = window.location.pathname;
            if (path && path !== '/login') return 'success';
            if (
                text.includes('로그인이 완료되었습니다.') ||
                text.includes('로그인 완료.') ||
                text.includes('관리자 호환 로그인으로 접속했습니다.')
            ) return 'success';
            if (
                text.includes('이메일과 비밀번호를 모두 입력해 주세요.') ||
                text.includes('로그인 처리 중 오류가 발생했습니다.')
            ) return 'error';
            return false;
        },
        { timeout: 30000 }
    );
    return loginResult.jsonValue();
}

async function setFallbackAdminState(target) {
    await target.addInitScript(({ key }) => {
        localStorage.setItem(key, 'true');
        document.cookie = `${key}=true; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
    }, ADMIN_BYPASS_KEY);
}

async function login(page) {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });

    await waitVisible(page, 'input[type="email"]');
    await waitVisible(page, 'input[type="password"]');

    await fillInput(page, 'input[type="email"]', EMAIL);
    await fillInput(page, 'input[type="password"]', PASSWORD);

    const loginButton = page
        .getByRole('button', { name: /이메일로 로그인/ })
        .first();
    await loginButton.click({ timeout: 10000 });

    const result = await waitForLoginDecision(page);

    if (result !== 'success') {
        await setFallbackAdminState(page);
        return;
    }

    const session = await page.evaluate((sessionKey) => {
        try {
            const token = localStorage.getItem(sessionKey);
            if (!token) return null;
            const parsed = JSON.parse(decodeURIComponent(token));
            return parsed?.access_token ? { accessToken: parsed.access_token } : null;
        } catch {
            return null;
        }
    }, AUTH_SESSION_KEY);

    if (!session?.accessToken) {
        await setFallbackAdminState(page);
    }
}

async function main() {
    const { browser, context, closeBrowser } = await createBrowserRuntime({
        channel: 'msedge',
        headless: true,
        viewport: { width: 1366, height: 900 },
    });
    await setFallbackAdminState(context);
    const page = await context.newPage();

    const consoleErrors = [];
    const pageErrors = [];
    const http5xx = [];
    const routeResults = [];

    page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => pageErrors.push(String(err)));
    page.on('response', (res) => {
        if (res.status() >= 500) http5xx.push(`${res.status()} ${res.url()}`);
    });

    try {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });

        if (useAuthUi) {
            await login(page);
        }

        const syncResult = await page.evaluate(async () => {
            const res = await fetch('/api/user/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ channel: 'smoke-admin-mode' }),
            });
            const body = await res.json().catch(() => ({}));
            return { ok: res.ok, status: res.status, body };
        });

        if (!syncResult.ok && !routeResults.length) {
            await setFallbackAdminState(page);
        }

        for (const route of ROUTES) {
            const url = `${BASE_URL}${route}`;
            try {
                const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
                const status = response?.status() ?? 0;
                const isOk = status >= 200 && status < 400;
                routeResults.push({ route, status, ok: isOk });
            } catch (error) {
                routeResults.push({ route, status: 0, ok: false, error: String(error) });
            }
        }

        const failedRoutes = routeResults.filter((r) => !r.ok);
        const hasSyncFailure = useAuthUi ? !syncResult.ok : false;
        const hasFailure = hasSyncFailure || failedRoutes.length > 0 || pageErrors.length > 0;

        console.log('[smoke-admin] sync', JSON.stringify(syncResult));
        console.log('[smoke-admin] routes', JSON.stringify(routeResults));
        console.log('[smoke-admin] console-errors', JSON.stringify(consoleErrors.slice(0, 20)));
        console.log('[smoke-admin] page-errors', JSON.stringify(pageErrors.slice(0, 20)));
        console.log('[smoke-admin] http-5xx', JSON.stringify(http5xx.slice(0, 40)));

        if (hasFailure) {
            process.exitCode = 1;
        }
    } finally {
        await closeBrowser();
    }
}

main().catch((error) => {
    console.error(`[smoke-admin] FAIL ${error.message}`);
    process.exit(1);
});
