import { chromium } from "playwright";

const browser=await chromium.launch({headless:true, channel:'msedge'});
const page=await browser.newPage();
await page.goto('http://127.0.0.1:3002/login',{waitUntil:'domcontentloaded'});
await page.locator('input[type="email"]').fill('piwpiw@naver.com');
await page.locator('input[type="password"]').fill('admin');
await page.getByRole('button',{name:'이메일로 로그인'}).click();
await page.waitForTimeout(6000);
const nodes = await page.evaluate(() => {
  const items = Array.from(document.querySelectorAll('*'));
  return items
    .filter((el) => {
      const t = (el.textContent || '').trim();
      return t.includes('로그인') || t.includes('실패') || t.includes('완료') || t.includes('오류') || t.includes('환영');
    })
    .slice(0, 60)
    .map((el) => ({
      tag: el.tagName,
      cls: el.className,
      text: (el.textContent || '').replace(/\s+/g, ' ').trim(),
      vis: el.offsetParent !== null,
    }));
});
console.log(JSON.stringify(nodes, null, 2));
console.log('inputs', await page.$$eval('input', els => els.map(e=>({type:e.type, value:e.value, ph:e.placeholder, cls:e.className, vis:e.offsetParent!==null}))));
console.log('url', page.url());
await page.screenshot({ path:'logs/login-after6.png', fullPage:true});
await browser.close();
