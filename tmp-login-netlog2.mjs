import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('response', async (res) => {
    if (res.url().includes('supabase') || res.url().includes('auth') || res.url().includes('/api/')) {
      const text = await res.text().catch(()=>'');
      if (res.status() >= 400) {
        console.log('[resp] ', res.status(), res.url(), text.slice(0,180));
      } else {
        console.log('[resp] ', res.status(), res.url(), text.slice(0,120));
      }
    }
  });

  await page.goto('http://127.0.0.1:3002/login', { waitUntil: 'domcontentloaded' });
  await page.locator('input[type="email"]').fill('piwpiw@naver.com');
  await page.locator('input[type="password"]').fill('admin');
  await page.getByRole('button',{name:'이메일로 로그인'}).click();
  await page.waitForTimeout(15000);
  const url = page.url();
  console.log('final-url', url);

  const messages = await page.locator('[class*=text-rose], [class*=text-emerald], .text-emerald-400, .text-rose-400').allTextContents();
  console.log('messages', messages);
  console.log('input-message-area', await page.locator('.min-h-\[52px\]').first().innerText().catch(()=>''));
  await page.screenshot({ path: 'logs/login-network.png', fullPage: true });
  await browser.close();
})();
