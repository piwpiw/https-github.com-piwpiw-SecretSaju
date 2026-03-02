"use client";

import Link from "next/link";
import {
  Activity,
  BookOpen,
  Compass,
  Crown,
  FileText,
  Gift,
  Globe,
  Heart,
  Moon,
  Settings,
  Shield,
  Sparkles,
  Sun,
  User,
  Zap,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

const MORE_MENUS = [
  {
    group: "사주·운세",
    items: [
      {
        icon: Sparkles,
        title: "사주 기본",
        desc: "프로필 기반으로 사주 계산 결과를 확인하고 상세 해석을 보세요.",
        link: "/saju",
        color: "text-indigo-400",
        help: "사주 생성, 요약 뷰, 요소 균형 분석",
      },
      {
        icon: Compass,
        title: "토정비결 2026",
        desc: "연도 흐름 기반 월별 추천 포인트를 한 번에 봅니다.",
        link: "/tojeong",
        color: "text-amber-400",
        help: "재물, 건강, 대인운 포인트를 묶어 확인",
      },
      {
        icon: Activity,
        title: "신살 분석",
        desc: "신살별 성향과 조심할 포인트를 정리해 제공합니다.",
        link: "/shinsal",
        color: "text-purple-400",
        help: "길신/흉신, 월별 주의점, 대응 전략",
      },
    ],
  },
  {
    group: "타로·별자리·꿈",
    items: [
      {
        icon: Moon,
        title: "타로 리딩",
        desc: "카드 뽑기 결과를 감정·결정 중심으로 해석해 드립니다.",
        link: "/tarot",
        color: "text-indigo-400",
        help: "카드 조합, 키워드, 권장 행동",
      },
      {
        icon: Globe,
        title: "점성술",
        desc: "별자리별 기운, 오늘의 궁합, 주의 경고를 확인하세요.",
        link: "/astrology",
        color: "text-cyan-400",
        help: "별자리 성향, 일간 에너지, 관계 호환도",
      },
      {
        icon: Sun,
        title: "꿈 해몽",
        desc: "꿈 키워드를 입력하면 상징 해석과 현실 적용 포인트를 제공합니다.",
        link: "/dreams",
        color: "text-yellow-400",
        help: "꿈 해석, 감정 요인, 반복 패턴",
      },
      {
        icon: Zap,
        title: "일일 운세",
        desc: "오늘 시간대별 흐름을 기반으로 행동 우선순위를 제안합니다.",
        link: "/daily",
        color: "text-orange-400",
        help: "행운 지수, 위험 신호, 일정 추천",
      },
    ],
  },
  {
    group: "이름·손금·심리",
    items: [
      {
        icon: BookOpen,
        title: "이름 추천",
        desc: "발음, 한자, 오행을 반영한 이름 제안을 제공합니다.",
        link: "/naming",
        color: "text-rose-400",
        help: "발음 안정성, 의미 일치도, 추천 근거",
      },
      {
        icon: Crown,
        title: "손금 운세",
        desc: "손금 패턴을 감각적으로 분석해 성향과 행운 흐름을 제시합니다.",
        link: "/palmistry",
        color: "text-emerald-400",
        help: "건강, 금전, 관계, 집중력 지표",
      },
      {
        icon: Heart,
        title: "심리 상담",
        desc: "감정 패턴을 분석해 연애·인간관계 흐름을 개선할 수 있게 돕습니다.",
        link: "/psychology",
        color: "text-pink-400",
        help: "의사결정 성향, 스트레스 패턴, 대인 관계 팁",
      },
    ],
  },
  {
    group: "내 계정 및 도움",
    items: [
      {
        icon: User,
        title: "마이 페이지",
        desc: "프로필, 분석 기록, 젤리 잔액을 한 곳에서 관리하세요.",
        link: "/mypage",
        color: "text-slate-200",
        help: "연인, 분석 히스토리, 계정 설정",
      },
      {
        icon: Gift,
        title: "후원하기",
        desc: "개발과 운영을 위해 정중한 후원 페이지입니다.",
        link: "/support",
        color: "text-rose-500",
        badge: "NEW",
        help: "후원 안내, 혜택, 톡방 연결 링크",
      },
      {
        icon: FileText,
        title: "문의하기",
        desc: "오류 신고, 제안, 환불 등 모든 문의를 접수합니다.",
        link: "/inquiry",
        color: "text-emerald-500",
        help: "문의 카테고리 선택 후 바로 제출",
      },
    ],
  },
];

export default function MorePage() {
  return (
    <main className="min-h-[100dvh] relative overflow-hidden pb-40 bg-background text-foreground">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]" />
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <div className="flex items-center gap-6 mb-12 pb-8 border-b border-border-color">
          <div className="w-20 h-20 rounded-3xl bg-surface border border-border-color flex items-center justify-center shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/20 animate-pulse group-hover:scale-150 transition-transform duration-700" />
            <Settings className="w-10 h-10 text-primary relative z-10 sm:animate-[spin_6s_linear_infinite]" />
          </div>
          <div>
            <p className="text-sm font-black text-secondary tracking-[0.2em] uppercase">Secret Saju</p>
            <h1 className="text-4xl font-black italic tracking-tighter mb-2">더 보기</h1>
            <p className="text-xs font-bold text-secondary tracking-widest uppercase">전체 메뉴를 빠르게 이동하세요</p>
          </div>
        </div>

        <div className="space-y-12">
          {MORE_MENUS.map((group, gIdx) => (
            <motion.section
              key={group.group}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gIdx * 0.08 }}
              className="space-y-6"
            >
              <h2 className="text-sm font-black text-secondary tracking-widest uppercase flex items-center gap-3">
                <Shield className="w-4 h-4 text-primary" /> {group.group}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {group.items.map((item) => (
                  <Link key={item.link} href={item.link}>
                    <div className="bg-surface border border-border-color p-6 rounded-3xl hover:-translate-y-1 hover:shadow-2xl hover:border-primary/50 transition-all duration-300 group flex items-center justify-between h-full">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-background border border-border-color flex items-center justify-center relative overflow-hidden shrink-0">
                          <div className={`absolute inset-0 opacity-10 ${item.color.replace("text", "bg")} group-hover:opacity-30 transition-opacity`} />
                          <item.icon className={`w-7 h-7 relative z-10 ${item.color} group-hover:scale-110 transition-transform`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-1 flex items-center gap-3">
                            {item.title}
                            {item.badge && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 tracking-widest uppercase">
                                {item.badge}
                              </span>
                            )}
                          </h3>
                          <p className="text-xs text-secondary font-medium leading-relaxed">{item.desc}</p>
                          <p className="text-[10px] text-slate-400 mt-1">도움말: {item.help}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-secondary group-hover:text-foreground transition-colors group-hover:translate-x-1 shrink-0 ml-4" />
                    </div>
                  </Link>
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      </div>
    </main>
  );
}
