import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: '이용약관',
    description: '멍냥의 이중생활(Secret Saju) 서비스 이용약관',
};

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950">
            <div className="max-w-3xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                        이용약관
                    </h1>
                    <p className="text-slate-400 text-sm">최종 수정일: 2026년 2월 26일</p>
                </div>

                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 space-y-8 text-slate-300 leading-relaxed">
                    {/* 제1조 */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">제1조 (목적)</h2>
                        <p>
                            이 약관은 Secret Paws(이하 &quot;회사&quot;)가 운영하는 &quot;멍냥의 이중생활&quot;
                            (이하 &quot;서비스&quot;)의 이용조건 및 절차, 회사와 이용자 간의 권리, 의무 및 책임사항을
                            규정함을 목적으로 합니다.
                        </p>
                    </section>

                    {/* 제2조 */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">제2조 (정의)</h2>
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong className="text-white">&quot;서비스&quot;</strong>란 회사가 제공하는 사주 분석, 궁합 분석, 디지털 굿즈 등의 콘텐츠를 말합니다.</li>
                            <li><strong className="text-white">&quot;이용자&quot;</strong>란 이 약관에 따라 서비스를 이용하는 자를 말합니다.</li>
                            <li><strong className="text-white">&quot;젤리(Jelly)&quot;</strong>란 서비스 내 프리미엄 콘텐츠 이용을 위한 유료 재화를 말합니다.</li>
                            <li><strong className="text-white">&quot;츄르(Churu)&quot;</strong>란 젤리의 기본 단위로, 콘텐츠 잠금 해제에 사용됩니다.</li>
                        </ul>
                    </section>

                    {/* 제3조 */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">제3조 (약관의 효력 및 변경)</h2>
                        <ol className="list-decimal list-inside space-y-2">
                            <li>이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</li>
                            <li>회사는 관련 법령을 위배하지 않는 범위에서 이 약관을 변경할 수 있으며, 변경 시 최소 7일 전에 공지합니다.</li>
                        </ol>
                    </section>

                    {/* 제4조 */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">제4조 (서비스의 제공)</h2>
                        <ol className="list-decimal list-inside space-y-2">
                            <li>회사는 다음과 같은 서비스를 제공합니다:
                                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                    <li>60갑자 기반 사주 분석</li>
                                    <li>관계 궁합 분석</li>
                                    <li>디지털 아크릴 키링 굿즈</li>
                                    <li>프리미엄 상세 운세</li>
                                </ul>
                            </li>
                            <li>서비스의 내용은 회사의 사정에 의해 변경될 수 있으며, 변경 시 사전 공지합니다.</li>
                        </ol>
                    </section>

                    {/* 제5조 */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">제5조 (젤리 구매 및 사용)</h2>
                        <ol className="list-decimal list-inside space-y-2">
                            <li>젤리는 회사가 정한 결제 수단(토스페이먼츠)을 통해 구매할 수 있습니다.</li>
                            <li>구매한 젤리는 서비스 내 프리미엄 콘텐츠 잠금 해제에 사용됩니다.</li>
                            <li>젤리의 유효기간은 구매일로부터 12개월이며, 유효기간 만료 시 소멸됩니다.</li>
                            <li>젤리의 환불에 관한 사항은 환불정책을 따릅니다.</li>
                        </ol>
                    </section>

                    {/* 제6조 */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">제6조 (이용자의 의무)</h2>
                        <ol className="list-decimal list-inside space-y-2">
                            <li>이용자는 서비스 이용 시 관련 법령, 이 약관 및 회사가 공지하는 사항을 준수하여야 합니다.</li>
                            <li>이용자는 타인의 개인정보를 무단으로 수집하거나 서비스를 부정하게 이용해서는 안 됩니다.</li>
                            <li>서비스를 이용하여 얻은 정보를 회사의 사전 동의 없이 상업적으로 이용해서는 안 됩니다.</li>
                        </ol>
                    </section>

                    {/* 제7조 */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">제7조 (면책조항)</h2>
                        <ol className="list-decimal list-inside space-y-2">
                            <li>본 서비스에서 제공하는 사주 분석 결과는 오락 및 참고 목적입니다.</li>
                            <li>사주 분석 결과를 근거로 한 의사결정에 대해 회사는 책임을 지지 않습니다.</li>
                            <li>천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력으로 인한 서비스 중단에 대해 회사는 책임을 지지 않습니다.</li>
                        </ol>
                    </section>

                    {/* 부칙 */}
                    <section className="border-t border-white/10 pt-6">
                        <h2 className="text-xl font-bold text-white mb-3">부칙</h2>
                        <p>이 약관은 2026년 2월 26일부터 시행됩니다.</p>
                    </section>
                </div>

                {/* Navigation */}
                <div className="mt-8 flex justify-center gap-4 text-sm">
                    <Link href="/privacy" className="text-purple-400 hover:text-purple-300 transition-colors">
                        개인정보처리방침 →
                    </Link>
                    <Link href="/refund" className="text-purple-400 hover:text-purple-300 transition-colors">
                        환불정책 →
                    </Link>
                    <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                        홈으로 돌아가기
                    </Link>
                </div>
            </div>
        </main>
    );
}
