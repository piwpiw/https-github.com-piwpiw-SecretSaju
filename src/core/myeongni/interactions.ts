import type { FourPillars, GanJi } from '../calendar/ganji';

export type InteractionType =
  | 'stem_combination'
  | 'stem_transformation'
  | 'branch_combination'
  | 'branch_transformation'
  | 'branch_three_combination'
  | 'branch_directional_combination'
  | 'branch_clash'
  | 'branch_punishment'
  | 'branch_harm'
  | 'branch_break';

export type InteractionScope = 'natal' | 'daewun' | 'saewun' | 'wolun' | 'ilun';

export interface InteractionEvent {
  id: string;
  type: InteractionType;
  actors: string[];
  scope: InteractionScope;
  result: 'detected' | 'formed' | 'blocked' | 'broken';
  resultingElement?: string;
  strength: number;
  description: string;
  evidenceIds: string[];
  conflictFlags: string[];
}

interface IndexedActor {
  key: string;
  index: number;
  origin: 'natal' | 'transit';
}

interface RelationDefinition {
  pair: [number, number];
  type: InteractionType;
  description: string;
  resultingElement?: string;
  strength: number;
  result: InteractionEvent['result'];
  evidenceIds: string[];
}

interface MultiBranchRelationDefinition {
  actors: [number, number, number];
  type: InteractionType;
  description: string;
  resultingElement?: string;
  strength: number;
  result: InteractionEvent['result'];
  evidenceIds: string[];
}

export interface TransitInteractionInput {
  daewun?: GanJi | null;
  saewun?: GanJi | null;
  wolun?: GanJi | null;
  ilun?: GanJi | null;
}

const STEM_COMBINATIONS: RelationDefinition[] = [
  { pair: [0, 5], type: 'stem_combination', resultingElement: 'earth', strength: 0.72, result: 'formed', evidenceIds: ['interaction.stem.combine.0-5'], description: '천간의 갑(甲)과 기(己)가 서로 끌어당기는 갑기합(甲己合) 관계가 나타납니다.' },
  { pair: [1, 6], type: 'stem_combination', resultingElement: 'metal', strength: 0.72, result: 'formed', evidenceIds: ['interaction.stem.combine.1-6'], description: '천간의 을(乙)과 경(庚)이 서로 끌어당기는 을경합(乙庚合) 관계가 나타납니다.' },
  { pair: [2, 7], type: 'stem_combination', resultingElement: 'water', strength: 0.72, result: 'formed', evidenceIds: ['interaction.stem.combine.2-7'], description: '천간의 병(丙)과 신(辛)이 서로 끌어당기는 병신합(丙辛合) 관계가 나타납니다.' },
  { pair: [3, 8], type: 'stem_combination', resultingElement: 'wood', strength: 0.72, result: 'formed', evidenceIds: ['interaction.stem.combine.3-8'], description: '천간의 정(丁)과 임(壬)이 서로 끌어당기는 정임합(丁壬合) 관계가 나타납니다.' },
  { pair: [4, 9], type: 'stem_combination', resultingElement: 'fire', strength: 0.72, result: 'formed', evidenceIds: ['interaction.stem.combine.4-9'], description: '천간의 무(戊)와 계(癸)가 서로 끌어당기는 무계합(戊癸合) 관계가 나타납니다.' },
];

const BRANCH_COMBINATIONS: RelationDefinition[] = [
  { pair: [0, 1], type: 'branch_combination', resultingElement: 'earth', strength: 0.7, result: 'formed', evidenceIds: ['interaction.branch.combine.0-1'], description: '지지의 자(子)와 축(丑)이 짝을 이루어 서로 돕는 자축육합(子丑六合)이 나타납니다.' },
  { pair: [2, 11], type: 'branch_combination', resultingElement: 'wood', strength: 0.7, result: 'formed', evidenceIds: ['interaction.branch.combine.2-11'], description: '지지의 인(寅)과 해(亥)가 짝을 이루어 서로 돕는 인해육합(寅亥六合)이 나타납니다.' },
  { pair: [3, 10], type: 'branch_combination', resultingElement: 'fire', strength: 0.7, result: 'formed', evidenceIds: ['interaction.branch.combine.3-10'], description: '지지의 묘(卯)와 술(戌)이 짝을 이루어 서로 돕는 묘술육합(卯戌六合)이 나타납니다.' },
  { pair: [4, 9], type: 'branch_combination', resultingElement: 'metal', strength: 0.7, result: 'formed', evidenceIds: ['interaction.branch.combine.4-9'], description: '지지의 진(辰)과 유(酉)가 짝을 이루어 서로 돕는 진유육합(辰酉六合)이 나타납니다.' },
  { pair: [5, 8], type: 'branch_combination', resultingElement: 'water', strength: 0.7, result: 'formed', evidenceIds: ['interaction.branch.combine.5-8'], description: '지지의 사(巳)와 신(申)이 짝을 이루어 서로 돕는 사신육합(巳申六合)이 나타납니다.' },
  { pair: [6, 7], type: 'branch_combination', resultingElement: 'earth', strength: 0.7, result: 'formed', evidenceIds: ['interaction.branch.combine.6-7'], description: '지지의 오(午)와 미(未)가 짝을 이루어 서로 돕는 오미육합(午未六合)이 나타납니다.' },
];

