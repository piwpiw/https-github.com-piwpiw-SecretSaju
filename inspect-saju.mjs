import { chromium } from 'playwright';
const browser = await chromium.launch({headless:true});
const page = await browser.newPage();
await page.goto('http://127.0.0.1:3002/saju', { waitUntil:'domcontentloaded' });
await page.waitForTimeout(2500);

const texts = await page.getByText('Official Analysis Report').count();
console.log('officialReport count', texts);

const allInputs = await page.locator('input').count();
console.log('input count', allInputs);
for (let i=0;i<Math.min(allInputs,40);i++){
  const el = page.locator('input').nth(i);
  const info = await el.evaluate(node => ({
    type: node.getAttribute('type'),
    placeholder: node.getAttribute('placeholder'),
    value: node.value,
    name: node.getAttribute('name'),
    visible: node.offsetParent !== null,
    label: node.getAttribute('aria-label'),
  }));
  if (info.type === 'checkbox') continue;
  if (info.placeholder || info.ariaLabel || info.name || i<6){
    console.log('input', i, info);
  }
}

const buttons = await page.locator('button').count();
console.log('button count', buttons);
for (let i=0;i<Math.min(buttons,80);i++){
  const txt = (await page.locator('button').nth(i).textContent())?.trim();
  if (!txt) continue;
  const vis = await page.locator('button').nth(i).isVisible().catch(()=>false);
  const dis = await page.locator('button').nth(i).isDisabled().catch(()=>false);
  console.log('button', i, JSON.stringify(txt), 'visible', vis, 'disabled', dis);
}

await page.close();
await browser.close();
