import { createBrowserRuntime } from './scripts/lib/chrome-runtime.mjs';

(async()=>{
 const {context,closeBrowser}=await createBrowserRuntime({headless:true,channel:'msedge'});
 const page=await context.newPage();
 await page.goto('http://127.0.0.1:3002/login',{waitUntil:'domcontentloaded'});
 await page.locator('input[type="email"]').fill('piwpiw@naver.com');
 await page.locator('input[type="password"]').fill('admin');
 await page.getByRole('button',{name:/이메일로 로그인/}).click();
 console.log('clicked');
 await page.waitForTimeout(5000);
 console.log('after5', page.url());
 await page.waitForTimeout(5000);
 console.log('after10', page.url());
 await page.waitForTimeout(5000);
 console.log('after15', page.url());
 await page.waitForTimeout(5000);
 console.log('after20', page.url());
 await closeBrowser();
})();
