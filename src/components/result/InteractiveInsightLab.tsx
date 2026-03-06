"use client";

import { useId, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SvgChart from "@/components/ui/SvgChart";
import { cn } from "@/lib/utils";

type ElementMetric = {
  label: string;
  score: number;
  count: number;
  percent: number;
  meaning: string;
  bar: string;
};

type TenGodMetric = {
  label: string;
  value: number;
};

type GangyakMetric = {
  label: string;
  value: number;
  hint: string;
};

type FocusKey = "base" | "love" | "money" | "career";
type TabKey = "elements" | "tenGods" | "gangyak";

type Props = {
  elements: ElementMetric[];
  tenGods: TenGodMetric[];
  gangyak: GangyakMetric[];
  focus: FocusKey;
  onFocusChange: (focus: FocusKey) => void;
};

const TABS: { key: TabKey; label: string; description: string }[] = [
  { key: "elements", label: "오행", description: "기운의 균형과 결핍 신호를 비교합니다." },
  { key: "tenGods", label: "십성", description: "성향과 역할 패턴이 어디에서 강해지는지 보여줍니다." },
  { key: "gangyak", label: "강약", description: "일간 에너지를 만드는 구성 요소를 점수로 읽습니다." },
];

const FOCUS_FILTERS: { key: FocusKey; label: string }[] = [
  { key: "base", label: "기본" },
  { key: "love", label: "연애" },
  { key: "money", label: "재물" },
  { key: "career", label: "직업" },
];

const FOCUS_GUIDES: Record<FocusKey, Record<TabKey, string>> = {
  base: {
    elements: "전체 성향과 기본 체질 흐름을 읽는 기준입니다.",
    tenGods: "반복적으로 드러나는 역할 패턴을 읽는 기준입니다.",
    gangyak: "일간이 버티는 힘과 균형을 보는 기준입니다.",
  },
  love: {
    elements: "감정 표현 방식과 관계 온도를 읽는 기준입니다.",
    tenGods: "연애에서 어떤 태도로 연결하고 반응하는지 읽는 기준입니다.",
    gangyak: "관계에서 버티는 힘과 과몰입 균형을 읽는 기준입니다.",
  },
  money: {
    elements: "소비 습관, 자원 축적, 리스크 감각을 읽는 기준입니다.",
    tenGods: "돈을 벌고 지키고 굴리는 방식을 보는 기준입니다.",
    gangyak: "재물 흐름을 감당할 체력과 안정성을 읽는 기준입니다.",
  },
  career: {
    elements: "문제 처리 스타일과 업무 강점을 읽는 기준입니다.",
    tenGods: "조직 내 역할, 성과 방식, 압박 반응을 보는 기준입니다.",
    gangyak: "직업 지속력과 추진 구조를 읽는 기준입니다.",
  },
};

function EmptyState({ copy }: { copy: string }) {
  return (
    <div
      className="rounded-2xl border border-white/10 bg-black/20 px-4 py-10 text-center text-sm text-slate-300"
      role="status"
    >
      {copy}
    </div>
  );
}

function getFocusComment(
  focus: FocusKey,
  tab: TabKey,
  label: string,
  value: number,
  extra?: string,
) {
  if (tab === "elements") {
    if (focus === "love") return `${label} 기운이 ${value}% 비중이라 감정 표현과 관계 온도에 직접 영향을 줍니다. ${extra ?? ""}`.trim();
    if (focus === "money") return `${label} 기운이 ${value}% 비중이라 소비와 축적 판단의 기본 태도를 만듭니다. ${extra ?? ""}`.trim();
    if (focus === "career") return `${label} 기운이 ${value}% 비중이라 업무 방식과 실행 강약을 설명합니다. ${extra ?? ""}`.trim();
    return `${label} 기운이 ${value}% 비중으로 작동합니다. ${extra ?? ""}`.trim();
  }

  if (tab === "tenGods") {
    if (focus === "love") return `${label} 십성이 ${value}% 비중이라 연애에서 주도권, 배려, 거리 조절 방식에 강하게 작동합니다.`;
    if (focus === "money") return `${label} 십성이 ${value}% 비중이라 수입 기회 포착과 지출 결정에 반영됩니다.`;
    if (focus === "career") return `${label} 십성이 ${value}% 비중이라 직업 적합성과 성과 방식이 더 분명하게 드러납니다.`;
    return `${label} 십성이 ${value}% 비중으로 반복됩니다. 기본 성향 해석의 중요한 축으로 읽으면 좋습니다.`;
  }

  if (focus === "love") return `${label} 점수 ${value}는 관계에서 감정 소모를 얼마나 감당하는지와 연결됩니다. ${extra ?? ""}`.trim();
  if (focus === "money") return `${label} 점수 ${value}는 재물 흐름을 컨트롤하는 체력과 안정성에 연결됩니다. ${extra ?? ""}`.trim();
  if (focus === "career") return `${label} 점수 ${value}는 업무 압박과 성과 지속력에 직접 연결됩니다. ${extra ?? ""}`.trim();
  return `${label} 점수 ${value}는 일간 에너지를 구성하는 핵심 요소입니다. ${extra ?? ""}`.trim();
}

export default function InteractiveInsightLab({ elements, tenGods, gangyak, focus, onFocusChange }: Props) {
  const [tab, setTab] = useState<TabKey>("elements");
  const [activeElement, setActiveElement] = useState(elements[0]?.label ?? "");
  const [activeTenGod, setActiveTenGod] = useState(tenGods[0]?.label ?? "");
  const [activeGangyak, setActiveGangyak] = useState(gangyak[0]?.label ?? "");

  const baseId = useId();

  const elementDetail = useMemo(
    () => elements.find((item) => item.label === activeElement) ?? elements[0],
    [elements, activeElement],
  );
  const tenGodDetail = useMemo(
    () => tenGods.find((item) => item.label === activeTenGod) ?? tenGods[0],
    [tenGods, activeTenGod],
  );
  const gangyakDetail = useMemo(
    () => gangyak.find((item) => item.label === activeGangyak) ?? gangyak[0],
    [gangyak, activeGangyak],
  );

  return (
    <section aria-labelledby={`${baseId}-title`} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-7">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-200">Interactive Insight Lab</p>
          <h3 id={`${baseId}-title`} className="mt-2 text-xl md:text-2xl font-black text-white">결과 차트 실험실</h3>
          <p className="mt-2 text-sm text-slate-200">
            같은 데이터라도 관점을 바꾸면 해석이 달라집니다. 연애, 재물, 직업 관점으로 다시 읽어보세요.
          </p>
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="차트 유형 선택">
          {TABS.map((item) => {
            const selected = tab === item.key;
            return (
              <button
                key={item.key}
                id={`${baseId}-${item.key}-tab`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${baseId}-${item.key}-panel`}
                onClick={() => setTab(item.key)}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.22em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                  selected
                    ? "border-cyan-300/50 bg-cyan-400/15 text-cyan-50"
                    : "border-white/15 bg-black/20 text-slate-200 hover:text-white",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-slate-300">{TABS.find((item) => item.key === tab)?.description}</p>

        <div className="flex flex-wrap gap-2" aria-label="해석 관점 선택">
          {FOCUS_FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-pressed={focus === item.key}
              onClick={() => onFocusChange(item.key)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[12px] font-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                focus === item.key
                  ? "border-indigo-300/50 bg-indigo-400/15 text-indigo-50"
                  : "border-white/15 bg-black/20 text-slate-200 hover:text-white",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-indigo-300/20 bg-indigo-400/10 px-4 py-3 text-sm text-slate-100" role="note">
        {FOCUS_GUIDES[focus][tab]}
      </div>

      <AnimatePresence mode="wait">
        {tab === "elements" ? (
          <motion.div
            key="elements"
            id={`${baseId}-elements-panel`}
            role="tabpanel"
            aria-labelledby={`${baseId}-elements-tab`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-6 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]"
          >
            <figure className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <figcaption className="mb-3 text-sm font-bold text-slate-100">오행 레이더 차트</figcaption>
              <div className="flex justify-center">
                <SvgChart
                  title="Elements"
                  accentColor="#22d3ee"
                  data={elements.map((item) => ({ label: item.label, value: item.score }))}
                />
              </div>
              <p className="mt-3 text-sm text-slate-300">
                차트는 오행별 점수를 비교합니다. 높은 축과 낮은 축의 차이가 클수록 체감 편차도 커집니다.
              </p>
            </figure>

            <div className="space-y-3">
              <ul className="space-y-3" aria-label="오행 상세 목록">
                {elements.map((item) => {
                  const active = item.label === elementDetail?.label;
                  return (
                    <li key={item.label}>
                      <button
                        type="button"
                        aria-pressed={active}
                        onClick={() => setActiveElement(item.label)}
                        onMouseEnter={() => setActiveElement(item.label)}
                        className={cn(
                          "w-full rounded-2xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                          active
                            ? "border-cyan-300/40 bg-cyan-400/10 shadow-[0_0_30px_rgba(34,211,238,0.12)]"
                            : "border-white/15 bg-black/20 hover:border-white/25",
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-white">{item.label}</p>
                            <p className="mt-1 text-xs text-slate-300">{item.meaning}</p>
                          </div>
                          <p className="text-lg font-black text-cyan-50">{item.score}</p>
                        </div>
                        <div className="mt-3 h-2 rounded-full overflow-hidden border border-white/10 bg-black/30" aria-hidden="true">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.score}%` }}
                            transition={{ duration: 0.6 }}
                            className={cn("h-full", item.bar)}
                          />
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {elementDetail ? (
                <aside className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4" aria-live="polite">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100">{elementDetail.label} 집중 해설</p>
                  <p className="mt-2 text-sm text-slate-100">
                    {getFocusComment(
                      focus,
                      "elements",
                      elementDetail.label,
                      elementDetail.percent,
                      `출현 횟수는 ${elementDetail.count}회이며 기본 해석은 ${elementDetail.meaning} 축입니다.`,
                    )}
                  </p>
                </aside>
              ) : null}
            </div>
          </motion.div>
        ) : null}

        {tab === "tenGods" ? (
          <motion.div
            key="tenGods"
            id={`${baseId}-tenGods-panel`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tenGods-tab`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-6"
          >
            {tenGods.length === 0 ? (
              <EmptyState copy="십성 분포는 정밀 엔진 데이터가 있을 때 표시됩니다." />
            ) : (
              <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                <figure className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <figcaption className="mb-3 text-sm font-bold text-slate-100">십성 분포 차트</figcaption>
                  <div className="flex h-72 items-end gap-2" aria-label="십성 분포 막대 차트">
                    {tenGods.map((item, index) => {
                      const active = item.label === tenGodDetail?.label;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setActiveTenGod(item.label)}
                          onMouseEnter={() => setActiveTenGod(item.label)}
                          className="flex flex-1 flex-col items-center justify-end gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                        >
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(item.value, 8)}%` }}
                            transition={{ duration: 0.6, delay: index * 0.05 }}
                            className={cn(
                              "w-full rounded-t-[1.4rem] border border-b-0 transition-all",
                              active
                                ? "bg-gradient-to-t from-fuchsia-500 via-indigo-400 to-cyan-300 border-cyan-200/40 shadow-[0_0_30px_rgba(129,140,248,0.25)]"
                                : "bg-gradient-to-t from-slate-700 to-slate-500 border-white/10 opacity-90",
                            )}
                            aria-hidden="true"
                          />
                          <div className="text-center">
                            <p className={cn("text-[11px] font-black", active ? "text-white" : "text-slate-200")}>{item.label}</p>
                            <p className="text-[11px] text-slate-300">{item.value}%</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </figure>

                <aside className="rounded-3xl border border-white/10 bg-black/20 p-5" aria-live="polite">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-100">선택한 십성</p>
                  <p className="mt-2 text-2xl font-black text-white">{tenGodDetail?.label ?? "-"}</p>
                  <p className="mt-3 text-sm text-slate-100">
                    {getFocusComment(focus, "tenGods", tenGodDetail?.label ?? "-", tenGodDetail?.value ?? 0)}
                  </p>
                  <div className="mt-5 grid gap-2">
                    {tenGods.slice(0, 4).map((item) => (
                      <button
                        key={`quick-${item.label}`}
                        type="button"
                        aria-pressed={item.label === tenGodDetail?.label}
                        onClick={() => setActiveTenGod(item.label)}
                        className={cn(
                          "rounded-xl border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                          item.label === tenGodDetail?.label
                            ? "border-fuchsia-300/40 bg-fuchsia-500/10 text-white"
                            : "border-white/15 bg-white/[0.03] text-slate-100 hover:text-white",
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </aside>
              </div>
            )}
          </motion.div>
        ) : null}

        {tab === "gangyak" ? (
          <motion.div
            key="gangyak"
            id={`${baseId}-gangyak-panel`}
            role="tabpanel"
            aria-labelledby={`${baseId}-gangyak-tab`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-6"
          >
            {gangyak.length === 0 ? (
              <EmptyState copy="신강·신약 구성 점수가 아직 계산되지 않았습니다." />
            ) : (
              <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <ul className="space-y-4" aria-label="신강 신약 구성 요소 목록">
                    {gangyak.map((item, index) => {
                      const active = item.label === gangyakDetail?.label;
                      return (
                        <li key={item.label}>
                          <button
                            type="button"
                            aria-pressed={active}
                            onClick={() => setActiveGangyak(item.label)}
                            onMouseEnter={() => setActiveGangyak(item.label)}
                            className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                          >
                            <div className="flex items-center justify-between">
                              <p className={cn("text-sm font-black", active ? "text-white" : "text-slate-100")}>{item.label}</p>
                              <p className={cn("text-sm font-black", active ? "text-cyan-100" : "text-slate-300")}>{item.value}</p>
                            </div>
                            <div className="mt-2 h-3 rounded-full overflow-hidden border border-white/10 bg-black/30" aria-hidden="true">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.max(6, Math.min(100, item.value))}%` }}
                                transition={{ duration: 0.6, delay: index * 0.07 }}
                                className={cn(
                                  "h-full rounded-full",
                                  active
                                    ? "bg-gradient-to-r from-cyan-300 via-indigo-300 to-fuchsia-300"
                                    : "bg-gradient-to-r from-slate-500 to-slate-300",
                                )}
                              />
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <aside className="rounded-3xl border border-white/10 bg-cyan-400/10 p-5" aria-live="polite">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-50">선택한 요소</p>
                  <p className="mt-2 text-2xl font-black text-white">{gangyakDetail?.label ?? "-"}</p>
                  <p className="mt-3 text-sm text-slate-100">{gangyakDetail?.hint ?? "-"}</p>
                  <p className="mt-4 text-5xl font-black text-white">{gangyakDetail?.value ?? 0}</p>
                  <p className="mt-2 text-sm text-slate-100">
                    {getFocusComment(focus, "gangyak", gangyakDetail?.label ?? "-", gangyakDetail?.value ?? 0, gangyakDetail?.hint)}
                  </p>
                </aside>
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
