'use client';

import { AlertTriangle, MessageSquare, Star, RefreshCw, ArrowRightLeft, Send, ChevronLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

type InquiryCategory = 'error' | 'feedback' | 'review' | 'refund' | 'convert';
type Step = 'select' | 'form' | 'done';

interface InquiryType {
    id: InquiryCategory;
    icon: any;
    title: string;
    description: string;
    color: string;
    bg: string;
    placeholder: string;
}

const INQUIRY_TYPES: InquiryType[] = [
    {
        id: 'error',
        icon: AlertTriangle,
        title: '오류 문의',
        description: '서비스 이용 중 불편함이 있으셨나요?',
        color: 'text-red-400',
        bg: 'bg-red-400/10 border-red-400/20',
        placeholder: '어떤 오류가 발생했는지 자세히 알려주세요. (예: 결제 후 젤리가 충전되지 않음)',
    },
    {
        id: 'feedback',
        icon: MessageSquare,
        title: '피드백 보내기',
        description: '서비스 개선 의견이 있으신가요?',
        color: 'text-blue-400',
        bg: 'bg-blue-400/10 border-blue-400/20',
        placeholder: '더 나은 서비스를 위한 소중한 의견을 남겨주세요.',
    },
    {
        id: 'review',
        icon: Star,
        title: '리뷰 남기기',
        description: '소중한 후기를 남겨주세요 ⭐',
        color: 'text-yellow-400',
        bg: 'bg-yellow-400/10 border-yellow-400/20',
        placeholder: '사용해보신 솔직한 후기를 남겨주세요! (사주가 맞았나요? 어떤 점이 좋았나요?)',
    },
    {
        id: 'refund',
        icon: RefreshCw,
        title: '환불 요청',
        description: '환불 정책을 먼저 확인해 주세요',
        color: 'text-orange-400',
        bg: 'bg-orange-400/10 border-orange-400/20',
        placeholder: '결제일, 결제 금액, 환불 사유를 알려주세요.',
    },
    {
        id: 'convert',
        icon: ArrowRightLeft,
        title: '냥 ↔ 츄르 교환',
        description: '잘못 전환하셨나요?',
        color: 'text-pink-400',
        bg: 'bg-pink-400/10 border-pink-400/20',
        placeholder: '어떤 상황인지 설명해 주세요. 확인 후 도움드리겠습니다.',
    },
];

export default function InquiryPage() {
    const [step, setStep] = useState<Step>('select');
    const [selected, setSelected] = useState<InquiryType | null>(null);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSelectType = (type: InquiryType) => {
        setSelected(type);
        setSubject(type.title);
        setStep('form');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected || !message.trim()) return;
        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/inquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: selected.id,
                    subject: subject || selected.title,
                    message: message.trim(),
                    email: email.trim() || undefined,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || '전송 실패');
            }
            setStep('done');
        } catch (err: any) {
            setError(err.message || '문의 전송 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950">
            <div className="max-w-2xl mx-auto px-4 py-8">

                <AnimatePresence mode="wait">
                    {/* Step 1: Select Category */}
                    {step === 'select' && (
                        <motion.div
                            key="select"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {/* Header */}
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent mb-2">
                                    문의하기
                                </h1>
                                <p className="text-slate-400 text-sm">문의 유형을 선택해주세요</p>
                            </div>

                            <div className="space-y-3">
                                {INQUIRY_TYPES.map((type, index) => (
                                    <motion.button
                                        key={type.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.07 }}
                                        onClick={() => handleSelectType(type)}
                                        className={`w-full border rounded-2xl p-5 flex items-center gap-4 hover:scale-[1.01] transition-all text-left ${type.bg}`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0`}>
                                            <type.icon className={`w-6 h-6 ${type.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-white mb-0.5">{type.title}</h3>
                                            <p className="text-sm text-slate-400">{type.description}</p>
                                        </div>
                                        <span className="text-slate-500 text-xl flex-shrink-0">›</span>
                                    </motion.button>
                                ))}
                            </div>

                            <div className="mt-8 text-center">
                                <Link href="/refund" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                                    환불정책 보기 →
                                </Link>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Form */}
                    {step === 'form' && selected && (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-8">
                                <button
                                    onClick={() => setStep('select')}
                                    className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5 text-slate-400" />
                                </button>
                                <div>
                                    <h1 className="text-2xl font-bold text-white">{selected.title}</h1>
                                    <p className="text-slate-400 text-sm">{selected.description}</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Subject */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">제목</label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-colors"
                                        placeholder="문의 제목을 입력하세요"
                                        required
                                    />
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">내용</label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={6}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-colors resize-none"
                                        placeholder={selected.placeholder}
                                        required
                                    />
                                    <p className="text-xs text-slate-500 mt-1 text-right">{message.length} / 1000</p>
                                </div>

                                {/* Email (optional) */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        이메일 <span className="text-slate-500 font-normal">(선택, 답변 받으실 경우)</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-colors"
                                        placeholder="answer@example.com"
                                    />
                                </div>

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !message.trim()}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:from-purple-600 hover:to-pink-600 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            전송 중...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            문의 보내기
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* Step 3: Done */}
                    {step === 'done' && (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center min-h-[60vh] text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                                className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-6"
                            >
                                <CheckCircle2 className="w-12 h-12 text-green-400" />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-white mb-3">문의가 접수되었습니다!</h2>
                            <p className="text-slate-400 mb-2">영업일 기준 1~3일 내로 확인 후 답변드리겠습니다.</p>
                            {email && (
                                <p className="text-slate-500 text-sm mb-8">
                                    답변은 <span className="text-purple-400">{email}</span>로 발송됩니다.
                                </p>
                            )}
                            {!email && <div className="mb-8" />}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setStep('select'); setMessage(''); setEmail(''); setSubject(''); }}
                                    className="px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                                >
                                    다른 문의하기
                                </button>
                                <Link
                                    href="/"
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:from-purple-600 hover:to-pink-600 transition-all"
                                >
                                    홈으로 돌아가기
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </main>
    );
}
