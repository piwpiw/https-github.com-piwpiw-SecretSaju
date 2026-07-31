#!/usr/bin/env node
/**
 * 없는 타로 카드 그림을 Gemini 로 생성해 받아 저장한다.
 *
 * 왜 Gemini 인가:
 * 이 작업 환경의 네트워크 정책이 이미지 API 중 `generativelanguage.googleapis.com`
 * 하나만 허용한다. OpenAI·Stability·Replicate·fal 은 프록시가 CONNECT 단계에서
 * 막는다(키가 있어도 안 된다). 확인한 결과다.
 *
 * 사용법:
 *   GEMINI_API_KEY=... node scripts/tarot/fetch-images.mjs
 *   GEMINI_API_KEY=... node scripts/tarot/fetch-images.mjs --limit 5   # 먼저 몇 장만
 *   GEMINI_API_KEY=... node scripts/tarot/fetch-images.mjs --force MA17
 *
 * 이미 있는 파일은 건너뛴다. 중간에 끊겨도 다시 돌리면 이어서 받는다.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

/**
 * 키는 환경변수에서 받는다. 없으면 .env.local 에서 읽는다.
 * .env.local 은 .gitignore 에 잡혀 있어 커밋되지 않는다.
 */
function readKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try {
    const line = readFileSync('.env.local', 'utf8')
      .split('\n')
      .find((row) => row.startsWith('GEMINI_API_KEY='));
    return line ? line.slice('GEMINI_API_KEY='.length).trim() : null;
  } catch {
    return null;
  }
}

const API_KEY = readKey();
if (!API_KEY) {
  console.error('GEMINI_API_KEY 가 없습니다.');
  console.error('  aistudio.google.com/apikey 에서 발급한 뒤,');
  console.error('  .env.local 에 GEMINI_API_KEY=... 로 넣거나 환경변수로 지정하세요.');
  process.exit(1);
}

// 이 키로 확인한 이미지 모델(2026-07 기준):
//   gemini-3-pro-image           최상위
//   gemini-3.1-flash-image       빠름
//   gemini-2.5-flash-image       나노바나나
//   imagen-4.0-ultra-generate-001  (predict 엔드포인트라 이 스크립트로는 못 부른다)
const MODEL = process.env.GEMINI_IMAGE_MODEL ?? 'gemini-3-pro-image';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const DECK_DIR = 'public/tarot-decks/standard';

/** 화풍을 붙들어 둘 참조 카드. 이미 들어와 있는 16장 중 하나 */
const STYLE_REFERENCE = `${DECK_DIR}/MA00.jpg`;

const args = process.argv.slice(2);
const limit = Number(args[args.indexOf('--limit') + 1]) || Infinity;
const forceCode = args.includes('--force') ? args[args.indexOf('--force') + 1] : null;

/** 프롬프트 목록은 generate-missing.mjs 가 만든다. 문장을 두 곳에 두지 않는다. */
// --force 로 특정 카드를 다시 뽑을 때는 "없는 카드" 목록에 그 카드가 없다.
// 이미 받아 둔 카드이기 때문이다. 그때는 전체 목록을 받아 온다.
const listArgs = ['scripts/tarot/generate-missing.mjs', '--json'];
if (forceCode) listArgs.push('--all');
const jobsJson = execFileSync('node', listArgs, {
  encoding: 'utf8',
  maxBuffer: 32 * 1024 * 1024,
});
let jobs = JSON.parse(jobsJson);
if (forceCode) jobs = jobs.filter((job) => job.code === forceCode);
jobs = jobs.slice(0, limit);

const referenceBase64 = existsSync(STYLE_REFERENCE)
  ? readFileSync(STYLE_REFERENCE).toString('base64')
  : null;
if (!referenceBase64) {
  console.warn(`참조 이미지가 없습니다: ${STYLE_REFERENCE}`);
  console.warn('화풍이 기존 카드와 어긋날 수 있습니다.');
}

const STYLE_INSTRUCTION = referenceBase64
  ? '첨부한 카드와 같은 화풍으로 그리세요. 금색 액자 테두리, 짙은 남색 바탕, '
    + '같은 붓질과 색감, 같은 구도 비율. 덱 한 벌로 보여야 합니다.'
  : '';

