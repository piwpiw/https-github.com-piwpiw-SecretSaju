'use client';

import { AlertTriangle, MessageSquare, Star, RefreshCw, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';

export default function InquiryPage() {
    const inquiryTypes = [
        {
            icon: AlertTriangle,
            title: '오류 문의',
            description: '해결이 너무치 않나요?',
            color: 'text-red-400',
        },
        {
            icon: MessageSquare,
            title: '피드백 보내기',
            description: '서비스 개선 의견이 있으신가요?',
            color: 'text-blue-400',
        },
        {
            icon: Star,
            title: '리뷰 남기기',
            description: '소중한 후기를 남겨주세요',
            color: 'text-yellow-400',
        },
        {
            icon: RefreshCw,
            title: '환불 요청',
            description: '츄르 환불을 원하시나요?',
            color: 'text-orange-400',
        },
        {
            icon: ArrowRightLeft,
            title: '냥을 츄르로 바꾸기',
            description: '옮시 1츄르를 냥으로 공동 바꾸셨나요?',
            color: 'text-pink-400',
        },
    ];

    return (
        <main className="min-h-screen bg-background">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="bg-yellow-400 text-black px-4 py-6">
                    <h1 className="text-xl font-bold text-center">문의 유형을 선택해주세요</h1>
                </div>

                {/* Inquiry Types */}
                <div className="p-4 space-y-3">
                    {inquiryTypes.map((type, index) => (
                        <button
                            key={index}
                            className="w-full glass rounded-2xl p-6 flex items-start gap-4 hover:bg-white/10 transition-colors text-left"
                        >
                            <type.icon className={`w-6 h-6 ${type.color} flex-shrink-0 mt-1`} />
                            <div className="flex-1">
                                <h3 className="font-medium text-foreground mb-1">{type.title}</h3>
                                <p className="text-sm text-zinc-400">{type.description}</p>
                            </div>
                            <span className="text-zinc-500 text-xl">›</span>
                        </button>
                    ))}
                </div>

                {/* My Inquiries Button */}
                <div className="px-4 py-4">
                    <button className="w-full py-4 rounded-xl bg-pink-500 text-white font-bold hover:bg-pink-600">
                        내 문의 내역
                    </button>
                </div>

                {/* Info Sections */}
                <div className="px-4 py-8 space-y-6 text-center">
                    <div className="glass rounded-2xl p-6">
                        <p className="text-zinc-400">클릭하시면 상세 내용을 보실 수 있습니다.</p>
                    </div>

                    <div className="glass rounded-2xl p-8">
                        <p className="text-zinc-500">아직 문의하신 내용이 없습니다.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
