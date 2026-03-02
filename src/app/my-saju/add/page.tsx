'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { SajuProfileRepository } from '@/lib/repositories/saju-profile.repository';
import { hasSufficientBalance, consumeJelly } from '@/lib/jelly-wallet';
import { triggerBalanceUpdate } from '@/components/shop/JellyBalance';
import JellyShopModal from '@/components/shop/JellyShopModal';
import { getUserFromCookie } from '@/lib/kakao-auth';
import { CalendarType, Gender, RelationshipType, CreateSajuProfileRequest } from '@/types/schema';
import { useLocale } from '@/lib/i18n';
import { Calendar, Clock, User as UserIcon, Heart, ArrowLeft, Loader2 } from 'lucide-react';

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
    const [formError, setFormError] = useState('');

    const isEmptyForm = name.trim() === '' || birthdate.trim() === '';

    const saveProfileAndNavigate = async (isFirst: boolean) => {
        setIsSubmitting(true);
        try {
            const user = getUserFromCookie();
            const userId = user ? String(user.id) : 'local-user';

            const request: CreateSajuProfileRequest = {
                name: name.trim(),
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

            router.push('/my-saju/list');
        } catch (error) {
            console.error('Failed to save:', error);
            setFormError('프로필 저장에 실패했습니다.');
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isEmptyForm) {
            setFormError('이름과 출생일은 필수 입력 항목입니다.');
            return;
        }

        setFormError('');
        setIsSubmitting(true);

        try {
            const user = getUserFromCookie();
            const userId = user ? String(user.id) : 'local-user';
            const existingProfiles = await SajuProfileRepository.findByUserId(userId);
            const isFirst = existingProfiles.length === 0;

            if (!isFirst && !hasSufficientBalance(1)) {
                setShowShopModal(true);
                setIsSubmitting(false);
                return;
            }

            if (!isFirst) {
                setShowConfirmModal(true);
            } else {
                await saveProfileAndNavigate(true);
            }
        } catch (error) {
            console.error(error);
            setFormError('저장 전 확인 과정에서 오류가 발생했습니다.');
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen relative overflow-hidden pb-40">
            <div className="max-w-4xl mx-auto px-6 py-16 relative z-10">
                <div className="flex items-center gap-3 text-sm text-secondary mb-8">
                    <button onClick={() => router.back()} className="flex items-center gap-2 hover:text-foreground">
                        <ArrowLeft className="w-4 h-4" /> {t('common.back')}
                    </button>
                </div>

                <div className="mb-12">
                    <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-flex px-4 py-2 rounded-full mb-6 bg-surface border border-border-color">
                        <span className="text-sm font-bold text-primary tracking-widest uppercase">새 사주 노드</span>
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black text-foreground">{locale === 'ko' ? '사주 데이터 등록' : 'ADD SAJU PROFILE'}</h1>
                    <p className="text-xl text-secondary mt-2">운명의 좌표를 입력해 분석 기록을 시작합니다.</p>
                </div>

                {formError && <p className="text-rose-500 font-bold mb-6">{formError}</p>}

                <form onSubmit={handleSubmit} className="space-y-10 bg-surface rounded-4xl p-10 border border-border-color">
                    <div className="space-y-6">
                        <label className="text-lg font-bold flex items-center gap-2"><UserIcon className="w-5 h-5" /> 이름</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-background border border-border-color rounded-3xl px-6 py-4 text-foreground font-black"
                            placeholder="홍길동"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-lg font-bold flex items-center gap-2"><Heart className="w-5 h-5" /> 관계</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {(['self', 'lover', 'friend', 'spouse', 'child', 'parent', 'other'] as RelationshipType[]).map((rel) => (
                                <button
                                    key={rel}
                                    type="button"
                                    onClick={() => setRelationship(rel)}
                                    className={`py-3 rounded-2xl text-sm font-black border ${
                                        relationship === rel ? 'bg-primary border-primary text-white' : 'bg-background border-border-color text-secondary'
                                    }`}
                                >
                                    {rel}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="text-lg font-bold flex items-center gap-2"><Calendar className="w-5 h-5" /> 생년월일</label>
                            <input
                                type="date"
                                value={birthdate}
                                onChange={(e) => setBirthdate(e.target.value)}
                                className="w-full bg-background border border-border-color rounded-3xl px-6 py-4 text-foreground"
                            />
                            <div className="flex border border-border-color rounded-2xl overflow-hidden">
                                {(['solar', 'lunar'] as CalendarType[]).map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setCalendarType(type)}
                                        className={`flex-1 py-3 ${calendarType === type ? 'bg-primary text-white' : 'bg-background text-secondary'}`}
                                    >
                                        {type === 'solar' ? '양력' : '음력'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-lg font-bold flex items-center justify-between gap-2">
                                <span className="flex items-center gap-2"><Clock className="w-5 h-5" /> 태어난 시간</span>
                                <button type="button" onClick={() => setIsTimeUnknown(!isTimeUnknown)} className="text-sm text-primary">
                                    {isTimeUnknown ? '시간 미상' : '시간 지정'}
                                </button>
                            </label>
                            <input
                                type="time"
                                value={birthTime}
                                onChange={(e) => setBirthTime(e.target.value)}
                                disabled={isTimeUnknown}
                                className="w-full bg-background border border-border-color rounded-3xl px-6 py-4 text-foreground disabled:opacity-40"
                            />
                            <label className="inline-flex items-center gap-2 text-sm text-secondary">
                                <input
                                    type="checkbox"
                                    checked={isLeapMonth}
                                    onChange={(e) => setIsLeapMonth(e.target.checked)}
                                />
                                윤달 여부
                            </label>
                        </div>
                    </div>

                    <button type="submit" disabled={isSubmitting} className="w-full py-5 rounded-3xl bg-primary text-white font-black text-xl uppercase disabled:opacity-40">
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : '사주 저장'}
                    </button>
                </form>

                <JellyShopModal
                    isOpen={showShopModal}
                    onClose={() => {
                        setShowShopModal(false);
                        setIsSubmitting(false);
                    }}
                    onPurchaseSuccess={() => {
                        setShowShopModal(false);
                        setShowConfirmModal(true);
                    }}
                />

                {showConfirmModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 p-4">
                        <div className="bg-surface p-8 rounded-3xl border border-border-color max-w-md w-full text-center">
                            <h3 className="text-2xl font-black mb-4">기록을 저장할까요?</h3>
                            <p className="text-secondary mb-6">한 번 저장 후 1 젤리를 사용합니다.</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowConfirmModal(false);
                                        setIsSubmitting(false);
                                    }}
                                    className="flex-1 py-3 rounded-2xl border border-border-color"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={async () => {
                                        setShowConfirmModal(false);
                                        await saveProfileAndNavigate(false);
                                    }}
                                    className="flex-1 py-3 rounded-2xl bg-primary text-white"
                                >
                                    저장
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