const BRANCH_CLASHES: RelationDefinition[] = [
  { pair: [0, 6], type: 'branch_clash', strength: 0.84, result: 'detected', evidenceIds: ['interaction.branch.clash.0-6'], description: '자(子)와 오(午)가 정면으로 부딪치는 자오충(子午冲)입니다. 변화와 이동의 기운이 커집니다.' },
  { pair: [1, 7], type: 'branch_clash', strength: 0.84, result: 'detected', evidenceIds: ['interaction.branch.clash.1-7'], description: '축(丑)과 미(未)가 정면으로 부딪치는 축미충(丑未冲)입니다. 변화와 이동의 기운이 커집니다.' },
  { pair: [2, 8], type: 'branch_clash', strength: 0.84, result: 'detected', evidenceIds: ['interaction.branch.clash.2-8'], description: '인(寅)과 신(申)이 정면으로 부딪치는 인신충(寅申冲)입니다. 변화와 이동의 기운이 커집니다.' },
  { pair: [3, 9], type: 'branch_clash', strength: 0.84, result: 'detected', evidenceIds: ['interaction.branch.clash.3-9'], description: '묘(卯)와 유(酉)가 정면으로 부딪치는 묘유충(卯酉冲)입니다. 변화와 이동의 기운이 커집니다.' },
  { pair: [4, 10], type: 'branch_clash', strength: 0.84, result: 'detected', evidenceIds: ['interaction.branch.clash.4-10'], description: '진(辰)과 술(戌)이 정면으로 부딪치는 진술충(辰戌冲)입니다. 변화와 이동의 기운이 커집니다.' },
  { pair: [5, 11], type: 'branch_clash', strength: 0.84, result: 'detected', evidenceIds: ['interaction.branch.clash.5-11'], description: '사(巳)와 해(亥)가 정면으로 부딪치는 사해충(巳亥冲)입니다. 변화와 이동의 기운이 커집니다.' },
];

