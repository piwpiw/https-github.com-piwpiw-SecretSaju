/**
 * 78장 각각의 장면 설명.
 *
 * 실사 이미지를 생성할 때 쓴다. 라이더-웨이트 도상을 따르되, 이미 들어와 있는
 * 16장(MA00~MA14, MA16)의 화풍에 맞춘다. 그 16장은 금색 액자 테두리, 짙은 남색
 * 바탕, 위쪽 로마 숫자, 아래쪽 영문 이름 띠를 가진 채색 일러스트다.
 *
 * 덱은 한 벌로 보여야 한다. 16장은 한 화풍이고 62장은 다른 화풍이면
 * 전부 코드로 그린 것만도 못하다. 그래서 기존 카드를 스타일 참조로 넣는다.
 */

/** 모든 카드에 공통으로 붙는 화풍 지시 */
export const STYLE_SUFFIX = [
  'ornate gold filigree border frame',
  'deep midnight navy background',
  'painted fantasy illustration, rich saturated colors, soft volumetric light',
  'centered symmetrical composition',
  'traditional Rider-Waite tarot iconography',
  'no text except the card title banner',
].join(', ');

/** 메이저 22장의 장면 */
export const MAJOR_SCENES = {
  MA00: 'The Fool: a young traveller in a bright embroidered tunic stepping off a sunlit cliff edge, a small white rose in one hand, a knapsack tied to a staff over the shoulder, a small white dog leaping at the heels, snowy peaks behind',
  MA01: 'The Magician: a robed figure standing at an altar with one arm raised holding a wand toward the sky and the other pointing to the ground, a wand, cup, sword and pentacle laid on the table, a lemniscate above the head, roses and lilies twining around',
  MA02: 'The High Priestess: a veiled priestess seated between one black pillar and one white pillar, a crescent moon at her feet, a horned lunar crown, a scroll held against her blue robe, a curtain of pomegranates behind her',
  MA03: 'The Empress: a serene crowned woman with twelve stars in her diadem, reclining on a cushioned throne in a field of ripe wheat, a heart-shaped shield bearing the sign of Venus beside her, a waterfall and cypress trees behind',
  MA04: 'The Emperor: a bearded ruler in red robes and armour seated on a grey stone throne carved with four rams heads, an ankh sceptre in one hand and an orb in the other, barren red mountains behind',
  MA05: 'The Hierophant: a mitred priest enthroned between two stone pillars, a triple cross sceptre raised in one hand and the other lifted in blessing, two tonsured acolytes kneeling before him, two crossed keys at his feet',
  // 전통 도상은 나체의 남녀지만, 일반 서비스라 시대풍 옷을 입힌다.
  // 천사·나무·산은 그대로 두어 카드의 의미는 잃지 않는다.
  MA06: 'The Lovers: a man and a woman in flowing medieval robes, fully clothed, standing apart in a green garden and looking up, a winged angel with outstretched arms in the clouds above them, a flaming tree behind the man and a fruiting tree with a coiled serpent behind the woman, a mountain between them',
  MA07: 'The Chariot: an armoured prince standing in a stone chariot beneath a starry canopy, a crescent moon on each shoulder plate, holding a wand, drawn by one black sphinx and one white sphinx, a walled city behind',
  MA08: 'Strength: a calm woman in a white gown with a lemniscate above her head and a garland of flowers at her waist, gently closing the jaws of a tawny lion with her bare hands, a golden meadow behind',
  MA09: 'The Hermit: an old bearded man in a grey hooded cloak standing alone on a snowy summit, raising a lantern holding a six-pointed star, leaning on a long wooden staff, night sky behind',
  MA10: 'Wheel of Fortune: a great golden wheel inscribed with mystic letters turning in the sky, a sphinx bearing a sword resting on top, a serpent descending on the left and a jackal-headed figure rising on the right, a winged bull, lion, eagle and angel reading books in the four corners of the clouds',
  MA11: 'Justice: a crowned figure enthroned between two pillars under a violet veil, holding an upright sword in the right hand and a pair of balanced golden scales in the left, red robes and a square clasp at the breast',
  MA12: 'The Hanged Man: a man in a blue tunic and red hose suspended upside down by one ankle from a living T-shaped wooden cross, the free leg crossed behind the other, hands behind his back, a golden nimbus of light around his serene head',
  MA13: 'Death: an armoured skeletal rider on a pale white horse carrying a black banner with a white five-petalled rose, a fallen king and a kneeling bishop and child before him, a river and two towers with the sun rising between them behind',
  MA14: 'Temperance: a large winged angel in a white robe with a solar disc on the brow, one foot on land and one in a pool, pouring water between two golden cups in an unbroken arc, irises growing on the bank and a crowned path leading to distant mountains',
  // 전통 도상은 사슬에 묶인 나체 남녀지만, 일반 서비스라 옷을 입힌다.
  // 뿔·사슬·역오각성은 그대로 두어 카드의 의미는 잃지 않는다.
  MA15: 'The Devil: a horned goat-headed figure perched on a black pedestal, an inverted pentagram above its brow, below it a man and a woman in simple dark medieval robes, fully clothed, loosely chained by the neck to the pedestal, small horns on their heads, torchlight and embers',
  MA16: 'The Tower: a tall grey stone tower on a rocky crag struck by a bolt of lightning, its golden crown blasted off the top, flames bursting from the windows, two figures in medieval robes falling headlong through the dark sky, yellow sparks scattered around',
  MA17: 'The Star: a kneeling woman pouring water from two urns, one into a pool and one onto the earth, a large eight-pointed star and seven smaller stars in the night sky, an ibis in a tree',
  MA18: 'The Moon: a full moon with a face between two grey towers, a dog and a wolf howling, a crayfish emerging from a pool, a winding path leading to the horizon',
  // 전통 도상은 나체 아이지만 그대로 둘 수 없다. 옷을 입힌다.
  MA19: 'The Sun: a radiant sun with a face, a joyful child in a simple white tunic riding a white horse, a red banner streaming, tall sunflowers behind a garden wall',
  MA20: 'Judgement: an angel blowing a golden trumpet from the clouds, figures rising from open coffins with arms raised, grey mountains behind',
  MA21: 'The World: a dancing figure draped in violet cloth inside a green laurel wreath, holding two wands, with a lion, bull, eagle and angel in the four corners',
};

