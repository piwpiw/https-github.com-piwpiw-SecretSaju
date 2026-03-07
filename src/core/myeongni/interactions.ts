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
  { pair: [0, 5], type: 'stem_combination', resultingElement: 'earth', strength: 0.72, result: 'formed', evidenceIds: ['interaction.stem.combine.0-5'], description: 'Gap-Gi style stem combination detected.' },
  { pair: [1, 6], type: 'stem_combination', resultingElement: 'metal', strength: 0.72, result: 'formed', evidenceIds: ['interaction.stem.combine.1-6'], description: 'Eul-Gyeong style stem combination detected.' },
  { pair: [2, 7], type: 'stem_combination', resultingElement: 'water', strength: 0.72, result: 'formed', evidenceIds: ['interaction.stem.combine.2-7'], description: 'Byeong-Sin style stem combination detected.' },
  { pair: [3, 8], type: 'stem_combination', resultingElement: 'wood', strength: 0.72, result: 'formed', evidenceIds: ['interaction.stem.combine.3-8'], description: 'Jeong-Im style stem combination detected.' },
  { pair: [4, 9], type: 'stem_combination', resultingElement: 'fire', strength: 0.72, result: 'formed', evidenceIds: ['interaction.stem.combine.4-9'], description: 'Mu-Gye style stem combination detected.' },
];

const BRANCH_COMBINATIONS: RelationDefinition[] = [
  { pair: [0, 1], type: 'branch_combination', resultingElement: 'earth', strength: 0.7, result: 'formed', evidenceIds: ['interaction.branch.combine.0-1'], description: 'Zi-Chuk six-combination detected.' },
  { pair: [2, 11], type: 'branch_combination', resultingElement: 'wood', strength: 0.7, result: 'formed', evidenceIds: ['interaction.branch.combine.2-11'], description: 'In-Hae six-combination detected.' },
  { pair: [3, 10], type: 'branch_combination', resultingElement: 'fire', strength: 0.7, result: 'formed', evidenceIds: ['interaction.branch.combine.3-10'], description: 'Myo-Sul six-combination detected.' },
  { pair: [4, 9], type: 'branch_combination', resultingElement: 'metal', strength: 0.7, result: 'formed', evidenceIds: ['interaction.branch.combine.4-9'], description: 'Jin-Yu six-combination detected.' },
  { pair: [5, 8], type: 'branch_combination', resultingElement: 'water', strength: 0.7, result: 'formed', evidenceIds: ['interaction.branch.combine.5-8'], description: 'Sa-Sin six-combination detected.' },
  { pair: [6, 7], type: 'branch_combination', resultingElement: 'earth', strength: 0.7, result: 'formed', evidenceIds: ['interaction.branch.combine.6-7'], description: 'O-Mi six-combination detected.' },
];

const BRANCH_CLASHES: RelationDefinition[] = [
  { pair: [0, 6], type: 'branch_clash', strength: 0.84, result: 'detected', evidenceIds: ['interaction.branch.clash.0-6'], description: 'Zi-O clash detected.' },
  { pair: [1, 7], type: 'branch_clash', strength: 0.84, result: 'detected', evidenceIds: ['interaction.branch.clash.1-7'], description: 'Chuk-Mi clash detected.' },
  { pair: [2, 8], type: 'branch_clash', strength: 0.84, result: 'detected', evidenceIds: ['interaction.branch.clash.2-8'], description: 'In-Sin clash detected.' },
  { pair: [3, 9], type: 'branch_clash', strength: 0.84, result: 'detected', evidenceIds: ['interaction.branch.clash.3-9'], description: 'Myo-Yu clash detected.' },
  { pair: [4, 10], type: 'branch_clash', strength: 0.84, result: 'detected', evidenceIds: ['interaction.branch.clash.4-10'], description: 'Jin-Sul clash detected.' },
  { pair: [5, 11], type: 'branch_clash', strength: 0.84, result: 'detected', evidenceIds: ['interaction.branch.clash.5-11'], description: 'Sa-Hae clash detected.' },
];

const BRANCH_PUNISHMENTS: RelationDefinition[] = [
  { pair: [0, 3], type: 'branch_punishment', strength: 0.67, result: 'detected', evidenceIds: ['interaction.branch.punishment.0-3'], description: 'Zi-Myo punishment detected.' },
  { pair: [2, 5], type: 'branch_punishment', strength: 0.67, result: 'detected', evidenceIds: ['interaction.branch.punishment.2-5'], description: 'In-Sa punishment link detected.' },
  { pair: [5, 8], type: 'branch_punishment', strength: 0.67, result: 'detected', evidenceIds: ['interaction.branch.punishment.5-8'], description: 'Sa-Sin punishment link detected.' },
  { pair: [2, 8], type: 'branch_punishment', strength: 0.67, result: 'detected', evidenceIds: ['interaction.branch.punishment.2-8'], description: 'In-Sin punishment link detected.' },
  { pair: [1, 7], type: 'branch_punishment', strength: 0.67, result: 'detected', evidenceIds: ['interaction.branch.punishment.1-7'], description: 'Chuk-Mi punishment link detected.' },
  { pair: [7, 10], type: 'branch_punishment', strength: 0.67, result: 'detected', evidenceIds: ['interaction.branch.punishment.7-10'], description: 'Mi-Sul punishment link detected.' },
  { pair: [1, 10], type: 'branch_punishment', strength: 0.67, result: 'detected', evidenceIds: ['interaction.branch.punishment.1-10'], description: 'Chuk-Sul punishment link detected.' },
  { pair: [4, 4], type: 'branch_punishment', strength: 0.62, result: 'detected', evidenceIds: ['interaction.branch.punishment.4-4'], description: 'Self-punishment on Jin detected.' },
  { pair: [6, 6], type: 'branch_punishment', strength: 0.62, result: 'detected', evidenceIds: ['interaction.branch.punishment.6-6'], description: 'Self-punishment on O detected.' },
  { pair: [9, 9], type: 'branch_punishment', strength: 0.62, result: 'detected', evidenceIds: ['interaction.branch.punishment.9-9'], description: 'Self-punishment on Yu detected.' },
  { pair: [11, 11], type: 'branch_punishment', strength: 0.62, result: 'detected', evidenceIds: ['interaction.branch.punishment.11-11'], description: 'Self-punishment on Hae detected.' },
];

