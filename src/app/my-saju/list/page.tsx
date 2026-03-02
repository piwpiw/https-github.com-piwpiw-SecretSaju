'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SajuProfileRepository } from '@/lib/repositories/saju-profile.repository';
import { Plus, Trash2, Loader2, ArrowLeft, ChevronRight, User, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProfiles } from '@/components/ProfileProvider';

const relationshipLabel: Record<string, string> = {
  self: '본인',
  spouse: '배우자',
  child: '자녀',
  parent: '부모',
  friend: '친구',
  lover: '연인',
  other: '기타',
};

const calendarLabel: Record<string, string> = {
  solar: '양력',
  lunar: '음력',
};

const genderLabel: Record<string, string> = {
  female: '여성',
  male: '남성',
};

export default function SajuListPage() {
  const router = useRouter();
  const { profiles, refreshProfiles } = useProfiles();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  const handleDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    setActionMessage(null);
    setDeletingId(pendingDelete.id);

    try {
      await SajuProfileRepository.delete(pendingDelete.id);
      await refreshProfiles();
      setActionMessage({ type: 'success', text: `${pendingDelete.name} 프로필이 삭제되었습니다.` });
      setTimeout(() => setActionMessage(null), 2200);
    } catch (error) {
      console.error('Failed to delete profile:', error);
      setActionMessage({ type: 'error', text: '프로필 삭제에 실패했습니다. 잠시 후 다시 시도하세요.' });
    } finally {
      setDeletingId(null);
      setPendingDelete(null);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden pb-40">
      <div className="max-w-4xl mx-auto px-6 py-16 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-20 text-center md:text-left border-b border-border-color pb-16">
          <div>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-3 text-lg font-bold text-secondary hover:text-foreground transition-all mb-8"
            >
              <ArrowLeft className="w-6 h-6" /> 이전으로
            </button>
            <h1 className="text-5xl font-black text-foreground italic tracking-tighter uppercase mb-2">
              사주 <span className="text-primary italic">프로필</span>
            </h1>
            <p className="text-xl text-secondary font-medium italic opacity-70">현재 저장된 프로필 {profiles.length}개</p>
          </div>
          <Link
            href="/my-saju/add"
            className="inline-flex items-center gap-4 px-10 py-5 rounded-3xl bg-primary text-white font-black text-xl shadow-2xl shadow-primary/20 hover:scale-105 transition-all w-full md:w-auto justify-center"
          >
            <Plus className="w-6 h-6 hover:rotate-90 transition-transform" />
            새 프로필 추가
          </Link>
        </div>

        {actionMessage && (
          <p
            className={`mb-6 rounded-xl border px-4 py-3 text-sm font-bold ${
              actionMessage.type === 'success'
                ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                : 'border-rose-400/40 bg-rose-500/10 text-rose-200'
            }`}
          >
            {actionMessage.text}
          </p>
        )}

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
                <h3 className="text-3xl font-black text-foreground mb-4">등록된 프로필이 없습니다.</h3>
                <p className="text-xl text-secondary font-medium mb-12">
                  첫 프로필을 저장하면 바로 분석과 궁합 진단을 이어서 볼 수 있습니다.
                </p>
                <Link
                  href="/my-saju/add"
                  className="px-10 py-5 rounded-3xl bg-background border-2 border-border-color text-foreground font-bold text-xl hover:border-primary hover:text-primary transition-all shadow-sm"
                >
                  프로필 만들기
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
                          {profile.relationship === 'self' ? '👤' : '👥'}
                          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
                        </div>
                        <button
                          disabled={deletingId === profile.id}
                          onClick={() => setPendingDelete({ id: profile.id, name: profile.name })}
                          className="p-3 text-secondary hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all border border-transparent hover:border-rose-500/20 disabled:opacity-50"
                        >
                          {deletingId === profile.id ? <Loader2 className="w-6 h-6 animate-spin" /> : <Trash2 className="w-6 h-6" />}
                        </button>
                      </div>

                      <div className="mb-8">
                        <h3 className="text-3xl font-black text-foreground italic tracking-tighter uppercase group-hover:text-primary transition-colors">
                          {profile.name}
                        </h3>
                        <span className="inline-flex mt-3 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border bg-primary/10 text-primary border-primary/30">
                          {relationshipLabel[profile.relationship] || profile.relationship}
                        </span>
                      </div>

                      <div className="space-y-4 mb-10">
                        <div className="flex items-center gap-4 text-sm font-bold text-secondary uppercase tracking-widest">
                          <Calendar className="w-5 h-5 text-primary" />
                          {String(profile.birthdate).split('T')[0]} ({calendarLabel[profile.calendarType] || profile.calendarType})
                        </div>
                        <div className="flex items-center gap-4 text-sm font-bold text-secondary uppercase tracking-widest">
                          <User className="w-5 h-5 text-primary" />
                          {genderLabel[profile.gender] || profile.gender}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/relationship/${profile.id}`)}
                      className="w-full py-5 rounded-2xl bg-background border border-border-color text-foreground font-black text-lg hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-3 group/btn shadow-sm"
                    >
                      프로필 분석 보기
                      <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-3xl border border-border-color bg-surface p-6">
            <h3 className="text-xl font-black">프로필 삭제</h3>
            <p className="mt-2 text-sm text-secondary">
              <span className="text-foreground font-bold">{pendingDelete.name}</span> 프로필을 삭제할까요?
            </p>
            <p className="mt-1 text-xs text-secondary">삭제된 데이터는 되돌릴 수 없습니다.</p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setPendingDelete(null)}
                className="flex-1 py-3 rounded-2xl border border-border-color text-foreground font-black"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={deletingId !== null}
                className="flex-1 py-3 rounded-2xl bg-rose-500 text-white font-black disabled:opacity-60"
              >
                삭제 확정
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
