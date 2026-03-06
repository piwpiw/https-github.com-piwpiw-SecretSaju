import { createBrowserRuntime } from "./scripts/lib/chrome-runtime.mjs";

(async()=>{
 const {context,closeBrowser}=await createBrowserRuntime({headless:true,channel:'msedge'});
 const page=await context.newPage();
 await page.goto('http://127.0.0.1:3002/login',{waitUntil:'domcontentloaded'});
 await page.locator('input[type="email"]').first().fill('piwpiw@naver.com');
 await page.locator('input[type="password"]').first().fill('admin');
 await page.getByRole('button',{name:/이메일로 로그인|로그인/}).first().click();
 await page.waitForFunction(()=>!window.location.pathname.includes('/login'),{timeout:12000});
 console.log('path', new URL(page.url()).pathname);
 await page.goto('http://127.0.0.1:3002/admin');
 console.log('admin status', (await (await page.goto('http://127.0.0.1:3002/admin')).status()));
 await closeBrowser();
})();