async function generateOne(job) {
  const parts = [{ text: `${job.prompt}\n\n${STYLE_INSTRUCTION}\n\nSquare 1:1 image, ${EXPECTED_EDGE}x${EXPECTED_EDGE}.` }];
  if (referenceBase64) {
    parts.push({ inline_data: { mime_type: 'image/jpeg', data: referenceBase64 } });
  }

  const response = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // generationConfig.responseModalities 를 넣으면 400 이 난다.
    // 이미지 모델은 별도 지정 없이도 이미지를 돌려준다.
    body: JSON.stringify({ contents: [{ parts }] }),
  });

  if (!response.ok) {
    // 본문을 너무 짧게 자르면 쿼터 지표 이름(free_tier)이 잘려 나가
    // 아래 결제 안내 분기가 걸리지 않는다. 실제로 그랬다.
    const detail = await response.text();
    throw new Error(`HTTP ${response.status} — ${detail.slice(0, 1500)}`);
  }

  const data = await response.json();
  const imagePart = data.candidates?.[0]?.content?.parts?.find(
    (part) => part.inlineData?.data ?? part.inline_data?.data,
  );
  const base64 = imagePart?.inlineData?.data ?? imagePart?.inline_data?.data;
  if (!base64) {
    throw new Error(`이미지가 오지 않았습니다: ${JSON.stringify(data).slice(0, 300)}`);
  }

  const buffer = Buffer.from(base64, 'base64');

  if (buffer[0] !== 0xFF || buffer[1] !== 0xD8) {
    throw new Error('JPEG 가 아닙니다');
  }

  const size = readJpegSize(buffer);
  if (!size || size.width !== size.height || size.width !== EXPECTED_EDGE) {
    throw new Error(
      `크기가 ${size ? `${size.width}x${size.height}` : '판독 불가'} 입니다. `
      + `${EXPECTED_EDGE}x${EXPECTED_EDGE} 를 기대했습니다.`
    );
  }

  // 응답은 JPEG 다. 확장자를 png 로 두면 이름이 내용과 어긋난다.
  // 실제로 처음에 그렇게 저장해서 62장이 "png 라는 이름의 jpeg" 가 됐다.
  writeFileSync(`${DECK_DIR}/${job.code}.jpg`, buffer);
}

/**
 * JPEG 의 가로·세로를 읽는다.
 *
 * `gemini-3-pro-image` 는 정사각형을 요구해도 가끔 세로(848x1264)를 돌려준다.
 * 실제로 78장 중 3장이 그렇게 들어와 있었고, 화면에서는 카드가 눌려 보인다.
 * 받은 뒤에 재서 아니면 다시 뽑는다.
 */
function readJpegSize(buffer) {
  let i = 2;
  while (i < buffer.length - 9) {
    if (buffer[i] !== 0xFF) { i += 1; continue; }
    const marker = buffer[i + 1];
    // SOF0/SOF1/SOF2 에 크기가 들어 있다
    if (marker === 0xC0 || marker === 0xC1 || marker === 0xC2) {
      return { height: buffer.readUInt16BE(i + 5), width: buffer.readUInt16BE(i + 7) };
    }
    i += 2 + buffer.readUInt16BE(i + 2);
  }
  return null;
}

/** 카드는 정사각형이어야 한다. 덱 안에서 한 장만 비율이 다르면 바로 눈에 띈다. */
const EXPECTED_EDGE = 1024;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let done = 0;
let failed = 0;
console.log(`${jobs.length}장 생성 시작 (모델 ${MODEL})\n`);

for (const [index, job] of jobs.entries()) {
  const target = `${DECK_DIR}/${job.code}.jpg`;
  if (existsSync(target) && !forceCode) {
    console.log(`[${index + 1}/${jobs.length}] ${job.code} 이미 있음, 건너뜀`);
    continue;
  }

  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await generateOne(job);
      const size = readFileSync(target).length;
      console.log(`[${index + 1}/${jobs.length}] ${job.code} ${job.name} — ${(size / 1024).toFixed(0)}KB`);
      done += 1;
      lastError = null;
      break;
    } catch (error) {
      lastError = error;

      // 429 + free_tier 는 결제가 안 켜진 것이다. 재시도해도 그대로다.
      if (/HTTP 429/.test(error.message) && /free_tier/.test(error.message)) {
        console.error('\n무료 등급이라 이미지 생성 쿼터가 0 입니다.');
        console.error('키가 속한 Google Cloud 프로젝트에 결제를 연결해야 합니다.');
        console.error('  console.cloud.google.com → 해당 프로젝트 → 결제 → 결제 계정 연결');
        process.exit(2);
      }

      await wait(attempt * 4000); // 일시적 속도 제한이면 물러섰다 다시
    }
  }

  if (lastError) {
    console.error(`[${index + 1}/${jobs.length}] ${job.code} 실패 — ${lastError.message}`);
    failed += 1;
  }

  await wait(1200); // 속도 제한 여유
}

console.log(`\n생성 ${done}장 / 실패 ${failed}장`);
console.log('확인: node scripts/tarot/generate-missing.mjs | head -1');
