import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, Clock, ChevronRight } from "lucide-react";
import { STORY_ITEMS } from "../data";

type Props = {
  params: {
    id: string;
  };
};

export default function StoryDetailPage({ params }: Props) {
  const storyId = Number(params.id);
  const currentIndex = STORY_ITEMS.findIndex((story) => story.id === storyId);

  if (currentIndex === -1) {
    return notFound();
  }

  const story = STORY_ITEMS[currentIndex];
  const prevStory = STORY_ITEMS[(currentIndex - 1 + STORY_ITEMS.length) % STORY_ITEMS.length];
  const nextStory = STORY_ITEMS[(currentIndex + 1) % STORY_ITEMS.length];
  const position = `${currentIndex + 1} / ${STORY_ITEMS.length}`;

  return (
    <main className="min-h-[100dvh] bg-background text-foreground relative pb-32">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <header className="mb-12">
          <Link
            href="/story"
            className="inline-flex items-center gap-3 text-secondary hover:text-foreground mb-6 transition-all group"
            aria-label="목록으로 돌아가기"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            목록으로 돌아가기
          </Link>

          <nav aria-label="스토리 내비게이션" className="text-xs text-secondary flex items-center gap-2">
            <Link href="/story" className="hover:text-foreground">
              스토리 목록
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span>#{storyId}</span>
            <ChevronRight className="w-3 h-3" />
            <span>{position}</span>
          </nav>
        </header>

        <article>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black text-primary uppercase tracking-widest bg-primary/10">
            {story.category}
          </span>
          <h1 className="mt-4 text-3xl md:text-5xl font-black leading-tight">{story.title}</h1>
          <p className="mt-4 text-secondary leading-relaxed">{story.description}</p>

          <div className="mt-6 flex items-center gap-6 text-sm font-bold text-secondary uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {story.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {story.readTime.toUpperCase()}
            </span>
          </div>
        </article>

        <section
          className="mt-8 bg-surface border border-border-color rounded-4xl p-8 md:p-10 shadow-xl leading-relaxed whitespace-pre-line text-base md:text-lg"
          aria-label={`${story.title} 본문`}
        >
          {story.content}
        </section>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href={`/story/${prevStory.id}`}
            className="bg-surface border border-border-color rounded-3xl px-6 py-5 hover:border-primary/40 transition-all flex items-center justify-between text-sm font-bold"
            aria-label="이전 글 보기"
          >
            <span>
              <span className="text-secondary">이전 글</span>
              <span className="block mt-1 text-foreground">{prevStory.title}</span>
            </span>
            <ArrowLeft className="w-5 h-5 text-secondary" />
          </Link>
          <Link
            href={`/story/${nextStory.id}`}
            className="bg-surface border border-border-color rounded-3xl px-6 py-5 hover:border-primary/40 transition-all flex items-center justify-between text-sm font-bold"
            aria-label="다음 글 보기"
          >
            <span className="text-right">
              <span className="text-secondary">다음 글</span>
              <span className="block mt-1 text-foreground">{nextStory.title}</span>
            </span>
            <ArrowRight className="w-5 h-5 text-secondary" />
          </Link>
        </div>
      </div>
    </main>
  );
}
