"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, ArrowRight, Zap, LayoutGrid, Compass, CalendarDays, Sparkles, UserRound, Star, Flame, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import JellyBalance from "@/components/shop/JellyBalance";
import { cn } from "@/lib/app/utils";

const FATE_MODULES = [
  {
    icon: UserRound,
    label: "인생 총운",
    desc: "12종 운세를 통한 일생 흐름을 읽어드립니다.",
    href: "/saju?focus=total",
  },
  {
    icon: Star,
    label: "별자리 운세",
    desc: "별의 움직임을 통해 미래를 예측합니다.",
    href: "/astrology",
  },
  {
    icon: CalendarDays,
    label: "신년 운세",
    desc: "한 해의 전체적인 길흉화복을 안내합니다.",
    href: "/fortune",
  },
  {
    icon: Flame,
    label: "성격 분석",
    desc: "타고난 성향과 잠재력을 분석합니다.",
    href: "/saju?focus=personality",
  },
  {
    icon: Sparkles,
    label: "금전운",
    desc: "재물운의 흐름과 시기를 예측합니다.",
    href: "/saju?focus=money",
  },
  {
    icon: Heart,
    label: "애정운",
    desc: "연애운의 변화와 인연의 시기 분석 리포트.",
    href: "/saju?focus=love",
  },
];

const COMPAT_MODULES = [
  {
    icon: Heart,
    title: "정통 궁합 분석",
    desc: "결혼, 연애, 사회적 조화 등을 심층 분석합니다.",
    href: "/compatibility",
    highlight: true,
    jelly: 30,
  },
  {
    icon: CalendarDays,
    title: "택일 서비스",
    desc: "중요한 일을 하기에 가장 좋은 날을 제안합니다.",
    href: "/compatibility",
  },
  {
    icon: Sparkles,
    title: "타로 인사이트",
    desc: "현재의 흐름을 반영한 단기 운을 분석합니다.",
    href: "/tarot",
  },
];

export default function DestinyPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 relative overflow-hidden pb-40 font-sans">
      <div className="absolute inset-x-0 top-0 h-[50dvh] bg-gradient-to-b from-indigo-900/10 via-slate-900/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <header className="flex items-center justify-between mb-16">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>

          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.24em] border border-indigo-500/20">
              <Compass className="w-3 h-3" /> Destiny Nexus
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white leading-none">사주 & 운명</h1>
          </div>

          <JellyBalance />
        </header>

        <div className="space-y-16">
          <section className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] italic">FATE FLOW</h3>
              <LayoutGrid className="w-4 h-4 text-slate-700" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {FATE_MODULES.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={i}
                    href={item.href}
                    className="p-6 rounded-[2.5rem] bg-slate-900/40 backdrop-blur-xl border border-white/5 hover:border-indigo-500/30 transition-all group hover:-translate-y-1"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-black text-white italic mb-1">{item.label}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{item.desc}</p>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] italic">RELATIONSHIP SIGNAL</h3>
              <Heart className="w-4 h-4 text-rose-500/50" />
            </div>
            <div className="space-y-4">
              {COMPAT_MODULES.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={i}
                    href={item.href}
                    className={cn(
                      "flex items-center p-8 rounded-[3rem] border transition-all hover:scale-[1.02] relative overflow-hidden group",
                      item.highlight
                        ? "bg-gradient-to-br from-rose-900/20 to-indigo-900/20 border-rose-500/20"
                        : "bg-slate-900/40 border-white/5",
                    )}
                  >
                    <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-3xl mr-6 group-hover:rotate-12 transition-transform">
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className={cn("text-lg font-black italic", item.highlight ? "text-rose-400" : "text-white")}>{item.title}</h4>
                        {item.highlight && <span className="px-2 py-0.5 bg-rose-600 text-white text-[8px] font-black rounded-full uppercase italic tracking-widest">Premium</span>}
                      </div>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-slate-600 group-hover:text-white transition-colors" />
                    {item.jelly && (
                      <div className="absolute top-4 right-8 flex items-center gap-1.5 px-3 py-1 bg-black/40 rounded-full border border-white/5 text-[9px] font-black text-rose-400 uppercase italic">
                        <Zap className="w-3 h-3 fill-rose-400" /> {item.jelly} Jelly
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        <div className="mt-24 p-10 bg-indigo-600/5 rounded-[3rem] border border-indigo-500/10 text-center space-y-4">
          <Shield className="w-8 h-8 text-indigo-500 mx-auto" />
          <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] leading-relaxed">
            운명은 예측이 아닌 준비와 행동을 통해 완성됩니다.<br />자신의 소신과 현명한 판단과 함께 하세요.
          </p>
        </div>
      </div>
    </main>
  );
}