const BRANCH_HARMS: RelationDefinition[] = [
  { pair: [0, 7], type: 'branch_harm', strength: 0.64, result: 'detected', evidenceIds: ['interaction.branch.harm.0-7'], description: 'Zi-Mi harm detected.' },
  { pair: [1, 6], type: 'branch_harm', strength: 0.64, result: 'detected', evidenceIds: ['interaction.branch.harm.1-6'], description: 'Chuk-O harm detected.' },
  { pair: [2, 5], type: 'branch_harm', strength: 0.64, result: 'detected', evidenceIds: ['interaction.branch.harm.2-5'], description: 'In-Sa harm detected.' },
  { pair: [3, 4], type: 'branch_harm', strength: 0.64, result: 'detected', evidenceIds: ['interaction.branch.harm.3-4'], description: 'Myo-Jin harm detected.' },
  { pair: [8, 11], type: 'branch_harm', strength: 0.64, result: 'detected', evidenceIds: ['interaction.branch.harm.8-11'], description: 'Sin-Hae harm detected.' },
  { pair: [9, 10], type: 'branch_harm', strength: 0.64, result: 'detected', evidenceIds: ['interaction.branch.harm.9-10'], description: 'Yu-Sul harm detected.' },
];

const BRANCH_BREAKS: RelationDefinition[] = [
  { pair: [0, 9], type: 'branch_break', strength: 0.61, result: 'broken', evidenceIds: ['interaction.branch.break.0-9'], description: 'Zi-Yu break detected.' },
  { pair: [1, 4], type: 'branch_break', strength: 0.61, result: 'broken', evidenceIds: ['interaction.branch.break.1-4'], description: 'Chuk-Jin break detected.' },
  { pair: [2, 11], type: 'branch_break', strength: 0.61, result: 'broken', evidenceIds: ['interaction.branch.break.2-11'], description: 'In-Hae break detected.' },
  { pair: [3, 6], type: 'branch_break', strength: 0.61, result: 'broken', evidenceIds: ['interaction.branch.break.3-6'], description: 'Myo-O break detected.' },
  { pair: [5, 8], type: 'branch_break', strength: 0.61, result: 'broken', evidenceIds: ['interaction.branch.break.5-8'], description: 'Sa-Sin break detected.' },
  { pair: [7, 10], type: 'branch_break', strength: 0.61, result: 'broken', evidenceIds: ['interaction.branch.break.7-10'], description: 'Mi-Sul break detected.' },
];

const BRANCH_THREE_COMBINATIONS: MultiBranchRelationDefinition[] = [
  { actors: [8, 0, 4], type: 'branch_three_combination', resultingElement: 'water', strength: 0.79, result: 'formed', evidenceIds: ['interaction.branch.three-combination.8-0-4'], description: 'Shin-Zi-Jin water frame detected.' },
  { actors: [11, 3, 7], type: 'branch_three_combination', resultingElement: 'wood', strength: 0.79, result: 'formed', evidenceIds: ['interaction.branch.three-combination.11-3-7'], description: 'Hae-Myo-Mi wood frame detected.' },
  { actors: [2, 6, 10], type: 'branch_three_combination', resultingElement: 'fire', strength: 0.79, result: 'formed', evidenceIds: ['interaction.branch.three-combination.2-6-10'], description: 'In-O-Sul fire frame detected.' },
  { actors: [5, 9, 1], type: 'branch_three_combination', resultingElement: 'metal', strength: 0.79, result: 'formed', evidenceIds: ['interaction.branch.three-combination.5-9-1'], description: 'Sa-Yu-Chuk metal frame detected.' },
];

const BRANCH_DIRECTIONAL_COMBINATIONS: MultiBranchRelationDefinition[] = [
  { actors: [2, 3, 4], type: 'branch_directional_combination', resultingElement: 'wood', strength: 0.75, result: 'formed', evidenceIds: ['interaction.branch.directional.2-3-4'], description: 'In-Myo-Jin eastern directional combination detected.' },
  { actors: [5, 6, 7], type: 'branch_directional_combination', resultingElement: 'fire', strength: 0.75, result: 'formed', evidenceIds: ['interaction.branch.directional.5-6-7'], description: 'Sa-O-Mi southern directional combination detected.' },
  { actors: [8, 9, 10], type: 'branch_directional_combination', resultingElement: 'metal', strength: 0.75, result: 'formed', evidenceIds: ['interaction.branch.directional.8-9-10'], description: 'Shin-Yu-Sul western directional combination detected.' },
  { actors: [11, 0, 1], type: 'branch_directional_combination', resultingElement: 'water', strength: 0.75, result: 'formed', evidenceIds: ['interaction.branch.directional.11-0-1'], description: 'Hae-Zi-Chuk northern directional combination detected.' },
];

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
      ? `${relation.description} Transformation into ${relation.resultingElement} is supported by the surrounding chart.`
      : `${relation.description} Transformation into ${relation.resultingElement} is blocked due to insufficient support in the surrounding chart.`,
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
