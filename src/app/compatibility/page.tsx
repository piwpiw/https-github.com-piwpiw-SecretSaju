'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateHighPrecisionSaju } from '@/core/api/saju-engine';
import { analyzeRelationship } from '@/lib/compatibility';
import { validateBirthInput } from '@/lib/validation';
import { getProfiles, SajuProfile } from '@/lib/storage';
import { ChevronDown, Heart, Share2, Copy } from 'lucide-react';

export default function CompatibilityPage() {
  const [profiles, setProfiles] = useState<SajuProfile[]>([]);
  const [personAId, setPersonAId] = useState('');
  const [personBId, setPersonBId] = useState('');
  const [relationshipQuestion, setRelationshipQuestion] = useState('');
  const [roleA, setRoleA] = useState('');
  const [roleB, setRoleB] = useState('');
  const [showRelationship, setShowRelationship] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReturnType<typeof analyzeRelationship> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setProfiles(getProfiles());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const personA = profiles.find(p => p.id === personAId);
    const personB = profiles.find(p => p.id === personBId);

    if (!personA || !personB) {
      setError('두 사람을 모두 선택해주세요');
      return;
    }

    const parseBirth = (dateStr: string) => {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day); // Convert to Date object
    };

    const birthA = parseBirth(personA.birthdate);
    const birthB = parseBirth(personB.birthdate);

    setLoading(true);
    setTimeout(async () => {
      // Updated to Enterprise Engine
      const sajuA = await calculateHighPrecisionSaju({
        birthDate: birthA,
        birthTime: '12:00', // Default
        gender: personA.gender === 'male' ? 'M' : 'F'
      });
      const sajuB = await calculateHighPrecisionSaju({
        birthDate: birthB,
        birthTime: '12:00',
        gender: personB.gender === 'male' ? 'M' : 'F'
      });

      setResult(analyzeRelationship(sajuA, sajuB, roleA as any || '기타'));
      setLoading(false);
    }, 800);
  };

  const selectedPersonA = profiles.find(p => p.id === personAId);
  const selectedPersonB = profiles.find(p => p.id === personBId);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white px-4 py-8 text-center">
          <div className="text-3xl mb-2">💕</div>
          <h1 className="text-2xl font-bold">새로운 궁합 보기</h1>
          <p className="text-green-100/80 text-sm mt-1">두 사람의 운명적 케미를 확인하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Person A Selection */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-foreground font-medium mb-4">첫 번째 사람 선택</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">관계 성별 생년월일</label>
                <div className="relative">
                  <select
                    value={personAId}
                    onChange={(e) => setPersonAId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-surface border border-white/10 text-foreground appearance-none"
                  >
                    <option value="">선택</option>
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.relationship} | {p.gender === 'female' ? '여자' : '남자'} | {p.birthdate}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
                </div>
              </div>
              {selectedPersonA && (
                <div className="flex gap-4 text-sm text-zinc-400">
                  <div>
                    <span className="mr-2">양/음력</span>
                    <span className="text-foreground">{selectedPersonA.calendarType === 'solar' ? '양력' : '음력'}</span>
                  </div>
                  <div>
                    <span className="mr-2">시간</span>
                    <span className="text-foreground">{selectedPersonA.isTimeUnknown ? '모름' : selectedPersonA.birthTime}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Person B Selection */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-foreground font-medium mb-4">두 번째 사람 선택</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">관계 성별 생년월일</label>
                <div className="relative">
                  <select
                    value={personBId}
                    onChange={(e) => setPersonBId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-surface border border-white/10 text-foreground appearance-none"
                  >
                    <option value="">선택</option>
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.relationship} | {p.gender === 'female' ? '여자' : '남자'} | {p.birthdate}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
                </div>
              </div>
              {selectedPersonB && (
                <div className="flex gap-4 text-sm text-zinc-400">
                  <div>
                    <span className="mr-2">양/음력</span>
                    <span className="text-foreground">{selectedPersonB.calendarType === 'solar' ? '양력' : '음력'}</span>
                  </div>
                  <div>
                    <span className="mr-2">시간</span>
                    <span className="text-foreground">{selectedPersonB.isTimeUnknown ? '모름' : selectedPersonB.birthTime}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Relationship Question - Expandable */}
          <button
            type="button"
            onClick={() => setShowRelationship(!showRelationship)}
            className="w-full glass rounded-2xl p-6 flex items-center justify-between hover:bg-white/5"
          >
            <span className="text-foreground font-medium">두 사람은 어떤 관계인가요?</span>
            <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform ${showRelationship ? 'rotate-180' : ''}`} />
          </button>

          {showRelationship && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="glass rounded-2xl p-6"
            >
              <input
                type="text"
                value={relationshipQuestion}
                onChange={(e) => setRelationshipQuestion(e.target.value)}
                placeholder="예: 연인, 가족, 친구 등"
                className="w-full px-4 py-3 rounded-lg bg-surface border border-white/10 text-foreground"
              />
            </motion.div>
          )}

          {/* Role Questions */}
          <div className="space-y-4">
            <div className="glass rounded-2xl p-6">
              <label className="block text-foreground font-medium mb-3">
                첫 번째 사람을 어떤 역할인가요? (예: 엄마)
                <span className="ml-2 text-xs text-zinc-500">선택</span>
              </label>
              <input
                type="text"
                value={roleA}
                onChange={(e) => setRoleA(e.target.value)}
                placeholder="예: 엄마"
                className="w-full px-4 py-3 rounded-lg bg-surface border border-white/10 text-foreground"
              />
            </div>

            <div className="glass rounded-2xl p-6">
              <label className="block text-foreground font-medium mb-3">
                두 번째 사람을 어떤 역할인가요? (예: 딸)
                <span className="ml-2 text-xs text-zinc-500">선택</span>
              </label>
              <input
                type="text"
                value={roleB}
                onChange={(e) => setRoleB(e.target.value)}
                placeholder="예: 딸"
                className="w-full px-4 py-3 rounded-lg bg-surface border border-white/10 text-foreground"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2" role="alert">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !personAId || !personBId}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 text-black font-bold hover:from-green-500 hover:to-emerald-600 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
          >
            <Heart className={`w-5 h-5 ${loading ? 'animate-pulse' : ''}`} />
            {loading ? '궁합 분석 중...' : '궁합 보기'}
          </button>
        </form>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              className="mt-6 mx-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Score Card */}
              <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/30 border border-green-400/20 rounded-2xl p-8 text-center mb-4">
                <p className="text-slate-400 text-sm mb-4">
                  {result.pillarA} × {result.pillarB}
                </p>
                <div className="relative inline-flex items-center justify-center w-36 h-36 mb-4">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <motion.circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke="url(#compat-grad)" strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - result.score / 100) }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                    <defs>
                      <linearGradient id="compat-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4ade80" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div>
                    <p className="text-5xl font-bold text-white">{result.score}</p>
                    <p className="text-slate-400 text-xs">/ 100점</p>
                  </div>
                </div>
                <p className="text-white font-bold text-lg mb-2">{result.message}</p>
              </div>

              {/* Share */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const w = window as any;
                    if (w.Kakao?.Share) {
                      w.Kakao.Share.sendDefault({
                        objectType: 'feed',
                        content: {
                          title: `우리 궁합 ${result.score}점!`,
                          description: result.message,
                          imageUrl: `${window.location.origin}/og-image.png`,
                          link: { mobileWebUrl: window.location.origin, webUrl: window.location.origin },
                        },
                      });
                    }
                  }}
                  className="flex-1 py-3 rounded-xl bg-yellow-400 text-black font-bold hover:bg-yellow-500 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  💬 카카오로 공유
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(`우리 궁합 ${result.score}점! ${result.message} — ${window.location.origin}/compatibility`)}
                  className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Copy className="w-4 h-4" /> 결과 복사
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
