import type { Metadata } from 'next';
import Link from 'next/link';
import { RefreshCw, ArrowLeft, CheckCircle, XCircle, Mail, ShieldAlert } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Refund Policy | Secret Saju',
    description: '시크릿 사주(Secret Saju) 환불 및 결제 취소 정책',
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
                            <h1 className="text-4xl font-black text-foreground italic tracking-tighter uppercase mb-2">환불 규정</h1>
                            <p className="text-sm font-bold text-secondary uppercase tracking-widest leading-none">에너지 환불 프로토콜 v4.5</p>
                        </div>
                    </div>

                    <div className="space-y-12 text-secondary text-base leading-relaxed whitespace-pre-line font-medium tracking-wide">
                        <p className="text-xl italic text-foreground font-medium bg-background p-6 rounded-2xl border border-border-color">
                            시크릿 사주(이하 &apos;회사&apos;)는 「전자상거래 등에서의 소비자보호에 관한 법률」에 따라 이용자의 정당한 에너지 환급 요청을 투명하게 처리합니다.
                        </p>

                        <section>
                            <h3 className="text-foreground font-black text-2xl italic tracking-tighter uppercase mb-6 flex items-center gap-4">
                                <span className="text-secondary">01</span> 환불 승인 기준 (Criteria)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-background border border-emerald-500/20 rounded-3xl p-8 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
                                    <div className="flex items-center gap-3 text-emerald-500 font-black uppercase tracking-widest mb-6 relative z-10 text-sm">
                                        <CheckCircle className="w-5 h-5" /> ELIGIBLE / 승인
                                    </div>
                                    <ul className="space-y-3 text-foreground font-medium relative z-10">
                                        <li>• 미사용 젤리 (결제 후 7일 이내)</li>
                                        <li>• 시스템 엔진 치명적 오류 발생 시</li>
                                        <li>• 결제 모듈 중복 트랜잭션</li>
                                    </ul>
                                </div>
                                <div className="bg-background border border-rose-500/20 rounded-3xl p-8 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-rose-500/5 group-hover:bg-rose-500/10 transition-colors" />
                                    <div className="flex items-center gap-3 text-rose-500 font-black uppercase tracking-widest mb-6 relative z-10 text-sm">
                                        <XCircle className="w-5 h-5" /> DENIED / 거부
                                    </div>
                                    <ul className="space-y-3 text-foreground font-medium relative z-10">
                                        <li>• 젤리 일부/전부 소모 시</li>
                                        <li>• 프로모션/보너스 에너지 유닛</li>
                                        <li>• 결제 시점으로부터 7일 경과</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-foreground font-black text-2xl italic tracking-tighter uppercase mb-6 flex items-center gap-4">
                                <span className="text-secondary">02</span> 환불 처리 단계 (Pipeline)
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { s: '01', t: 'REQUEST / 요청', d: '마이페이지 > 문의하기에서 환불 요청 접수' },
                                    { s: '02', t: 'VERIFY / 검증', d: '결제 내역 및 트랜잭션 사용 이력 실시간 대조 (24h)' },
                                    { s: '03', t: 'REVOKE / 회수', d: '젤리 잔액 차감 및 결제 수단별 취소 절차 개시' }
                                ].map(step => (
                                    <div key={step.s} className="flex gap-8 items-center bg-background p-6 rounded-2xl border border-border-color group hover:border-secondary/50 transition-all">
                                        <span className="text-secondary font-black italic text-4xl leading-none group-hover:scale-110 transition-transform">{step.s}</span>
                                        <div>
                                            <h4 className="text-foreground font-black uppercase tracking-widest mb-1 text-lg">{step.t}</h4>
                                            <p className="text-secondary font-medium">{step.d}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="bg-background rounded-3xl p-10 border border-border-color group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Mail className="w-32 h-32 text-primary" />
                            </div>
                            <h3 className="text-foreground font-black uppercase tracking-widest mb-8 flex items-center gap-3 text-lg relative z-10">
                                <Mail className="w-6 h-6 text-primary" /> 고객 지원 (Support)
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
                                <div className="space-y-2">
                                    <p className="text-xs text-secondary uppercase font-bold tracking-widest leading-none">접수 이메일 (Endpoint)</p>
                                    <p className="text-primary font-black italic text-2xl break-all">support@secretpaws.kr</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs text-secondary uppercase font-bold tracking-widest leading-none">운영 시간 (Cycle)</p>
                                    <p className="text-foreground font-black italic text-2xl">평일 10:00 - 18:00 (KST)</p>
                                </div>
                            </div>
                        </section>

                        <div className="pt-12 border-t border-border-color flex items-center justify-between">
                            <span className="text-sm text-secondary font-bold uppercase tracking-widest">Effective: 2026.02.26</span>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
                                <ShieldAlert className="w-5 h-5 text-secondary" />
                                <span className="text-xs font-black text-secondary uppercase tracking-widest">안전한 자산 보호 (Asset Protection)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Navigation */}
                <div className="mt-16 flex justify-center gap-12 border-t border-border-color pt-12">
                    <Link href="/terms" className="text-sm font-black text-secondary hover:text-foreground uppercase tracking-widest transition-colors">이용약관</Link>
                    <Link href="/privacy" className="text-sm font-black text-secondary hover:text-foreground uppercase tracking-widest transition-colors">개인정보처리방침</Link>
                    <Link href="/" className="text-sm font-black text-secondary hover:text-foreground uppercase tracking-widest transition-colors">홈</Link>
                </div>
            </div>
        </main>
    );
}
