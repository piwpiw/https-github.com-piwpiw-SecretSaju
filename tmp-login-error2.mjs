import { chromium } from "playwright";

const base='http://127.0.0.1:3002';
const browser=await chromium.launch({headless:true, channel:'msedge'});
const page=await browser.newPage();
await page.goto(base+'/login');
await page.locator('input[type="email"]').fill('piwpiw@naver.com');
await page.locator('input[type="password"]').fill('admin');
await page.getByRole('button',{name:'이메일로 로그인'}).click();
await page.waitForTimeout(5000);
const html=await page.content();
console.log(html.includes('Login failed') || html.includes('로그인')); 
const texts=await page.$$eval('body *', els => {
  return els.filter(el => ['P', 'DIV', 'SPAN', 'BUTTON', 'H2'].includes(el.tagName)).map(el => el.textContent?.trim()).filter(Boolean).filter(t=>t.includes('로그인')||t.includes('오류')||t.includes('실패')||t.includes('완료')||t.includes('환영'));
});
console.log(texts.slice(0, 30));
const errors=await page.locator('[class*=text-rose-400], [class*=bg-rose-500/10], [class*=text-red]').allTextContents();
console.log('errorBlocks', errors);
console.log('url', page.url());
await browser.close();
