import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: '개인정보 처리방침',
    description: '멍냥의 이중생활(Secret Saju) 개인정보 처리방침',
};

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950">
            <div className="max-w-3xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                        개인정보 처리방침
                    </h1>
                    <p className="text-slate-400 text-sm">최종 수정일: 2026년 2월 26일</p>
                </div>

                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 space-y-8 text-slate-300 leading-relaxed">
                    {/* 제1조 */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">제1조 (개인정보의 수집 항목 및 방법)</h2>
                        <p className="mb-3">회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다:</p>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="py-3 px-4 text-left text-white">수집 항목</th>
                                        <th className="py-3 px-4 text-left text-white">수집 방법</th>
                                        <th className="py-3 px-4 text-left text-white">수집 목적</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4">카카오 계정 정보 (닉네임, 이메일, 프로필 이미지)</td>
                                        <td className="py-3 px-4">카카오 소셜 로그인</td>
                                        <td className="py-3 px-4">회원 식별 및 서비스 제공</td>
                                    </tr>
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4">생년월일, 성별</td>
                                        <td className="py-3 px-4">이용자 직접 입력</td>
                                        <td className="py-3 px-4">사주 분석 서비스 제공</td>
                                    </tr>
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4">결제 정보 (거래 내역)</td>
                                        <td className="py-3 px-4">토스페이먼츠 연동</td>
                                        <td className="py-3 px-4">젤리 구매 및 환불 처리</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4">서비스 이용 기록, 접속 로그</td>
                                        <td className="py-3 px-4">자동 수집</td>
                                        <td className="py-3 px-4">서비스 개선 및 통계 분석</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* 제2조 */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">제2조 (개인정보의 이용 목적)</h2>
                        <ul className="list-disc list-inside space-y-2">
                            <li>서비스 제공 및 운영: 사주 분석, 궁합, 프리미엄 콘텐츠 제공</li>
                            <li>회원 관리: 회원 식별, 서비스 이용 기록 관리</li>
                            <li>결제 처리: 젤리 구매, 환불 및 거래 내역 관리</li>
                            <li>서비스 개선: 이용 통계 분석, 신규 서비스 개발</li>
                            <li>고객 지원: 문의 응대, 불만 처리</li>
                        </ul>
                    </section>

                    {/* 제3조 */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">제3조 (개인정보의 보유 및 이용 기간)</h2>
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong className="text-white">회원 정보:</strong> 회원 탈퇴 시까지 (탈퇴 후 즉시 파기)</li>
                            <li><strong className="text-white">결제 기록:</strong> 전자상거래법에 따라 5년간 보관</li>
                            <li><strong className="text-white">서비스 이용 기록:</strong> 3개월간 보관 후 파기</li>
                            <li><strong className="text-white">소비자 상담 기록:</strong> 전자상거래법에 따라 3년간 보관</li>
                        </ul>
                    </section>

                    {/* 제4조 */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">제4조 (개인정보의 제3자 제공)</h2>
                        <p className="mb-3">
                            회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다:
                        </p>
                        <ul className="list-disc list-inside space-y-2">
                            <li>이용자가 사전에 동의한 경우</li>
                            <li>법령의 규정에 의하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
                        </ul>
                    </section>

                    {/* 제5조 */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">제5조 (개인정보의 처리 위탁)</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="py-3 px-4 text-left text-white">수탁자</th>
                                        <th className="py-3 px-4 text-left text-white">위탁 업무</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4">㈜비바리퍼블리카 (토스페이먼츠)</td>
                                        <td className="py-3 px-4">결제 처리</td>
                                    </tr>
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4">Supabase Inc.</td>
                                        <td className="py-3 px-4">데이터 저장 및 인증</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4">Vercel Inc.</td>
                                        <td className="py-3 px-4">서비스 호스팅</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* 제6조 */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">제6조 (이용자의 권리)</h2>
                        <p className="mb-3">이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다:</p>
                        <ul className="list-disc list-inside space-y-2">
                            <li>개인정보 열람 요구</li>
                            <li>개인정보 정정·삭제 요구</li>
                            <li>개인정보 처리정지 요구</li>
                            <li>회원 탈퇴 (카카오 계정 연결 해제)</li>
                        </ul>
                    </section>

                    {/* 제7조 */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">제7조 (개인정보 보호책임자)</h2>
                        <div className="bg-white/5 rounded-xl p-4">
                            <p>이름: Secret Paws 개인정보 보호팀</p>
                            <p>이메일: privacy@secretpaws.kr</p>
                        </div>
                    </section>

                    {/* 부칙 */}
                    <section className="border-t border-white/10 pt-6">
                        <h2 className="text-xl font-bold text-white mb-3">부칙</h2>
                        <p>이 개인정보 처리방침은 2026년 2월 26일부터 시행됩니다.</p>
                    </section>
                </div>

                {/* Navigation */}
                <div className="mt-8 flex justify-center gap-4 text-sm">
                    <Link href="/terms" className="text-purple-400 hover:text-purple-300 transition-colors">
                        ← 이용약관
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
