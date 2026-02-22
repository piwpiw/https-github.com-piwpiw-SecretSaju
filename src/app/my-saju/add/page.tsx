'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SajuProfileRepository } from '@/lib/repositories/saju-profile.repository';
// import { saveProfile, getProfiles } from '@/lib/storage'; // Removed
import { getProfiles } from '@/lib/storage'; // Kept specifically for initial check, but strictly we should use Repository. 
// However, getProfiles is synchronous and mostly for local check. 
// For production consistency we should use Repository.findByUserId.
// Let's migrate "isFirstProfile" check to use Repository too.
import { hasSufficientBalance, consumeJelly } from '@/lib/jelly-wallet';
import { triggerBalanceUpdate } from '@/components/shop/JellyBalance';
import JellyShopModal from '@/components/shop/JellyShopModal';
import { getUserFromCookie } from '@/lib/kakao-auth';
import Link from 'next/link';
import { X, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { CalendarType, Gender, RelationshipType, CreateSajuProfileRequest } from '@/types/schema';

export default function AddSajuPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [relationship, setRelationship] = useState<RelationshipType>('self');
    const [birthdate, setBirthdate] = useState('');
    const [birthTime, setBirthTime] = useState('14:30');
    const [isTimeUnknown, setIsTimeUnknown] = useState(false);
    const [calendarType, setCalendarType] = useState<CalendarType>('solar');
    const [gender, setGender] = useState<Gender>('female');

    // Jelly system states
    const [showShopModal, setShowShopModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isFirstProfile, setIsFirstProfile] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !birthdate) {
            alert('이름과 생년월일을 입력해주세요');
            return;
        }

        setIsSubmitting(true);
        try {
            // Check if this is the first profile (using Repository)
            const user = getUserFromCookie();
            const userId = user ? String(user.id) : 'local-user';
            const existingProfiles = await SajuProfileRepository.findByUserId(userId);
            const isFirst = existingProfiles.length === 0;
            setIsFirstProfile(isFirst);

            if (isFirst) {
                // First profile is FREE - save immediately
                await saveProfileAndNavigate(true);
            } else {
                // Subsequent profiles require Jelly
                if (!hasSufficientBalance(1)) {
                    setShowShopModal(true);
                    setIsSubmitting(false);
                } else {
                    setShowConfirmModal(true);
                    // stay creating... wait for confirm
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
                gender,
            };

            const newProfile = await SajuProfileRepository.create(request, userId);

            // If not first profile, consume Jelly
            if (!isFirst) {
                // Note: consumeJelly is synchronous and uses localStorage
                // Ideally this should also be migrated to Repository eventually
                consumeJelly(1, 'unlock_profile', {
                    profileId: newProfile.id,
                    profileName: name,
                });
                triggerBalanceUpdate();
            }

            router.push(`/my-saju/list`);
        } catch (error) {
            console.error('Failed to save:', error);
            alert('저장에 실패했습니다.');
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-background">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="bg-green-600 text-white px-4 py-4 flex items-center justify-between">
                    <h1 className="text-lg font-bold">새로운 사주 추가</h1>
                    <button onClick={() => router.back()} className="p-1">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-foreground font-medium mb-2">
                            이름 <span className="text-red-500">필수</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="소성으로만 입력하지 마시고, 전체 이름을 작성해주세요."
                            className="w-full px-4 py-3 rounded-lg bg-surface border border-white/10 text-foreground placeholder:text-zinc-500 text-sm"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Relationship */}
                    <div>
                        <label className="block text-foreground font-medium mb-2 flex items-center gap-2">
                            관계 <span className="text-green-500">✓</span>
                        </label>
                        <select
                            value={relationship}
                            onChange={(e) => setRelationship(e.target.value as RelationshipType)}
                            className="w-full px-4 py-3 rounded-lg bg-surface border border-white/10 text-foreground"
                            disabled={isSubmitting}
                        >
                            <option value="self">본인</option>
                            <option value="spouse">배우자</option>
                            <option value="child">자녀</option>
                            <option value="parent">부모</option>
                            <option value="friend">친구</option>
                            <option value="lover">연인</option>
                            <option value="other">기타</option>
                        </select>
                    </div>

                    {/* Birthdate */}
                    <div>
                        <label className="block text-foreground font-medium mb-2">
                            생년월일 <span className="text-red-500">필수</span>
                        </label>
                        <input
                            type="text"
                            value={birthdate}
                            onChange={(e) => setBirthdate(e.target.value)}
                            placeholder="YYYY-MM-DD"
                            className="w-full px-4 py-3 rounded-lg bg-surface border border-white/10 text-foreground placeholder:text-zinc-400"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Birth Time */}
                    <div>
                        <label className="block text-foreground font-medium mb-2 flex items-center justify-between">
                            <span>태어난 시간</span>
                            <label className="flex items-center gap-2 text-sm font-normal">
                                <input
                                    type="checkbox"
                                    checked={isTimeUnknown}
                                    onChange={(e) => setIsTimeUnknown(e.target.checked)}
                                    className="rounded"
                                    disabled={isSubmitting}
                                />
                                시간 모름
                            </label>
                        </label>
                        <input
                            type="time"
                            value={birthTime}
                            onChange={(e) => setBirthTime(e.target.value)}
                            disabled={isTimeUnknown || isSubmitting}
                            className="w-full px-4 py-3 rounded-lg bg-surface border border-white/10 text-foreground disabled:opacity-50"
                        />
                        <p className="text-xs text-zinc-500 mt-2">
                            밤 12시는 00:00, 낮 12시는 12:00으로 입력하세요.
                        </p>
                    </div>

                    {/* Calendar Type */}
                    <div>
                        <label className="block text-foreground font-medium mb-3">달력 종류</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="calendar"
                                    value="solar"
                                    checked={calendarType === 'solar'}
                                    onChange={() => setCalendarType('solar')}
                                    className="w-5 h-5"
                                    disabled={isSubmitting}
                                />
                                <span className="text-foreground">양력</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="calendar"
                                    value="lunar"
                                    checked={calendarType === 'lunar'}
                                    onChange={() => setCalendarType('lunar')}
                                    className="w-5 h-5"
                                    disabled={isSubmitting}
                                />
                                <span className="text-foreground">음력</span>
                            </label>
                        </div>
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-foreground font-medium mb-3">성별</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="female"
                                    checked={gender === 'female'}
                                    onChange={() => setGender('female')}
                                    className="w-5 h-5"
                                    disabled={isSubmitting}
                                />
                                <span className="text-foreground">여자</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="male"
                                    checked={gender === 'male'}
                                    onChange={() => setGender('male')}
                                    className="w-5 h-5"
                                    disabled={isSubmitting}
                                />
                                <span className="text-foreground">남자</span>
                            </label>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 py-3 rounded-lg border border-white/20 text-foreground font-medium hover:bg-white/5"
                            disabled={isSubmitting}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 rounded-lg bg-yellow-400 text-black font-bold hover:bg-yellow-500 flex items-center justify-center gap-2"
                            disabled={isSubmitting}
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            저장하기
                        </button>
                    </div>

                    {/* View All Link */}
                    <div className="text-center pt-4">
                        <Link href="/my-saju/list" className="text-sm text-primary hover:underline">
                            전체 사주 목록 보러가기 →
                        </Link>
                    </div>
                </form>

                {/* Jelly Confirmation Modal */}
                <AnimatePresence>
                    {showConfirmModal && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    setIsSubmitting(false);
                                }}
                            />

                            {/* Modal */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                            >
                                <div
                                    className="bg-surface rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto p-6 border border-white/10"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Sparkles className="w-8 h-8 text-yellow-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground mb-2">
                                            새 프로필 추가
                                        </h3>
                                        <p className="text-sm text-zinc-400">
                                            <strong className="text-foreground">{name}</strong> 님의 사주를 추가하려면<br />
                                            <strong className="text-yellow-400">1 젤리</strong>가 필요해요
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setShowConfirmModal(false);
                                                setIsSubmitting(false);
                                            }}
                                            className="flex-1 py-3 px-6 rounded-xl border border-white/20 text-foreground hover:bg-white/5 transition"
                                        >
                                            취소
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowConfirmModal(false);
                                                saveProfileAndNavigate(false);
                                            }}
                                            className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold hover:from-yellow-500 hover:to-amber-600 transition flex items-center justify-center gap-2"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                            확인
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Jelly Shop Modal */}
                <JellyShopModal
                    isOpen={showShopModal}
                    onClose={() => {
                        setShowShopModal(false);
                        setIsSubmitting(false);
                    }}
                    onPurchaseSuccess={(jellies) => {
                        setShowShopModal(false);
                        // After purchase, show confirmation modal
                        setShowConfirmModal(true);
                    }}
                />
            </div>
        </main>
    );
}