const BRANCH_PUNISHMENTS: RelationDefinition[] = [
  { pair: [0, 3], type: 'branch_punishment', strength: 0.67, result: 'detected', evidenceIds: ['interaction.branch.punishment.0-3'], description: '자(子)와 묘(卯)가 서로 마찰을 일으키는 자묘형(子卯刑)입니다. 관계에서 긴장이 쌓이기 쉽습니다.' },
  { pair: [2, 5], type: 'branch_punishment', strength: 0.67, result: 'detected', evidenceIds: ['interaction.branch.punishment.2-5'], description: '인(寅)과 사(巳)가 서로 마찰을 일으키는 인사형(寅巳刑)입니다. 관계에서 긴장이 쌓이기 쉽습니다.' },
  { pair: [5, 8], type: 'branch_punishment', strength: 0.67, result: 'detected', evidenceIds: ['interaction.branch.punishment.5-8'], description: '사(巳)와 신(申)이 서로 마찰을 일으키는 사신형(巳申刑)입니다. 관계에서 긴장이 쌓이기 쉽습니다.' },
  { pair: [2, 8], type: 'branch_punishment', strength: 0.67, result: 'detected', evidenceIds: ['interaction.branch.punishment.2-8'], description: '인(寅)과 신(申)이 서로 마찰을 일으키는 인신형(寅申刑)입니다. 관계에서 긴장이 쌓이기 쉽습니다.' },
  { pair: [1, 7], type: 'branch_punishment', strength: 0.67, result: 'detected', evidenceIds: ['interaction.branch.punishment.1-7'], description: '축(丑)과 미(未)가 서로 마찰을 일으키는 축미형(丑未刑)입니다. 관계에서 긴장이 쌓이기 쉽습니다.' },
  { pair: [7, 10], type: 'branch_punishment', strength: 0.67, result: 'detected', evidenceIds: ['interaction.branch.punishment.7-10'], description: '미(未)와 술(戌)이 서로 마찰을 일으키는 미술형(未戌刑)입니다. 관계에서 긴장이 쌓이기 쉽습니다.' },
  { pair: [1, 10], type: 'branch_punishment', strength: 0.67, result: 'detected', evidenceIds: ['interaction.branch.punishment.1-10'], description: '축(丑)과 술(戌)이 서로 마찰을 일으키는 축술형(丑戌刑)입니다. 관계에서 긴장이 쌓이기 쉽습니다.' },
  { pair: [4, 4], type: 'branch_punishment', strength: 0.62, result: 'detected', evidenceIds: ['interaction.branch.punishment.4-4'], description: '같은 진(辰)이 겹쳐 스스로를 힘들게 하는 자형(自刑)입니다. 혼자 애태우는 일이 생기기 쉽습니다.' },
  { pair: [6, 6], type: 'branch_punishment', strength: 0.62, result: 'detected', evidenceIds: ['interaction.branch.punishment.6-6'], description: '같은 오(午)가 겹쳐 스스로를 힘들게 하는 자형(自刑)입니다. 혼자 애태우는 일이 생기기 쉽습니다.' },
  { pair: [9, 9], type: 'branch_punishment', strength: 0.62, result: 'detected', evidenceIds: ['interaction.branch.punishment.9-9'], description: '같은 유(酉)가 겹쳐 스스로를 힘들게 하는 자형(自刑)입니다. 혼자 애태우는 일이 생기기 쉽습니다.' },
  { pair: [11, 11], type: 'branch_punishment', strength: 0.62, result: 'detected', evidenceIds: ['interaction.branch.punishment.11-11'], description: '같은 해(亥)가 겹쳐 스스로를 힘들게 하는 자형(自刑)입니다. 혼자 애태우는 일이 생기기 쉽습니다.' },
];

const BRANCH_HARMS: RelationDefinition[] = [
  { pair: [0, 7], type: 'branch_harm', strength: 0.64, result: 'detected', evidenceIds: ['interaction.branch.harm.0-7'], description: '자(子)와 미(未)가 서로 어긋나는 해(害) 관계입니다. 은근한 갈등이나 손해가 따르기 쉽습니다.' },
  { pair: [1, 6], type: 'branch_harm', strength: 0.64, result: 'detected', evidenceIds: ['interaction.branch.harm.1-6'], description: '축(丑)과 오(午)가 서로 어긋나는 해(害) 관계입니다. 은근한 갈등이나 손해가 따르기 쉽습니다.' },
  { pair: [2, 5], type: 'branch_harm', strength: 0.64, result: 'detected', evidenceIds: ['interaction.branch.harm.2-5'], description: '인(寅)과 사(巳)가 서로 어긋나는 해(害) 관계입니다. 은근한 갈등이나 손해가 따르기 쉽습니다.' },
  { pair: [3, 4], type: 'branch_harm', strength: 0.64, result: 'detected', evidenceIds: ['interaction.branch.harm.3-4'], description: '묘(卯)와 진(辰)이 서로 어긋나는 해(害) 관계입니다. 은근한 갈등이나 손해가 따르기 쉽습니다.' },
  { pair: [8, 11], type: 'branch_harm', strength: 0.64, result: 'detected', evidenceIds: ['interaction.branch.harm.8-11'], description: '신(申)과 해(亥)가 서로 어긋나는 해(害) 관계입니다. 은근한 갈등이나 손해가 따르기 쉽습니다.' },
  { pair: [9, 10], type: 'branch_harm', strength: 0.64, result: 'detected', evidenceIds: ['interaction.branch.harm.9-10'], description: '유(酉)와 술(戌)이 서로 어긋나는 해(害) 관계입니다. 은근한 갈등이나 손해가 따르기 쉽습니다.' },
];

