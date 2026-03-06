'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Users, Plus, ChevronRight, Loader2, Trash2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface SajuProfile {
    id: string;
    name: string;
    relationship: string;
    birthdate: string;
    archetype?: string;
}

interface Props {
    onSelectProfile?: (profile: SajuProfile) => void;
}

export default function ProfileWallet({ onSelectProfile }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [profiles, setProfiles] = useState<SajuProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProfiles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/saju/list');
            if (res.status === 401) {
                // Not logged in — show empty state, not an error
                setProfiles([]);
                return;
            }
            if (!res.ok) throw new Error('프로필을 불러오지 못했습니다.');
            const data = await res.json();
            setProfiles(data.profiles ?? []);
        } catch (e) {
            setError(e instanceof Error ? e.message : '오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) fetchProfiles();
    }, [isOpen, fetchProfiles]);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('이 프로필을 삭제하시겠습니까?')) return;
        try {
            const res = await fetch(`/api/saju/delete?id=${id}`, { method: 'DELETE' });
            if (res.ok) setProfiles(prev => prev.filter(p => p.id !== id));
        } catch {
            alert('삭제에 실패했습니다.');
        }
    };

    const relationshipLabel = (rel: string) => {
        const map: Record<string, string> = {
            self: '나', spouse: '배우자', child: '자녀', parent: '부모', sibling: '형제/자매', friend: '친구',
        };
        return map[rel] ?? rel;
    };

    return (
        <div className="fixed bottom-6 left-6 z-[110]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 16 }}
                        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                        className="mb-4 w-72 rounded-[2.5rem] bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-white/5">
                            <div>
                                <h3 className="text-sm font-black text-indigo-300 uppercase tracking-widest">Destiny Wallet</h3>
                                <p className="text-[10px] text-slate-500 mt-0.5">{profiles.length}/5 슬롯 사용 중</p>
                            </div>
                            <div className="w-8 h-8 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                <Users className="w-4 h-4 text-indigo-400" />
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
                            {loading && (
                                <div className="flex justify-center py-6">
                                    <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                                </div>
                            )}
                            {error && (
                                <div className="text-center py-4 text-[11px] text-rose-400">{error}</div>
                            )}
                            {!loading && !error && profiles.length === 0 && (
                                <div className="text-center py-6 text-[11px] text-slate-500">
                                    저장된 사주 프로필이 없습니다.<br />
                                    <span className="text-indigo-400">로그인 후 추가해보세요.</span>
                                </div>
                            )}
                            {!loading && profiles.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => { onSelectProfile?.(p); setIsOpen(false); }}
                                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all text-left flex items-center justify-between group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black text-slate-200 truncate">{p.name}</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">
                                            {relationshipLabel(p.relationship)} · {p.birthdate}
                                        </p>
                                        {p.archetype && (
                                            <p className="text-[10px] text-indigo-400 mt-0.5 truncate">{p.archetype}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 ml-2 shrink-0">
                                        <button
                                            onClick={(e) => handleDelete(p.id, e)}
                                            className="p-1.5 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 transition-all"
                                        >
                                            <Trash2 className="w-3 h-3 text-rose-400" />
                                        </button>
                                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                                    </div>
                                </button>
                            ))}

                            {!loading && profiles.length < 5 && (
                                <a
                                    href="/my-saju/add"
                                    className="w-full p-4 rounded-2xl border border-dashed border-white/10 hover:border-indigo-400/40 hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-2 group"
                                >
                                    <Plus className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                                    <span className="text-[10px] font-black text-slate-500 group-hover:text-indigo-300 uppercase tracking-widest transition-colors">새 사주 추가</span>
                                </a>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FAB Toggle Button */}
            <button
                onClick={() => setIsOpen(v => !v)}
                className={`relative w-14 h-14 rounded-3xl flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 ${isOpen
                        ? 'bg-indigo-600 border border-indigo-500 text-white shadow-indigo-500/30'
                        : 'bg-slate-900/80 backdrop-blur-xl border border-white/10 text-slate-400'
                    }`}
            >
                <Wallet className="w-6 h-6" />
                {profiles.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-500 border-2 border-slate-950 flex items-center justify-center">
                        <span className="text-[9px] font-black text-white">{profiles.length}</span>
                    </div>
                )}
            </button>
        </div>
    );
}
