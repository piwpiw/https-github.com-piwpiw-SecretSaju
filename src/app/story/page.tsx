"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Clock, ChevronRight, Sparkles, Shuffle } from "lucide-react";
import { STORY_ITEMS } from "./data";

function getRandomStoryId() {
  return STORY_ITEMS[Math.floor(Math.random() * STORY_ITEMS.length)]?.id;
}

export default function StoryPage() {
  const router = useRouter();
  const featuredStory = STORY_ITEMS[0];
  const featuredReadTime = featuredStory.readTime.toUpperCase();

  const moveRandomStory = () => {
    const randomId = getRandomStoryId();
    if (randomId) router.push(`/story/${randomId}`);
  };

  return (
    <main className="min-h-[100dvh] bg-background text-foreground relative pb-40">
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        <div className="flex items-center justify-between mb-16">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-3 text-secondary hover:text-foreground transition-all group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold tracking-widest uppercase">뒤로</span>
          </button>
          <BookOpen className="w-6 h-6 text-primary" />
        </div>

        <div className="mb-16">
          <h1 className="text-4xl sm:text-6xl font-black italic tracking-tighter uppercase mb-4 text-foreground">
            운명 이야기 아카이브
          </h1>
          <p className="text-xl text-secondary font-medium max-w-2xl leading-relaxed">
            하루의 분위기와 마음의 결을 읽어보는 사주 에세이를 모았습니다.
          </p>
        </div>

        <Link href={`/story/${featuredStory.id}`} className="block mb-12 group">
          <div className="bg-surface border border-border-color rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col md:flex-row min-h-[400px]">
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="w-full md:w-1/2 bg-surface/50 border-r border-border-color p-12 flex flex-col justify-center relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-primary font-bold text-xs uppercase tracking-widest mb-6 w-fit">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                PICK
              </div>
              <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight group-hover:text-primary transition-colors duration-300">
                {featuredStory.title}
              </h2>
              <p className="text-lg text-secondary mb-8 line-clamp-3 leading-relaxed">
                {featuredStory.description}
              </p>
              <div className="flex items-center gap-4 text-sm font-bold text-secondary uppercase tracking-wider mt-auto pt-8 border-t border-border-color/50">
                <span>{featuredStory.category}</span>
                <span className="w-1 h-1 rounded-full bg-border-color" />
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {featuredReadTime}
                </span>
              </div>
            </div>

            <div className="w-full md:w-1/2 relative bg-background flex items-center justify-center p-12 overflow-hidden border-t md:border-t-0 border-border-color">
              <div className="absolute w-[150%] h-[150%] bg-[url('/grid.svg')] opacity-10 animate-[spin_120s_linear_infinite]" />
              <div className="relative w-48 h-48 rounded-full border-4 border-primary/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-700 shadow-[0_0_50px_rgba(var(--color-primary),0.2)]">
                <Sparkles className="w-20 h-20 text-primary" />
              </div>
            </div>
          </div>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STORY_ITEMS.map((story, i) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={`/story/${story.id}`}
                className="flex flex-col h-full p-8 bg-background border border-border-color rounded-4xl hover:border-primary/50 hover:bg-surface transition-all group shadow-sm hover:shadow-xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                    {story.category}
                  </span>
                  <ArrowLeft className="w-5 h-5 text-secondary rotate-[135deg] group-hover:text-primary group-hover:scale-110 group-hover:-translate-y-1 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-2xl font-black mb-3 group-hover:text-primary transition-colors leading-snug">
                  {story.title}
                </h3>
                <p className="text-secondary leading-relaxed font-medium mb-8 flex-1">
                  {story.description}
                </p>
                <div className="flex items-center justify-between text-sm font-bold text-secondary uppercase tracking-wider pt-6 border-t border-border-color mt-auto">
                  <span>{story.date}</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {story.readTime.toUpperCase()}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button
            onClick={moveRandomStory}
            className="px-10 py-5 bg-surface border border-border-color rounded-full text-foreground hover:bg-background transition-colors font-black uppercase tracking-widest shadow-lg inline-flex items-center gap-4 group"
          >
            <Shuffle className="w-5 h-5" />
            랜덤 스토리 보기
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </main>
  );
}