const BRANCH_BREAKS: RelationDefinition[] = [
  { pair: [0, 9], type: 'branch_break', strength: 0.61, result: 'broken', evidenceIds: ['interaction.branch.break.0-9'], description: '자(子)와 유(酉)가 서로 흐름을 깨뜨리는 파(破) 관계입니다. 이어지던 일이 흔들릴 수 있습니다.' },
  { pair: [1, 4], type: 'branch_break', strength: 0.61, result: 'broken', evidenceIds: ['interaction.branch.break.1-4'], description: '축(丑)과 진(辰)이 서로 흐름을 깨뜨리는 파(破) 관계입니다. 이어지던 일이 흔들릴 수 있습니다.' },
  { pair: [2, 11], type: 'branch_break', strength: 0.61, result: 'broken', evidenceIds: ['interaction.branch.break.2-11'], description: '인(寅)과 해(亥)가 서로 흐름을 깨뜨리는 파(破) 관계입니다. 이어지던 일이 흔들릴 수 있습니다.' },
  { pair: [3, 6], type: 'branch_break', strength: 0.61, result: 'broken', evidenceIds: ['interaction.branch.break.3-6'], description: '묘(卯)와 오(午)가 서로 흐름을 깨뜨리는 파(破) 관계입니다. 이어지던 일이 흔들릴 수 있습니다.' },
  { pair: [5, 8], type: 'branch_break', strength: 0.61, result: 'broken', evidenceIds: ['interaction.branch.break.5-8'], description: '사(巳)와 신(申)이 서로 흐름을 깨뜨리는 파(破) 관계입니다. 이어지던 일이 흔들릴 수 있습니다.' },
  { pair: [7, 10], type: 'branch_break', strength: 0.61, result: 'broken', evidenceIds: ['interaction.branch.break.7-10'], description: '미(未)와 술(戌)이 서로 흐름을 깨뜨리는 파(破) 관계입니다. 이어지던 일이 흔들릴 수 있습니다.' },
];

const BRANCH_THREE_COMBINATIONS: MultiBranchRelationDefinition[] = [
  { actors: [8, 0, 4], type: 'branch_three_combination', resultingElement: 'water', strength: 0.79, result: 'formed', evidenceIds: ['interaction.branch.three-combination.8-0-4'], description: '신(申)·자(子)·진(辰) 세 글자가 모여 수(水) 기운으로 뭉치는 삼합(三合)을 이룹니다.' },
  { actors: [11, 3, 7], type: 'branch_three_combination', resultingElement: 'wood', strength: 0.79, result: 'formed', evidenceIds: ['interaction.branch.three-combination.11-3-7'], description: '해(亥)·묘(卯)·미(未) 세 글자가 모여 목(木) 기운으로 뭉치는 삼합(三合)을 이룹니다.' },
  { actors: [2, 6, 10], type: 'branch_three_combination', resultingElement: 'fire', strength: 0.79, result: 'formed', evidenceIds: ['interaction.branch.three-combination.2-6-10'], description: '인(寅)·오(午)·술(戌) 세 글자가 모여 화(火) 기운으로 뭉치는 삼합(三合)을 이룹니다.' },
  { actors: [5, 9, 1], type: 'branch_three_combination', resultingElement: 'metal', strength: 0.79, result: 'formed', evidenceIds: ['interaction.branch.three-combination.5-9-1'], description: '사(巳)·유(酉)·축(丑) 세 글자가 모여 금(金) 기운으로 뭉치는 삼합(三合)을 이룹니다.' },
];

const BRANCH_DIRECTIONAL_COMBINATIONS: MultiBranchRelationDefinition[] = [
  { actors: [2, 3, 4], type: 'branch_directional_combination', resultingElement: 'wood', strength: 0.75, result: 'formed', evidenceIds: ['interaction.branch.directional.2-3-4'], description: '인(寅)·묘(卯)·진(辰)이 나란히 모여 동방 목(木) 기운이 강해지는 방합(方合)을 이룹니다.' },
  { actors: [5, 6, 7], type: 'branch_directional_combination', resultingElement: 'fire', strength: 0.75, result: 'formed', evidenceIds: ['interaction.branch.directional.5-6-7'], description: '사(巳)·오(午)·미(未)가 나란히 모여 남방 화(火) 기운이 강해지는 방합(方合)을 이룹니다.' },
  { actors: [8, 9, 10], type: 'branch_directional_combination', resultingElement: 'metal', strength: 0.75, result: 'formed', evidenceIds: ['interaction.branch.directional.8-9-10'], description: '신(申)·유(酉)·술(戌)이 나란히 모여 서방 금(金) 기운이 강해지는 방합(方合)을 이룹니다.' },
  { actors: [11, 0, 1], type: 'branch_directional_combination', resultingElement: 'water', strength: 0.75, result: 'formed', evidenceIds: ['interaction.branch.directional.11-0-1'], description: '해(亥)·자(子)·축(丑)이 나란히 모여 북방 수(水) 기운이 강해지는 방합(方合)을 이룹니다.' },
];

