/**
 * 타로 카드 그림 (실사 이미지가 없을 때 대신 그린다).
 *
 * 처음에는 "이미지 준비 중" 글자만 떴다. 그걸 면하려고 기호를 하나 띄웠는데,
 * 실제로 렌더해 보니 여전히 카드 구실을 못 했다.
 *
 *   - 별·달·태양·심판·세계가 전부 같은 모양이었다. 로마 숫자만 달랐다.
 *   - 컵 수트가 하트(♥)였다. 타로의 컵은 성배지 트럼프 하트가 아니다.
 *   - 완즈가 ⚕ 였다. 의료 기호처럼 보였다.
 *   - 핍이 비뚤어졌다. 완즈 10이 4+3+3 으로 어긋나 9와 구별하려면 세어야 했다.
 *   - 코트 넷이 글자만 달랐다. 인물이 없었다.
 *   - 카드 이름은 "완즈"인데 그림 안 라벨은 "완드"였다.
 *
 * 이제 SVG 로 직접 그린다. 수트는 성배·막대·검·오각별을 실제 모양으로,
 * 메이저는 22장이 각기 다른 상징을 갖는다. 핍은 라이더-웨이트의 전통 배열을
 * 그대로 쓴다.
 *
 * 정통 도상을 대체하지는 못한다. 카드마다 고유한 장면이 있는 것이 라이더-웨이트고,
 * 그건 코드로 그릴 수 있는 종류가 아니다. 실사 파일이 들어오면 그쪽이 우선이다.
 */

type Props = {
  suit?: string | null;
  /** 마이너는 카드 숫자(1~10, 코트는 없음), 메이저는 아르카나 번호(0~21) */
  number?: number | null;
  /** 코트 카드 약자 (P/N/Q/K) */
  rank?: string | null;
  arcana?: string;
  isReversed?: boolean;
  className?: string;
};

type Palette = { ink: string; glow: string; label: string };

/**
 * 수트별 색과 이름.
 * label 은 덱의 name_kr 과 같아야 한다. 예전에는 "완드" 라고 적어 두어
 * 카드 이름("완즈 3")과 그림 안 라벨("완드")이 한 화면에서 갈렸다.
 */
const SUIT_STYLE: Record<string, Palette> = {
  wands: { ink: '#fbbf24', glow: 'rgba(251,191,36,0.28)', label: '완즈' },
  cups: { ink: '#38bdf8', glow: 'rgba(56,189,248,0.28)', label: '컵' },
  swords: { ink: '#a78bfa', glow: 'rgba(167,139,250,0.28)', label: '소드' },
  pentacles: { ink: '#34d399', glow: 'rgba(52,211,153,0.28)', label: '펜타클' },
};

const MAJOR_STYLE: Palette = { ink: '#e2e8f0', glow: 'rgba(226,232,240,0.24)', label: '메이저' };

const COURT_LABEL: Record<string, string> = { P: '시종', N: '기사', Q: '여왕', K: '왕' };

/* ────────────────────────── 수트 기호 ────────────────────────── */

/** 각 기호는 24x24 좌표계 안에 그린다. stroke 는 currentColor 를 쓴다. */
function SuitMark({ suit, size = 18 }: { suit: string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (suit === 'cups') {
    // 성배 — 잔 + 기둥 + 받침
    return (
      <svg {...common}>
        <path d="M6 4h12v4a6 6 0 0 1-12 0V4z" />
        <path d="M12 14v5" />
        <path d="M8 20h8" />
      </svg>
    );
  }

  if (suit === 'wands') {
    // 막대 — 곧은 지팡이에 잎눈 둘.
    // 처음엔 사선에 잎을 두 갈래로 달았는데 15px 로 줄이면 뭉개져 점처럼 보였다.
    return (
      <svg {...common}>
        <path d="M12 2v20" />
        <path d="M12 8c2.4-1.2 4.2-1 5.4.6" />
        <path d="M12 13c-2.4-1.2-4.2-1-5.4.6" />
      </svg>
    );
  }

  if (suit === 'swords') {
    // 검 — 날 + 코등이 + 자루
    return (
      <svg {...common}>
        <path d="M12 2 12 15" />
        <path d="m9 5 3-3 3 3" />
        <path d="M8 15h8" />
        <path d="M12 15v6" />
        <path d="M10 21h4" />
      </svg>
    );
  }

  // 펜타클 — 원 안의 오각별
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9.2" />
      <path d="M12 4.4 14.6 12l6.4 0-5.2 3.8 2 7.2-5.8-4.4-5.8 4.4 2-7.2L3 12l6.4 0z" transform="scale(0.82) translate(2.6 2.6)" />
    </svg>
  );
}

