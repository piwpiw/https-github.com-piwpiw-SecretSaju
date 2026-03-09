'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SajuProfileRepository } from '@/lib/saju/repositories/saju-profile.repository';
import RelationshipMap from '@/components/mysaju/RelationshipMap';
import LifeTimeline from '@/components/mysaju/LifeTimeline';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { Sparkles, Users, UserPlus, RefreshCcw } from 'lucide-react';
import { Plus, Trash2, Loader2, ArrowLeft, ChevronRight, User, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProfiles } from '@/components/profile/ProfileProvider';

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

type SortMode = "name" | "date";

export default function SajuListPage() {
  const router = useRouter();
  const { profiles, refreshProfiles } = useProfiles();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const [searchName, setSearchName] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("date");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const completionRate = profiles.length ? Math.min(100, profiles.length * 23) : 0;
  const visibleProfiles = useMemo(() => {
    const normalized = searchName.trim().toLowerCase();
    const filtered = normalized
      ? profiles.filter((profile) => profile.name.toLowerCase().includes(normalized))
      : profiles;

    return [...filtered].sort((a, b) => {
      if (sortMode === "name") {
        return a.name.localeCompare(b.name);
      }
      return String(b.birthdate).localeCompare(String(a.birthdate));
    });
  }, [profiles, searchName, sortMode]);

  const handleDelete = async () => {
    if (!pendingDelete) return;

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
      setTimeout(() => setActionMessage(null), 2600);
    } finally {
      setDeletingId(null);
      setPendingDelete(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshProfiles();
      setActionMessage({ type: 'success', text: '프로필 목록을 갱신했습니다.' });
      setTimeout(() => setActionMessage(null), 1500);
    } catch (error) {
      console.error('Refresh failed', error);
      setActionMessage({ type: 'error', text: '목록 새로고침 실패. 잠시 후 다시 시도하세요.' });
      setTimeout(() => setActionMessage(null), 1800);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden pb-40">
      <div className="max-w-4xl mx-auto px-6 py-16 relative z-10">
        <ScrollReveal>
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.back()}
              aria-label="이전 페이지로 돌아가기"
              className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-slate-200" />
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                aria-label="프로필 목록 새로고침"
                className="rounded-2xl border border-border-color px-4 py-3 inline-flex items-center gap-2"
              >
                {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                {isRefreshing ? "갱신 중" : "새로고침"}
              </button>
              <button
                onClick={() => router.push('/my-saju/add')}
                className="btn-neumorphic px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-indigo-400 group"
                aria-label="신규 프로필 추가"
              >
                <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" /> 신규 프로필 추가
              </button>
            </div>
          </div>

          <div className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h1 className="ui-title-gradient text-3xl leading-none">인연 네트워크</h1>
                <p className="text-[10px] font-black text-indigo-500/60 uppercase tracking-[0.2em] mt-1 italic">사주 시너지 지도</p>
              </div>
            </div>
            <RelationshipMap />
          </div>
        </ScrollReveal>

        <div className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-3xl border border-border-color bg-gradient-to-br from-slate-900/70 to-surface p-6">
            <p className="text-xs font-black uppercase tracking-widest text-secondary">프로필 커버리지</p>
            <div className="mt-4 h-2 rounded-full bg-black/30 border border-white/10">
              <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${completionRate}%` }} />
            </div>
            <p className="mt-3 text-sm text-secondary">현재 {completionRate}%</p>
          </div>
          <div className="rounded-3xl border border-border-color bg-gradient-to-br from-indigo-900/20 to-surface p-6">
            <p className="text-xs font-black uppercase tracking-widest text-secondary">관계 맵 가동률</p>
            <p className="mt-4 text-3xl font-black">{profiles.length > 1 ? `${profiles.length - 1}개` : "0개"}</p>
            <p className="mt-2 text-sm text-secondary">연결 가능한 관계 후보군</p>
          </div>
          <div className="rounded-3xl border border-border-color bg-gradient-to-br from-rose-900/20 to-surface p-6">
            <p className="text-xs font-black uppercase tracking-widest text-secondary">다음 액션</p>
            <p className="mt-4 text-xl font-black">프로필 점검 1회</p>
            <p className="mt-2 text-sm text-secondary">오늘도 관계 분석 정확도 향상</p>
          </div>
        </div>

        <ScrollReveal delay={0.2}>
          <div className="mb-10 bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 overflow-hidden">
            <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest italic mb-2">Life Path Energy</h4>
            <LifeTimeline />
          </div>
        </ScrollReveal>

        <div className="mb-8 flex flex-col sm:flex-row gap-3">
          <label className="flex-1">
            <span className="sr-only">프로필 이름 검색</span>
            <input
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              aria-label="프로필 이름 검색"
              placeholder="이름으로 찾기"
              className="w-full rounded-2xl border border-border-color bg-surface px-4 py-3"
            />
          </label>
          <div className="inline-flex rounded-2xl border border-border-color bg-surface overflow-hidden">
            <button
              type="button"
              onClick={() => setSortMode("date")}
              aria-pressed={sortMode === "date"}
              className={`px-4 py-3 text-sm ${sortMode === "date" ? "bg-indigo-500/20 text-indigo-100" : ""}`}
            >
              날짜순
            </button>
            <button
              type="button"
              onClick={() => setSortMode("name")}
              aria-pressed={sortMode === "name"}
              className={`px-4 py-3 text-sm ${sortMode === "name" ? "bg-indigo-500/20 text-indigo-100" : ""}`}
            >
              이름순
            </button>
          </div>
        </div>

        <div className="mt-4" aria-live="polite" aria-atomic="true">
          {actionMessage && (
            <p className={`mb-6 rounded-xl border px-4 py-3 text-sm font-bold ${actionMessage.type === 'success'
              ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
              : 'border-rose-400/40 bg-rose-500/10 text-rose-200'
              }`}>
              {actionMessage.text}
            </p>
          )}
        </div>

        <div className="space-y-6">
          {visibleProfiles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-surface rounded-5xl p-20 text-center border-2 border-dashed border-border-color group hover:border-primary/50 transition-all shadow-xl"
              role="status"
              aria-live="polite"
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
                  aria-label="프로필 만들기"
                >
                  프로필 만들기
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence>
                {visibleProfiles.map((profile, index) => (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-surface rounded-4xl p-10 border border-border-color hover:border-primary/40 transition-all shadow-xl group hover:scale-[1.02] flex flex-col justify-between"
                    aria-label={`${profile.name} 프로필 카드`}
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
                          aria-label={`${profile.name} 삭제`}
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
                      aria-label={`${profile.name} 분석 보기`}
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
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-black">프로필 삭제</h3>
              <Sparkles className="w-5 h-5 text-secondary" />
            </div>
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
