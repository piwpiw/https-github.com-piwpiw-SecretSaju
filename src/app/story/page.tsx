"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Clock, ChevronRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const STORIES = [
    {
        id: 1,
        title: "도화살의 진짜 의미: 연예인만 갖는 걸까?",
        desc: "많은 이들이 두려워하거나 열광하는 도화살. 매력살이라 불리는 이 기운의 진짜 본질과 현대적 활용법을 알아봅니다.",
        category: "명리학 칼럼",
        readTime: "5 min",
        date: "2024. 02. 27"
    },
    {
        id: 2,
        title: "오행(五行)으로 보는 내게 부족한 기운 채우는 법",
        desc: "사주에 물(水)이 부족하다면 검은 옷을 입어라? 오행의 불균형을 해소하는 일상 속 소소한 개운법(開運法) 대공개.",
        category: "운명 향상",
        readTime: "7 min",
        date: "2024. 02. 25"
    },
    {
        id: 3,
        title: "귀문관살: 천재성과 예민함 사이",
        desc: "귀신이 드나드는 문이 있다? 직관력과 영감이 뛰어나지만 때로는 스스로를 괴롭히는 귀문관살의 양면성.",
        category: "신살 탐구",
        readTime: "6 min",
        date: "2024. 02. 20"
    },
    {
        id: 4,
        title: "궁합의 진실: 상극(相剋)이라고 무조건 나쁠까?",
        desc: "나랑 완전 반대인 사람에게 끌리는 이유. 명리학에서 말하는 상생과 상극의 진짜 의미와 좋은 궁합의 조건.",
        category: "인연법",
        readTime: "8 min",
        date: "2024. 02. 15"
    }
];

export default function StoryPage() {
    const router = useRouter();

    return (
        <main className="min-h-[100dvh] bg-background text-foreground relative pb-40">
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

            <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
                <div className="flex items-center justify-between mb-16">
                    <button onClick={() => router.back()} className="flex items-center gap-3 text-secondary hover:text-foreground transition-all group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold tracking-widest uppercase">뒤로</span>
                    </button>
                    <BookOpen className="w-6 h-6 text-primary" />
                </div>

                <div className="mb-16">
                    <h1 className="text-4xl sm:text-6xl font-black italic tracking-tighter uppercase mb-4 text-foreground">사주 이야기</h1>
                    <p className="text-xl text-secondary font-medium max-w-2xl leading-relaxed">
                        명리학의 깊은 지혜부터 운명을 개척하는 현대적인 팁까지, 당신의 운명에 풍부한 인사이트를 더해줄 이야기들입니다.
                    </p>
                </div>

                {/* Featured Story */}
                <Link href="#" className="block mb-12 group">
                    <div className="bg-surface border border-border-color rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col md:flex-row min-h-[400px]">
                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <div className="w-full md:w-1/2 bg-surface/50 border-r border-border-color p-12 flex flex-col justify-center relative z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-primary font-bold text-xs uppercase tracking-widest mb-6 w-fit">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> PICK
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight group-hover:text-primary transition-colors duration-300">
                                대운(大運)이 바뀔 때 우리 몸이 보내는 3가지 신호
                            </h2>
                            <p className="text-lg text-secondary mb-8 line-clamp-3 leading-relaxed">
                                인생의 거대한 전환점인 대운의 교체기. 그냥 지나치기 쉬운 일상 속 징조들을 파악하고 운의 흐름을 내 편으로 만드는 방법을 소개합니다.
                            </p>
                            <div className="flex items-center gap-4 text-sm font-bold text-secondary uppercase tracking-wider mt-auto pt-8 border-t border-border-color/50">
                                <span>명리학 칼럼</span>
                                <span className="w-1 h-1 rounded-full bg-border-color" />
                                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 10 MIN READ</span>
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

                {/* Story Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {STORIES.map((story, i) => (
                        <motion.div
                            key={story.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Link href="#" className="flex flex-col h-full p-8 bg-background border border-border-color rounded-4xl hover:border-primary/50 hover:bg-surface transition-all group shadow-sm hover:shadow-xl">
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
                                    {story.desc}
                                </p>
                                <div className="flex items-center justify-between text-sm font-bold text-secondary uppercase tracking-wider pt-6 border-t border-border-color mt-auto">
                                    <span>{story.date}</span>
                                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {story.readTime}</span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <button className="px-10 py-5 bg-surface border border-border-color rounded-full text-foreground hover:bg-background transition-colors font-black uppercase tracking-widest shadow-lg inline-flex items-center gap-4 group">
                        더 많은 이야기 보기
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </main>
    );
}
