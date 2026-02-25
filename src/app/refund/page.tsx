import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: '환불정책',
    description: '멍냥의 이중생활(Secret Saju) 환불 및 결제 취소 정책',
};

export default function RefundPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950">
            <div className="max-w-3xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                        환불 및 결제 취소 정책
                    </h1>
                    <p className="text-slate-400 text-sm">최종 수정일: 2026년 2월 26일</p>
                </div>

                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 space-y-8 text-slate-300 leading-relaxed">
                    {/* 제1조 */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">제1조 (환불 원칙)</h2>
                        <p>
                            회사는 「전자상거래 등에서의 소비자보호에 관한 법률」 및 「콘텐츠산업 진흥법」에 따라
                            이용자의 정당한 환불 요청에 성실히 응합니다.
                        </p>
                    </section>

                    {/* 제2조 */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">제2조 (환불 가능 조건)</h2>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-4">
                            <h3 className="text-emerald-400 font-bold mb-2">✅ 환불이 가능한 경우</h3>
                            <ul className="list-disc list-inside space-y-1">
                                <li>구매한 젤리를 전혀 사용하지 않은 경우 (구매 후 7일 이내)</li>
                                <li>서비스 장애로 인해 서비스를 정상적으로 이용하지 못한 경우</li>
                                <li>결제 오류로 중복 결제된 경우</li>
                            </ul>
                        </div>
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                            <h3 className="text-red-400 font-bold mb-2">❌ 환불이 제한되는 경우</h3>
                            <ul className="list-disc list-inside space-y-1">
                                <li>구매한 젤리를 일부 또는 전부 사용한 경우</li>
                                <li>보너스로 지급된 무료 젤리</li>
                                <li>이벤트/프로모션으로 할인 지급된 젤리 (사용된 부분)</li>
                                <li>구매 후 7일이 경과한 경우 (미사용이라도 제한)</li>
                            </ul>
                        </div>
                    </section>

                    {/* 제3조 */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">제3조 (환불 금액 산정)</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="py-3 px-4 text-left text-white">구분</th>
                                        <th className="py-3 px-4 text-left text-white">환불 금액</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4">미사용 전액 (7일 이내)</td>
                                        <td className="py-3 px-4 text-emerald-400">결제 금액 100%</td>
                                    </tr>
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4">부분 사용</td>
                                        <td className="py-3 px-4 text-yellow-400">환불 불가 (사용된 콘텐츠 가치 차감 불가)</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4">중복 결제</td>
                                        <td className="py-3 px-4 text-emerald-400">중복된 금액 전액 환불</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* 제4조 */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">제4조 (환불 절차)</h2>
                        <ol className="list-decimal list-inside space-y-3">
                            <li>
                                <strong className="text-white">환불 신청:</strong> 마이페이지 &gt; 문의하기 또는 이메일(support@secretpaws.kr)로 환불 요청
                            </li>
                            <li>
                                <strong className="text-white">접수 확인:</strong> 영업일 기준 1일 이내 확인 후 안내
                            </li>
                            <li>
                                <strong className="text-white">환불 처리:</strong> 확인 후 영업일 기준 3일 이내 환불 진행
                            </li>
                            <li>
                                <strong className="text-white">환불 완료:</strong> 결제 수단에 따라 3~7 영업일 소요될 수 있음
                            </li>
                        </ol>
                    </section>

                    {/* 제5조 */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">제5조 (환불 방법)</h2>
                        <p>
                            환불은 원칙적으로 원래의 결제 수단으로 처리됩니다. 카드 결제의 경우 카드사 승인 취소 처리되며,
                            실제 카드 대금 반영까지는 카드사 사정에 따라 일정 시간이 소요될 수 있습니다.
                        </p>
                    </section>

                    {/* 고객센터 안내 */}
                    <section className="border-t border-white/10 pt-6">
                        <h2 className="text-xl font-bold text-white mb-3">💬 환불 문의</h2>
                        <div className="bg-white/5 rounded-xl p-4 space-y-2">
                            <p>이메일: <span className="text-cyan-400">support@secretpaws.kr</span></p>
                            <p>운영시간: 평일 10:00 ~ 18:00 (공휴일 제외)</p>
                            <p>처리기간: 접수 후 영업일 기준 3일 이내</p>
                        </div>
                    </section>

                    {/* 부칙 */}
                    <section className="border-t border-white/10 pt-6">
                        <h2 className="text-xl font-bold text-white mb-3">부칙</h2>
                        <p>이 환불정책은 2026년 2월 26일부터 시행됩니다.</p>
                    </section>
                </div>

                {/* Navigation */}
                <div className="mt-8 flex justify-center gap-4 text-sm">
                    <Link href="/terms" className="text-purple-400 hover:text-purple-300 transition-colors">
                        ← 이용약관
                    </Link>
                    <Link href="/privacy" className="text-purple-400 hover:text-purple-300 transition-colors">
                        ← 개인정보처리방침
                    </Link>
                    <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                        홈으로 돌아가기
                    </Link>
                </div>
            </div>
        </main>
    );
}
