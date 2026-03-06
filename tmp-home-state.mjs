import { chromium } from "playwright";

const base='http://127.0.0.1:3002';
const browser=await chromium.launch({headless:true,channel:'msedge'});
const page=await browser.newPage();
await page.goto(base+'/',{waitUntil:'domcontentloaded'});
await page.locator('input[placeholder="홍길동"]').first().fill('HOMEUSER');
await page.locator('input[placeholder="예: 1990 (또는 19900101)"]').first().fill('1990');
await page.locator('input[placeholder="1~12"]').first().fill('1');
await page.locator('input[placeholder="1~31"]').first().fill('1');
const selects=page.locator('select');
await selects.nth(0).selectOption('12');
await selects.nth(1).selectOption('00');
const states=await page.$$eval('button',els=>els.map(el=>({text:(el.textContent||'').trim(),disabled:el.disabled,type:el.type}))); 
console.log(JSON.stringify(states.filter(s=>s.text.includes('사주')||s.text.includes('시작')||s.text.includes('확인')||s.text.includes('실행')||s.text.includes('검색'),),null,2));
await browser.close();
