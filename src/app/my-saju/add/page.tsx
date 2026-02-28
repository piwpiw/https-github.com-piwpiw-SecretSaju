'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SajuProfileRepository } from '@/lib/repositories/saju-profile.repository';
import { hasSufficientBalance, consumeJelly } from '@/lib/jelly-wallet';
import { triggerBalanceUpdate } from '@/components/shop/JellyBalance';
import JellyShopModal from '@/components/shop/JellyShopModal';
import { getUserFromCookie } from '@/lib/kakao-auth';
import Link from 'next/link';
import {
    Sparkles, Loader2, ArrowLeft, Calculator, Calendar,
    User as UserIcon, Clock, Heart, Terminal, Database, ShieldCheck
} from 'lucide-react';
import { CalendarType, Gender, RelationshipType, CreateSajuProfileRequest } from '@/types/schema';
import { useLocale } from '@/lib/i18n';

export default function AddSajuPage() {
    const router = useRouter();
    const { t, locale } = useLocale();
    const [name, setName] = useState('');
    const [relationship, setRelationship] = useState<RelationshipType>('self');
    const [birthdate, setBirthdate] = useState('');
    const [birthTime, setBirthTime] = useState('12:00');
    const [isTimeUnknown, setIsTimeUnknown] = useState(false);
    const [calendarType, setCalendarType] = useState<CalendarType>('solar');
    const [isLeapMonth, setIsLeapMonth] = useState(false);
    const [gender, setGender] = useState<Gender>('female');

    const [showShopModal, setShowShopModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !birthdate) {
            alert(locale === 'ko' ? '이름과 생년월일을 입력해 주세요.' : 'Name and birthdate are required.');
            return;
        }

        setIsSubmitting(true);
        try {
            const user = getUserFromCookie();
            const userId = user ? String(user.id) : 'local-user';
            const existingProfiles = await SajuProfileRepository.findByUserId(userId);
            const isFirst = existingProfiles.length === 0;

            if (isFirst) {
                await saveProfileAndNavigate(true);
            } else {
                if (!hasSufficientBalance(1)) {
                    setShowShopModal(true);
                    setIsSubmitting(false);
                } else {
                    setShowConfirmModal(true);
                }
            }
        } catch (error) {
            console.error(error);
            setIsSubmitting(false);
        }
    };

    const saveProfileAndNavigate = async (isFirst: boolean) => {
        setIsSubmitting(true);
        try {
            const user = getUserFromCookie();
            const userId = user ? String(user.id) : 'local-user';

            const request: CreateSajuProfileRequest = {
                name,
                relationship,
                birthdate,
                birthTime: isTimeUnknown ? undefined : birthTime,
                isTimeUnknown,
                calendarType,
                isLeapMonth,
                gender,
            };

            const newProfile = await SajuProfileRepository.create(request, userId);

            if (!isFirst) {
                consumeJelly(1, 'unlock_profile', {
                    profileId: newProfile.id,
                    profileName: name,
                });
                triggerBalanceUpdate();
            }

            router.push(`/my-saju/list`);
        } catch (error) {
            console.error('Failed to save:', error);
            alert(locale === 'ko' ? '오류: 프로필 저장에 실패했습니다.' : 'Error: Failed to save profile.');
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen relative overflow-hidden pb-40">
            <div className="max-w-4xl mx-auto px-6 py-16 relative z-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-20 text-center md:text-left border-b border-border-color pb-16">
                    <div>
                        <button onClick={() => router.back()} className="flex items-center gap-3 text-lg font-bold text-secondary hover:text-foreground transition-all mb-8">
                            <ArrowLeft className="w-6 h-6" /> {t('common.back')}
                        </button>
                        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-flex px-4 py-2 rounded-full mb-6 bg-surface border border-border-color">
                            <span className="text-sm font-bold text-primary tracking-widest leading-none uppercase">{locale === 'ko' ? '사주 노드 추가' : 'NEW SAJU NODE'}</span>
                        </motion.div>
                        <h1 className="text-5xl font-black text-foreground italic tracking-tighter uppercase mb-2">
                            {locale === 'ko' ? '운명 프로필' : 'Fate Profile'} <span className="text-primary italic">등록기</span>
                        </h1>
                        <p className="text-xl text-secondary font-medium italic opacity-70">
                            {locale === 'ko' ? '운명 분석을 위한 데이터를 입력합니다.' : 'Map the cosmic coordinates for analysis.'}
                        </p>
                    </div>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-12">
                    <div className="bg-surface rounded-5xl p-12 border border-border-color shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-primary" />

                        <div className="space-y-16">
                            {/* Name Input */}
                            <div className="space-y-6">
                                <label className="text-xl font-bold flex items-center gap-4 text-secondary">
                                    <UserIcon className="w-6 h-6 text-primary" /> {locale === 'ko' ? '이름' : 'Name'}
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={locale === 'ko' ? "실명을 입력해 주세요" : "Enter full name"}
                                    className="w-full bg-transparent border-b-2 border-border-color text-5xl font-black text-foreground italic tracking-tighter placeholder:text-neutral-800 focus:outline-none focus:border-primary transition-all pb-4"
                                />
                            </div>

                            {/* Relationship Picker */}
                            <div className="space-y-6">
                                <label className="text-xl font-bold flex items-center gap-4 text-secondary">
                                    <Heart className="w-6 h-6 text-primary" /> {t('compat.relationType')}
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {['self', 'lover', 'friend', 'spouse', 'child', 'parent', 'other'].map((rel) => (
                                        <button
                                            key={rel}
                                            type="button"
                                            onClick={() => setRelationship(rel as RelationshipType)}
                                            className={`py-5 rounded-3xl text-lg font-black tracking-tight border transition-all ${relationship === rel
                                                ? 'bg-primary border-primary text-white shadow-xl scale-105'
                                                : 'bg-background border-border-color text-secondary hover:border-primary/50'
                                                }`}
                                        >
                                            {t(`common.relation.${rel}`)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Birthdate & Gender Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                <div className="space-y-8">
                                    <label className="text-xl font-bold flex items-center gap-4 text-secondary uppercase tracking-widest">
                                        <Calendar className="w-6 h-6 text-primary" /> 출생 일자 (Date of Origin)
                                    </label>
                                    <div className="space-y-6">
                                        <input
                                            type="date"
                                            value={birthdate}
                                            onChange={(e) => setBirthdate(e.target.value)}
                                            className="w-full bg-background border border-border-color rounded-4xl px-8 py-6 text-foreground font-black text-2xl focus:outline-none focus:border-primary transition-all [color-scheme:dark] italic"
                                        />
                                        <div className="flex p-2 bg-background rounded-3xl border border-border-color">
                                            {(['solar', 'lunar'] as CalendarType[]).map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setCalendarType(type)}
                                                    className={`flex-1 py-4 rounded-2xl text-lg font-black tracking-widest uppercase transition-all ${calendarType === type ? 'bg-primary text-white shadow-lg' : 'text-secondary hover:text-foreground'}`}
                                                >
                                                    {type === 'solar' ? (locale === 'ko' ? '양력' : 'SOLAR') : (locale === 'ko' ? '음력' : 'LUNAR')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <label className="text-xl font-bold flex items-center justify-between text-secondary uppercase tracking-widest">
                                        <span className="flex items-center gap-4"><Clock className="w-6 h-6 text-primary" /> 출생 시각 (Temporal Coordinate)</span>
                                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsTimeUnknown(!isTimeUnknown)}>
                                            <div className={`w-4 h-4 rounded-full border-2 border-border-color transition-all ${isTimeUnknown ? 'bg-rose-500 border-rose-500 shadow-xl shadow-rose-500/20' : 'bg-transparent'}`} />
                                            <span className="text-sm font-bold text-secondary group-hover:text-foreground">{locale === 'ko' ? '모름' : 'Unknown'}</span>
                                        </div>
                                    </label>
                                    <div className="space-y-6">
                                        <input
                                            type="time"
                                            value={birthTime}
                                            onChange={(e) => setBirthTime(e.target.value)}
                                            disabled={isTimeUnknown}
                                            className="w-full bg-background border border-border-color rounded-4xl px-8 py-6 text-foreground font-black text-2xl focus:outline-none focus:border-primary transition-all [color-scheme:dark] disabled:opacity-10 italic"
                                        />
                                        <div className="flex p-2 bg-background rounded-3xl border border-border-color">
                                            {(['female', 'male'] as Gender[]).map(g => (
                                                <button
                                                    key={g}
                                                    type="button"
                                                    onClick={() => setGender(g)}
                                                    className={`flex-1 py-4 rounded-2xl text-lg font-black tracking-widest uppercase transition-all ${gender === g
                                                        ? 'bg-primary text-white shadow-lg'
                                                        : 'text-secondary hover:text-foreground'}`}
                                                >
                                                    {t(`common.${g === 'female' ? 'female' : 'male'}`)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-10 rounded-5xl bg-gradient-to-r from-primary via-indigo-600 to-purple-600 text-white font-black text-3xl tracking-[0.4em] uppercase shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-6 disabled:opacity-30"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-10 h-10 animate-spin" />
                        ) : (
                            <>
                                <Calculator className="w-10 h-10" />
                                {locale === 'ko' ? '운명망에 등록하기' : 'MAP & SAVE DESTINY'}
                            </>
                        )}
                    </button>
                </form>

                {/* Secure Badge */}
                <div className="mt-20 flex flex-col items-center gap-6 opacity-40">
                    <div className="flex items-center gap-4 px-8 py-4 rounded-full bg-surface border border-border-color shadow-sm">
                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                        <span className="text-sm font-black text-foreground uppercase tracking-widest">종단 간 데이터 암호화 프로토콜 활성화</span>
                    </div>
                </div>

                {/* Modals */}
                <AnimatePresence>
                    {showConfirmModal && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl flex items-center justify-center p-8 z-[100]">
                            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-surface p-12 md:p-16 max-w-xl w-full text-center rounded-5xl border-2 border-primary/30 shadow-2xl shadow-primary/20 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-primary via-indigo-500 to-purple-500" />
                                <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/20 blur-3xl rounded-full" />
                                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/20 blur-3xl rounded-full" />

                                <div className="relative z-10">
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} className="w-28 h-28 bg-background rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-primary/20 shadow-xl">
                                        <Database className="w-12 h-12 text-primary" />
                                    </motion.div>

                                    <h2 className="text-4xl font-black text-foreground italic tracking-tighter uppercase mb-4">
                                        {locale === 'ko' ? '운명망 확장' : 'EXPAND DESTINY WEB'}
                                    </h2>

                                    <div className="bg-background rounded-3xl p-6 mb-8 border border-border-color">
                                        <p className="text-2xl text-secondary font-medium leading-relaxed">
                                            {locale === 'ko' ? (
                                                <>새로운 인연 <span className="text-primary font-black">[{name}]</span>을(를)<br />동기화하시겠습니까?</>
                                            ) : (
                                                <>Sync new bond <span className="text-primary font-black">[{name}]</span><br />to your destiny web?</>
                                            )}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-center gap-2 mb-10">
                                        <span className="text-3xl font-black text-foreground flex items-center gap-3">
                                            <Sparkles className="w-8 h-8 text-primary" />
                                            {locale === 'ko' ? '1 젤리 소모' : '1 Jelly Required'}
                                        </span>
                                        <p className="text-sm font-bold text-secondary">
                                            {locale === 'ko' ? '초대 링크를 공유하고 무료 젤리를 받으세요!' : 'Share referral link to get free jellies!'}
                                        </p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button onClick={() => { setShowConfirmModal(false); setIsSubmitting(false); }} className="w-full py-5 rounded-2xl bg-background border-2 border-border-color text-secondary font-black text-xl hover:text-foreground transition-all uppercase">
                                            {locale === 'ko' ? '취소' : 'Cancel'}
                                        </button>
                                        <button onClick={() => { setShowConfirmModal(false); saveProfileAndNavigate(false); }} className="w-full py-5 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 text-white font-black text-xl shadow-xl hover:scale-105 transition-all uppercase flex items-center justify-center gap-2">
                                            <ShieldCheck className="w-6 h-6" />
                                            {locale === 'ko' ? '운명 동기화' : 'Sync Fate'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <JellyShopModal
                    isOpen={showShopModal}
                    onClose={() => { setShowShopModal(false); setIsSubmitting(false); }}
                    onPurchaseSuccess={() => { setShowShopModal(false); setShowConfirmModal(true); }}
                />
            </div>
        </main>
    );
}
