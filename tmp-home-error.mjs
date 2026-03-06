import { chromium } from "playwright";

const base='http://127.0.0.1:3002';
const browser=await chromium.launch({ headless:true, channel:'msedge' });
const page=await browser.newPage();
page.on('console', msg => {
  if (msg.type() === 'error' || msg.type() === 'warn') {
    console.log('console', msg.type(), msg.text());
  }
});
await page.goto(base+'/',{waitUntil:'domcontentloaded'});
await page.waitForTimeout(1000);
const form = page.locator('form').filter({ has: page.locator('input[placeholder="홍길동"]')}).first();
await form.locator('input[placeholder="홍길동"]').fill('HOMEUSER');
await form.locator('input[placeholder="예: 1990 (또는 19900101)"]').fill('1990');
await form.locator('input[placeholder="1~12"]').fill('1');
await form.locator('input[placeholder="1~31"]').fill('1');
await form.locator('select').first().selectOption('12');
await form.locator('select').nth(1).selectOption('00');
await page.waitForTimeout(500);
await Promise.all([
  page.waitForTimeout(12000),
  form.getByRole('button',{name:'사주 분석 시작'}).click()
]);
console.log('flow', await page.locator('text=출생정보 입력').count(), await page.locator('text=공식 사주 분석 리포트').count(), await page.locator('text=계산 처리 중 오류가 발생했습니다.').count());
await page.screenshot({ path:'logs/home-error-debug.png', fullPage:true});
await browser.close();
