import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('console', (m) => console.log('console', m.type(), m.text()));
  await page.goto('http://127.0.0.1:3002/login', { waitUntil: 'domcontentloaded' });

  await page.locator('input[type="email"]').fill('piwpiw@naver.com');
  await page.locator('input[type="password"]').fill('admin');
  await page.getByRole('button', { name: '이메일로 로그인' }).click();

  await page.waitForTimeout(12000);
  console.log('url', page.url());
  console.log('path', new URL(page.url()).pathname);
  const cookies = await context.cookies('http://127.0.0.1:3002');
  console.log('cookies', JSON.stringify(cookies.filter(c => c.name.includes('secret_paws') || c.name.includes('sb-') || c.name.includes('auth') || c.name.includes('token'))));

  const body = await page.locator('body').innerText();
  const hasFailed = body.includes('실패') || body.includes('오류') || body.includes('완료');
  console.log('body_has_failed_or_complete', hasFailed);
  console.log('body_preview', body.slice(0, 300));

  await page.screenshot({ path: 'logs/login-inline2.png', fullPage: true });
  await browser.close();
})();
