/**
 * src/lib/saju/sipsongPalace.ts
 * 궁위(宮位)로 읽는 십성 — 같은 십성이라도 어느 기둥에 있느냐로 해석이 갈린다.
 *
 * 전통 궁위론의 표준 배속만 쓴다:
 *   연주 = 조상·뿌리 궁, 초년운 · 월주 = 부모·사회 궁, 청년운(월지가 가장 힘이 큰 자리)
 *   일지 = 배우자 궁, 중년운     · 시주 = 자식·아랫사람 궁, 말년운
 * 천간은 겉으로 드러나는 방식, 지지는 바탕에 깔린 실질이라는 층위 구분도
 * 명리 일반론 그대로다. 여기에 없는 새 규칙을 만들어내지 않는다.
 *
 * 7자리 × 10십성 = 70개 조합이 전부 이 모듈을 지나며,
 * tests/logic/sipsong-palace.test.ts 가 전수(비어 있음·중복·누출)를 검사한다.
 */
import type { Sipsong, SipsongResult } from '@/core/myeongni/sipsong';

export type SipsongPositionKey = keyof SipsongResult;

type PalaceInfo = {
    /** 화면 라벨 (한글) */
    label: string;
    /** 궁위가 관장하는 삶의 영역 */
    domain: string;
    /** 이 자리가 대표하는 시기 */
    period: string;
    /** 천간(드러남) / 지지(바탕) 층위 — 조사까지 포함한 부사구 ("실질으로" 같은 조사 오류 방지) */
    layer: '겉으로 드러나는 모습으로' | '바탕에 깔린 실질로';
};

/** SipsongResult 의 7개 키 전부를 빠짐없이 다뤄야 한다 (테스트가 강제) */
export const PALACE_INFO: Record<SipsongPositionKey, PalaceInfo> = {
    yearStem: { label: '연간', domain: '집안 내력과 첫인상, 바깥에 비치는 뿌리', period: '초년', layer: '겉으로 드러나는 모습으로' },
    yearBranch: { label: '연지', domain: '조상·성장 환경에서 물려받은 기질', period: '초년', layer: '바탕에 깔린 실질로' },
    monthStem: { label: '월간', domain: '부모·윗사람과 사회생활에서 보이는 태도', period: '청년', layer: '겉으로 드러나는 모습으로' },
    monthBranch: { label: '월지', domain: '직업과 사회 활동의 무대 — 사주에서 힘이 가장 큰 자리', period: '청년', layer: '바탕에 깔린 실질로' },
    dayBranch: { label: '일지', domain: '배우자·가장 가까운 관계, 그리고 내 안방', period: '중년', layer: '바탕에 깔린 실질로' },
    hourStem: { label: '시간', domain: '자식·아랫사람에게 보이는 모습과 노후의 지향', period: '말년', layer: '겉으로 드러나는 모습으로' },
    hourBranch: { label: '시지', domain: '말년의 실속과 마지막에 남기는 것', period: '말년', layer: '바탕에 깔린 실질로' },
};

type SipsongCore = {
    /** 십성의 핵심 성질 (명리 표준 의미) */
    core: string;
    /** 그 성질이 잘 흐를 때 */
    gift: string;
    /** 과할 때의 주의점 */
    caution: string;
};

export const SIPSONG_CORE: Record<Sipsong, SipsongCore> = {
    비견: { core: '주체성과 대등한 동료의 기운', gift: '자립심이 서고 또래·동업의 도움을 받습니다', caution: '고집과 경쟁이 겹치면 내 몫이 나뉩니다' },
    겁재: { core: '승부욕과 몫을 다투는 기운', gift: '추진과 돌파가 빠릅니다', caution: '재물과 사람을 나눠 갖게 되는 자리이니 금전 거래를 조심합니다' },
    식신: { core: '먹고사는 생산과 여유의 기운', gift: '꾸준한 산출과 복이 따릅니다', caution: '편안함에 안주하면 확장이 멈춥니다' },
    상관: { core: '표현과 파격, 틀을 깨는 기운', gift: '재주와 언변이 빛납니다', caution: '규칙·윗사람과 부딪히기 쉬워 말이 앞서지 않게 합니다' },
    편재: { core: '움직이며 버는 활동 재물의 기운', gift: '유통·투자·대외 활동에서 기회를 잡습니다', caution: '들어온 만큼 나가기 쉬워 굳히는 장치가 필요합니다' },
    정재: { core: '성실하게 쌓는 관리 재물의 기운', gift: '꾸준함이 신용과 실속으로 돌아옵니다', caution: '지나친 절약과 소심함이 기회를 놓치게 합니다' },
    편관: { core: '도전과 압박, 자기를 단련하는 기운', gift: '위기 대응과 책임 돌파에 강합니다', caution: '눌리면 스트레스가 몸으로 오니 힘을 뺄 출구를 둡니다' },
    정관: { core: '원칙과 책임, 공적인 명예의 기운', gift: '조직과 제도 안에서 인정받습니다', caution: '체면과 규범에 매이면 결단이 늦어집니다' },
    편인: { core: '직관과 특수 재능, 비주류 학습의 기운', gift: '남다른 관점과 전문 기술이 됩니다', caution: '변덕과 회의가 실행을 끊지 않게 합니다' },
    정인: { core: '학문과 후원, 받아들이는 기운', gift: '공부·자격·윗사람의 도움이 따릅니다', caution: '받는 것에 익숙해지면 실전 감각이 늦게 붙습니다' },
};

export type SipsongPalaceReading = {
    positionKey: SipsongPositionKey;
    positionLabel: string;
    period: string;
    tenGod: Sipsong;
    text: string;
};

/**
 * 7개 자리 각각에 대해 "궁위 + 십성 + 층위"를 한 문장으로 조합한다.
 * 새 해석을 창작하지 않고 두 표준 표(PALACE_INFO, SIPSONG_CORE)의
 * 조합만으로 만든다 — 같은 십성이 자리마다 다른 문장이 되는 이유가
 * 사용자에게 그대로 보인다.
 */
export function buildSipsongPalaceReadings(sipsong: SipsongResult): SipsongPalaceReading[] {
    return (Object.keys(PALACE_INFO) as SipsongPositionKey[]).map((positionKey) => {
        const palace = PALACE_INFO[positionKey];
        const tenGod = sipsong[positionKey];
        const core = SIPSONG_CORE[tenGod];
        const text =
            `${palace.label}(${palace.period}운)의 ${tenGod} — ${core.core}이 ` +
            `${palace.domain} 자리에 ${palace.layer} 놓였습니다. ` +
            `${core.gift}. 다만 ${core.caution}.`;
        return { positionKey, positionLabel: palace.label, period: palace.period, tenGod, text };
    });
}