/** 수트별 소재 */
export const SUIT_MOTIF = {
  wands: { one: 'flowering wooden stave', many: 'flowering wooden staves', palette: 'warm amber and gold', land: 'sunlit desert plain' },
  cups: { one: 'golden chalice', many: 'golden chalices', palette: 'sky blue and silver', land: 'calm water and green shore' },
  swords: { one: 'upright steel sword', many: 'upright steel swords', palette: 'cool violet and grey', land: 'windswept cloudy sky' },
  pentacles: { one: 'golden coin engraved with a pentagram', many: 'golden coins engraved with pentagrams', palette: 'deep green and gold', land: 'fertile garden and stone arch' },
};

/** 숫자 카드 1~10 의 장면 (수트 무관 공통 뼈대) */
export const RANK_SCENES = {
  1: 'a single {object} held by a hand emerging from a cloud, radiant',
  2: 'a figure contemplating two {object} at a parapet overlooking {land}',
  3: 'three {object} arranged before a figure looking toward the horizon over {land}',
  4: 'four {object} marking the corners of a celebration canopy over {land}',
  5: 'five {object} amid a scene of struggle and scarcity on {land}',
  6: 'six {object} carried in a procession of return and generosity across {land}',
  7: 'a lone figure defending a position with seven {object} on {land}',
  8: 'eight {object} in swift motion through the air above {land}',
  9: 'a wary figure guarding nine {object} standing in a row on {land}',
  10: 'a bowed figure carrying the burden of ten {object} toward a distant house over {land}',
};

/** 코트 카드의 장면 */
export const COURT_SCENES = {
  P: 'a young page in a tunic standing on {land}, examining a single {object} with curiosity',
  N: 'an armored knight on a charging horse across {land}, raising a single {object}',
  Q: 'a crowned queen enthroned on {land}, holding a single {object}, serene and composed',
  K: 'a crowned king enthroned on {land}, holding a single {object}, commanding and still',
};

/** 카드 하나의 프롬프트를 만든다 */
/** 메이저 번호를 로마 숫자로. 기존 16장이 카드 위쪽에 이 표기를 갖고 있다 */
const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];

export function buildPrompt(card) {
  if (card.arcana === 'major') {
    const scene = MAJOR_SCENES[card.code];
    if (!scene) return null;
    const numeral = ROMAN[card.number] ?? '';
    // 기존 카드는 위쪽에 로마 숫자, 아래쪽에 영문 이름 띠를 갖는다.
    // 이걸 빼먹으면 새로 넣은 카드만 번호가 없어 한 벌로 안 보인다.
    return `Tarot card "${card.name_en}". ${scene}. `
      + `The roman numeral ${numeral} in a small ornate cartouche at the top of the card, `
      + `the title "${card.name_en.toUpperCase()}" on a gold banner at the bottom. `
      + `${STYLE_SUFFIX}`;
  }

  const motif = SUIT_MOTIF[card.suit];
  if (!motif) return null;

  const template = card.rank in COURT_SCENES
    ? COURT_SCENES[card.rank]
    : RANK_SCENES[card.number];
  if (!template) return null;

  // 에이스와 코트는 한 개만 든다. 복수형을 그대로 끼우면
  // "a single upright steel swords" 같은 문장이 나온다.
  const isSingle = card.rank in COURT_SCENES || card.number === 1;
  const scene = template
    .replaceAll('{object}', isSingle ? motif.one : motif.many)
    .replaceAll('{land}', motif.land);

  return `Tarot card "${card.name_en}". ${scene}. Dominant palette ${motif.palette}. ${STYLE_SUFFIX}`;
}
