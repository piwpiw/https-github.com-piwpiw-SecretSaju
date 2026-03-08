import { Lock, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen relative overflow-hidden pb-40">
      <div className="max-w-4xl mx-auto px-6 pt-16 relative z-10">
        <Link href="/mypage" className="flex items-center gap-3 text-secondary hover:text-foreground transition-all group mb-12">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold tracking-widest uppercase">Return</span>
        </Link>

        <div className="bg-surface border border-border-color rounded-5xl p-10 sm:p-16 relative z-10 shadow-2xl">
          <div className="flex items-center gap-6 mb-12 pb-12 border-b border-border-color">
            <div className="w-20 h-20 rounded-3xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
              <Lock className="w-10 h-10 text-secondary" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-foreground mb-2">개인정보 처리방침</h1>
              <p className="text-sm font-bold text-secondary uppercase tracking-widest leading-none">Last Modified: 2026.03.08</p>
            </div>
          </div>

          <div className="space-y-10 text-secondary text-base leading-8 whitespace-pre-line font-medium">
            <p className="text-lg text-foreground bg-background p-6 rounded-2xl border border-border-color">
              Secret Saju는 서비스 제공에 필요한 최소한의 개인정보만 수집하며, 결제 검증, 계정 관리, 고객지원,
              보안 대응 목적 외에는 이용하지 않습니다.
            </p>

            <section>
              <h2 className="text-foreground font-black text-2xl mb-4">1. 수집하는 정보</h2>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>필수: 이메일, 닉네임, 인증 제공자 식별값, 생년월일, 출생 시간, 성별</li>
                <li>선택: 프로필 이미지, 문의 내용, 결제 관련 상담 정보</li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground font-black text-2xl mb-4">2. 이용 목적</h2>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>사주, 운세, 궁합 등 결과 계산과 저장</li>
                <li>결제 확인, 환불 처리, 멤버십 상태 검증</li>
                <li>문의 대응, 장애 대응, 보안 로그 확인</li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground font-black text-2xl mb-4">3. 보관 및 삭제</h2>
              <p className="p-6 bg-background rounded-2xl border border-border-color text-foreground leading-relaxed">
                이용자는 탈퇴 요청 또는 삭제 요청을 할 수 있습니다. 계정 삭제가 확정되면 서비스 데이터는 내부 정책과
                관계 법령에 따라 삭제 또는 분리 보관됩니다. 다만 전자상거래, 세무, 분쟁 대응에 필요한 일부 기록은 법정
                보존 기간 동안 암호화하여 보관될 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-foreground font-black text-2xl mb-4">4. 이용자 권리</h2>
              <p className="text-foreground">
                이용자는 자신의 개인정보 열람, 정정, 삭제, 처리 정지 요청을 할 수 있으며,
                <Link href="/account/delete" className="text-secondary underline ml-1">회원 탈퇴 요청</Link> 또는
                <Link href="/inquiry" className="text-secondary underline ml-1">문의하기</Link>를 통해 접수할 수 있습니다.
              </p>
            </section>

            <div className="pt-12 border-t border-border-color flex items-center justify-between">
              <span className="text-sm text-secondary font-bold uppercase tracking-widest">Protection Protocols</span>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
                <ShieldCheck className="w-5 h-5 text-secondary" />
                <span className="text-xs font-black text-secondary uppercase tracking-widest">Security First</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
