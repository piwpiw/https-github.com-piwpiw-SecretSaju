"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Twitter, Mail, Info, Shield, HelpCircle, BookOpen, Sparkles } from "lucide-react";

export function Footer() {
    const pathname = usePathname();

    // Admin pages or specific pages might hide the footer
    if (pathname?.startsWith('/admin')) {
        return null;
    }

    return (
        <footer className="w-full border-t border-white/10 bg-background/80 backdrop-blur-xl mt-auto z-40">
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand & Description */}
                    <div className="md:col-span-2 space-y-4">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-lg">🐶</span>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                                990 사주마미
                            </span>
                        </Link>
                        <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
                            사회적 가면 뒤에 숨겨진 짐승의 본능을 디지털 굿즈로 발급합니다. 명리학 기반 60갑자 동물 아키타입으로 나를 파헤쳐보세요.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <Link href="/inquiry" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
                                <Mail className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Service Links */}
                    <div>
                        <h4 className="text-foreground font-bold mb-4 flex items-center gap-2">
                            <Info className="w-4 h-4 text-cyan-400" />
                            Services
                        </h4>
                        <ul className="space-y-3">
                            <li><Link href="/" className="text-sm text-zinc-400 hover:text-cyan-400 transition-colors">일주 분석 (무료)</Link></li>
                            <li><Link href="/dashboard" className="text-sm text-zinc-400 hover:text-cyan-400 transition-colors">관계 대시보드</Link></li>
                            <li><Link href="/compatibility" className="text-sm text-zinc-400 hover:text-cyan-400 transition-colors">정밀 궁합 분석</Link></li>
                            <li><Link href="/fortune" className="text-sm text-zinc-400 hover:text-cyan-400 transition-colors">2026 신년운세</Link></li>
                            <li><Link href="/gift" className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors font-medium">젤리 충전소 🎁</Link></li>
                        </ul>
                    </div>

                    {/* Policy Links */}
                    <div>
                        <h4 className="text-foreground font-bold mb-4 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-purple-400" />
                            Support & Policy
                        </h4>
                        <ul className="space-y-3">
                            <li><Link href="/inquiry" className="text-sm text-zinc-400 hover:text-purple-400 transition-colors">자주 묻는 질문 / 문의</Link></li>
                            <li><Link href="/terms" className="text-sm text-zinc-400 hover:text-purple-400 transition-colors">이용약관</Link></li>
                            <li><Link href="/privacy" className="text-sm text-zinc-400 hover:text-purple-400 transition-colors">개인정보처리방침</Link></li>
                            <li><Link href="/refund" className="text-sm text-zinc-400 hover:text-purple-400 transition-colors">취소 및 환불 정책</Link></li>
                            <li><Link href="/wiki" className="text-sm text-zinc-400 hover:text-purple-400 transition-colors">Secret Docs 📚</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Banner */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-zinc-500">
                        © {new Date().getFullYear()} Secret Paws. All rights reserved. 본 서비스는 오락용이며 법적/의학적 조언을 대체하지 않습니다.
                    </p>
                    <div className="text-xs font-mono text-zinc-600">
                        v1.1.0-alpha · Next.JS 14
                    </div>
                </div>
            </div>
        </footer>
    );
}
