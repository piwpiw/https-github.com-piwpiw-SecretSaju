"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n";

export function Footer() {
    const pathname = usePathname();
    const { t } = useLocale();

    if (pathname?.startsWith('/admin')) {
        return null;
    }

    return (
        <footer className="w-full border-t mt-auto" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-color)' }}>
            <div className="max-w-6xl mx-auto px-4 py-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* 브랜드 */}
                    <div className="md:col-span-2 space-y-3">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white text-sm font-bold">사</span>
                            </div>
                            <span className="text-lg font-bold" style={{ color: 'var(--text-foreground)' }}>
                                시크릿<span style={{ color: 'var(--primary)' }}>사주</span>
                            </span>
                        </Link>
                        <p className="text-sm max-w-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {t('home.feature.desc')}
                        </p>
                    </div>

                    {/* 서비스 */}
                    <div>
                        <h4 className="font-bold text-sm mb-4" style={{ color: 'var(--text-foreground)' }}>{t('footer.service')}</h4>
                        <ul className="grid grid-cols-2 gap-2.5 text-sm">
                            <li><Link href="/luck" className="transition-colors hover:opacity-100 opacity-60" style={{ color: 'var(--text-foreground)' }}>액운/행운</Link></li>
                            <li><Link href="/destiny" className="transition-colors hover:opacity-100 opacity-60" style={{ color: 'var(--text-foreground)' }}>운명/궁합</Link></li>
                            <li><Link href="/healing" className="transition-colors hover:opacity-100 opacity-60" style={{ color: 'var(--text-foreground)' }}>소원/힐링</Link></li>
                            <li><Link href="/dreams" className="transition-colors hover:opacity-100 opacity-60" style={{ color: 'var(--text-foreground)' }}>꿈해몽 검색</Link></li>
                            <li><Link href="/daily" className="transition-colors hover:opacity-100 opacity-60" style={{ color: 'var(--text-foreground)' }}>오늘의 운세</Link></li>
                            <li><Link href="/consulting" className="transition-colors hover:opacity-100 opacity-60" style={{ color: 'var(--text-foreground)' }}>전문가 상담</Link></li>
                        </ul>
                    </div>

                    {/* 고객지원 */}
                    <div>
                        <h4 className="font-bold text-sm mb-4" style={{ color: 'var(--text-foreground)' }}>{t('footer.support')}</h4>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link href="/faq" className="transition-colors hover:opacity-100 opacity-60" style={{ color: 'var(--text-foreground)' }}>{t('footer.faq')}</Link></li>
                            <li><Link href="/terms" className="transition-colors hover:opacity-100 opacity-60" style={{ color: 'var(--text-foreground)' }}>{t('footer.terms')}</Link></li>
                            <li><Link href="/privacy" className="transition-colors hover:opacity-100 opacity-60" style={{ color: 'var(--text-foreground)' }}>{t('footer.privacy')}</Link></li>
                            <li><Link href="/refund" className="transition-colors hover:opacity-100 opacity-60" style={{ color: 'var(--text-foreground)' }}>{t('footer.refund')}</Link></li>
                            <li><Link href="/wiki" className="transition-colors hover:opacity-100 opacity-60" style={{ color: 'var(--text-foreground)' }}>{t('footer.wiki')}</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                        <Link href="/custom/terms" className="hover:underline">이용약관</Link>
                        <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                        <Link href="/custom/privacy" className="font-bold hover:underline" style={{ color: 'var(--text-foreground)' }}>개인정보처리방침</Link>
                        <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                        <Link href="/custom/refund" className="hover:underline">환불정책</Link>
                        <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                        <Link href="/custom/partnership" className="hover:underline">광고/제휴 문의</Link>
                    </div>

                    <div className="text-[11px] leading-relaxed mt-2" style={{ color: 'var(--text-secondary)' }}>
                        <p className="font-bold mb-1" style={{ color: 'var(--text-foreground)' }}>주식회사 시크릿사주</p>
                        <p>대표이사 : 강태공 | 사업자등록번호 : 123-45-67890 <a href="#" className="underline ml-1">사업자정보확인</a></p>
                        <p>통신판매업신고 : 2026-서울강남-1234호 | 개인정보보호책임자 : 홍길동</p>
                        <p>주소 : 서울특별시 강남구 테헤란로 123, 지하 1층 101호</p>
                        <p className="mt-2">
                            <span className="font-bold mr-2">고객센터 1811-9329</span>
                            (평일 10:00 ~ 17:00 / 점심 12:00 ~ 13:00 / 주말 및 공휴일 휴무)
                        </p>
                        <p className="mt-4">
                            © {new Date().getFullYear()} Secret Saju Corp. All rights reserved. {t('footer.disclaimer')}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end justify-between h-full">
                    <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md font-mono mt-auto" style={{ color: 'var(--text-secondary)' }}>v4.5.1 (Jeomsin)</span>
                </div>
            </div>
        </footer>
    );
}
