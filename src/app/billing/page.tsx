import Link from "next/link";
import { ArrowLeft, CreditCard, Receipt, RefreshCw, ShieldCheck } from "lucide-react";

export default function BillingPage() {
  return (
    <main className="min-h-screen relative overflow-hidden pb-40">
      <div className="max-w-4xl mx-auto px-6 pt-16 relative z-10">
        <Link href="/mypage" className="flex items-center gap-3 text-secondary hover:text-foreground transition-all group mb-12">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold">뒤로</span>
        </Link>

        <div className="bg-surface border border-border-color rounded-5xl p-10 sm:p-16 shadow-2xl">
          <div className="flex items-center gap-6 mb-12 pb-12 border-b border-border-color">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <CreditCard className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-foreground mb-2">결제 및 구독 관리</h1>
              <p className="text-sm text-secondary font-medium">표준 결제 경로와 고객지원 기준 안내</p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <Link href="/shop" className="rounded-3xl border border-border-color bg-background p-6 hover:border-primary/40 transition-colors">
              <CreditCard className="w-6 h-6 text-primary" />
              <h2 className="mt-4 text-lg font-black text-foreground">상품 보기</h2>
              <p className="mt-2 text-sm text-secondary">젤리 충전, 프리미엄, 멤버십 상품을 실제 결제 경로에서 확인합니다.</p>
            </Link>
            <Link href="/refund" className="rounded-3xl border border-border-color bg-background p-6 hover:border-primary/40 transition-colors">
              <RefreshCw className="w-6 h-6 text-primary" />
              <h2 className="mt-4 text-lg font-black text-foreground">환불 정책</h2>
              <p className="mt-2 text-sm text-secondary">환불 가능 기준, 처리 절차, 검토 범위를 확인합니다.</p>
            </Link>
            <Link href="/inquiry" className="rounded-3xl border border-border-color bg-background p-6 hover:border-primary/40 transition-colors">
              <Receipt className="w-6 h-6 text-primary" />
              <h2 className="mt-4 text-lg font-black text-foreground">결제 문의</h2>
              <p className="mt-2 text-sm text-secondary">영수증, 결제 확인, 구독 문의는 고객지원으로 접수합니다.</p>
            </Link>
          </div>

          <div className="mt-8 rounded-3xl border border-secondary/20 bg-secondary/5 p-6">
            <div className="flex items-center gap-3 text-secondary font-black">
              <ShieldCheck className="w-5 h-5" /> 현재 운영 기준
            </div>
            <ul className="mt-3 list-disc pl-6 text-sm text-secondary space-y-2">
              <li>클라이언트 저장값만으로 구독이나 권한을 확정하지 않습니다.</li>
              <li>실제 결제와 환불은 서버 검증 또는 고객지원 확인 후 처리됩니다.</li>
              <li>셀프서비스 빌링 포털은 준비 중이며, 현재는 문의 기반으로 지원합니다.</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
