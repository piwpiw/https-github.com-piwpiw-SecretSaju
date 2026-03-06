import { chromium } from "playwright";

const base='http://127.0.0.1:3002';
const browser=await chromium.launch({ headless:true, channel:'msedge' });
const page=await browser.newPage();
const captures=[];
page.on('response',res=>{
  const u=res.url();
  if (u.includes('auth') || u.includes('/api/')) captures.push({type:'res',url:u,status:res.status(),method:res.request().method()});
});
page.on('requestfailed', req=>captures.push({type:'fail',url:req.url(),error:req.failure()?.errorText}));
page.on('console',msg=>{if(msg.type()==='error') captures.push({type:'console',text:msg.text()});});
await page.goto(base+'/login');
await page.locator('input[type="email"]').fill('piwpiw@naver.com');
await page.locator('input[type="password"]').fill('admin');
await page.getByRole('button',{name:'이메일로 로그인'}).click();
await page.waitForTimeout(8000);
console.log(JSON.stringify(captures,null,2));
console.log('url', page.url());
await browser.close();
