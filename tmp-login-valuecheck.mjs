import { chromium } from 'playwright';

(async()=>{
 const browser = await chromium.launch({headless:true,channel:'msedge'});
 const context=await browser.newContext();
 const page=await context.newPage();
 await page.goto('http://127.0.0.1:3002/login', { waitUntil: 'domcontentloaded' });
 await page.locator('input[type="email"]').fill('piwpiw@naver.com');
 await page.locator('input[type="password"]').fill('admin');
 const pre = await page.$$eval('input[type="email"], input[type="password"]', els => els.map(e => ({type:e.type, value:e.value, visible:e.offsetParent!==null})));
 console.log('pre', JSON.stringify(pre));
 const btn = page.getByRole('button',{name:'이메일로 로그인'});
 console.log('btn visible', await btn.isVisible());
 await btn.click();
 await page.waitForTimeout(1000);
 const postClick = await page.$$eval('input[type="email"], input[type="password"]', els => els.map(e => ({type:e.type, value:e.value, visible:e.offsetParent!==null})));
 const errTexts = await page.$$eval('.text-rose-400, .text-emerald-400, .font-bold', els => els.map(e => ({class:e.className, text:(e.textContent||'').trim()})).filter(v=>v.text).slice(0,20));
 console.log('postClick', JSON.stringify(postClick));
 console.log('errors', JSON.stringify(errTexts));
 console.log('html', await page.content().then(h=> h.includes('이메일과 비밀번호를 모두 입력해 주세요.')));
 const msg = await page.locator('body').locator('text=/이메일과 비밀번호를 모두 입력해 주세요.|이메일.*비밀번호|로그인이 완료/').first().textContent().catch(()=>null);
 console.log('msg', msg);
 await page.waitForTimeout(3000);
 console.log('url2', page.url());
 await browser.close();
})();
