import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('response', async (res) => {
    const url = res.url();
    if (!url.includes('auth/v1') && !url.includes('token') && !url.includes('signup') && !url.includes('login')) return;
    const payload = await res.text().catch(() => '');
    console.log('[resp]', res.status(), url, payload);
  });
  page.on('requestfailed', req => console.log('[req-fail]', req.url(), req.failure()?.errorText));

  await page.goto('http://127.0.0.1:3002/login', { waitUntil: 'domcontentloaded' });
  await page.locator('input[type="email"]').fill('piwpiw@naver.com');
  await page.locator('input[type="password"]').fill('admin');
  await page.getByRole('button',{name:'이메일로 로그인'}).click();
  await page.waitForTimeout(5000);

  console.log('after5 url', page.url());
  await page.waitForTimeout(7000);
  console.log('after12 url', page.url());

  await browser.close();
})();