/* ────────────────────────── 코트 상징 ────────────────────────── */

/**
 * 코트 넷을 문장(紋章)으로 구분한다.
 *
 * 처음엔 인물 실루엣을 그렸는데, 46px 안에서는 어떻게 그려도 졸라맨이 됐다.
 * 팔다리를 막대로 뻗은 형태가 카드 그림보다 유치해 보였다. 저해상도에서
 * 인물은 포기하고 지물(持物)로 간다. 실제 라이더-웨이트도 코트는 지물로 읽는다.
 */
function CourtMark({ rank, size = 44 }: { rank: string; size?: number }) {
  const p = {
    width: size,
    height: size,
    viewBox: '0 0 48 48',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (rank === 'K') {
    // 왕 — 다섯 봉우리 왕관
    return (
      <svg {...p}>
        <path d="M8 34 6 14l9 7 9-13 9 13 9-7-2 20z" />
        <path d="M8 34h32" />
        <path d="M8 39h32" />
      </svg>
    );
  }

  if (rank === 'Q') {
    // 여왕 — 둥근 아치 왕관
    return (
      <svg {...p}>
        <path d="M9 34c-2-8-2-14 0-18 3 4 6 6 9 6s5-3 6-8c1 5 3 8 6 8s6-2 9-6c2 4 2 10 0 18z" />
        <path d="M9 34h30" />
        <circle cx="24" cy="12" r="2.4" />
      </svg>
    );
  }

  if (rank === 'N') {
    // 기사 — 옆을 보는 투구
    return (
      <svg {...p}>
        <path d="M14 40V26a12 12 0 0 1 24 0v14z" />
        <path d="M14 30h16" />
        <path d="M20 34h10" />
        <path d="M26 14c-4-4-9-4-13 0 2 3 4 5 7 6" />
      </svg>
    );
  }

  // 시종 — 깃발
  return (
    <svg {...p}>
      <path d="M16 6v38" />
      <path d="M16 8h20l-5 7 5 7H16z" />
    </svg>
  );
}

/* ────────────────────────── 메이저 상징 ────────────────────────── */

/**
 * 22장이 각기 다른 상징을 갖는다.
 * 예전에는 전부 ✧ 하나였다. 별·달·태양이 같은 그림이었다.
 */
function MajorMark({ number, size = 46 }: { number: number; size?: number }) {
  const p = {
    width: size,
    height: size,
    viewBox: '0 0 48 48',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (number) {
    case 0: // 바보 — 봇짐 진 막대와 절벽
      return (<svg {...p}><path d="M10 38 34 12" /><path d="M30 8c4-1 7 1 8 4-3 2-6 2-8 0z" /><path d="M6 42h14l-4-6" /></svg>);
    case 1: // 마법사 — 무한대와 지팡이
      return (<svg {...p}><path d="M14 20c0-3 4-3 4 0s-4 3-4 0" transform="scale(1.7) translate(-3 -1)" /><path d="M24 26v14" /><path d="M20 40h8" /></svg>);
    case 2: // 여사제 — 초승달과 두 기둥
      return (<svg {...p}><path d="M28 10a11 11 0 1 0 0 22 13 13 0 0 1 0-22z" /><path d="M10 8v34M38 8v34" /></svg>);
    case 3: // 여황제 — 밀 이삭과 관
      return (<svg {...p}><path d="M24 42V16" /><path d="M24 20c-4-2-6-5-6-9 4 0 7 2 8 5M24 20c4-2 6-5 6-9-4 0-7 2-8 5" /><path d="M14 10l4 4 6-6 6 6 4-4" /></svg>);
    case 4: // 황제 — 각진 왕좌
      return (<svg {...p}><path d="M12 42V16h24v26" /><path d="M12 24h24" /><path d="M16 16V8l8 5 8-5v8" /></svg>);
    case 5: // 교황 — 교차한 두 열쇠
      return (<svg {...p}><circle cx="14" cy="14" r="5" /><path d="m18 18 16 16M34 30v6M30 34h6" /><circle cx="34" cy="14" r="5" /><path d="M30 18 14 34M14 30v6M10 34h6" /></svg>);
    case 6: // 연인 — 겹친 두 원
      return (<svg {...p}><circle cx="19" cy="24" r="11" /><circle cx="29" cy="24" r="11" /></svg>);
    case 7: // 전차 — 바퀴와 별
      return (<svg {...p}><circle cx="24" cy="30" r="10" /><path d="M24 20v20M14 30h20M17 23l14 14M31 23 17 37" /><path d="m24 4 2.4 5 5.4.6-4 3.7 1.1 5.3L24 15.8 19.1 18.6l1.1-5.3-4-3.7 5.4-.6z" /></svg>);
    case 8: // 힘 — 무한대와 사자 갈기
      return (<svg {...p}><circle cx="24" cy="28" r="11" /><path d="M24 28c0-8 8-8 8 0M24 28c0 8-8 8-8 0" transform="translate(0 -14) scale(1)" /><path d="M13 28h-4M35 28h4M24 39v4M24 13v4" /></svg>);
    case 9: // 은둔자 — 등불
      return (<svg {...p}><path d="M18 16h12v20H18z" /><path d="M24 8v8M16 40h16" /><circle cx="24" cy="26" r="4" /></svg>);
    case 10: // 운명의 수레바퀴
      return (<svg {...p}><circle cx="24" cy="24" r="16" /><circle cx="24" cy="24" r="5" /><path d="M24 8v11M24 29v11M8 24h11M29 24h11" /></svg>);
    case 11: // 정의 — 저울
      return (<svg {...p}><path d="M24 8v34M12 42h24M10 16h28" /><path d="M10 16 5 28h10zM38 16l-5 12h10z" /></svg>);
    case 12: // 매달린 남자 — 거꾸로 매달린 형태
      return (<svg {...p}><path d="M10 10h28" /><path d="M24 10v12" /><circle cx="24" cy="27" r="5" /><path d="M24 32v6M24 38l-6 6M24 38l6 6" /></svg>);
    case 13: // 죽음 — 낫
      return (<svg {...p}><path d="M14 42 34 8" /><path d="M34 8c-9 1-15 6-17 13 8 2 14-3 17-13z" /></svg>);
    case 14: // 절제 — 두 잔 사이 물줄기
      return (<svg {...p}><path d="M8 12h10v6a5 5 0 0 1-10 0z" /><path d="M30 30h10v6a5 5 0 0 1-10 0z" /><path d="M17 20c4 4 6 8 16 10" /></svg>);
    case 15: // 악마 — 뿔과 사슬
      return (<svg {...p}><path d="M14 18c-2-4-2-8 0-10 3 3 6 4 10 4s7-1 10-4c2 2 2 6 0 10" /><circle cx="24" cy="26" r="8" /><path d="M18 38a3 3 0 1 0 6 0 3 3 0 1 0 6 0" /></svg>);
    case 16: // 탑 — 번개 맞은 탑
      return (<svg {...p}><path d="M16 42V18h16v24z" /><path d="M14 18l10-8 10 8" /><path d="m28 22-5 8h6l-5 8" /></svg>);
    case 17: // 별 — 팔각별과 물동이
      return (<svg {...p}><path d="M24 4v14M24 30v14M10 24h14M30 24h14M14 14l10 10M34 14 24 24M14 34l10-10M34 34 24 24" /><circle cx="24" cy="24" r="3" /></svg>);
    case 18: // 달 — 초승달과 물방울
      return (<svg {...p}><path d="M30 8a15 15 0 1 0 0 28 18 18 0 0 1 0-28z" /><path d="M18 40c0-3 3-6 3-6s3 3 3 6a3 3 0 0 1-6 0z" /></svg>);
    case 19: // 태양
      return (<svg {...p}><circle cx="24" cy="24" r="9" /><path d="M24 4v6M24 38v6M4 24h6M38 24h6M10 10l4 4M34 34l4 4M38 10l-4 4M14 34l-4 4" /></svg>);
    case 20: // 심판 — 나팔
      return (<svg {...p}><path d="M8 24h20l12-10v20L28 24" /><circle cx="8" cy="24" r="4" /><path d="M34 30v8" /></svg>);
    default: // 21 세계 — 화환
      return (<svg {...p}><ellipse cx="24" cy="24" rx="12" ry="17" /><path d="M24 7v-3M24 41v3M12 24h-3M36 24h3" /><path d="M16 12c-2 4-2 8 0 12M32 12c2 4 2 8 0 12" /></svg>);
  }
}

/* ────────────────────────── 핍 배열 ────────────────────────── */

/**
 * 라이더-웨이트의 전통 핍 배열. [열 개수] 로 표현한다.
 * 예전에는 3열 그리드에 순서대로 채워 넣어 10이 4+3+3 으로 어긋났다.
 */
const PIP_ROWS: Record<number, number[]> = {
  1: [1],
  2: [1, 1],
  3: [1, 1, 1],
  4: [2, 2],
  5: [2, 1, 2],
  6: [2, 2, 2],
  7: [2, 2, 2, 1],
  8: [2, 2, 2, 2],
  9: [2, 2, 2, 2, 1],
  10: [2, 3, 3, 2],
};

function romanize(n: number): string {
  const table: Array<[number, string]> = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let rest = n;
  let out = '';
  for (const [value, sign] of table) {
    while (rest >= value) {
      out += sign;
      rest -= value;
    }
  }
  return out || '0';
}

/* ────────────────────────── 카드 ────────────────────────── */

export default function TarotCardArt({
  suit,
  number,
  rank,
  arcana,
  isReversed = false,
  className = '',
}: Props) {
  const isMajor = arcana === 'major';
  const style = isMajor ? MAJOR_STYLE : (SUIT_STYLE[suit ?? ''] ?? MAJOR_STYLE);
  const court = rank ? COURT_LABEL[rank] ?? null : null;
  const pipRows = !isMajor && !court && number ? PIP_ROWS[number] : undefined;

  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-xl ${className}`}
      style={{
        background: `radial-gradient(circle at 50% 32%, ${style.glow}, rgba(2,6,23,0.96) 72%)`,
        color: style.ink,
      }}
      aria-hidden="true"
    >
      {/* 이중 테두리 */}
      <div className="absolute inset-1.5 rounded-lg border" style={{ borderColor: `${style.ink}55` }} />
      <div className="absolute inset-[7px] rounded-md border" style={{ borderColor: `${style.ink}22` }} />

      <div className="absolute inset-0 flex flex-col items-center justify-between py-3">
        {/* 위: 번호 */}
        <span className="text-[11px] font-black tracking-[0.28em] tabular-nums" style={{ opacity: 0.9 }}>
          {isMajor
            ? (typeof number === 'number' ? romanize(number) : '')
            : court
              ? ''
              : (number ?? '')}
        </span>

        {/* 가운데: 상징 — 역방향이면 상징만 뒤집는다.
            예전에는 카드 전체를 180° 돌려 번호·수트 이름 글자까지 뒤집혔고,
            "타로 이미지가 이상하다"는 피드백의 원인이었다. 실물 타로의
            역방향 느낌은 상징 뒤집힘으로 남기고 글자는 읽히게 유지한다. */}
        <div
          className="flex flex-1 flex-col items-center justify-center gap-1.5"
          style={{ transform: isReversed ? 'rotate(180deg)' : undefined }}
        >
          {isMajor ? (
            <MajorMark number={typeof number === 'number' ? number : 0} />
          ) : court ? (
            <>
              <CourtMark rank={rank ?? ''} />
              <div className="flex items-center gap-1.5">
                <SuitMark suit={suit ?? ''} size={14} />
                <span className="text-[15px] font-black">{court}</span>
              </div>
            </>
          ) : pipRows ? (
            <div className="flex flex-col items-center gap-[5px]">
              {pipRows.map((count, rowIndex) => (
                <div key={rowIndex} className="flex items-center gap-[7px]">
                  {Array.from({ length: count }, (_, i) => (
                    <SuitMark key={i} suit={suit ?? ''} size={number && number <= 4 ? 22 : 15} />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <SuitMark suit={suit ?? ''} size={34} />
          )}
        </div>

        {/* 아래: 수트 이름 (+ 역방향 표시 — 글자는 항상 정방향으로 읽힌다) */}
        <span className="text-[11px] font-black tracking-[0.08em]" style={{ opacity: 0.75 }}>
          {isReversed ? `${style.label} · 역` : style.label}
        </span>
      </div>
    </div>
  );
}
