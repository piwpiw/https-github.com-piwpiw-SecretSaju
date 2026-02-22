'use client';

import { useState, useEffect } from 'react';
import { getProfiles, SajuProfile } from '@/lib/storage';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export default function SelectionPage() {
    const [profiles, setProfiles] = useState<SajuProfile[]>([]);
    const [selectedProfile, setSelectedProfile] = useState<string>('');

    useEffect(() => {
        const saved = getProfiles();
        setProfiles(saved);
        if (saved.length > 0) {
            setSelectedProfile(saved[0].id);
        }
    }, []);

    return (
        <main className="min-h-screen bg-background">
            <div className="max-w-2xl mx-auto pb-12">
                {/* Yellow Banner */}
                <div className="bg-yellow-400 text-black px-4 py-6 mb-6">
                    <h1 className="text-xl font-bold text-center">문제를 할 사람을 선택해주세요</h1>
                </div>

                {/* Profile Selector */}
                <div className="px-4 mb-8">
                    <div className="relative">
                        <select
                            value={selectedProfile}
                            onChange={(e) => setSelectedProfile(e.target.value)}
                            className="w-full px-4 py-4 pr-10 rounded-lg bg-surface border border-white/10 text-foreground appearance-none font-medium"
                        >
                            <option value="">누구의 운세를 볼까요?</option>
                            {profiles.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} ({p.relationship})
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
                    </div>
                </div>

                {/* Service Cards */}
                <div className="px-4 space-y-6">
                    {/* New Year Fortune - Premium */}
                    <div className="glass rounded-2xl overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20">
                            <span className="text-xl">🎁</span>
                            <span className="text-sm font-medium text-foreground">신년운세</span>
                            <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold ml-auto">
                                일별 무료
                            </span>
                        </div>
                        <div className="bg-gradient-to-br from-pink-500 to-red-600 p-8 text-center">
                            <div className="mb-4">
                                <p className="text-white text-sm mb-2">🎊 꿀이 팡팡 들어가!</p>
                                <h2 className="text-4xl font-black text-white mb-1" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                                    2026
                                </h2>
                                <h3 className="text-5xl font-black text-yellow-300 mb-2" style={{
                                    textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
                                    WebkitTextStroke: '2px black'
                                }}>
                                    丙午年
                                </h3>
                                <p className="text-white text-sm font-bold">
                                    11주대마 봐란 말만! 너너로써!
                                </p>
                            </div>
                        </div>
                        <button className="w-full bg-black text-white py-4 font-bold hover:bg-black/80">
                            지금 바로 확인하기
                        </button>
                    </div>

                    {/* Daily Fortune Premium */}
                    <div className="glass rounded-2xl overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/20">
                            <span className="text-xl">📅</span>
                            <span className="text-sm font-medium text-foreground">오늘의 운세 프리미엄</span>
                            <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-xs font-bold ml-auto">
                                4일
                            </span>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-orange-100 to-yellow-50">
                            <div className="flex items-center gap-4">
                                <div className="bg-yellow-400 rounded-full px-4 py-2">
                                    <p className="text-black text-sm font-bold">단 330일</p>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-black text-orange-600 mb-1">더 자세한</h3>
                                    <p className="text-lg font-bold text-gray-800">오늘의 운세가</p>
                                    <p className="text-lg font-bold text-gray-800">궁금하다면?</p>
                                </div>
                                <div className="text-5xl">💁</div>
                            </div>
                        </div>
                        <button className="w-full bg-pink-500 text-white py-4 font-bold hover:bg-pink-600">
                            지금 바로 확인하기
                        </button>
                        <p className="text-center text-xs text-zinc-500 py-2">
                            선택 오뚜기 거로 보기
                        </p>
                    </div>

                    {/* Daily Fortune Free */}
                    <div className="glass rounded-2xl overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20">
                            <span className="text-xl">📅</span>
                            <span className="text-sm font-medium text-foreground">오늘의 운세</span>
                            <span className="px-2 py-0.5 rounded-full bg-green-500 text-white text-xs font-bold ml-auto">
                                무료
                            </span>
                        </div>
                        <div className="p-12 text-center">
                            <div className="text-6xl mb-4">❓</div>
                        </div>
                        <button className="w-full bg-green-600 text-white py-4 font-bold hover:bg-green-700">
                            무료로 확인하기
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
