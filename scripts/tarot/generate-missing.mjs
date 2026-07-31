#!/usr/bin/env node
/**
 * 없는 타로 카드 그림을 뽑을 목록과 프롬프트를 출력한다.
 *
 * 이미지 생성 자체는 이 스크립트가 하지 않는다. 생성은 MCP 도구로 돌리고,
 * 여기서는 "무엇을 어떤 문장으로 뽑아야 하는지"를 한 곳에서 정한다.
 * 그래야 나중에 다시 뽑을 때도 같은 문장이 나온다.
 *
 * 사용법:
 *   node scripts/tarot/generate-missing.mjs            # 없는 카드 목록 + 프롬프트
 *   node scripts/tarot/generate-missing.mjs --json     # 기계가 읽을 형태로
 */
import { existsSync, readFileSync } from 'node:fs';
import { buildPrompt } from './card-scenes.mjs';

const DECK_DIR = 'public/tarot-decks/standard';

// tarotDeck.ts 를 직접 부르지 않고, 코드 규칙만 재현한다.
// (TS 를 노드에서 바로 부르면 빌드 도구가 필요해진다)
const MAJOR_NAMES = [
  'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
  'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
  'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
  'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement', 'The World',
];
const SUITS = [
  { suit: 'wands', code: 'WA' }, { suit: 'cups', code: 'CU' },
  { suit: 'swords', code: 'SW' }, { suit: 'pentacles', code: 'PE' },
];
const RANKS = [
  ['A', 'Ace'], ['2', 'Two'], ['3', 'Three'], ['4', 'Four'], ['5', 'Five'],
  ['6', 'Six'], ['7', 'Seven'], ['8', 'Eight'], ['9', 'Nine'], ['10', 'Ten'],
  ['P', 'Page'], ['N', 'Knight'], ['Q', 'Queen'], ['K', 'King'],
];

const deck = [
  ...MAJOR_NAMES.map((name_en, i) => ({
    code: `MA${String(i).padStart(2, '0')}`, arcana: 'major', name_en, number: i, suit: null, rank: name_en,
  })),
  ...SUITS.flatMap(({ suit, code }) =>
    RANKS.map(([short, label], i) => ({
      code: `${code}${String(i + 1).padStart(2, '0')}-${short}`,
      arcana: 'minor', suit, rank: short, number: i + 1,
      name_en: `${label} of ${suit}`,
    }))),
];

const missing = deck.filter((card) => !existsSync(`${DECK_DIR}/${card.code}.png`));
const jobs = missing.map((card) => ({ code: card.code, name: card.name_en, prompt: buildPrompt(card) }));
const unbuildable = jobs.filter((job) => !job.prompt);

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(jobs, null, 2));
} else {
  console.log(`없는 카드 ${missing.length}장 / 전체 ${deck.length}장\n`);
  for (const job of jobs) console.log(`${job.code}  ${job.name}\n  ${job.prompt}\n`);
  if (unbuildable.length) {
    console.log(`\n프롬프트를 만들지 못한 카드 ${unbuildable.length}장: ${unbuildable.map((j) => j.code).join(', ')}`);
    process.exit(1);
  }
  console.log(`프롬프트 ${jobs.length}장 준비 완료. 스타일 참조로 ${DECK_DIR}/MA00.png 를 함께 넣으세요.`);
}