// 화(化) 설명 문구에 쓰이는 오행 표기(계산에는 관여하지 않는 표시용 라벨).
const ELEMENT_LABELS_KO: Record<string, string> = {
  wood: '목(木)',
  fire: '화(火)',
  earth: '토(土)',
  metal: '금(金)',
  water: '수(水)',
};

function toElementLabelKo(element?: string): string {
  return (element && ELEMENT_LABELS_KO[element]) || '해당 오행';
}

/**
 * 화면 표기용 라벨.
 *
 * `InteractionEvent`의 `scope`('daewun')와 `actors`('currentDaewunBranch')는
 * 내부 식별자라 영어다. 결과 화면의 "현재 운세 상호작용" 카드가 이 값을 그대로
 * 렌더링해서 사용자에게 `DAEWUN`, `yearStem · currentSaewunBranch` 처럼 보였다.
 * 계산에는 관여하지 않고 표시할 때만 쓴다.
 */
const SCOPE_LABELS_KO: Record<InteractionScope, string> = {
  natal: '원국',
  daewun: '대운',
  saewun: '세운',
  wolun: '월운',
  ilun: '일운',
};

export function toScopeLabelKo(scope?: string): string {
  return (scope && SCOPE_LABELS_KO[scope as InteractionScope]) || '원국';
}

const ACTOR_LABELS_KO: Record<string, string> = {
  yearStem: '연간',
  monthStem: '월간',
  dayStem: '일간',
  hourStem: '시간',
  yearBranch: '연지',
  monthBranch: '월지',
  dayBranch: '일지',
  hourBranch: '시지',
  currentDaewunStem: '대운 천간',
  currentDaewunBranch: '대운 지지',
  currentSaewunStem: '세운 천간',
  currentSaewunBranch: '세운 지지',
  currentWolunStem: '월운 천간',
  currentWolunBranch: '월운 지지',
  currentIlunStem: '일운 천간',
  currentIlunBranch: '일운 지지',
};

/** 알 수 없는 키는 원문을 그대로 보여준다(영어가 남으면 라벨 누락 신호). */
export function toActorLabelKo(actorKey: string): string {
  return ACTOR_LABELS_KO[actorKey] || actorKey;
}

const STEM_INDEX_ELEMENTS = ['wood', 'wood', 'fire', 'fire', 'earth', 'earth', 'metal', 'metal', 'water', 'water'] as const;
const BRANCH_INDEX_ELEMENTS = ['water', 'earth', 'wood', 'wood', 'earth', 'fire', 'fire', 'earth', 'metal', 'metal', 'earth', 'water'] as const;

const BRANCH_RELATIONS = [
  ...BRANCH_COMBINATIONS,
  ...BRANCH_CLASHES,
  ...BRANCH_PUNISHMENTS,
  ...BRANCH_HARMS,
  ...BRANCH_BREAKS,
];

function normalizePair(a: number, b: number): [number, number] {
  return a <= b ? [a, b] : [b, a];
}

function pairKey(a: number, b: number): string {
  const [left, right] = normalizePair(a, b);
  return `${left}:${right}`;
}

function matchesPair(a: number, b: number, pair: [number, number]) {
  const [left, right] = normalizePair(a, b);
  const [pairLeft, pairRight] = normalizePair(pair[0], pair[1]);
  return left === pairLeft && right === pairRight;
}

function toIndexedStemActors(fourPillars: FourPillars, origin: IndexedActor['origin'] = 'natal', prefix = ''): IndexedActor[] {
  return [
    { key: `${prefix}yearStem`, index: fourPillars.year.stemIndex, origin },
    { key: `${prefix}monthStem`, index: fourPillars.month.stemIndex, origin },
    { key: `${prefix}dayStem`, index: fourPillars.day.stemIndex, origin },
    { key: `${prefix}hourStem`, index: fourPillars.hour.stemIndex, origin },
  ];
}

