'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Copy, Share2, ChevronLeft, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { calculateSaju } from '@/lib/saju';
import { getArchetypeByCode } from '@/lib/archetypes';

type Step = 'input' | 'preview' | 'share';

export default function GiftPage() {
  const [step, setStep] = useState<Step>('input');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [giftData, setGiftData] = useState<{
    archetype: any;
    giftUrl: string;
    shortCode: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);

    if (!y || !m || !d || y < 1900 || y > 2010 || m < 1 || m > 12 || d < 1 || d > 31) {
      setError('올바른 생년월일을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    try {
      const birthDate = new Date(y, m - 1, d);
      const saju = calculateSaju(birthDate);
      const archetype = getArchetypeByCode(saju.code, saju.ageGroup);

      // Generate a short code for sharing (client-side for now)
      const shortCode = btoa(`${y}-${m}-${d}`).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
      const giftUrl = `${window.location.origin}/?gift=${shortCode}&name=${encodeURIComponent(recipientName || '친구')}`;

      setGiftData({ archetype, giftUrl, shortCode });
      setStep('preview');
    } catch (err) {
      setError('사주 계산 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!giftData) return;
    try {
      await navigator.clipboard.writeText(giftData.giftUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('복사 실패 — 링크를 직접 복사해주세요.');
    }
  };

  const handleKakaoShare = () => {
    if (!giftData) return;
    const w = window as any;
    if (w.Kakao?.Share) {
      w.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `🎁 ${recipientName || '친구'}에게 사주 선물`,
          description: `비밀 결과: ${giftData.archetype.animal_name} — 링크를 눌러 확인해봐!`,
          imageUrl: `${window.location.origin}/og-image.png`,
          link: {
            mobileWebUrl: giftData.giftUrl,
            webUrl: giftData.giftUrl,
          },
        },
        buttons: [{ title: '선물 확인하기', link: { mobileWebUrl: giftData.giftUrl, webUrl: giftData.giftUrl } }],
      });
    } else {
      handleCopy();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950">
      <div className="max-w-lg mx-auto px-4 py-8">

        <AnimatePresence mode="wait">

          {/* Step 1: Input */}
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-8">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                  className="text-6xl mb-4"
                >
                  🎁
                </motion.div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  익명으로 선물하기
                </h1>
                <p className="text-slate-400 text-sm">
                  친구의 생년월일을 입력하면<br />
                  사주 결과 링크를 만들어 드려요 🐾
                </p>
              </div>

              <form onSubmit={handleGenerate} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 space-y-5">
                {/* Recipient name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    받는 사람 이름 <span className="text-slate-500 font-normal">(선택)</span>
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="예: 지연이, 오빠, 상사 ㅋ"
                    maxLength={20}
                  />
                </div>

                {/* Birth date */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">친구 생년월일</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-colors text-center"
                      placeholder="년도"
                      min={1900}
                      max={2010}
                      required
                    />
                    <input
                      type="number"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-colors text-center"
                      placeholder="월"
                      min={1}
                      max={12}
                      required
                    />
                    <input
                      type="number"
                      value={day}
                      onChange={(e) => setDay(e.target.value)}
                      className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-colors text-center"
                      placeholder="일"
                      min={1}
                      max={31}
                      required
                    />
                  </div>
                </div>

                {/* Gift message */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    선물 메시지 <span className="text-slate-500 font-normal">(선택)</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-colors resize-none text-sm"
                    placeholder="예: 너 궁금해서 봐봤는데 ㅋㅋ 우리 궁합 어때?"
                    maxLength={100}
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !year || !month || !day}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold hover:from-pink-600 hover:to-purple-600 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> 사주 분석 중...</>
                  ) : (
                    <><Gift className="w-5 h-5" /> 선물 링크 만들기</>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* Step 2: Preview & Share */}
          {step === 'preview' && giftData && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setStep('input')}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-400" />
                </button>
                <h2 className="text-xl font-bold text-white">선물 준비 완료! 🎉</h2>
              </div>

              {/* Preview Card */}
              <div className="bg-gradient-to-br from-purple-900/60 to-pink-900/40 border border-purple-400/20 rounded-2xl p-6 mb-6 text-center">
                <p className="text-slate-400 text-sm mb-1">
                  {recipientName || '친구'}의 사주 결과
                </p>
                <p className="text-4xl mb-2">{giftData.archetype.emoji || '🐾'}</p>
                <h3 className="text-2xl font-bold text-white mb-1">{giftData.archetype.animal_name}</h3>
                <p className="text-slate-300 text-sm mb-4">{giftData.archetype.displaySecretPreview}</p>
                {message && (
                  <div className="bg-white/5 rounded-xl px-4 py-3 text-slate-300 text-sm italic">
                    &ldquo;{message}&rdquo;
                  </div>
                )}
              </div>

              {/* Link */}
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 mb-4">
                <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <p className="text-slate-400 text-xs flex-1 truncate">{giftData.giftUrl}</p>
              </div>

              {/* Share buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleKakaoShare}
                  className="w-full py-4 rounded-xl bg-yellow-400 text-black font-bold hover:bg-yellow-500 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 shadow-lg"
                >
                  💬 카카오톡으로 선물하기
                </button>

                <button
                  onClick={handleCopy}
                  className="w-full py-4 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <><CheckCircle2 className="w-5 h-5 text-green-400" /> 복사됨!</>
                  ) : (
                    <><Copy className="w-5 h-5" /> 링크 복사</>
                  )}
                </button>

                <button
                  onClick={() => {
                    const text = `🎁 ${recipientName || '친구'}에게 사주 선물!\n${message ? `"${message}"\n` : ''}👉 ${giftData.giftUrl}`;
                    window.open(
                      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
                      '_blank',
                      'width=550,height=420'
                    );
                  }}
                  className="w-full py-3 rounded-xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 font-medium hover:bg-cyan-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" /> 트위터에 공유
                </button>
              </div>

              <p className="text-center text-xs text-slate-500 mt-6">
                링크를 받은 친구는 자신의 사주 결과를 바로 확인할 수 있어요
              </p>

              <div className="mt-4 text-center">
                <Link href="/" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                  나도 내 사주 보기 →
                </Link>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}
