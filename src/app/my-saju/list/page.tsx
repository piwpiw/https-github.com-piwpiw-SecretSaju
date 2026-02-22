'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SajuProfileRepository } from '@/lib/repositories/saju-profile.repository';
import { SajuProfile } from '@/types/schema';
import { getUserFromCookie } from '@/lib/kakao-auth';
import Link from 'next/link';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SajuListPage() {
    const router = useRouter();
    const [profiles, setProfiles] = useState<SajuProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadProfiles = async () => {
        setIsLoading(true);
        try {
            // Get user ID or fallback to local-user
            const user = getUserFromCookie();
            const userId = user ? String(user.id) : 'local-user';

            const data = await SajuProfileRepository.findByUserId(userId);
            setProfiles(data);
        } catch (error) {
            console.error('Failed to load profiles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProfiles();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm('정말 삭제하시겠습니까?')) {
            try {
                await SajuProfileRepository.delete(id);
                loadProfiles();
            } catch (error) {
                console.error('Failed to delete profile:', error);
                alert('삭제에 실패했습니다.');
            }
        }
    };

    if (isLoading) {
        return (
            <main className="min-h-screen bg-background px-4 py-8 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="font-display text-2xl text-foreground">저장된 사주</h1>
                    <Link
                        href="/my-saju/add"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        추가
                    </Link>
                </div>

                <div className="space-y-4">
                    {profiles.length === 0 ? (
                        <div className="glass rounded-2xl p-12 text-center">
                            <p className="text-zinc-400 mb-4">저장된 사주가 없습니다</p>
                            <Link
                                href="/my-saju/add"
                                className="inline-block px-6 py-3 rounded-xl bg-primary text-white font-medium"
                            >
                                첫 사주 추가하기
                            </Link>
                        </div>
                    ) : (
                        profiles.map((profile, index) => (
                            <motion.div
                                key={profile.id}
                                className="glass rounded-2xl p-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-display text-xl text-foreground">{profile.name}</h3>
                                            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
                                                {/* Translate relationship type */}
                                                {profile.relationship === 'self' ? '본인' :
                                                    profile.relationship === 'spouse' ? '배우자' :
                                                        profile.relationship === 'child' ? '자녀' :
                                                            profile.relationship === 'parent' ? '부모' :
                                                                profile.relationship === 'friend' ? '친구' :
                                                                    profile.relationship === 'lover' ? '연인' :
                                                                        profile.relationship === 'other' ? '기타' : profile.relationship}
                                            </span>
                                        </div>
                                        <div className="space-y-1 text-sm text-zinc-400">
                                            <p>
                                                생년월일: {profile.birthdate.toISOString().split('T')[0]}
                                                ({profile.calendarType === 'solar' ? '양력' : '음력'})
                                            </p>
                                            <p>
                                                태어난 시간: {profile.isTimeUnknown
                                                    ? '시간 모름'
                                                    : profile.birthTime
                                                        ? new Date(profile.birthTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
                                                        : '시간 모름'}
                                            </p>
                                            <p>성별: {profile.gender === 'female' ? '여자' : '남자'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(profile.id)}
                                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