function toIndexedBranchActors(fourPillars: FourPillars, origin: IndexedActor['origin'] = 'natal', prefix = ''): IndexedActor[] {
  return [
    { key: `${prefix}yearBranch`, index: fourPillars.year.branchIndex, origin },
    { key: `${prefix}monthBranch`, index: fourPillars.month.branchIndex, origin },
    { key: `${prefix}dayBranch`, index: fourPillars.day.branchIndex, origin },
    { key: `${prefix}hourBranch`, index: fourPillars.hour.branchIndex, origin },
  ];
}

function toIndexedTransitStemActor(label: 'currentDaewun' | 'currentSaewun', pillar: GanJi): IndexedActor[] {
  return [{ key: `${label}Stem`, index: pillar.stemIndex, origin: 'transit' }];
}

function toIndexedTransitBranchActor(label: 'currentDaewun' | 'currentSaewun', pillar: GanJi): IndexedActor[] {
  return [{ key: `${label}Branch`, index: pillar.branchIndex, origin: 'transit' }];
}

function createEvent(prefix: string, left: IndexedActor, right: IndexedActor, relation: RelationDefinition, scope: InteractionScope): InteractionEvent {
  return {
    id: `${prefix}:${left.key}:${right.key}:${relation.type}`,
    type: relation.type,
    actors: [left.key, right.key],
    scope,
    result: relation.result,
    resultingElement: relation.resultingElement,
    strength: relation.strength,
    description: relation.description,
    evidenceIds: relation.evidenceIds,
    conflictFlags: [],
  };
}

function createMultiBranchEvent(prefix: string, actors: IndexedActor[], relation: MultiBranchRelationDefinition, scope: InteractionScope): InteractionEvent {
  return {
    id: `${prefix}:${actors.map((actor) => actor.key).join(':')}:${relation.type}`,
    type: relation.type,
    actors: actors.map((actor) => actor.key),
    scope,
    result: relation.result,
    resultingElement: relation.resultingElement,
    strength: relation.strength,
    description: relation.description,
    evidenceIds: relation.evidenceIds,
    conflictFlags: [],
  };
}

function getActorElement(actor: IndexedActor): string {
  if (actor.key.endsWith('Stem')) {
    return STEM_INDEX_ELEMENTS[actor.index] ?? 'earth';
  }
  return BRANCH_INDEX_ELEMENTS[actor.index] ?? 'earth';
}

function hasTransformationSupport(
  relation: RelationDefinition,
  actors: IndexedActor[],
  contextActors: IndexedActor[],
): boolean {
  if (!relation.resultingElement) {
    return false;
  }
  return contextActors
    .filter((actor) => !actors.some((entry) => entry.key === actor.key))
    .some((actor) => getActorElement(actor) === relation.resultingElement);
}

function createTransformationEvent(
  prefix: string,
  actors: IndexedActor[],
  relation: RelationDefinition,
  scope: InteractionScope,
  formed: boolean,
): InteractionEvent {
  return {
    id: `${prefix}:${actors.map((actor) => actor.key).join(':')}:${relation.type}-transformation`,
    type: relation.type === 'stem_combination' ? 'stem_transformation' : 'branch_transformation',
    actors: actors.map((actor) => actor.key),
    scope,
    result: formed ? 'formed' : 'blocked',
    resultingElement: relation.resultingElement,
    strength: formed ? Math.min(0.95, relation.strength + 0.08) : Math.max(0.35, relation.strength - 0.18),
    description: formed
      ? `${relation.description} 주변 글자의 도움이 충분해 ${toElementLabelKo(relation.resultingElement)} 기운으로 화(化)합니다.`
      : `${relation.description} 다만 주변 글자의 도움이 부족해 ${toElementLabelKo(relation.resultingElement)} 기운으로 완전히 바뀌지는(化) 못합니다.`,
    evidenceIds: [...relation.evidenceIds, formed ? 'interaction.transformation.supported' : 'interaction.transformation.blocked'],
    conflictFlags: formed ? [] : ['transformation_support_missing'],
  };
}

