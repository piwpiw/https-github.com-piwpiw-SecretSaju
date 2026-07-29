/**
 * 타로 카드 그림.
 *
 * 지금까지는 "이미지 준비 중"이라는 글자만 띄우고 있었다. 카드를 뽑았는데
 * 그림 자리가 비어 있으면 뽑은 느낌이 안 난다.
 *
 * 외부 이미지 파일을 쓰지 않고 SVG 로 직접 그린다. 이유는 두 가지다.
 * 첫째, 78장 그림 파일을 받아 넣으면 저작권을 하나하나 확인해야 한다.
 * 둘째, 파일이 없으면 또 빈 칸이 된다. 코드로 그리면 항상 나온다.
 *
 * 정통 라이더-웨이트 도상을 흉내내지는 않는다. 대신 카드를 구분하는 데
 * 필요한 정보(수트, 숫자/코트, 메이저 번호)를 상징으로 명확히 보여준다.
 */

type Props = {
  suit?: string | null;
  /** 마이너는 카드 숫자(1~10, 코트는 없음), 메이저는 아르카나 번호(0~21) */
  number?: number | null;
  /** 코트 카드 약자 (P/N/Q/K) 또는 메이저 번호 */
  rank?: string | null;
  arcana?: string;
  isReversed?: boolean;
  className?: string;
};

/** 수트별 색과 기호 */
const SUIT_STYLE: Record<string, { ink: string; glow: string; glyph: string; label: string }> = {
  wands: { ink: '#fbbf24', glow: 'rgba(251,191,36,0.35)', glyph: '⚕', label: '완드' },
  cups: { ink: '#38bdf8', glow: 'rgba(56,189,248,0.35)', glyph: '♥', label: '컵' },
  swords: { ink: '#a78bfa', glow: 'rgba(167,139,250,0.35)', glyph: '⚔', label: '소드' },
  pentacles: { ink: '#34d399', glow: 'rgba(52,211,153,0.35)', glyph: '✦', label: '펜타클' },
};

const MAJOR = { ink: '#e2e8f0', glow: 'rgba(226,232,240,0.3)', glyph: '✧', label: '메이저' };

/** 코트 카드 약자 → 표시용 글자 */
const COURT: Record<string, string> = { P: '시종', N: '기사', Q: '여왕', K: '왕' };

function romanize(n: number): string {
  const table: Array<[number, string]> = [
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
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

export default function TarotCardArt({
  suit,
  number,
  rank,
  arcana,
  isReversed = false,
  className = '',
}: Props) {
  const isMajor = arcana === 'major';
  const style = isMajor ? MAJOR : (SUIT_STYLE[suit ?? ''] ?? MAJOR);
  const court = rank && COURT[rank] ? COURT[rank] : null;

  // 마이너 숫자 카드는 수트 기호를 숫자만큼 배치해 "몇 번 카드"인지 세어 볼 수 있게 한다.
  const pips = !isMajor && !court && number && number >= 1 && number <= 10 ? number : 0;
  const columns = pips <= 3 ? 1 : pips <= 6 ? 2 : 3;

  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-xl ${className}`}
      style={{
        background: `radial-gradient(circle at 50% 30%, ${style.glow}, rgba(2,6,23,0.95) 70%)`,
        transform: isReversed ? 'rotate(180deg)' : undefined,
      }}
      aria-hidden="true"
    >
      {/* 테두리 장식 */}
      <div
        className="absolute inset-2 rounded-lg border"
        style={{ borderColor: `${style.ink}44` }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
        {isMajor ? (
          <>
            <span className="text-3xl leading-none" style={{ color: style.ink }}>
              {style.glyph}
            </span>
            <span
              className="text-2xl font-black tracking-widest"
              style={{ color: style.ink }}
            >
              {/* 메이저 번호는 카드의 number(0~21). 덱 전체 정렬용 sequence(1~78)를
                  쓰면 바보=I, 세계=XXII 처럼 한 칸씩 밀린다. */}
              {typeof number === 'number' ? romanize(number) : style.glyph}
            </span>
          </>
        ) : court ? (
          <>
            <span className="text-3xl leading-none" style={{ color: style.ink }}>
              {style.glyph}
            </span>
            <span className="text-xl font-black" style={{ color: style.ink }}>
              {court}
            </span>
          </>
        ) : (
          <div
            className="grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: pips }, (_, i) => (
              <span key={i} className="text-lg leading-none" style={{ color: style.ink }}>
                {style.glyph}
              </span>
            ))}
          </div>
        )}

        <span
          className="mt-1 text-[12px] font-black tracking-[0.2em]"
          style={{ color: `${style.ink}cc` }}
        >
          {style.label}
        </span>
      </div>
    </div>
  );
}
