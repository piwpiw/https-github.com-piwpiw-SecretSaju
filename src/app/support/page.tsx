"use client";

import Link from "next/link";
import { ArrowLeft, HeartHandshake, MessageCircle, Send, Shield, Sparkles, CreditCard, FileText, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const KAKAO_LINK = "https://open.kakao.com/o/secret-saju";

const SUPPORT_OPTIONS = [
  {
    title: "젤리 충전 후 이용",
    description: "후원이나 이용권 구매는 실제 결제 검증이 있는 상점 화면에서만 진행됩니다.",
    href: "/shop",
    icon: CreditCard,
    color: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-400",
    cta: "상점으로 이동",
    borderHover: "hover:border-emerald-500/50",
    shadowHover: "hover:shadow-emerald-500/20",
  },
  {
    title: "영수증·환불·문의",
    description: "결제 확인, 환불 요청, 세금계산서 또는 영수증 문의는 고객지원으로 접수해 주세요.",
    href: "/inquiry",
    icon: FileText,
    color: "from-indigo-500/20 to-indigo-500/5",
    iconColor: "text-indigo-400",
    cta: "문의 접수",
    borderHover: "hover:border-indigo-500/50",
    shadowHover: "hover:shadow-indigo-500/20",
  },
] as const;

export default function SupportPage() {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden pb-32 selection:bg-pink-500/30">
      {/* Mystic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(244,114,182,0.12),transparent_40%),radial-gradient(circle_at_70%_70%,rgba(99,102,241,0.12),transparent_40%)]" />
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-pink-900/10 via-slate-950/50 to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all mb-10 group"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors group-hover:-translate-x-1" />
        </motion.button>

        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 md:p-14 relative overflow-hidden shadow-2xl"
        >
          {/* Subtle glow inside section */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />

          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/10 text-pink-400 rounded-full text-[10px] font-black uppercase tracking-[0.24em] border border-pink-500/20 mb-6">
            <HeartHandshake className="w-3 h-3" /> Customer Support
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-black italic tracking-tighter text-white leading-tight mb-6">
            표준 결제 경로로만<br />이용해 주세요
          </motion.h1>

          <motion.p variants={itemVariants} className="text-slate-300 max-w-2xl leading-relaxed text-sm md:text-base font-medium mb-12">
            Secret Saju는 결제, 젤리 충전, 멤버십 활성화를 클라이언트 화면에서 직접 처리하지 않습니다.
            실제 구매와 크레딧 반영은 <strong className="text-white bg-white/10 px-2 py-0.5 rounded-md">검증 가능한 결제 경로</strong>에서만 엄격하게 진행되며,
            오류나 환불 문의는 고객지원으로 접수됩니다.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {SUPPORT_OPTIONS.map((item) => (
              <motion.div key={item.title} variants={itemVariants}>
                <Link
                  href={item.href}
                  className={`group block h-full rounded-[2rem] border border-white/5 bg-gradient-to-br ${item.color} p-8 hover:bg-slate-900/80 transition-all duration-300 ${item.borderHover} ${item.shadowHover} shadow-xl relative overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity -rotate-12 scale-150">
                    <item.icon className={`w-24 h-24 ${item.iconColor}`} />
                  </div>

                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 mb-6 ${item.iconColor} bg-black/20`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-3 tracking-tight">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-8">{item.description}</p>

                  <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors">
                    {item.cta} <ExternalLink className="w-3 h-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div variants={itemVariants} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="rounded-[2rem] border border-slate-800 bg-slate-950/50 p-8 flex flex-col items-start hover:border-cyan-500/30 transition-colors group">
              <div className="flex items-center gap-3 text-cyan-400 font-black tracking-tight text-lg mb-4">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                  <MessageCircle className="w-4 h-4" />
                </div>
                커뮤니티 톡방
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
                서비스 공지, 장애 공지 및 가벼운 질문은 오픈 채널에서 가장 빠르게 확인할 수 있습니다. 자유롭게 참여해주세요.
              </p>
              <a
                href={KAKAO_LINK}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 text-white bg-slate-800 hover:bg-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20 rounded-xl px-5 py-3.5 font-black text-sm tracking-wider transition-all"
              >
                <Send className="w-4 h-4" /> 카카오톡 톡방 입장
              </a>
            </div>

            <div className="rounded-[2rem] border border-indigo-500/20 bg-indigo-950/20 p-8 relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Shield className="w-32 h-32 text-indigo-400" />
              </div>
              <div className="flex items-center gap-3 text-white font-black tracking-tight text-lg mb-4 relative z-10">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <Sparkles className="w-4 h-4 text-indigo-300" />
                </div>
                이용자 보호 원칙
              </div>
              <ul className="space-y-3 nav mt-6 relative z-10">
                {[
                  "결제/크레딧 지급은 서버 측 이중 검증 후 반영됩니다.",
                  "환불 및 취소는 PG사 결제 내역을 기준으로 신속 검토됩니다.",
                  "테스트용 데이터나 가상 화폐는 즉시 회수될 수 있습니다."
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.section>
      </div>
    </main>
  );
}
