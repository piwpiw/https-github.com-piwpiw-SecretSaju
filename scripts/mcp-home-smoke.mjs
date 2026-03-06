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
    const page = await context.newPage();

    const consoleErrors = [];
    const consoleLogs = [];
    const pageErrors = [];
    const httpFailures = [];
    page.on('console', (msg) => {
        consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
        if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (error) => pageErrors.push(String(error)));
    page.on('response', (response) => {
        if (response.status() >= 500) {
            httpFailures.push(`${response.status()} ${response.url()}`);
        }
    });

    try {
        console.log(`[home-smoke] open ${baseUrl}/`);
        await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded', timeout: 90000 });

        const form = page.locator('form').filter({
            has: page.getByRole('button', { name: '사주 분석 시작' }),
        });
        const nameInput = form.locator('input[placeholder="홍길동"]');
        await nameInput.fill('HOMEUSER');
        await form.locator('input[placeholder="예: 1990 (또는 19900101)"]').fill('1990');
        await form.locator('input[placeholder="1~12"]').fill('1');
        await form.locator('input[placeholder="1~31"]').fill('1');

        const selects = form.locator('select');
        await selects.nth(0).selectOption('12');
        await selects.nth(1).selectOption('00');

        const submitButton = form.getByRole('button', { name: '사주 분석 시작' });
        await submitButton.waitFor({ state: 'visible', timeout: 30000 });
        await page.waitForFunction(() => {
            const button = Array.from(document.querySelectorAll('button')).find((el) => {
                return (el.textContent || '').trim() === '사주 분석 시작' && el instanceof HTMLButtonElement;
            });
            return button ? !button.disabled : false;
        }, { timeout: 30000 });
        await submitButton.click();

        const completed = await Promise.race([
            page.getByText('공식 사주 분석 리포트').first().waitFor({ state: 'visible', timeout: 120000 }).then(() => true),
            page.getByText('결과 다시 계산').first().waitFor({ state: 'visible', timeout: 120000 }).then(() => true),
            page.getByText('분석 공유하기').first().waitFor({ state: 'visible', timeout: 120000 }).then(() => true),
        ]);
        if (!completed) {
            throw new Error('home-result-timeout');
        }
        const screenshotPath = path.join(outDir, 'mcp-home-smoke-result.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`[home-smoke] PASS screenshot=${screenshotPath}`);
    } catch (error) {
        const failPath = path.join(outDir, 'mcp-home-smoke-fail.png');
        await page.screenshot({ path: failPath, fullPage: true });
        const reportCount = await page.getByText('공식 사주 분석 리포트').count();
        const submitButtons = await page.locator('button').count();
        const nameInputCount = await page.locator('input[placeholder="홍길동"]').count();
        const loadingPercentCount = await page.locator('text=/\\d+%/').count();
        const url = page.url();
        console.error(`[home-smoke] fail-screenshot=${failPath}`);
        console.error(`[home-smoke] state url=${url} report=${reportCount} submitButtons=${submitButtons} nameInput=${nameInputCount} loadingHint=${loadingPercentCount}`);
        if (httpFailures.length) {
            console.error(`[home-smoke] http-failures=${JSON.stringify(httpFailures.slice(0, 10))}`);
        }
        if (consoleErrors.length) {
            console.error(`[home-smoke] console-errors=${JSON.stringify(consoleErrors.slice(0, 10))}`);
        }
        if (pageErrors.length) {
            console.error(`[home-smoke] page-errors=${JSON.stringify(pageErrors.slice(0, 10))}`);
        }
        if (consoleLogs.length) {
            console.error(`[home-smoke] console-tail=${JSON.stringify(consoleLogs.slice(-20))}`);
        }
        throw error;
    } finally {
        await closeBrowser();
    }
}

run().catch((error) => {
    console.error('[home-smoke] FAIL', error);
    process.exit(1);
});
