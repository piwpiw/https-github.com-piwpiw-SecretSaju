'use client';

import { motion } from 'framer-motion';

export function GlobalCompliance() {
    return (
        <footer className="w-full py-12 px-6 border-t border-white/5 bg-background/50 backdrop-blur-sm mt-20">
            <div className="max-w-md mx-auto space-y-8">
                {/* Important Disclaimer */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <p className="text-[10px] text-zinc-400 leading-relaxed text-center">
                        전통 사주 명리학에 근거한 인공지능 분석 결과입니다.<br />
                        모든 결과는 개인의 선택과 노력이 가장 중요하며,<br />
                        운세 결과에 따른 법적 책임이나 의무는 발생하지 않습니다.
                    </p>
                </div>

                {/* Business Info */}
                <div className="space-y-4">
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] text-zinc-500">
                        <button className="hover:text-primary transition-colors">이용약관</button>
                        <button className="hover:text-primary transition-colors">개인정보처리지침</button>
                        <button className="hover:text-primary transition-colors">환불규정</button>
                        <button className="hover:text-primary transition-colors">사업자정보확인</button>
                    </div>

                    <div className="text-center space-y-1">
                        <p className="text-[10px] text-zinc-600 font-medium">상호: (주)시크릿퍼블리싱 | 대표: 홍길동</p>
                        <p className="text-[10px] text-zinc-600">사업자등록번호: 123-45-67890 | 통신판매업: 2024-서울강남-1234</p>
                        <p className="text-[10px] text-zinc-600">주소: 서울특별시 강남구 테헤란로 123, 4층</p>
                        <p className="text-[10px] text-zinc-600">고객센터: support@secretsaju.com</p>
                    </div>
                </div>

                {/* Copyright */}
                <div className="text-center opacity-30">
                    <p className="text-[10px]">© 2026 Secret Saju. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}