function finalizeEvents(events: InteractionEvent[], actorIndexLookup: Map<string, number>): InteractionEvent[] {
  const pairTypeCounts = new Map<string, Set<InteractionType>>();
  for (const event of events) {
    const key = [...event.actors].sort().join(':');
    const existing = pairTypeCounts.get(key) ?? new Set<InteractionType>();
    existing.add(event.type);
    pairTypeCounts.set(key, existing);
  }

  return events.map((event) => {
    const key = [...event.actors].sort().join(':');
    const relationTypes = pairTypeCounts.get(key);
    if (relationTypes && relationTypes.size > 1 && event.actors.length === 2) {
      const actorIndexes = event.actors.map((actor) => actorIndexLookup.get(actor) ?? -1);
      return {
        ...event,
        conflictFlags: ['multi_relation_pair', `pair:${key}`, `pairKey:${pairKey(actorIndexes[0], actorIndexes[1])}`],
      };
    }
    return event;
  });
}

function analyzeWithinScope(
  stems: IndexedActor[],
  branches: IndexedActor[],
  scope: InteractionScope,
): InteractionEvent[] {
  const events: InteractionEvent[] = [];
  const contextActors = [...stems, ...branches];

  for (let i = 0; i < stems.length; i += 1) {
    for (let j = i + 1; j < stems.length; j += 1) {
      const relation = STEM_COMBINATIONS.find((entry) => matchesPair(stems[i].index, stems[j].index, entry.pair));
      if (relation) {
        const pairActors = [stems[i], stems[j]];
        events.push(createEvent('stem', stems[i], stems[j], relation, scope));
        events.push(
          createTransformationEvent(
            'stem-transform',
            pairActors,
            relation,
            scope,
            hasTransformationSupport(relation, pairActors, contextActors),
          ),
        );
      }
    }
  }

  for (let i = 0; i < branches.length; i += 1) {
    for (let j = i + 1; j < branches.length; j += 1) {
      for (const relation of BRANCH_RELATIONS) {
        if (matchesPair(branches[i].index, branches[j].index, relation.pair)) {
          const pairActors = [branches[i], branches[j]];
          events.push(createEvent('branch', branches[i], branches[j], relation, scope));
          if (relation.type === 'branch_combination' && relation.resultingElement) {
            events.push(
              createTransformationEvent(
                'branch-transform',
                pairActors,
                relation,
                scope,
                hasTransformationSupport(relation, pairActors, contextActors),
              ),
            );
          }
        }
      }
    }
  }

  const branchIndexMap = new Map<number, IndexedActor>();
  for (const actor of branches) {
    if (!branchIndexMap.has(actor.index)) {
      branchIndexMap.set(actor.index, actor);
    }
  }

  for (const relation of BRANCH_THREE_COMBINATIONS) {
    const actors = relation.actors.map((index) => branchIndexMap.get(index)).filter(Boolean) as IndexedActor[];
    if (actors.length === 3) {
      events.push(createMultiBranchEvent('branch-three', actors, relation, scope));
    }
  }

  for (const relation of BRANCH_DIRECTIONAL_COMBINATIONS) {
    const actors = relation.actors.map((index) => branchIndexMap.get(index)).filter(Boolean) as IndexedActor[];
    if (actors.length === 3) {
      events.push(createMultiBranchEvent('branch-directional', actors, relation, scope));
    }
  }

  const actorIndexLookup = new Map<string, number>();
  for (const actor of [...stems, ...branches]) {
    actorIndexLookup.set(actor.key, actor.index);
  }

  return finalizeEvents(events, actorIndexLookup);
}

