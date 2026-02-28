import { FileText, ArrowLeft, Shield } from "lucide-react";
import Link from 'next/link';

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
                            <h1 className="text-4xl font-black mb-2 text-foreground uppercase tracking-tight">이용약관</h1>
                            <p className="text-sm text-secondary font-medium">이용약관 v4.5</p>
                        </div>
                    </div>

                    <div className="space-y-12 text-secondary text-base leading-relaxed whitespace-pre-line font-medium tracking-wide">
                        <section>
                            <h3 className="text-foreground font-black text-2xl italic tracking-tighter uppercase mb-6 flex items-center gap-4">
                                <span className="text-primary">01</span> 목적
                            </h3>
                            <p>본 약관은 회사가 제공하는 시크릿 사주(Secret Saju) 서비스 이용과 관련하여 회사와 사용자의 권리, 의무, 책임 사항을 규정합니다. 운명 분석 서비스의 공정한 이용을 목적으로 합니다.</p>
                        </section>

                        <section>
                            <h3 className="text-foreground font-black text-2xl italic tracking-tighter uppercase mb-6 flex items-center gap-4">
                                <span className="text-primary">02</span> 계정 및 젤리
                            </h3>
                            <div className="space-y-6">
                                <p className="flex gap-4 p-6 bg-background rounded-2xl border border-border-color">
                                    <span className="text-primary font-black">A.</span>
                                    유저는 카카오 및 기타 인증을 통해 고유 노드를 생성하며, 운명 데이터의 무결성을 유지할 책임이 있습니다.
                                </p>
                                <p className="flex gap-4 p-6 bg-background rounded-2xl border border-border-color">
                                    <span className="text-primary font-black">B.</span>
                                    유료 재화(젤리)는 결제 시점으로부터 5년간 유효하며, 기한 만료 시 소멸됩니다.
                                </p>
                                <p className="flex gap-4 p-6 bg-background rounded-2xl border border-border-color">
                                    <span className="text-primary font-black">C.</span>
                                    환불 요청 시 운용 수수료가 발생할 수 있으며 시스템 사용 내역을 기반으로 처리됩니다.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-foreground font-black text-2xl italic tracking-tighter uppercase mb-6 flex items-center gap-4">
                                <span className="text-primary">03</span> 사용자 책임
                            </h3>
                            <p>회원은 타인의 생년월일 등 개인정보를 도용할 수 없으며, 모든 이용의 법적 책임은 해당 계정 소유자에게 귀속됩니다.</p>
                        </section>

                        <div className="pt-12 border-t border-border-color flex items-center justify-between">
                            <span className="text-sm text-secondary font-bold uppercase tracking-widest">시행일: 2026.02.01</span>
                            <div className="flex gap-2 relative">
                                <div className="absolute -left-12 -top-12 w-24 h-24 bg-primary/20 blur-2xl rounded-full" />
                                <div className="w-2 h-2 rounded-full bg-primary opacity-20 relative z-10" />
                                <div className="w-2 h-2 rounded-full bg-primary opacity-50 relative z-10" />
                                <div className="w-2 h-2 rounded-full bg-primary relative z-10" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
