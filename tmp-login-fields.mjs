import { chromium } from 'playwright';

(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const page=await browser.newPage();
 await page.goto('http://127.0.0.1:3002/login', {waitUntil:'domcontentloaded'});
 const infos = await page.$$eval('input', els => els.map((e,idx)=>({idx, type:e.type, ph:e.placeholder, value:e.value, className:e.className, id:e.id, aria:e.getAttribute('aria-label')})));
 console.log('inputs', JSON.stringify(infos, null, 2));
 const emailInputs = page.locator('input', {has: page.locator('xpath=ancestor::body')});
 const buttons = await page.$$eval('button', els => els.map((e)=>({type:e.type,text:(e.textContent||'').trim().replace(/\s+/g,' '), className:e.className, visible:e.offsetParent!==null})).filter((b)=>b.text));
 console.log('buttons', JSON.stringify(buttons, null,2));
 await browser.close();
})();
