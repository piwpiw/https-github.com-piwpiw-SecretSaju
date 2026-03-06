import { chromium } from "playwright";

const base='http://127.0.0.1:3002';
const browser=await chromium.launch({headless:true,channel:'msedge'});
const page=await browser.newPage();
const entries=[];
page.on('response',res=>{
  const u=res.url();
  if(u.includes('/api/')) entries.push({url:u,status:res.status(),method:res.request().method()});
});
await page.goto(base+'/',{waitUntil:'domcontentloaded'});
await page.locator('input[placeholder="홍길동"]').first().fill('HOMEUSER');
await page.locator('input[placeholder="예: 1990 (또는 19900101)"]').first().fill('1990');
await page.locator('input[placeholder="1~12"]').first().fill('1');
await page.locator('input[placeholder="1~31"]').first().fill('1');
const selects=page.locator('select');
await selects.nth(0).selectOption('12');
await selects.nth(1).selectOption('00');
await page.getByRole('button',{name:'사주 분석 시작'}).click();
await page.waitForTimeout(8000);
console.log(JSON.stringify(entries.filter(e=>e.url.includes('saju')||e.url.includes('wallet')||e.url.includes('auth')||e.url.includes('history')||e.url.includes('user/sync')),null,2));
const txt=await page.locator('body').innerText();
for (const key of ['젤리가 부족','실패','비밀번호','결과','리포트','에러','오류']) {
  console.log(key, txt.includes(key));
}
await page.screenshot({path:'logs/home-after-attempt3.png',fullPage:true});
await browser.close();
