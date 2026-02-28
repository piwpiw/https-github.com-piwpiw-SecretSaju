import { Lock, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from 'next/link';

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
                            <h1 className="text-4xl font-black text-foreground italic tracking-tighter uppercase mb-2">Data Privacy</h1>
                            <p className="text-sm font-bold text-secondary uppercase tracking-widest leading-none">Protection Protocols v4.0.2</p>
                        </div>
                    </div>

                    <div className="space-y-12 text-secondary text-base leading-relaxed whitespace-pre-line font-medium tracking-wide">
                        <p className="text-xl italic text-foreground font-medium bg-background p-6 rounded-2xl border border-border-color">
                            시크릿 사주(이하 &apos;회사&apos;)는 회원의 개인정보 보호를 최우선 순위로 하며, 모든 운명 데이터는 종단간 암호화를 통해 관리됩니다.
                        </p>

                        <section>
                            <h3 className="text-foreground font-black text-2xl italic tracking-tighter uppercase mb-6 flex items-center gap-4">
                                <span className="text-secondary">01</span> Collected Datasets
                            </h3>
                            <div className="space-y-6">
                                <p className="flex gap-4 p-6 bg-background rounded-2xl border border-border-color text-foreground">
                                    <span className="text-secondary font-black">ESSENTIAL:</span>
                                    생년월일, 탄생 시각, 성별, 소셜 식별 토큰(Email, Nickname)
                                </p>
                                <p className="flex gap-4 p-6 bg-background rounded-2xl border border-border-color text-foreground">
                                    <span className="text-secondary font-black">VOLUNTARY:</span>
                                    디지털 프로필 이미지 (UI 고도화용)
                                </p>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-foreground font-black text-2xl italic tracking-tighter uppercase mb-6 flex items-center gap-4">
                                <span className="text-secondary">02</span> Processing Objectives
                            </h3>
                            <ul className="space-y-4 list-disc pl-6 marker:text-secondary p-6 bg-background rounded-2xl border border-border-color text-foreground">
                                <li>AI 기반 정밀 명리학 알고리즘 운용 및 결과 산출</li>
                                <li>회원 노드 식별 및 CS 커뮤니케이션, 에너지 트랜잭션 기록</li>
                                <li>차세대 사주 엔진 고도화 및 알고리즘 튜닝</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-foreground font-black text-2xl italic tracking-tighter uppercase mb-6 flex items-center gap-4">
                                <span className="text-secondary">03</span> Erasure & Archiving
                            </h3>
                            <p className="p-6 bg-background rounded-2xl border border-border-color text-foreground leading-relaxed">
                                회원이 노드를 폐쇄(탈퇴)할 경우, 해당 페이트 매트릭스 데이터는 복구 불가능한 방식으로 즉각 소멸됩니다. 단, 상거래법에 명시된 금융 데이터는 규정에 따라 법정 기간 동안 암호화 보관됩니다.
                            </p>
                        </section>

                        <div className="pt-12 border-t border-border-color flex items-center justify-between">
                            <span className="text-sm text-secondary font-bold uppercase tracking-widest">Last Modified: 2026.02.26</span>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
                                <ShieldCheck className="w-5 h-5 text-secondary" />
                                <span className="text-xs font-black text-secondary uppercase tracking-widest">GDPR Compliance Ready</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
