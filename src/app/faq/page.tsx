"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, HelpCircle, MessageSquare } from "lucide-react";

type FAQItem = { q: string; a: string };
type FAQSection = { id: string; title: string; route: string; items: FAQItem[] };

const FAQ_SECTIONS: FAQSection[] = [
  {
    id: "saju",
    title: "사주 분석",
    route: "/saju",
    items: [
      { q: "출생 시간은 분 단위로 입력 가능한가요?", a: "가능합니다. 시/분을 직접 선택하면 분 단위로 저장됩니다." },
      { q: "시간을 모르면 어떻게 하나요?", a: "시간 미상으로 진행할 수 있으며, 결과 해석에는 해당 기준이 함께 표시됩니다." },
      { q: "양력/음력 선택은 결과에 반영되나요?", a: "네. 달력 기준은 엔진 계산에 직접 반영됩니다." },
    ],
  },
  {
    id: "compat",
    title: "궁합/관계",
    route: "/compatibility",
    items: [
      { q: "관계 유형은 한국어 기준으로 보이나요?", a: "네. 본인/연인/배우자/친구/부모/자녀/기타로 표시됩니다." },
      { q: "궁합 결과의 근거는 무엇인가요?", a: "사주 4기둥, 오행 상생상극, 십성 상호작용, 관계 가중치를 함께 사용합니다." },
      { q: "연인 추가가 안 될 때는?", a: "프로필 저장 후 목록에서 다시 선택해 주세요. 동일 이름 중복 여부도 확인해 주세요." },
    ],
  },
  {
    id: "support",
    title: "결제/문의",
    route: "/support",
    items: [
      { q: "젤리가 부족하면 어떻게 하나요?", a: "결제 또는 관리자 모드에서 테스트 경로를 통해 확인할 수 있습니다." },
      { q: "오류가 계속 발생합니다.", a: "오류 문구와 재현 경로를 문의하기에 남겨주시면 우선 순위로 확인합니다." },
      { q: "모바일 화면이 깨집니다.", a: "기기/브라우저/해상도와 함께 제보해 주시면 레이아웃을 즉시 보정합니다." },
    ],
  },
];

export default function FAQPage() {
  const [openId, setOpenId] = useState<string>("saju-0");

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/mypage" className="inline-flex items-center gap-2 text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          마이페이지
        </Link>

        <header className="mt-8 mb-10">
          <h1 className="text-3xl font-black">FAQ</h1>
          <p className="text-sm text-slate-400 mt-2">핵심 메뉴 사용법과 문제 해결 가이드를 제공합니다.</p>
        </header>

        <div className="space-y-8">
          {FAQ_SECTIONS.map((section) => (
            <section key={section.id}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold">{section.title}</h2>
                <Link href={section.route} className="text-xs text-indigo-300 hover:text-indigo-200">
                  메뉴로 이동
                </Link>
              </div>

              <div className="space-y-3">
                {section.items.map((item, idx) => {
                  const id = `${section.id}-${idx}`;
                  const open = openId === id;
                  return (
                    <div key={id} className="rounded-2xl border border-white/10 bg-white/5">
                      <button
                        onClick={() => setOpenId(open ? "" : id)}
                        className="w-full px-5 py-4 text-left flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2 font-semibold">
                          <HelpCircle className="w-4 h-4 text-indigo-300" />
                          {item.q}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
                      </button>
                      {open && <div className="px-5 pb-4 text-sm text-slate-300">{item.a}</div>}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
          <MessageSquare className="w-8 h-8 mx-auto text-indigo-300 mb-2" />
          <p className="text-sm text-slate-300">추가 문의는 문의하기 메뉴에서 접수해 주세요.</p>
          <Link href="/inquiry" className="inline-block mt-3 text-sm text-indigo-300 hover:text-indigo-200">
            문의하기
          </Link>
        </div>
      </div>
    </main>
  );
}
