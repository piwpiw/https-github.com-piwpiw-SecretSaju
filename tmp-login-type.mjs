import { chromium } from 'playwright';

(async()=>{
 const browser = await chromium.launch({headless:true,channel:'msedge'});
 const page = await browser.newPage();
 await page.goto('http://127.0.0.1:3002/login', {waitUntil:'domcontentloaded'});
 const emailInput = page.locator('input[type="email"]');
 const passInput = page.locator('input[type="password"]');
 await emailInput.click();
 await emailInput.type('piwpiw@naver.com', { delay: 10 });
 await passInput.click();
 await passInput.type('admin', { delay: 10 });
 const vals = await page.$$eval('input', els => els.map(e=>e.value));
 console.log('vals', vals);
 await page.locator('button', { hasText: '이메일로 로그인' }).click();
 await page.waitForTimeout(500);
 console.log('after vals', await page.$$eval('input', els => els.map(e=>e.value)));
 console.log('err', await page.locator('text=이메일과 비밀번호를 모두 입력해 주세요.').count());
 await page.screenshot({path:'logs/login-keyboard.png',fullPage:true});
 await browser.close();
})();
