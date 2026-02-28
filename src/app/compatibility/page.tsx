'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateHighPrecisionSaju, type HighPrecisionSajuResult } from '@/core/api/saju-engine';
import { analyzeRelationship, RelationshipType, RelationshipAnalysis } from '@/lib/compatibility';
import { getProfiles, SajuProfile } from '@/lib/storage';
import {
  ChevronDown, Heart, Copy, Sparkles, Users, ArrowLeft,
  ChevronRight, Zap, Loader2, UserPlus, AlertTriangle,
  Star, MessageCircle, TrendingUp, RefreshCw, User
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import JellyBalance from '@/components/shop/JellyBalance';
import { useLocale } from '@/lib/i18n';
import ElementPolygon from '@/components/ui/ElementPolygon';

const RELATIONSHIP_PRESETS: { labelKey: string; value: RelationshipType; icon: string }[] = [
  { labelKey: 'common.relation.lover', value: '연인', icon: '💕' },
  { labelKey: 'common.relation.spouse', value: '배우자', icon: '💍' },
  { labelKey: 'common.relation.friend', value: '친구', icon: '🤝' },
  { labelKey: 'common.relation.parent', value: '엄마', icon: '👨‍👩‍👧' },
  { labelKey: 'common.relation.other', value: '상사', icon: '💼' },
  { labelKey: 'common.relation.other', value: '기타', icon: '✨' },
];

const GRADE_CONFIG = {
  best: { icon: '🏆', colorClass: 'text-yellow-400', bgClass: 'bg-yellow-500/10 border-yellow-500/30' },
  good: { icon: '💎', colorClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10 border-emerald-500/30' },
  normal: { icon: '⭐', colorClass: 'text-blue-400', bgClass: 'bg-blue-500/10 border-blue-500/30' },
  caution: { icon: '⚠️', colorClass: 'text-amber-400', bgClass: 'bg-amber-500/10 border-amber-500/30' },
  low: { icon: '❗', colorClass: 'text-rose-400', bgClass: 'bg-rose-500/10 border-rose-500/30' },
};

function CompatibilityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileId = searchParams.get('profileId');
  const { t, locale } = useLocale();
  const [profiles, setProfiles] = useState<SajuProfile[]>([]);
  const [personAId, setPersonAId] = useState('');
  const [personBId, setPersonBId] = useState('');
  const [selectedRelationType, setSelectedRelationType] = useState<RelationshipType>('연인');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RelationshipAnalysis | null>(null);
  const [sajuA, setSajuA] = useState<HighPrecisionSajuResult | null>(null);
  const [sajuB, setSajuB] = useState<HighPrecisionSajuResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const p = getProfiles();
    setProfiles(p);
    if (profileId) {
      setPersonAId(profileId);
    }
  }, [profileId]);

  useEffect(() => {
    if (!result) { setAnimatedScore(0); return; }
    let frame: number;
    let start: number | null = null;
    const duration = 1500;
    const target = result.score;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [result]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const personA = profiles.find(p => p.id === personAId);
    const personB = profiles.find(p => p.id === personBId);

    if (!personA || !personB) {
      setError(t('compat.selectBothError'));
      return;
    }
    if (personA.id === personB.id) {
      setError(t('compat.samePersonError'));
      return;
    }

    const parseBirth = (dateStr: string) => {
      const parts = dateStr.split('T')[0].split('-');
      const [year, month, day] = parts.map(Number);
      return new Date(year, month - 1, day);
    };

    setLoading(true);
    setTimeout(async () => {
      try {
        const hpA = await calculateHighPrecisionSaju({
          birthDate: parseBirth(personA.birthdate),
          birthTime: personA.birthTime || '12:00',
          gender: personA.gender === 'male' ? 'M' : 'F',
          calendarType: personA.calendarType,
        });
        const hpB = await calculateHighPrecisionSaju({
          birthDate: parseBirth(personB.birthdate),
          birthTime: personB.birthTime || '12:00',
          gender: personB.gender === 'male' ? 'M' : 'F',
          calendarType: personB.calendarType,
        });
        setSajuA(hpA);
        setSajuB(hpB);
        setResult(analyzeRelationship(hpA, hpB, selectedRelationType));
      } catch (err) {
        console.error(err);
        setError('Analysis Error');
      } finally {
        setLoading(false);
      }
    }, 1200);
  };

  const selectedPersonA = profiles.find(p => p.id === personAId);
  const selectedPersonB = profiles.find(p => p.id === personBId);
  const gradeInfo = result ? GRADE_CONFIG[result.grade] : null;

  // ── Empty State ──
  if (profiles.length < 2) {
    return (
      <main className="min-h-screen relative overflow-hidden flex items-center justify-center px-6 pb-32">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 bg-surface border border-border-color">
            <Users className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-foreground">{t('compat.noProfiles')}</h2>
          <p className="text-lg mb-10 text-secondary leading-relaxed">{t('compat.noProfilesDesc')}</p>
          <div className="flex flex-col gap-4">
            <Link href="/my-saju/add" className="w-full py-5 rounded-2xl bg-primary text-white font-bold text-lg shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3">
              <UserPlus className="w-6 h-6" /> {t('compat.addProfile')}
            </Link>
            <button onClick={() => router.back()} className="w-full py-5 rounded-2xl bg-surface text-foreground font-bold text-lg border border-border-color hover:bg-white/5 transition-all">
              {t('common.back')}
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden pb-32">
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-16">
          <button onClick={() => router.back()} className="flex items-center gap-3 text-lg font-bold text-secondary hover:text-foreground transition-all">
            <ArrowLeft className="w-6 h-6" /> {t('common.back')}
          </button>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-black text-foreground italic tracking-tighter uppercase">{t('compat.title')}</h1>
            <p className="text-lg mt-2 text-secondary">{t('compat.desc')}</p>
          </div>
          <JellyBalance onClick={() => router.push('/shop')} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* ── Profile Picker (Card News Style) ── */}
          <div className="space-y-10">
            {/* Person A Selector */}
            <div className="space-y-4">
              <label className="text-xl font-bold text-secondary flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">1</span>
                {t('compat.person1')}
              </label>
              <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPersonAId(p.id)}
                    className={`flex-shrink-0 w-48 p-6 rounded-3xl border transition-all text-left relative group ${personAId === p.id
                      ? 'bg-primary border-primary shadow-xl scale-105'
                      : 'bg-surface border-border-color hover:border-primary/50'
                      }`}
                  >
                    <div className={`p-3 rounded-2xl mb-4 w-fit ${personAId === p.id ? 'bg-white/20' : 'bg-background'}`}>
                      <User className={`w-6 h-6 ${personAId === p.id ? 'text-white' : 'text-primary'}`} />
                    </div>
                    <p className={`text-xl font-black mb-1 ${personAId === p.id ? 'text-white' : 'text-foreground'}`}>{p.name}</p>
                    <p className={`text-sm ${personAId === p.id ? 'text-white/70' : 'text-secondary'}`}>{t(`common.relation.${p.relationship}`)}</p>
                    {personAId === p.id && (
                      <motion.div layoutId="checkA" className="absolute top-4 right-4 text-white">
                        <Zap className="w-5 h-5 fill-current" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Person B Selector */}
            <div className="space-y-4">
              <label className="text-xl font-bold text-secondary flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm">2</span>
                {t('compat.person2')}
              </label>
              <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPersonBId(p.id)}
                    className={`flex-shrink-0 w-48 p-6 rounded-3xl border transition-all text-left relative group ${personBId === p.id
                      ? 'bg-purple-600 border-purple-600 shadow-xl scale-105'
                      : 'bg-surface border-border-color hover:border-purple-500/50'
                      }`}
                  >
                    <div className={`p-3 rounded-2xl mb-4 w-fit ${personBId === p.id ? 'bg-white/20' : 'bg-background'}`}>
                      <User className={`w-6 h-6 ${personBId === p.id ? 'text-white' : 'text-purple-400'}`} />
                    </div>
                    <p className={`text-xl font-black mb-1 ${personBId === p.id ? 'text-white' : 'text-foreground'}`}>{p.name}</p>
                    <p className={`text-sm ${personBId === p.id ? 'text-white/70' : 'text-secondary'}`}>{t(`common.relation.${p.relationship}`)}</p>
                    {personBId === p.id && (
                      <motion.div layoutId="checkB" className="absolute top-4 right-4 text-white">
                        <Heart className="w-5 h-5 fill-current" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Relationship Type Preset ── */}
          <div className="bg-surface rounded-4xl p-8 border border-border-color">
            <div className="flex items-center gap-3 mb-8">
              <Star className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold text-foreground">{t('compat.relationType')}</h3>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {RELATIONSHIP_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setSelectedRelationType(preset.value)}
                  className={`py-6 rounded-3xl text-center transition-all border ${selectedRelationType === preset.value
                    ? 'bg-primary border-primary text-white shadow-xl scale-105'
                    : 'bg-background border-border-color text-secondary hover:border-primary/30'
                    }`}
                >
                  <span className="text-3xl block mb-2">{preset.icon}</span>
                  <span className="text-sm font-bold">{t(preset.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Error ── */}
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-4 text-lg font-bold">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" /> {error}
            </motion.div>
          )}

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={loading || !personAId || !personBId}
            className="w-full py-8 rounded-4xl text-white font-black text-2xl tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, var(--primary), #8b5cf6)' }}
          >
            {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : <><Zap className="w-8 h-8" /> {t('compat.analyze')}</>}
          </button>
        </form>

        {/* ══════ Results ══════ */}
        <AnimatePresence>
          {result && gradeInfo && (
            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', damping: 20 }} className="mt-20 space-y-10">
              <div className="bg-surface rounded-5xl p-16 text-center border border-border-color relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-purple-500" />
                <p className="text-lg font-bold text-secondary mb-10 tracking-widest uppercase">{t('compat.score')}</p>

                <div className="relative w-64 h-64 mx-auto mb-12">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" fill="none" stroke="var(--border-color)" strokeWidth="6" />
                    <motion.circle
                      cx="50" cy="50" r="44" fill="none"
                      stroke="var(--primary)" strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 44}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - result.score / 100) }}
                      transition={{ duration: 2, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-8xl font-black text-foreground italic tracking-tighter leading-none">{animatedScore}</span>
                    <span className="text-xl font-bold text-secondary mt-2">%</span>
                  </div>
                </div>

                <div className={`inline-flex items-center gap-3 px-8 py-3 rounded-full text-xl font-black border mb-10 ${gradeInfo.bgClass} ${gradeInfo.colorClass}`}>
                  <span>{gradeInfo.icon}</span> <span>{result.grade.toUpperCase()}</span>
                </div>

                <h2 className="text-4xl font-black text-foreground mb-6 leading-tight whitespace-pre-line">{result.message}</h2>
                <p className="text-xl leading-relaxed text-secondary max-w-2xl mx-auto font-medium">{result.chemistry}</p>
              </div>

              {/* ── Detail Cards ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface rounded-4xl p-10 border border-border-color">
                  <div className="flex items-center gap-4 mb-6">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    <span className="text-lg font-bold text-secondary">{t('compat.powerDynamic')}</span>
                  </div>
                  <p className="text-2xl font-black text-foreground">{result.powerDynamic}</p>
                </div>

                <div className="bg-surface rounded-4xl p-10 border border-border-color">
                  <div className="flex items-center gap-4 mb-6">
                    <MessageCircle className="w-6 h-6 text-primary" />
                    <span className="text-lg font-bold text-secondary">{t('compat.advice')}</span>
                  </div>
                  <p className="text-xl font-bold text-foreground leading-relaxed">{result.advice}</p>
                </div>

                {result.tension && (
                  <div className="bg-rose-500/5 rounded-4xl p-10 border border-rose-500/20 md:col-span-2">
                    <div className="flex items-center gap-4 mb-6">
                      <AlertTriangle className="w-6 h-6 text-rose-500" />
                      <span className="text-lg font-bold text-rose-500">{t('compat.tension')}</span>
                    </div>
                    <p className="text-xl font-bold text-foreground leading-relaxed">{result.tension}</p>
                  </div>
                )}
              </div>

              {/* ── Action Items ── */}
              {result.actionItems && result.actionItems.length > 0 && (
                <div className="bg-surface rounded-4xl p-10 border border-border-color">
                  <div className="flex items-center gap-4 mb-10">
                    <Sparkles className="w-6 h-6 text-primary" />
                    <span className="text-xl font-bold text-foreground">{t('compat.actionItems')}</span>
                  </div>
                  <div className="space-y-6">
                    {result.actionItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-6 p-6 rounded-3xl bg-background border border-border-color">
                        <span className="w-12 h-12 rounded-2xl bg-primary text-white text-xl font-black flex items-center justify-center flex-shrink-0 shadow-lg">{i + 1}</span>
                        <p className="text-lg font-bold text-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* ── Energy Synergy (Element Comparison) ── */}
              {sajuA && sajuB && (
                <div className="bg-surface rounded-4xl p-10 border border-border-color">
                  <div className="flex items-center gap-4 mb-10">
                    <TrendingUp className="w-6 h-6 text-cyan-400" />
                    <span className="text-xl font-black text-foreground italic uppercase tracking-wider">오행 에너지 시너지 (Energy Synergy)</span>
                  </div>
                  <div className="flex flex-col md:flex-row items-center justify-around gap-12">
                    <div className="flex flex-col items-center gap-6 group">
                      <div className="relative">
                        <ElementPolygon
                          scores={[sajuA.elements.scores.목, sajuA.elements.scores.화, sajuA.elements.scores.토, sajuA.elements.scores.금, sajuA.elements.scores.수]}
                          size={180}
                        />
                      </div>
                      <span className="text-sm font-black text-secondary tracking-widest">{selectedPersonA?.name}</span>
                    </div>

                    <div className="hidden md:flex flex-col items-center gap-4 py-8">
                      <Zap className="w-8 h-8 text-amber-500 animate-pulse" />
                      <div className="h-24 w-px bg-gradient-to-b from-transparent via-border-color to-transparent" />
                    </div>

                    <div className="flex flex-col items-center gap-6 group">
                      <div className="relative">
                        <ElementPolygon
                          scores={[sajuB.elements.scores.목, sajuB.elements.scores.화, sajuB.elements.scores.토, sajuB.elements.scores.금, sajuB.elements.scores.수]}
                          size={180}
                        />
                      </div>
                      <span className="text-sm font-black text-secondary tracking-widest">{selectedPersonB?.name}</span>
                    </div>
                  </div>
                  <div className="mt-12 p-6 bg-cyan-500/5 border border-cyan-500/15 rounded-3xl text-center">
                    <p className="text-sm text-secondary leading-relaxed font-medium">
                      서로의 부족한 오행을 채워주고 넘치는 기운을 조절하면 관계의 밸런스가 완벽해집니다.
                    </p>
                  </div>
                </div>
              )}

              {/* ── Action Buttons ── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button onClick={() => {
                  navigator.clipboard.writeText(`[Compatibility] ${selectedPersonA?.name} ♥ ${selectedPersonB?.name} : ${result.score}%`);
                  alert(locale === 'ko' ? '복사되었습니다!' : 'Copied!');
                }} className="py-6 rounded-3xl font-black text-lg bg-surface text-foreground border border-border-color hover:bg-white/5 transition-all flex items-center justify-center gap-3">
                  <Copy className="w-6 h-6" /> {t('compat.copyResult')}
                </button>
                <button onClick={() => { setResult(null); setPersonAId(''); setPersonBId(''); }} className="py-6 rounded-3xl font-black text-lg bg-surface text-foreground border border-border-color hover:bg-white/5 transition-all flex items-center justify-center gap-3">
                  <RefreshCw className="w-6 h-6" /> {t('compat.reAnalyze')}
                </button>
                <Link href={`/relationship/${personBId}`} className="py-6 rounded-3xl font-black text-lg bg-primary text-white shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3">
                  {t('compat.viewDetail')} <ChevronRight className="w-6 h-6" />
                </Link>
              </div>

              <Link href={`/relationship/${personBId}/vs`} className="block bg-surface border border-border-color p-8 rounded-4xl text-center text-xl font-black text-primary hover:bg-primary/5 transition-all active:scale-95">
                {t('compat.vsMode')}
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function CompatibilityPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center space-y-6">
          <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
          <p className="text-slate-500 font-black tracking-widest uppercase text-xs">Loading Harmony Compass...</p>
        </div>
      </div>
    }>
      <CompatibilityContent />
    </Suspense>
  );
}
