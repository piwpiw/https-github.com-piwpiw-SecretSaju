import { chromium } from "playwright";

const base='http://127.0.0.1:3002';
const browser=await chromium.launch({ headless:true, channel:'msedge' });
const page=await browser.newPage();
await page.goto(base+'/',{waitUntil:'domcontentloaded'});
const form=page.locator('form').filter({ has: page.locator('input[placeholder="홍길동"]').first()}).first();
await form.locator('input[placeholder="홍길동"]').fill('HOMEUSER');
await form.locator('input[placeholder="예: 1990 (또는 19900101)"]').fill('1990');
await form.locator('input[placeholder="1~12"]').fill('1');
await form.locator('input[placeholder="1~31"]').fill('1');
await form.locator('select').first().selectOption('12');
await form.locator('select').nth(1).selectOption('00');
await form.getByRole('button',{name:'사주 분석 시작'}).click();
await page.waitForTimeout(15000);
const results = [
  '결과 다시 계산',
  '출생정보 입력',
  '사주 분석 시작',
  '분석 공유하기',
  '공식 사주 분석 리포트',
  '결과 화면',
  '시베리안',
  '신뢰도 점수',
  'Loading',
];
for (const r of results) {
  console.log(r, await page.locator(`text=${r}`).count());
}
await page.screenshot({ path:'logs/home-state-final.png', fullPage:true});
await browser.close();
