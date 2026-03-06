import Link from 'next/link';
import { Brain, ArrowRight, ArrowLeft } from 'lucide-react';

export default function PsychologyModuleHomePage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-xl rounded-4xl bg-surface border border-border-color p-8 text-center shadow-2xl">
        <Brain className="w-12 h-12 mx-auto mb-5 text-primary" />
        <h1 className="text-2xl font-black text-foreground mb-3">심리 진단은 통합 페이지에서 시작됩니다</h1>
        <p className="text-sm sm:text-base text-secondary mb-8 leading-relaxed">
          심리 모듈은 `/psychology` 페이지로 통합되어, 진단 선택, 결과 분석, 맞춤 제안을 한 번에 제공합니다.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/psychology"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-4 bg-primary text-white font-black rounded-2xl hover:scale-105 transition-all"
          >
            심리 진단 바로가기
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-4 border border-border-color text-secondary font-black rounded-2xl hover:text-foreground transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로
          </Link>
        </div>
      </section>
    </main>
  );
}
