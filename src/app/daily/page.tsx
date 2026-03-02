"use client";

import { useState } from "react";
import { ArrowLeft, CalendarClock, Sunrise, SunMoon } from "lucide-react";
import { useRouter } from "next/navigation";

const BLOCKS = [
  { time: "오전 06~12", mood: "차분", action: "가벼운 시작, 이메일 정리" },
  { time: "오후 12~18", mood: "활성", action: "중요 대화, 제안서 검토" },
  { time: "저녁 18~24", mood: "회복", action: "리뷰, 휴식, 관계 대화" },
];

export default function DailyFortunePage() {
  const router = useRouter();
  const [, setRefreshTick] = useState(0);
  const today = new Date().toLocaleDateString("ko-KR", { dateStyle: "full" });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden pb-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_5%,rgba(244,114,182,0.16),transparent_40%),radial-gradient(circle_at_20%_80%,rgba(74,222,128,0.16),transparent_45%)]" />
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.back()} className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-slate-200" />
          </button>
          <button onClick={() => setRefreshTick((v) => v + 1)} className="text-xs px-4 py-2 rounded-full bg-white/10 border border-white/10">
            오늘 운세 다시 생성
          </button>
        </div>

        <section className="bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 md:p-12">
          <div className="text-sm text-fuchsia-300 font-black tracking-[0.2em]">일일 운세</div>
          <h1 className="mt-3 text-3xl font-black italic">{today}</h1>
          <p className="mt-3 text-slate-300">오늘의 에너지를 시간대별로 정리해 행동 우선순위를 표시합니다.</p>

          <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-4">
            {BLOCKS.map((item) => (
              <div key={item.time} className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">
                <div className="flex items-center gap-2 text-cyan-300 font-black">
                  <CalendarClock className="w-4 h-4" /> {item.time}
                </div>
                <div className="mt-3 text-lg font-bold text-white">기운: {item.mood}</div>
                <div className="mt-2 text-slate-300">권장: {item.action}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-5">
            <div className="flex items-center gap-2 text-yellow-300 font-black"><SunMoon className="w-4 h-4" /> 오늘의 주의</div>
            <p className="mt-3 text-slate-300">큰 판단은 밤 10시 이후로 미루고, 문서화한 뒤 실행하세요.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-5">
            <div className="flex items-center gap-2 text-emerald-300 font-black"><Sunrise className="w-4 h-4" /> 오늘의 제안</div>
            <p className="mt-3 text-slate-300">가벼운 산책 + 10분 일지 작성으로 다음 흐름을 정리하세요.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
