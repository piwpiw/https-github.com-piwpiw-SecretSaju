import type { Metadata } from "next";
import Link from "next/link";
import { RefreshCw, ArrowLeft, CheckCircle, XCircle, Mail, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund Policy | Secret Saju",
  description: "Secret Saju 환불 및 결제 취소 정책",
};

export default function RefundPage() {
  return (
    <main className="min-h-screen relative overflow-hidden pb-40">
      <div className="max-w-4xl mx-auto px-6 pt-16 relative z-10">
        <Link href="/mypage" className="flex items-center gap-3 text-secondary hover:text-foreground transition-all group mb-12">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold tracking-widest uppercase">뒤로가기</span>
        </Link>

        <div className="bg-surface border border-border-color rounded-5xl p-10 sm:p-16 relative z-10 shadow-2xl">
          <div className="flex items-center gap-6 mb-12 pb-12 border-b border-border-color">
            <div className="w-20 h-20 rounded-3xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
              <RefreshCw className="w-10 h-10 text-secondary" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-foreground mb-2">환불 규정</h1>
              <p className="text-sm font-bold text-secondary uppercase tracking-widest leading-none">최종 개정일: 2026.03.08</p>
            </div>
          </div>

          <div className="space-y-10 text-secondary text-base leading-8 whitespace-pre-line font-medium">
            <p className="text-lg text-foreground bg-background p-6 rounded-2xl border border-border-color">
              Secret Saju는 결제 내역과 실제 사용 여부를 기준으로 환불 가능 여부를 검토합니다.
              환불이 필요한 경우 문의 접수를 통해 검토가 시작됩니다.
            </p>

            <section>
              <h2 className="text-foreground font-black text-2xl mb-4">1. 환불 가능한 경우</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-background border border-emerald-500/20 rounded-3xl p-8">
                  <div className="flex items-center gap-3 text-emerald-500 font-black uppercase tracking-widest mb-6 text-sm">
                    <CheckCircle className="w-5 h-5" /> Eligible
                  </div>
                  <ul className="space-y-3 text-foreground font-medium">
                    <li>중복 결제 또는 명백한 결제 오류</li>
                    <li>결제 후 서비스가 정상적으로 제공되지 않은 경우</li>
                    <li>미사용 상태의 유료 권한에 대해 운영 정책상 환불이 가능한 경우</li>
                  </ul>
                </div>
                <div className="bg-background border border-rose-500/20 rounded-3xl p-8">
                  <div className="flex items-center gap-3 text-rose-500 font-black uppercase tracking-widest mb-6 text-sm">
                    <XCircle className="w-5 h-5" /> Not Eligible
                  </div>
                  <ul className="space-y-3 text-foreground font-medium">
                    <li>이미 사용한 젤리, 분석권, 프리미엄 리포트</li>
                    <li>프로모션 또는 무상 지급 크레딧</li>
                    <li>정책상 환불 불가로 안내된 특별 상품</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-foreground font-black text-2xl mb-4">2. 처리 절차</h2>
              <div className="space-y-4">
                {[
                  { s: "01", t: "문의 접수", d: "문의하기에서 환불/결제 카테고리를 선택해 신청합니다." },
                  { s: "02", t: "결제 검증", d: "결제 기록, 사용 기록, 중복 여부를 확인합니다." },
                  { s: "03", t: "승인 또는 반려", d: "승인 시 환불 처리, 반려 시 사유를 안내합니다." },
                ].map((step) => (
                  <div key={step.s} className="flex gap-8 items-center bg-background p-6 rounded-2xl border border-border-color">
                    <span className="text-secondary font-black text-4xl leading-none">{step.s}</span>
                    <div>
                      <h3 className="text-foreground font-black mb-1 text-lg">{step.t}</h3>
                      <p className="text-secondary">{step.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-background rounded-3xl p-10 border border-border-color relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Mail className="w-32 h-32 text-primary" />
              </div>
              <h2 className="text-foreground font-black mb-8 flex items-center gap-3 text-lg relative z-10">
                <Mail className="w-6 h-6 text-primary" /> 고객지원
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
                <div className="space-y-2">
                  <p className="text-xs text-secondary uppercase font-bold tracking-widest leading-none">문의 경로</p>
                  <p className="text-primary font-black text-2xl break-all">/inquiry</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-secondary uppercase font-bold tracking-widest leading-none">처리 시간</p>
                  <p className="text-foreground font-black text-2xl">영업일 기준 순차 처리</p>
                </div>
              </div>
            </section>

            <div className="pt-12 border-t border-border-color flex items-center justify-between">
              <span className="text-sm text-secondary font-bold uppercase tracking-widest">Asset Protection</span>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
                <ShieldAlert className="w-5 h-5 text-secondary" />
                <span className="text-xs font-black text-secondary uppercase tracking-widest">Verified Billing Only</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex justify-center gap-12 border-t border-border-color pt-12">
          <Link href="/terms" className="text-sm font-black text-secondary hover:text-foreground uppercase tracking-widest transition-colors">이용약관</Link>
          <Link href="/privacy" className="text-sm font-black text-secondary hover:text-foreground uppercase tracking-widest transition-colors">개인정보처리방침</Link>
          <Link href="/inquiry" className="text-sm font-black text-secondary hover:text-foreground uppercase tracking-widest transition-colors">문의하기</Link>
        </div>
      </div>
    </main>
  );
}
