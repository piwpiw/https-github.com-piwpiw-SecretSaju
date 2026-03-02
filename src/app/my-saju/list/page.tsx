'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SajuProfileRepository } from '@/lib/repositories/saju-profile.repository';
import { SajuProfile } from '@/types/schema';
import { getUserFromCookie } from '@/lib/kakao-auth';
import Link from 'next/link';
import { Plus, Trash2, Loader2, ArrowLeft, ChevronRight, User, Heart, Star, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useProfiles } from '@/components/ProfileProvider';

export default function SajuListPage() {
    const router = useRouter();
    const { profiles, refreshProfiles } = useProfiles();
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`'${name}' 님의 인연 데이터를 영구 삭제하시겠습니까?`)) {
            try {
                await SajuProfileRepository.delete(id);
                await refreshProfiles();
            } catch (error) {
                console.error('Failed to delete profile:', error);
                alert('삭제에 실패했습니다.');
            }
        }
    };

    if (isLoading) {
        return (
            <main className="min-h-screen bg-background flex flex-col items-center justify-center space-y-6 pb-20">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-xl font-bold text-secondary">Loading your destiny web...</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen relative overflow-hidden pb-40">
            <div className="max-w-4xl mx-auto px-6 py-16 relative z-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-20 text-center md:text-left border-b border-border-color pb-16">
                    <div>
                        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-3 text-lg font-bold text-secondary hover:text-foreground transition-all mb-8">
                            <ArrowLeft className="w-6 h-6" /> 대시보드
                        </button>
                        <h1 className="text-5xl font-black text-foreground italic tracking-tighter uppercase mb-2">
                            프로필 <span className="text-primary italic">목록</span>
                        </h1>
                        <p className="text-xl text-secondary font-medium italic opacity-70">
                            등록된 인연 {profiles.length}명
                        </p>
                    </div>
                    <Link
                        href="/my-saju/add"
                        className="inline-flex items-center gap-4 px-10 py-5 rounded-3xl bg-primary text-white font-black text-xl shadow-2xl shadow-primary/20 hover:scale-105 transition-all w-full md:w-auto justify-center"
                    >
                        <Plus className="w-6 h-6 hover:rotate-90 transition-transform" />
                        새 인연 추가
                    </Link>
                </div>

                <div className="space-y-6">
                    {profiles.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-surface rounded-5xl p-20 text-center border-2 border-dashed border-border-color group hover:border-primary/50 transition-all shadow-xl"
                        >
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full bg-background border border-border-color flex items-center justify-center mb-8 group-hover:scale-110 transition-transform group-hover:bg-primary/5">
                                    <Plus className="w-12 h-12 text-secondary group-hover:text-primary transition-colors" />
                                </div>
                                <h3 className="text-3xl font-black text-foreground mb-4">등록된 인연이 없습니다</h3>
                                <p className="text-xl text-secondary font-medium mb-12">나를 둘러싼 운명망을 등록해 보세요.</p>
                                <Link
                                    href="/my-saju/add"
                                    className="px-10 py-5 rounded-3xl bg-background border-2 border-border-color text-foreground font-bold text-xl hover:border-primary hover:text-primary transition-all shadow-sm"
                                >
                                    첫 인연 동기화하기
                                </Link>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <AnimatePresence>
                                {profiles.map((profile, index) => (
                                    <motion.div
                                        key={profile.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-surface rounded-4xl p-10 border border-border-color hover:border-primary/40 transition-all shadow-xl group hover:scale-[1.02] flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between mb-8">
                                                <div className="w-20 h-20 bg-background rounded-3xl flex items-center justify-center border border-border-color text-4xl shadow-inner group-hover:scale-110 transition-transform relative overflow-hidden">
                                                    {profile.relationship === 'self' ? '👑' : '👤'}
                                                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(profile.id, profile.name)}
                                                    className="p-3 text-secondary hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all border border-transparent hover:border-rose-500/20"
                                                >
                                                    <Trash2 className="w-6 h-6" />
                                                </button>
                                            </div>

                                            <div className="mb-8">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-3xl font-black text-foreground italic tracking-tighter uppercase group-hover:text-primary transition-colors">
                                                        {profile.name}
                                                    </h3>
                                                </div>
                                                <span className={`inline-flex px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${profile.relationship === 'self'
                                                    ? 'bg-primary/10 text-primary border-primary/30'
                                                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                                                    }`}>
                                                    {profile.relationship === 'self' ? '본인 (CORE)' :
                                                        profile.relationship === 'spouse' ? '배우자' :
                                                            profile.relationship === 'child' ? '자녀' :
                                                                profile.relationship === 'parent' ? '부모' :
                                                                    profile.relationship === 'friend' ? '친구' :
                                                                        profile.relationship === 'lover' ? '연인' :
                                                                            profile.relationship === 'other' ? '기타' : profile.relationship}
                                                </span>
                                            </div>

                                            <div className="space-y-4 mb-10">
                                                <div className="flex items-center gap-4 text-sm font-bold text-secondary uppercase tracking-widest">
                                                    <Calendar className="w-5 h-5 text-primary" />
                                                    {String(profile.birthdate).split('T')[0]} ({profile.calendarType === 'solar' ? '양' : '음'})
                                                </div>
                                                <div className="flex items-center gap-4 text-sm font-bold text-secondary uppercase tracking-widest">
                                                    <User className="w-5 h-5 text-primary" />
                                                    {profile.gender === 'female' ? '여성' : '남성'}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => router.push(`/relationship/${profile.id}`)}
                                            className="w-full py-5 rounded-2xl bg-background border border-border-color text-foreground font-black text-lg hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-3 group/btn shadow-sm"
                                        >
                                            운석 분석하기
                                            <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
