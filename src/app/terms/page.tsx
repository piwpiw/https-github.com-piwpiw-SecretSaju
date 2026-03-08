import { FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen relative overflow-hidden pb-40">
      <div className="max-w-4xl mx-auto px-6 pt-16 relative z-10">
        <Link href="/mypage" className="flex items-center gap-3 text-secondary hover:text-foreground transition-all group mb-12">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold">뒤로</span>
        </Link>

        <div className="bg-surface border border-border-color rounded-5xl p-10 sm:p-16 relative z-10 shadow-2xl">
          <div className="flex items-center gap-6 mb-12 pb-12 border-b border-border-color">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <FileText className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black mb-2 text-foreground">이용약관</h1>
              <p className="text-sm text-secondary font-medium">최종 개정일: 2026.03.08</p>
            </div>
          </div>

          <div className="space-y-10 text-secondary text-base leading-8 whitespace-pre-line font-medium">
            <section>
              <h2 className="text-foreground font-black text-2xl mb-4">1. 목적</h2>
              <p>
                본 약관은 Secret Saju가 제공하는 사주, 운세, 궁합, 결제 및 멤버십 관련 서비스의 이용 조건과
                회사와 이용자의 권리, 의무 및 책임 사항을 규정합니다.
              </p>
            </section>

            <section>
              <h2 className="text-foreground font-black text-2xl mb-4">2. 계정과 인증</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>이용자는 카카오, 구글, 이메일 등 서비스가 실제로 지원하는 인증 수단으로만 가입하거나 로그인할 수 있습니다.</li>
                <li>타인의 정보 또는 접근 권한을 무단으로 사용하는 행위는 금지됩니다.</li>
                <li>이용자는 본인 계정의 보안 유지 책임을 집니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground font-black text-2xl mb-4">3. 유료 서비스와 결제</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>젤리 충전, 프리미엄 해설, 멤버십은 회사가 제공하는 검증 가능한 결제 경로에서만 구매할 수 있습니다.</li>
                <li>클라이언트 화면의 임시 상태나 캐시는 실제 권한을 증명하지 않습니다. 최종 권한은 서버 검증 결과를 따릅니다.</li>
                <li>가격, 제공 범위, 환불 가능 여부는 상품 안내와 환불 규정에 따릅니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground font-black text-2xl mb-4">4. 이용 제한</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>서비스를 자동화 도구로 대량 호출하거나, 허가되지 않은 방식으로 데이터를 수집하는 행위</li>
                <li>결제, 포인트, 멤버십 권한을 조작하거나 우회하려는 행위</li>
                <li>운영을 방해하거나 다른 이용자에게 피해를 주는 행위</li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground font-black text-2xl mb-4">5. 책임 제한</h2>
              <p>
                서비스에서 제공하는 해석과 콘텐츠는 정보 제공 목적이며, 의료, 법률, 투자 판단을 대체하지 않습니다.
                회사는 이용자의 최종 의사결정에 대한 직접 책임을 부담하지 않습니다.
              </p>
            </section>

            <section>
              <h2 className="text-foreground font-black text-2xl mb-4">6. 문의</h2>
              <p>
                이용약관, 결제, 환불, 계정 관련 문의는 <Link href="/inquiry" className="text-primary underline">문의하기</Link> 또는
                <Link href="/refund" className="text-primary underline ml-1">환불 안내</Link>를 통해 접수할 수 있습니다.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
