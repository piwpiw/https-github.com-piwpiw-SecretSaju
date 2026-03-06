import Link from 'next/link';
import { BookOpenText, ArrowRight, MessageCircleHeart } from 'lucide-react';

export default function BlogRedirectPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-xl rounded-4xl bg-surface border border-border-color p-8 text-center shadow-2xl">
        <BookOpenText className="w-12 h-12 mx-auto mb-5 text-primary" />
        <h1 className="text-2xl font-black text-foreground mb-3">스토리 중심 페이지로 통합 이동</h1>
        <p className="text-sm sm:text-base text-secondary mb-8 leading-relaxed">
          콘텐츠 운영 정책상 블로그 목록은 스토리 허브(`/story`)로 통합되어 관리되고 있습니다. 최신 운세 스토리를 즉시 확인하세요.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/story"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-4 bg-primary text-white font-black rounded-2xl hover:scale-105 transition-all"
          >
            스토리 보기
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/support"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-4 border border-border-color text-secondary font-black rounded-2xl hover:text-foreground transition-all"
          >
            <MessageCircleHeart className="w-4 h-4" />
            지원 정책 보기
          </Link>
        </div>
      </section>
    </main>
  );
}
