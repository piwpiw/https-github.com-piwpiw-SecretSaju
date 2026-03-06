import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';

export default function AnalysisHistoryPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-xl rounded-4xl bg-surface border border-border-color p-8 text-center shadow-2xl">
        <Clock className="w-12 h-12 mx-auto mb-5 text-primary" />
        <h1 className="text-2xl font-black text-foreground mb-3">통합 분석 이력으로 이동합니다</h1>
        <p className="text-sm sm:text-base text-secondary mb-8 leading-relaxed">
          분석 이력 기능은 `/history`에서 통합 제공되며, 필터/카테고리/상세 조회를 한 화면에서 확인할 수 있습니다.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/history"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-4 bg-primary text-white font-black rounded-2xl hover:scale-105 transition-all"
          >
            분석 이력 보기
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/mypage"
            className="w-full inline-flex items-center justify-center px-4 py-4 border border-border-color text-secondary font-black rounded-2xl hover:text-foreground transition-all"
          >
            마이페이지로 이동
          </Link>
        </div>
      </section>
    </main>
  );
}
