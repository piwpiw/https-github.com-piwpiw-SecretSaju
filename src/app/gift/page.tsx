"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Send, Mail, ArrowLeft, ShieldCheck } from "lucide-react";
import { useLocale } from "@/lib/app/i18n";
import { useRouter } from "next/navigation";
import AuthRequiredNotice from "@/components/auth/AuthRequiredNotice";
import { useWallet } from "@/components/payment/WalletProvider";
import JellyBalance from "@/components/shop/JellyBalance";
import JellyShopModal from "@/components/shop/JellyShopModal";
import { useAuthStatus } from "@/lib/auth/auth-status";

export default function GiftPage() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const { isAuthenticated } = useAuthStatus();
  const { consumeChuru, churu, isAdmin } = useWallet();
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", birthDate: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  // `isSubmitting` state (and the derived `disabled` prop) only settles after a
  // re-render, so rapid same-tick clicks slip past it and fire N requests —
  // each one deducting jellies. This ref closes the window synchronously.
  const submitLockRef = useRef(false);
  const hasName = formData.name.trim().length > 1;
  const hasBirth = formData.birthDate.trim().length > 0;
  const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isReady = hasName && hasBirth && hasEmail;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || submitLockRef.current) return;
    if (!isReady) return;
    setSubmitError("");

    if (!isAuthenticated && !isAdmin) {
      setSubmitError(locale === 'ko' ? '선물 발송과 젤리 차감은 로그인 후에만 진행됩니다.' : 'Please log in before sending a gift.');
      return;
    }

    if (!isAdmin && churu < 3) {
      setIsShopModalOpen(true);
      return;
    }

    // Claim the lock before the first side effect (jelly deduction).
    submitLockRef.current = true;

    const consumed = consumeChuru(3);
    if (!consumed) {
      submitLockRef.current = false;
      setSubmitError(locale === 'ko' ? "젤리 차감에 실패했습니다. 잠시 후 다시 시도해 주세요." : "Failed to deduct Jelly.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/gift/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetName: formData.name,
          targetBirthDate: formData.birthDate,
          targetEmail: formData.email,
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        const generic = locale === 'ko'
          ? '발송에 실패했습니다. 잠시 후 다시 시도해 주세요.'
          : 'Error sending gift. Please try again later.';

        if (res.status === 401 || res.status === 403) {
          throw new Error(locale === 'ko'
            ? '로그인 세션이 만료되었습니다. 다시 로그인한 뒤 시도해 주세요.'
            : 'Your session has expired. Please log in again.');
        }

        // The API emits internal English strings ("Unauthorized: No token
        // provided", "Internal server error"). Only pass a server message
        // through when it is user-facing copy, i.e. already written in Korean.
        const serverMessage = typeof payload?.error === 'string' ? payload.error.trim() : '';
        throw new Error(/[가-힣]/.test(serverMessage) ? serverMessage : generic);
      }

      setSuccess(true);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (locale === 'ko' ? '발송에 실패했습니다. 잠시 후 다시 시도해 주세요.' : 'Error sending gift. Please try again later.');
      setSubmitError(message);
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center pt-24 pb-40 px-6">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-4xl mx-auto mb-20 relative z-10"
      >
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border-color">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-3 text-lg font-bold text-muted hover:text-foreground transition-all"
          >
            <ArrowLeft className="w-6 h-6" />
            {t('common.back')}
          </button>
          <JellyBalance />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="w-32 h-32 rounded-4xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-pink-500/20 transform rotate-3">
            <Gift className="w-16 h-16 text-white" />
          </div>
          <div>
            <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-flex px-4 py-2 rounded-full mb-4 bg-surface border border-border-color">
              <span className="text-sm font-bold text-pink-500 tracking-widest leading-none uppercase">
                {locale === 'ko' ? '프리미엄 선물' : 'PREMIUM GIFT'}
              </span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter uppercase mb-4">
              {locale === 'ko' ? '행운' : 'Destiny'} <span className="text-pink-500">{locale === 'ko' ? '선물' : 'Gift'}</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted font-medium opacity-70">
              {locale === 'ko'
                ? '특별한 사람에게 운세 선물을 보내보세요.'
                : 'Gift a comprehensive destiny report to someone special.'}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-2xl bg-surface rounded-5xl border border-border-color p-6 sm:p-9 md:p-16 relative shadow-2xl overflow-hidden z-10"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 blur-3xl rounded-full opacity-50" />

        {!isAuthenticated && !isAdmin ? (
          <div className="relative z-10 mb-6">
            <AuthRequiredNotice
              compact
              nextPath="/gift"
              title="선물 발송은 로그인 후 사용할 수 있습니다."
              detail="결제, 젤리 차감, 발송 기록을 안전하게 관리하려면 로그인 세션이 필요합니다."
            />
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          {!success ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              onSubmit={handleSubmit}
              className="space-y-12 relative z-10"
            >
              <div className="space-y-6">
                <label className="text-xl font-bold flex items-center gap-4 text-muted">
                  <span className="w-2 h-8 rounded-full bg-pink-500" />
                  {locale === 'ko' ? '받는 사람 이름' : 'Recipient Name'}
                </label>
                <input
                  required
                  type="text"
                  aria-required="true"
                  aria-invalid={formData.name.length > 0 && !hasName}
                  aria-describedby="gift-name-help"
                  placeholder={locale === 'ko' ? '이름을 입력해 주세요' : 'Enter their name'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-background border-2 border-border-color rounded-3xl px-8 py-6 text-foreground font-black text-3xl focus:outline-none focus:border-pink-500 transition-all placeholder:text-neutral-700"
                />
                <p id="gift-name-help" className="text-sm text-slate-400">2글자 이상 입력해 주세요.</p>
              </div>

              <div className="space-y-6">
                <label className="text-xl font-bold flex items-center gap-4 text-muted">
                  <span className="w-2 h-8 rounded-full bg-pink-500" />
                  {locale === 'ko' ? '생년월일' : 'Birthdate'}
                </label>
                <input
                  required
                  type="date"
                  min="1900-01-01"
                  max="2100-12-31"
                  aria-label="받는 분 생년월일"
                  aria-required="true"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full bg-background border-2 border-border-color rounded-3xl px-8 py-6 text-foreground font-black text-2xl focus:outline-none focus:border-pink-500 transition-all [color-scheme:dark]"
                />
              </div>

              <div className="space-y-6">
                <label className="text-xl font-bold flex items-center gap-4 text-muted">
                  <span className="w-2 h-8 rounded-full bg-pink-500" />
                  {locale === 'ko' ? '이메일' : 'Email Address'}
                </label>
                <div className="relative group/input">
                  <Mail className="absolute left-8 top-1/2 -translate-y-1/2 w-8 h-8 text-neutral-600 group-focus-within/input:text-pink-500 transition-colors" />
                  <input
                    required
                    type="email"
                    aria-required="true"
                    aria-invalid={formData.email.length > 0 && !hasEmail}
                    aria-describedby="gift-email-help"
                    placeholder="friend@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-background border-2 border-border-color rounded-3xl pl-20 pr-8 py-6 text-foreground font-black text-2xl focus:outline-none focus:border-pink-500 transition-all placeholder:text-neutral-700"
                  />
                  {formData.email.length > 0 && !hasEmail ? (
                    <p id="gift-email-help" className="text-sm text-rose-300 mt-2">올바른 이메일 형식을 입력해 주세요.</p>
                  ) : (
                    <p id="gift-email-help" className="text-sm text-slate-500 mt-2">이메일은 영문+숫자 + @ + 도메인 형식이 필요합니다.</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !isReady || (!isAuthenticated && !isAdmin)}
                  aria-busy={isSubmitting}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-3xl py-10 rounded-4xl flex items-center justify-center gap-6 hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-pink-500/30 transition-all disabled:opacity-30 tracking-widest uppercase mt-4"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      <span>{locale === 'ko' ? '선물 보내기' : 'SEND GIFT'}</span>
                      <Send className="w-8 h-8 group-hover:translate-x-3 group-hover:-translate-y-3 transition-transform duration-500" />
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-2 mt-4 text-emerald-400 font-bold text-base bg-emerald-500/10 py-3 rounded-2xl">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-sm">J</span>
                  {locale === 'ko' ? '젤리 3개 소모' : 'Consumes 3 Jellies'}
                </div>
              </div>

              {submitError && !isSubmitting && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 px-4 py-3 rounded-xl text-center"
                >
                  {submitError}
                </motion.p>
              )}
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-10 text-center relative z-10 flex flex-col items-center"
            >
              <div className="w-40 h-40 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border-2 border-emerald-500/30">
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 12, delay: 0.2 }}
                  className="w-24 h-24 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.4)]"
                >
                  <Send className="w-12 h-12 text-white" />
                </motion.div>
              </div>
              <h3 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-6 uppercase">
                {locale === 'ko' ? '발송 완료' : 'Transmission Complete'}
              </h3>
              <p className="text-2xl text-muted mb-8 font-medium">
                {locale === 'ko'
                  ? '선물이 성공적으로 등록되었습니다.'
                  : 'The gift has been successfully registered.'}
              </p>
              <button
                onClick={() => {
                  setSuccess(false);
                  setFormData({ name: '', birthDate: '', email: '' });
                }}
                className="w-full py-8 rounded-3xl font-black text-2xl transition-all border-2 border-border-color bg-background text-foreground hover:border-pink-500 hover:text-pink-500 uppercase tracking-widest"
              >
                {locale === 'ko' ? '다시 보내기' : 'Send Another'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="mt-24 flex items-center gap-4 px-8 py-4 rounded-full bg-surface border border-border-color shadow-sm opacity-50 hover:opacity-100 transition-opacity">
        <ShieldCheck className="w-6 h-6 text-emerald-500" />
        <span className="text-sm font-black text-foreground tracking-widest break-keep">암호화된 선물 전달</span>
      </div>

      <JellyShopModal
        isOpen={isShopModalOpen}
        onClose={() => setIsShopModalOpen(false)}
        highlightTier="smart"
      />
    </main>
  );
}