function analyzeCrossScope(
  natalStems: IndexedActor[],
  natalBranches: IndexedActor[],
  transitStems: IndexedActor[],
  transitBranches: IndexedActor[],
  scope: Exclude<InteractionScope, 'natal'>,
): InteractionEvent[] {
  const events: InteractionEvent[] = [];
  const contextActors = [...natalStems, ...natalBranches, ...transitStems, ...transitBranches];

  for (const natalStem of natalStems) {
    for (const transitStem of transitStems) {
      const relation = STEM_COMBINATIONS.find((entry) => matchesPair(natalStem.index, transitStem.index, entry.pair));
      if (relation) {
        const pairActors = [natalStem, transitStem];
        events.push(createEvent('transit-stem', natalStem, transitStem, relation, scope));
        events.push(
          createTransformationEvent(
            'transit-stem-transform',
            pairActors,
            relation,
            scope,
            hasTransformationSupport(relation, pairActors, contextActors),
          ),
        );
      }
    }
  }

  for (const natalBranch of natalBranches) {
    for (const transitBranch of transitBranches) {
      for (const relation of BRANCH_RELATIONS) {
        if (matchesPair(natalBranch.index, transitBranch.index, relation.pair)) {
          const pairActors = [natalBranch, transitBranch];
          events.push(createEvent('transit-branch', natalBranch, transitBranch, relation, scope));
          if (relation.type === 'branch_combination' && relation.resultingElement) {
            events.push(
              createTransformationEvent(
                'transit-branch-transform',
                pairActors,
                relation,
                scope,
                hasTransformationSupport(relation, pairActors, contextActors),
              ),
            );
          }
        }
      }
    }
  }

  const combinedBranches = [...natalBranches, ...transitBranches];
  const branchIndexMap = new Map<number, IndexedActor>();
  for (const actor of combinedBranches) {
    if (!branchIndexMap.has(actor.index) || actor.origin === 'transit') {
      branchIndexMap.set(actor.index, actor);
    }
  }

  for (const relation of BRANCH_THREE_COMBINATIONS) {
    const actors = relation.actors.map((index) => branchIndexMap.get(index)).filter(Boolean) as IndexedActor[];
    if (actors.length === 3 && actors.some((actor) => actor.origin === 'transit')) {
      events.push(createMultiBranchEvent('transit-branch-three', actors, relation, scope));
    }
  }

  for (const relation of BRANCH_DIRECTIONAL_COMBINATIONS) {
    const actors = relation.actors.map((index) => branchIndexMap.get(index)).filter(Boolean) as IndexedActor[];
    if (actors.length === 3 && actors.some((actor) => actor.origin === 'transit')) {
      events.push(createMultiBranchEvent('transit-branch-directional', actors, relation, scope));
    }
  }

  const actorIndexLookup = new Map<string, number>();
  for (const actor of [...natalStems, ...natalBranches, ...transitStems, ...transitBranches]) {
    actorIndexLookup.set(actor.key, actor.index);
  }

  return finalizeEvents(events, actorIndexLookup);
}

export function analyzeVisibleInteractions(fourPillars: FourPillars): InteractionEvent[] {
  return analyzeWithinScope(
    toIndexedStemActors(fourPillars),
    toIndexedBranchActors(fourPillars),
    'natal',
  );
}

export function analyzeTransitInteractions(
  fourPillars: FourPillars,
  transitInput: TransitInteractionInput,
): InteractionEvent[] {
  const natalStems = toIndexedStemActors(fourPillars);
  const natalBranches = toIndexedBranchActors(fourPillars);
  const events: InteractionEvent[] = [];

  if (transitInput.daewun) {
    events.push(
      ...analyzeCrossScope(
        natalStems,
        natalBranches,
        toIndexedTransitStemActor('currentDaewun', transitInput.daewun),
        toIndexedTransitBranchActor('currentDaewun', transitInput.daewun),
        'daewun',
      ),
    );
  }

  if (transitInput.saewun) {
    events.push(
      ...analyzeCrossScope(
        natalStems,
        natalBranches,
        toIndexedTransitStemActor('currentSaewun', transitInput.saewun),
        toIndexedTransitBranchActor('currentSaewun', transitInput.saewun),
        'saewun',
      ),
    );
  }

  if (transitInput.wolun) {
    events.push(
      ...analyzeCrossScope(
        natalStems,
        natalBranches,
        toIndexedTransitStemActor('currentSaewun', transitInput.wolun).map((actor) => ({ ...actor, key: actor.key.replace('currentSaewun', 'currentWolun') })),
        toIndexedTransitBranchActor('currentSaewun', transitInput.wolun).map((actor) => ({ ...actor, key: actor.key.replace('currentSaewun', 'currentWolun') })),
        'wolun',
      ),
    );
  }

  if (transitInput.ilun) {
    events.push(
      ...analyzeCrossScope(
        natalStems,
        natalBranches,
        toIndexedTransitStemActor('currentSaewun', transitInput.ilun).map((actor) => ({ ...actor, key: actor.key.replace('currentSaewun', 'currentIlun') })),
        toIndexedTransitBranchActor('currentSaewun', transitInput.ilun).map((actor) => ({ ...actor, key: actor.key.replace('currentSaewun', 'currentIlun') })),
        'ilun',
      ),
    );
  }

  return events;
}
