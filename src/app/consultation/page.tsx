"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, MessageSquare, Phone, ShieldCheck, Star, Zap } from "lucide-react";

type Counselor = {
  id: number;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  status: "online" | "busy";
  price: string;
  tags: string[];
  emoji: string;
};

const COUNSELORS: Counselor[] = [
  {
    id: 1,
    name: "천상권",
    category: "타로/사주",
    rating: 4.9,
    reviews: 1240,
    status: "online",
    price: "1,500원 / 30초",
    tags: ["#명확함", "#미래진로", "#현실조언"],
    emoji: "🔮",
  },
  {
    id: 2,
    name: "서율아",
    category: "심리 상담",
    rating: 4.8,
    reviews: 856,
    status: "online",
    price: "1,200원 / 30초",
    tags: ["#공감형", "#관계상담", "#감정정리"],
    emoji: "🌙",
  },
  {
    id: 3,
    name: "박도현",
    category: "사주/진로",
    rating: 5.0,
    reviews: 2100,
    status: "online",
    price: "2,000원 / 30초",
    tags: ["#정밀해석", "#취업", "#커리어"],
    emoji: "📘",
  },
  {
    id: 4,
    name: "지윤정",
    category: "마음 치유",
    rating: 4.7,
    reviews: 432,
    status: "busy",
    price: "1,500원 / 30초",
    tags: ["#위로", "#회복", "#스트레스"],
    emoji: "🫧",
  },
];

export default function ConsultationPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden pb-40">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" />

      <div className="max-w-2xl mx-auto px-4 pt-10">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-3 text-slate-400 hover:text-white transition-all mb-10 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-black uppercase tracking-tighter">뒤로</span>
        </button>

        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
            <Zap className="w-3 h-3" />
            실시간 상담
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">1:1 전문가 상담</h1>
          <p className="text-slate-500 text-sm font-medium">
            결제 전 상담사 프로필과 후기를 확인하고 바로 채팅/통화를 시작할 수 있습니다.
          </p>
        </div>

        <div className="space-y-4">
          {COUNSELORS.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-6 hover:bg-slate-800 hover:border-amber-500/50 transition-all group"
            >
              <div className="flex gap-6">
                <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform shadow-xl">
                  {c.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black">{c.name}</h3>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                        {c.category}
                      </span>
                    </div>
                    {c.status === "online" ? (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[9px] text-green-400 font-black uppercase tracking-tighter">
                          접속
                        </span>
                      </div>
                    ) : (
                      <span className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">
                        상담중
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1 text-amber-300">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-xs font-black">{c.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold">{c.reviews}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold">{c.price}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {c.tags.map((tag) => (
                      <span key={tag} className="text-[9px] text-slate-500 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-black transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  채팅 상담
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black transition-all"
                >
                  <Phone className="w-4 h-4" />
                  통화 상담
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-slate-900/30 border border-slate-800 rounded-3xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
            <div>
              <p className="text-xs font-black text-slate-100 uppercase tracking-tighter">보안 보호</p>
              <p className="text-[10px] text-slate-500 font-medium leading-tight">
                상담 내용은 암호화되어 저장되며,
                <br />
                결제/로그는 공식 정책에 따라 관리됩니다.
              </p>
            </div>
          </div>
          <Link
            href="/shop"
            className="text-[10px] font-black text-amber-500 border-b border-amber-500 hover:text-amber-300"
          >
            충전하기
          </Link>
        </div>
      </div>
    </main>
  );
}
