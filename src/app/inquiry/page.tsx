'use client';

import {
    AlertTriangle, MessageSquare, Star, RefreshCw,
    ArrowRightLeft, Send, ChevronLeft, CheckCircle2,
    Loader2, ArrowLeft, ShieldCheck, ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/i18n';

type InquiryCategory = 'error' | 'feedback' | 'review' | 'refund' | 'convert';
type Step = 'select' | 'form' | 'done';

interface InquiryType {
    id: InquiryCategory;
    icon: any;
    titleKo: string;
    descriptionKo: string;
    titleEn: string;
    descriptionEn: string;
    color: string;
    bg: string;
    accent: string;
    placeholderKo: string;
    placeholderEn: string;
}

const INQUIRY_TYPES: InquiryType[] = [
    {
        id: 'review',
        icon: Star,
        titleKo: '분석 솔직 리뷰',
        descriptionKo: '사주 AI 분석 결과에 대한 놀라운 후기를 남겨주세요',
        titleEn: 'Honest Review',
        descriptionEn: 'Leave an amazing review about our AI analysis',
        color: 'text-yellow-400',
        bg: 'border-yellow-500/20 bg-yellow-500/5',
        accent: 'from-yellow-500/10',
        placeholderKo: '가장 놀라웠던 점은 무엇인가요?',
        placeholderEn: 'What was the most surprising part?',
    },
    {
        id: 'feedback',
        icon: MessageSquare,
        titleKo: '서비스 제안',
        descriptionKo: '우리가 더 나아질 수 있는 아이디어를 공유해주세요',
        titleEn: 'Feature Proposal',
        descriptionEn: 'Share brilliant ideas for our next updates',
        color: 'text-cyan-400',
        bg: 'border-cyan-500/20 bg-cyan-500/5',
        accent: 'from-cyan-500/10',
        placeholderKo: '이런 기능이 있으면 정말 좋을 것 같아요!',
        placeholderEn: 'It would be amazing if you had...',
    },
    {
        id: 'error',
        icon: AlertTriangle,
        titleKo: '시스템 통신 장애',
        descriptionKo: '오류나 버그로 불편하셨던 점을 상세히 신고합니다',
        titleEn: 'System Error',
        descriptionEn: 'Report technical errors or visual bugs',
        color: 'text-rose-400',
        bg: 'border-rose-500/20 bg-rose-500/5',
        accent: 'from-rose-500/10',
        placeholderKo: '어떤 페이지에서 오류가 발생했나요?',
        placeholderEn: 'Which page caused the issue?',
    },
    {
        id: 'refund',
        icon: RefreshCw,
        titleKo: '결제/환불 상담',
        descriptionKo: '젤리 결제 내역 안내 및 환불 절차 문의',
        titleEn: 'Payment / Refund',
        descriptionEn: 'Jelly payment history and refund process',
        color: 'text-purple-400',
        bg: 'border-purple-500/20 bg-purple-500/5',
        accent: 'from-purple-500/10',
        placeholderKo: '상세 결제 일시와 사유를 작성해 주세요.',
        placeholderEn: 'Describe transaction time and reasons.',
    },
];

export default function InquiryPage() {
    const router = useRouter();
    const { t, locale } = useLocale();
    const [step, setStep] = useState<Step>('select');
    const [selected, setSelected] = useState<InquiryType | null>(null);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSelectType = (type: InquiryType) => {
        setSelected(type);
        setSubject(locale === 'ko' ? type.titleKo : type.titleEn);
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
                    subject: subject || (locale === 'ko' ? selected.titleKo : selected.titleEn),
                    message: message.trim(),
                    email: email.trim() || undefined,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || ' 전송 실패');
            }
            setStep('done');
        } catch (err: any) {
            setError(err.message || (locale === 'ko' ? '데이터 전송 중 통신 장애가 발생했습니다.' : 'Network error during transmission.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-[radial-gradient(circle_at_50%_0%,var(--background)_0%,#09090b_70%)] relative overflow-hidden pb-40">
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

            <div className="max-w-4xl mx-auto px-6 py-16 relative z-10">
                <AnimatePresence mode="wait">
                    {/* Step 1: Select Protocol */}
                    {step === 'select' && (
                        <motion.div
                            key="select"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                        >
                            <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-20 md:text-left text-center border-b border-border-color pb-16">
                                <div>
                                    <button onClick={() => router.back()} className="flex items-center justify-center md:justify-start gap-3 text-lg font-bold text-secondary hover:text-foreground transition-all mb-8 w-full md:w-auto">
                                        <ArrowLeft className="w-6 h-6" /> {t('common.back')}
                                    </button>
                                    <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-flex px-4 py-2 rounded-full mb-6 bg-surface border border-border-color">
                                        <span className="text-sm font-bold text-primary tracking-widest leading-none uppercase">{locale === 'ko' ? '고객 커뮤니케이션' : 'Support Desk'}</span>
                                    </motion.div>
                                    <h1 className="text-5xl md:text-7xl font-black text-foreground italic tracking-tighter uppercase mb-2">
                                        {locale === 'ko' ? '무엇을' : 'How can we'} <span className="text-primary italic">{locale === 'ko' ? '도와드릴까요?' : 'help you?'}</span>
                                    </h1>
                                    <p className="text-xl md:text-2xl text-secondary font-medium italic opacity-70">
                                        {locale === 'ko' ? '운명의 파동에 오류가 있다면 상세히 알려주세요.' : 'Report anomalies or let us know your thoughts.'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {INQUIRY_TYPES.map((type, index) => (
                                    <motion.button
                                        key={type.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.5 }}
                                        onClick={() => handleSelectType(type)}
                                        className="bg-surface rounded-5xl p-10 border border-border-color flex flex-col items-start gap-8 group hover:border-primary/50 transition-all hover:bg-background shadow-xl hover:shadow-primary/5 relative overflow-hidden"
                                    >
                                        <div className={`absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br ${type.accent} rounded-full blur-3xl opacity-30 group-hover:opacity-100 transition-opacity duration-700`} />

                                        <div className="w-full flex items-center justify-between">
                                            <div className="w-20 h-20 rounded-4xl bg-background border border-border-color flex items-center justify-center group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 shadow-sm relative z-10">
                                                <type.icon className={`w-10 h-10 ${type.color}`} />
                                            </div>
                                            <div className="w-12 h-12 rounded-full border border-border-color bg-surface flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-colors">
                                                <ChevronRight className="w-6 h-6 text-secondary group-hover:text-white" />
                                            </div>
                                        </div>
                                        <div className="text-left relative z-10">
                                            <h3 className="text-3xl font-black text-foreground tracking-tight mb-3 group-hover:text-primary transition-colors">
                                                {locale === 'ko' ? type.titleKo : type.titleEn}
                                            </h3>
                                            <p className="text-xl font-bold text-secondary opacity-70 italic leading-relaxed">
                                                {locale === 'ko' ? type.descriptionKo : type.descriptionEn}
                                            </p>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Protocol Form */}
                    {step === 'form' && selected && (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                        >
                            <div className="flex flex-col md:flex-row items-center gap-8 mb-16 pb-12 border-b border-border-color">
                                <button onClick={() => setStep('select')} className="w-16 h-16 rounded-3xl bg-surface border border-border-color flex items-center justify-center hover:bg-background transition-all group shrink-0">
                                    <ChevronLeft className="w-8 h-8 text-secondary group-hover:text-foreground group-hover:-translate-x-1" />
                                </button>
                                <div className="text-center md:text-left">
                                    <h2 className="text-5xl font-black italic tracking-tighter text-foreground uppercase mb-2">
                                        {locale === 'ko' ? selected.titleKo : selected.titleEn}
                                    </h2>
                                    <p className="text-xl font-bold tracking-widest text-secondary opacity-70 uppercase">
                                        {locale === 'ko' ? selected.descriptionKo : selected.descriptionEn}
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-12 max-w-2xl mx-auto">
                                <div className="bg-surface p-12 md:p-16 rounded-5xl border border-border-color shadow-2xl space-y-12">
                                    <div className="space-y-6">
                                        <label className="text-2xl font-black text-secondary uppercase flex items-center gap-4">
                                            <span className="w-2 h-6 bg-primary" /> {locale === 'ko' ? '제목' : 'Subject'}
                                        </label>
                                        <input
                                            type="text"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            className="w-full bg-transparent border-b-2 border-border-color px-0 py-4 text-foreground font-black text-3xl focus:outline-none focus:border-primary transition-all placeholder:text-neutral-700 italic"
                                            placeholder={locale === 'ko' ? "핵심 내용을 요약해주세요..." : "Brief summary..."}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-6">
                                        <label className="text-2xl font-black text-secondary uppercase flex items-center gap-4">
                                            <span className="w-2 h-6 bg-primary" /> {locale === 'ko' ? '상세 내용' : 'Details'}
                                        </label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            rows={6}
                                            className="w-full bg-background border-2 border-border-color rounded-4xl p-8 text-foreground font-bold text-xl focus:outline-none focus:border-primary transition-all resize-none placeholder:text-neutral-700 leading-relaxed italic"
                                            placeholder={locale === 'ko' ? selected.placeholderKo : selected.placeholderEn}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-6">
                                        <label className="text-2xl font-black text-secondary uppercase flex items-center gap-4">
                                            <span className="w-2 h-6 bg-primary scale-y-50" /> {locale === 'ko' ? '회신 이메일 (선택)' : 'Email (Optional)'}
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-background border-2 border-border-color rounded-4xl px-8 py-6 text-foreground font-bold text-2xl focus:outline-none focus:border-primary transition-all placeholder:text-neutral-700 italic"
                                            placeholder="destiny@email.com"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-8 rounded-3xl bg-rose-500/10 border-2 border-rose-500/30 text-rose-500 text-xl font-black uppercase tracking-widest text-center">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !message.trim()}
                                    className="w-full py-10 rounded-full bg-primary text-white font-black text-3xl tracking-widest uppercase shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-6 disabled:opacity-30 disabled:hover:scale-100"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-10 h-10 animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="w-8 h-8 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                                            {locale === 'ko' ? '메시지 전송하기' : 'TRANSMIT LOG'}
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* Step 3: Success Screen */}
                    {step === 'done' && (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-48 h-48 rounded-[3.5rem] bg-emerald-500/10 border-4 border-emerald-500/30 flex items-center justify-center mb-12 shadow-[0_0_80px_rgba(16,185,129,0.2)]"
                            >
                                <CheckCircle2 className="w-24 h-24 text-emerald-400" />
                            </motion.div>
                            <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter mb-6 text-foreground uppercase">
                                {locale === 'ko' ? '수신 완료' : 'RECEIVED'}
                            </h2>
                            <p className="text-2xl text-secondary mb-16 font-bold leading-relaxed opacity-80">
                                {locale === 'ko' ? '고객님의 목소리가 무사히 도착했습니다.' : 'Your message has safely arrived.'}<br />
                                {locale === 'ko' ? '빠른 시일 내에 답변드리겠습니다.' : 'We will respond as soon as possible.'}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg">
                                <button
                                    onClick={() => { setStep('select'); setMessage(''); setEmail(''); setSubject(''); }}
                                    className="flex-1 py-6 rounded-3xl text-xl font-black transition-all bg-surface text-secondary border-2 border-border-color hover:border-primary hover:text-primary uppercase tracking-widest"
                                >
                                    {locale === 'ko' ? '돌아가기' : 'Return'}
                                </button>
                                <Link
                                    href="/"
                                    className="flex-1 py-6 rounded-3xl bg-primary text-white text-xl font-black text-center shadow-lg hover:scale-105 transition-transform uppercase tracking-widest"
                                >
                                    {locale === 'ko' ? '메인 화면' : 'HOME'}
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Assurance */}
                <div className="mt-32 flex justify-center opacity-30">
                    <div className="flex items-center gap-4 px-8 py-3 rounded-full border border-border-color bg-surface">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        <span className="text-sm font-black uppercase tracking-widest text-secondary">
                            Customer Support Channel
                        </span>
                    </div>
                </div>
            </div>
        </main>
    );
}
