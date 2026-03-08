"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  ExternalLink,
  FileText,
  HeartHandshake,
  MessageCircle,
  Send,
  Shield,
  Sparkles,
} from "lucide-react";
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
    <main className="relative min-h-screen overflow-hidden bg-slate-950 pb-32 text-slate-100 selection:bg-pink-500/30">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 10%, rgba(244,114,182,0.12), transparent 40%), radial-gradient(circle at 70% 70%, rgba(99,102,241,0.12), transparent 40%)",
        }}
      />
      <div className="pointer-events-none absolute left-0 top-0 h-[40vh] w-full bg-gradient-to-b from-pink-900/10 via-slate-950/50 to-transparent" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-12">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="group mb-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-all hover:border-white/20 hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5 text-slate-400 transition-colors group-hover:-translate-x-1 group-hover:text-white" />
        </motion.button>

        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-slate-900/40 p-10 shadow-2xl backdrop-blur-2xl md:p-14"
        >
          <div className="pointer-events-none absolute right-0 top-0 -mr-40 -mt-40 h-[400px] w-[400px] rounded-full bg-pink-500/10 blur-[100px]" />

          <motion.div
            variants={itemVariants}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-pink-500/20 bg-pink-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-pink-400"
          >
            <HeartHandshake className="h-3 w-3" /> Customer Support
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="mb-6 text-4xl font-black italic leading-tight tracking-tighter text-white md:text-5xl"
          >
            표준 결제 경로로만
            <br />
            이용해 주세요
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mb-12 max-w-2xl text-sm font-medium leading-relaxed text-slate-300 md:text-base"
          >
            Secret Saju는 결제, 젤리 충전, 멤버십 활성화를 클라이언트 화면에서 직접 처리하지
            않습니다. 실제 구매와 크레딧 반영은{" "}
            <strong className="rounded-md bg-white/10 px-2 py-0.5 text-white">
              검증 가능한 결제 경로
            </strong>
            에서만 엄격하게 진행되며, 오류나 환불 문의는 고객지원으로 접수됩니다.
          </motion.p>

          <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {SUPPORT_OPTIONS.map((item) => (
              <motion.div key={item.title} variants={itemVariants}>
                <Link
                  href={item.href}
                  className={`group relative block h-full overflow-hidden rounded-[2rem] border border-white/5 bg-gradient-to-br ${item.color} p-8 shadow-xl transition-all duration-300 hover:bg-slate-900/80 ${item.borderHover} ${item.shadowHover}`}
                >
                  <div className="absolute right-0 top-0 scale-150 p-6 opacity-0 transition-opacity group-hover:opacity-10 -rotate-12">
                    <item.icon className={`h-24 w-24 ${item.iconColor}`} />
                  </div>

                  <div
                    className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/20 ${item.iconColor}`}
                  >
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 text-xl font-black tracking-tight text-white">{item.title}</h3>
                  <p className="mb-8 text-sm leading-relaxed text-slate-400">{item.description}</p>

                  <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-300 transition-colors group-hover:text-white">
                    {item.cta}
                    <ExternalLink className="h-3 w-3 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div variants={itemVariants} className="relative z-10 mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="group flex flex-col items-start rounded-[2rem] border border-slate-800 bg-slate-950/50 p-8 transition-colors hover:border-cyan-500/30">
              <div className="mb-4 flex items-center gap-3 text-lg font-black tracking-tight text-cyan-400">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10">
                  <MessageCircle className="h-4 w-4" />
                </div>
                커뮤니티 톡방
              </div>
              <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-400">
                서비스 공지, 장애 공지 및 가벼운 질문은 오픈 채널에서 가장 빠르게 확인할 수
                있습니다. 자유롭게 참여해주세요.
              </p>
              <a
                href={KAKAO_LINK}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-5 py-3.5 text-sm font-black tracking-wider text-white transition-all hover:bg-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20"
              >
                <Send className="h-4 w-4" /> 카카오톡 톡방 입장
              </a>
            </div>

            <div className="group relative overflow-hidden rounded-[2rem] border border-indigo-500/20 bg-indigo-950/20 p-8">
              <div className="absolute -right-4 -top-4 p-4 opacity-5 transition-opacity group-hover:opacity-10">
                <Shield className="h-32 w-32 text-indigo-400" />
              </div>
              <div className="relative z-10 mb-4 flex items-center gap-3 text-lg font-black tracking-tight text-white">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/20">
                  <Sparkles className="h-4 w-4 text-indigo-300" />
                </div>
                이용자 보호 원칙
              </div>
              <ul className="nav relative z-10 mt-6 space-y-3">
                {[
                  "결제/크레딧 지급은 서버 측 이중 검증 후 반영됩니다.",
                  "환불 및 취소는 PG사 결제 내역을 기준으로 신속 검토됩니다.",
                  "테스트용 데이터나 가상 화폐는 즉시 회수될 수 있습니다.",
                ].map((text) => (
                  <li
                    key={text}
                    className="flex items-start gap-3 text-sm font-medium leading-relaxed text-slate-300"
                  >
                    <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" />
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
