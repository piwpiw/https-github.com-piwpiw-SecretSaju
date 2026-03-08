import Link from "next/link";
import { ArrowLeft, AlertTriangle, Mail, ShieldAlert } from "lucide-react";

export default function AccountDeletePage() {
  return (
    <main className="min-h-screen relative overflow-hidden pb-40">
      <div className="max-w-4xl mx-auto px-6 pt-16 relative z-10">
        <Link href="/mypage" className="flex items-center gap-3 text-secondary hover:text-foreground transition-all group mb-12">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold">뒤로</span>
        </Link>

        <div className="bg-surface border border-border-color rounded-5xl p-10 sm:p-16 shadow-2xl">
          <div className="flex items-center gap-6 mb-12 pb-12 border-b border-border-color">
            <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-rose-400" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-foreground mb-2">회원 탈퇴 요청</h1>
              <p className="text-sm text-secondary font-medium">계정 삭제와 데이터 처리 범위를 먼저 확인해 주세요.</p>
            </div>
          </div>

          <div className="space-y-8 text-secondary leading-8">
            <div className="rounded-3xl border border-border-color bg-background p-6">
              <h2 className="text-xl font-black text-foreground">탈퇴 전에 확인할 내용</h2>
              <ul className="mt-3 list-disc pl-6 space-y-2 text-sm">
                <li>구매한 젤리, 프리미엄 해설, 멤버십 상태는 복구되지 않을 수 있습니다.</li>
                <li>전자상거래 및 분쟁 대응에 필요한 일부 기록은 법정 보존 기간 동안 별도 보관될 수 있습니다.</li>
                <li>탈퇴 요청은 본인 확인 후 처리됩니다.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-6">
              <div className="flex items-center gap-2 text-rose-300 font-black">
                <ShieldAlert className="w-5 h-5" /> 현재 처리 방식
              </div>
              <p className="mt-3 text-sm">
                셀프서비스 즉시 삭제는 아직 지원하지 않습니다. 표준 운영 절차에 따라 고객지원으로 요청을 접수하고,
                본인 확인 후 계정 삭제를 진행합니다.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="/inquiry" className="rounded-2xl bg-rose-500 px-5 py-4 text-center font-black text-white">
                탈퇴 요청 접수하기
              </Link>
              <Link href="/privacy" className="rounded-2xl border border-border-color bg-background px-5 py-4 text-center font-black text-foreground">
                개인정보 처리방침 보기
              </Link>
            </div>

            <div className="flex items-center gap-3 text-sm text-secondary">
              <Mail className="w-4 h-4" />
              요청 접수 후 운영팀이 순차적으로 확인합니다.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
