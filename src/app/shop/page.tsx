'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles } from 'lucide-react';
import PremiumTierCard from '@/components/shop/PremiumTierCard';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function ShopPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden pb-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.15),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(244,114,182,0.1),transparent_45%)]" />

      <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        <header className="flex items-center justify-between mb-16">
          <button
            onClick={() => router.back()}
            className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-slate-200" />
          </button>
          <div className="px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-widest italic">시크릿사주 젤리 공방</span>
          </div>
        </header>

        <ScrollReveal>
          <section className="text-center mb-16">
            <h1 className="ui-title-gradient text-4xl sm:text-6xl mb-6 leading-tight">
              사주 분석
              <br />
              <span className="text-indigo-500">젤리 구독 혜택</span>
            </h1>
            <p className="text-sm text-slate-400 uppercase tracking-widest font-bold">
              전문가급 오라클 젤리로 무제한 개인 통찰
            </p>
          </section>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center px-4">
            <PremiumTierCard
              name="체험팩"
              jellies={30}
              price="3,300"
              features={['젤리 30개 즉시 사용', '일부 분석 도구 3회 이용', '기본 리포트 템플릿 포함']}
            />
            <PremiumTierCard
              name="프로팩"
              jellies={300}
              price="22,000"
              isPro
              features={['젤리 300개 보유', '전체 분석 리포트 무제한', '우선 상담 채널 사용', '정밀 해석 템플릿 추가']}
            />
            <PremiumTierCard
              name="스마트팩"
              jellies={100}
              price="9,900"
              features={['젤리 100개 + 보너스 지급', '상세 해석 리포트 지원', '해몽·타로 우선 분석']}
            />
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.28}>
          <section className="mt-16 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-fuchsia-200">Signature Reader Membership</p>
                <h2 className="mt-3 text-3xl font-black text-white">시그니처 리더 멤버십</h2>
                <p className="mt-4 text-sm leading-7 text-slate-200">
                  단건 해금보다 더 깊은 해설을 원하면 시그니처 리더 멤버십이 맞습니다.
                  30일 동안 시그니처 마스터를 열고, 롱폼 브리핑과 통합 조언형 결과를 바로 확인할 수 있습니다.
                </p>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-amber-200">
                  추천 진입가: 5 젤리 / 30일 활성
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/fortune-readers"
                  className="inline-flex items-center justify-center rounded-2xl bg-fuchsia-600 px-5 py-3 text-sm font-black text-white"
                >
                  역술가 마켓 보기
                </Link>
                <Link
                  href="/saju"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-slate-100"
                >
                  결과 화면에서 사용
                </Link>
              </div>
            </div>
          </section>
        </ScrollReveal>

        <section className="mt-24 text-center">
          <div className="inline-flex flex-col items-center">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] mb-4">
              신경망 암호화로 결제 데이터 보호
            </p>
            <div className="flex gap-4 opacity-30 grayscale hover:grayscale-0 transition-all">
              <div className="h-6 w-16 bg-white/10 rounded" />
              <div className="h-6 w-16 bg-white/10 rounded" />
              <div className="h-6 w-16 bg-white/10 rounded" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
