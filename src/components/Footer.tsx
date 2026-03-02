"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n";

export function Footer() {
    const pathname = usePathname();
    const { t } = useLocale();

    if (pathname?.startsWith("/admin")) {
        return null;
    }

    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto border-t border-white/10" style={{ backgroundColor: "var(--background)" }}>
            <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-2 space-y-4">
                        <Link href="/" className="inline-flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-black tracking-tighter">
                                SS
                            </div>
                            <span className="text-lg font-black text-foreground uppercase tracking-tight">Secret Saju</span>
                        </Link>
                        <p className="text-sm max-w-sm leading-relaxed text-secondary">
                            {t('home.feature.desc') || '프리미엄 사주 분석 및 운세 플랫폼'}
                        </p>
                    </div>

                    <div>
                        <h4 className="font-black text-xs mb-4 uppercase tracking-[0.22em] text-foreground">서비스</h4>
                        <ul className="grid grid-cols-2 gap-3 text-sm">
                            <li><Link href="/luck" className="text-slate-300 hover:text-white transition-colors">운세/부적</Link></li>
                            <li><Link href="/destiny" className="text-slate-300 hover:text-white transition-colors">사주/궁합</Link></li>
                            <li><Link href="/healing" className="text-slate-300 hover:text-white transition-colors">희망/아트</Link></li>
                            <li><Link href="/dreams" className="text-slate-300 hover:text-white transition-colors">꿈해몽</Link></li>
                            <li><Link href="/daily" className="text-slate-300 hover:text-white transition-colors">오늘의운세</Link></li>
                            <li><Link href="/consultation" className="text-slate-300 hover:text-white transition-colors">상담</Link></li>
                            <li><Link href="/story" className="text-slate-300 hover:text-white transition-colors">운명 이야기</Link></li>
                            <li><Link href="/more" className="text-slate-300 hover:text-white transition-colors">더보기</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-xs mb-4 uppercase tracking-[0.22em] text-foreground">정보</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/faq" className="text-slate-300 hover:text-white transition-colors">{t('footer.faq') || '자주 묻는 질문'}</Link></li>
                            <li><Link href="/terms" className="text-slate-300 hover:text-white transition-colors">{t('footer.terms') || '이용약관'}</Link></li>
                            <li><Link href="/privacy" className="text-slate-300 hover:text-white transition-colors">{t('footer.privacy') || '개인정보처리방침'}</Link></li>
                            <li><Link href="/refund" className="text-slate-300 hover:text-white transition-colors">{t('footer.refund') || '환불정책'}</Link></li>
                            <li><Link href="/wiki" className="text-slate-300 hover:text-white transition-colors">{t('footer.wiki') || '사주백과'}</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col gap-2 border-t border-white/10 pt-5">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-black text-secondary tracking-[0.12em]">
                        <Link href="/terms" className="hover:text-white transition-colors">이용약관</Link>
                        <span className="w-1 h-1 rounded-full bg-slate-500/60"></span>
                        <Link href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link>
                        <span className="w-1 h-1 rounded-full bg-slate-500/60"></span>
                        <Link href="/refund" className="hover:text-white transition-colors">환불정책</Link>
                        <span className="w-1 h-1 rounded-full bg-slate-500/60"></span>
                        <Link href="/custom/partnership" className="hover:text-white transition-colors">광고 및 제휴</Link>
                    </div>

                    <div className="text-[11px] leading-relaxed text-slate-400">
                        <p className="font-black text-foreground mb-1">보헤미안 스튜디오 (Bohemian Studio)</p>
                        <p>대표: 박인혁 | 사업자등록번호: 123-45-67890 | 통신판매업신고: 2026-서울강남-0000호</p>
                        <p className="mt-1">주소: 서울특별시 강남구 테헤란로 123, 보헤미안 스튜디오</p>
                        <p className="mt-2">
                            고객센터: 070-1234-5678 (평일 10:00~17:00, 점심 12:00~13:00, 휴무: 주말/공휴일)
                        </p>
                        <p className="mt-3">© {currentYear} Secret Saju. All rights reserved.</p>
                    </div>
                </div>

                <div className="text-right">
                    <span className="text-xs px-2 py-1 bg-white/5 rounded-md font-mono text-secondary">v4.5.1 (Jeomsin)</span>
                </div>
            </div>
        </footer>
    );
}
