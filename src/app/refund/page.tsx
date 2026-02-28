import type { Metadata } from 'next';
import Link from 'next/link';
import { RefreshCw, ArrowLeft, CheckCircle, XCircle, Mail, Clock } from 'lucide-react';

export const metadata: Metadata = {
    title: '환불정책',
    description: '시크릿 사주(Secret Saju) 환불 및 결제 취소 정책',
};

export default function RefundPage() {
    return (
        <main className="min-h-screen relative overflow-hidden pb-40">
            <div className="max-w-4xl mx-auto px-6 pt-16 relative z-10">
                <Link href="/mypage" className="flex items-center gap-3 text-secondary hover:text-foreground transition-all group mb-12">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold">뒤로</span>
                </Link>

                <div className="bg-surface border border-border-color rounded-5xl p-10 sm:p-16 relative z-10 shadow-2xl">
                    <div className="flex items-center gap-6 mb-12 pb-12 border-b border-border-color">
                        <div className="w-20 h-20 rounded-3xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                            <RefreshCw className="w-10 h-10 text-secondary" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black mb-2 text-foreground tracking-tight">환불 안내</h1>
                            <p className="text-sm text-secondary font-medium tracking-wide">환불 정책 v4.5</p>
                        </div>
                    </div>

                    <div className="space-y-12 text-secondary text-base leading-relaxed whitespace-pre-line font-medium tracking-wide">
                        <section>
                            <h3 className="text-foreground font-black text-2xl italic tracking-tighter uppercase mb-6 flex items-center gap-4">
                                <span className="text-secondary">01</span> 환불 원칙
                            </h3>
                            <p>회사는 「전자상거래 등에서의 소비자보호에 관한 법률」 및 「콘텐츠산업 진흥법」에 따라 이용자의 정당한 에너지 환급 요청을 투명하게 처리합니다.</p>
                        </section>

                        <section>
                            <h3 className="text-foreground font-black text-2xl italic tracking-tighter uppercase mb-6 flex items-center gap-4">
                                <span className="text-secondary">02</span> 환불 조건
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-background border border-emerald-500/20 rounded-3xl p-8 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
                                    <div className="flex items-center gap-3 text-emerald-500 font-black uppercase tracking-widest mb-6 relative z-10 text-sm">
                                        <CheckCircle className="w-5 h-5" /> 환불 가능
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
                                        <XCircle className="w-5 h-5" /> 환불 불가
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
                                <span className="text-secondary">03</span> 환불 절차
                            </h3>
                            <div className="space-y-6">
                                {[
                                    { s: '01', t: '요청', d: '마이페이지 > 문의하기에서 환불 요청' },
                                    { s: '02', t: '검증', d: '결제 내역 및 사용 이력 확인 (24시간)' },
                                    { s: '03', t: '처리', d: '결제 수단별 취소 처리 (3-7일)' }
                                ].map(step => (
                                    <div key={step.s} className="flex gap-8 items-center bg-background p-6 rounded-2xl border border-border-color">
                                        <span className="text-secondary font-black italic text-3xl leading-none">{step.s}</span>
                                        <div>
                                            <h4 className="text-foreground font-black uppercase tracking-widest mb-2 text-lg">{step.t}</h4>
                                            <p className="text-secondary font-medium">{step.d}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="bg-background rounded-3xl p-10 border border-border-color group">
                            <h3 className="text-foreground font-black uppercase tracking-widest mb-8 flex items-center gap-3 text-lg">
                                <Mail className="w-6 h-6 text-primary mr-2" /> 고객지원
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <p className="text-xs text-secondary uppercase font-bold tracking-widest">이메일</p>
                                    <p className="text-primary font-black italic text-xl">support@secretpaws.kr</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs text-secondary uppercase font-bold tracking-widest">운영 시간</p>
                                    <p className="text-foreground font-black italic text-xl">평일 10:00 - 18:00</p>
                                </div>
                            </div>
                        </section>

                        <div className="pt-12 border-t border-border-color flex items-center justify-between">
                            <span className="text-sm text-secondary font-bold uppercase tracking-widest">시행일: 2026.02.26</span>
                            <div className="flex gap-2">
                                <div className="w-2 h-2 rounded-full bg-secondary opacity-20" />
                                <div className="w-2 h-2 rounded-full bg-secondary opacity-40" />
                                <div className="w-2 h-2 rounded-full bg-secondary" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="mt-16 flex justify-center gap-12 border-t border-border-color pt-12">
                    <Link href="/terms" className="text-sm font-bold text-secondary hover:text-foreground transition-colors">이용약관</Link>
                    <Link href="/privacy" className="text-sm font-bold text-secondary hover:text-foreground transition-colors">개인정보</Link>
                    <Link href="/" className="text-sm font-bold text-secondary hover:text-foreground transition-colors">홈</Link>
                </div>
            </div>
        </main>
    );
}
