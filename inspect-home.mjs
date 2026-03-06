import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('http://127.0.0.1:3002/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2000);
const yearInput = page.locator('input[placeholder*="1990"]');
const form = yearInput.locator('xpath=ancestor::form[1]');
const textInputs = form.locator('input[type="text"]');
await textInputs.nth(0).fill('HOMEUSER');
await textInputs.nth(1).fill('1990');
await textInputs.nth(2).fill('1');
await textInputs.nth(3).fill('1');
await page.waitForTimeout(500);
const button = form.locator('button:has-text("사주 분석 시작")').first();
console.log('after fill disabled', await button.isDisabled().catch(()=>null));
await page.evaluate(() => {
  const el = Array.from(document.querySelectorAll('button')).find((b)=>b.textContent?.trim()==='사주 분석 시작');
  if (el) {
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
});
await page.waitForTimeout(500);
console.log('after dispatch disabled', await button.isDisabled().catch(()=>null));
await browser.close();
