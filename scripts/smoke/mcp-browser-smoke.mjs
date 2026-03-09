import fs from 'fs';
import path from 'path';
import { createBrowserRuntime } from './lib/chrome-runtime.mjs';

async function run() {
    const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3100';
    const outDir = path.resolve('logs');
    fs.mkdirSync(outDir, { recursive: true });

    const { context, closeBrowser } = await createBrowserRuntime({
        channel: 'msedge',
        headless: true,
        viewport: { width: 1440, height: 900 },
    });
    await context.addInitScript(() => {
        localStorage.setItem('secret_paws_mock_admin', 'true');
        document.cookie = 'secret_paws_mock_admin=true; path=/; SameSite=Lax';
        localStorage.setItem('secret_paws_wallet', JSON.stringify({ churu: 999999, nyang: 0 }));
    });
    const page = await context.newPage();

    const consoleErrors = [];
    const consoleMessages = [];
    const pageErrors = [];
    const httpFailures = [];

    page.on('console', (msg) => {
        consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });
    page.on('pageerror', (error) => {
        pageErrors.push(String(error));
    });
    page.on('response', (response) => {
        if (response.status() >= 500) {
            httpFailures.push(`${response.status()} ${response.url()}`);
        }
    });

    try {
        const targetUrl = `${baseUrl}/saju`;
        console.log(`[smoke] open ${targetUrl}`);
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });

        await page.waitForTimeout(1500);
        const directInputButton = page.getByRole('button', { name: /이름 직접입력/ });
        if (await directInputButton.isVisible().catch(() => false)) {
            await directInputButton.click();
        }

        await page.locator('input[placeholder="홍길동"]').first().fill('MCPUSER');
        await page.locator('input[type="date"]').first().fill('1990-01-01');
        await page.locator('input[type="time"]').first().fill('12:00');
        await page.waitForTimeout(500);

        await page.waitForFunction(() => {
            const button = Array.from(document.querySelectorAll('button')).find((el) => {
                const text = el.textContent ? el.textContent.replace(/\s+/g, ' ').trim() : '';
                return (text === '3젤리로 사주 실행') && el instanceof HTMLButtonElement;
            });
            return button ? !button.disabled : false;
        }, { timeout: 30000 });

        const runButton = page.getByRole('button', { name: /3젤리로 사주 실행|3\s*젤리로\s*사주\s*실행/ }).first();
        await runButton.click();

        const passed = await Promise.race([
            page.locator('text=공식 사주 분석 리포트').first().waitFor({ state: 'visible', timeout: 120000 }).then(() => true),
            page.locator('text=분석 완료').first().waitFor({ state: 'visible', timeout: 120000 }).then(() => true),
            page.locator('text=사주 분석 중...').first().waitFor({ state: 'hidden', timeout: 120000 }).then(() => true),
        ]);

        if (!passed) {
            throw new Error('result-state-timeout');
        }

        const screenshotPath = path.join(outDir, 'mcp-browser-smoke-result.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`[smoke] PASS screenshot=${screenshotPath}`);
    } catch (error) {
        const failPath = path.join(outDir, 'mcp-browser-smoke-fail.png');
        await page.screenshot({ path: failPath, fullPage: true });
        const hasResultHeading = (await page.getByText('공식 사주 분석 리포트').count()) > 0;
        const hasCompleteBadge = (await page.getByText('분석 완료').count()) > 0;
        const hasNotice = (await page.getByText('젤리가 부족합니다. 3젤리가 필요해요.').count()) > 0;
        const hasError = (await page.getByText('사주 분석 중 오류').count()) > 0;
        console.error(`[smoke] fail-screenshot=${failPath}`);
        console.error(`[smoke] state url=${page.url()} resultHeading=${hasResultHeading} complete=${hasCompleteBadge} missingNotice=${hasNotice} error=${hasError}`);
        if (consoleErrors.length > 0) {
            console.error('[smoke] console-errors');
            for (const item of consoleErrors.slice(0, 10)) {
                console.error(`  - ${item}`);
            }
        }
        if (pageErrors.length > 0) {
            console.error('[smoke] page-errors');
            for (const item of pageErrors.slice(0, 10)) {
                console.error(`  - ${item}`);
            }
        }
        if (httpFailures.length > 0) {
            console.error('[smoke] http-failures');
            for (const item of httpFailures.slice(0, 20)) {
                console.error(`  - ${item}`);
            }
        }
        if (consoleMessages.length > 0) {
            console.error('[smoke] recent-console');
            for (const item of consoleMessages.slice(-20)) {
                console.error(`  - ${item}`);
            }
        }
        throw error;
    } finally {
        await closeBrowser().catch(() => {});
    }
}

run().catch((error) => {
    console.error('[smoke] FAIL', error);
    process.exit(1);
});
