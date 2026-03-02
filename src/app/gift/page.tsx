"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Send, Mail, ArrowLeft, ShieldCheck } from "lucide-react";
import { useLocale } from "@/lib/i18n";

export default function GiftPage() {
  const { t, locale } = useLocale();
  const [formData, setFormData] = useState({ name: "", birthDate: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
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
        throw new Error(
          payload?.error || (locale === 'ko'
            ? '발송에 실패했습니다. 잠시 후 다시 시도해 주세요.'
            : 'Error sending gift. Please try again later.')
        );
      }

      setSuccess(true);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (locale === 'ko' ? '발송에 실패했습니다. 잠시 후 다시 시도해 주세요.' : 'Error sending gift. Please try again later.');
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center pt-24 pb-40 px-6">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center md:text-left w-full max-w-4xl mx-auto mb-20 border-b border-border-color pb-16 relative z-10"
      >
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-3 text-lg font-bold text-secondary hover:text-foreground transition-all mb-8 mx-auto md:mx-0"
        >
          <ArrowLeft className="w-6 h-6" />
          {t('common.back')}
        </button>

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
            <h1 className="text-5xl md:text-7xl font-black text-foreground italic tracking-tighter uppercase mb-4">
              {locale === 'ko' ? '행운' : 'Destiny'} <span className="text-pink-500 italic">{locale === 'ko' ? '선물' : 'Gift'}</span>
            </h1>
            <p className="text-xl md:text-2xl text-secondary font-medium italic opacity-70">
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
        className="w-full max-w-2xl bg-surface rounded-5xl border border-border-color p-12 md:p-16 relative shadow-2xl overflow-hidden z-10"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 blur-3xl rounded-full opacity-50" />

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
                <label className="text-xl font-bold flex items-center gap-4 text-secondary">
                  <span className="w-2 h-8 rounded-full bg-pink-500" />
                  {locale === 'ko' ? '받는 사람 이름' : 'Recipient Name'}
                </label>
                <input
                  required
                  type="text"
                  placeholder={locale === 'ko' ? '이름을 입력해 주세요' : 'Enter their name'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-background border-2 border-border-color rounded-3xl px-8 py-6 text-foreground font-black text-3xl focus:outline-none focus:border-pink-500 transition-all placeholder:text-neutral-700 italic"
                />
              </div>

              <div className="space-y-6">
                <label className="text-xl font-bold flex items-center gap-4 text-secondary">
                  <span className="w-2 h-8 rounded-full bg-pink-500" />
                  {locale === 'ko' ? '생년월일' : 'Birthdate'}
                </label>
                <input
                  required
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full bg-background border-2 border-border-color rounded-3xl px-8 py-6 text-foreground font-black text-2xl focus:outline-none focus:border-pink-500 transition-all [color-scheme:dark] italic"
                />
              </div>

              <div className="space-y-6">
                <label className="text-xl font-bold flex items-center gap-4 text-secondary">
                  <span className="w-2 h-8 rounded-full bg-pink-500" />
                  {locale === 'ko' ? '이메일' : 'Email Address'}
                </label>
                <div className="relative group/input">
                  <Mail className="absolute left-8 top-1/2 -translate-y-1/2 w-8 h-8 text-neutral-600 group-focus-within/input:text-pink-500 transition-colors" />
                  <input
                    required
                    type="email"
                    placeholder="friend@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-background border-2 border-border-color rounded-3xl pl-20 pr-8 py-6 text-foreground font-black text-2xl focus:outline-none focus:border-pink-500 transition-all placeholder:text-neutral-700 italic"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
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

              {submitError && (
                <p className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 px-4 py-3 rounded-xl text-center">
                  {submitError}
                </p>
              )}
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-16 text-center relative z-10 flex flex-col items-center"
            >
              <div className="w-40 h-40 bg-emerald-500/10 rounded-full flex items-center justify-center mb-10 border-2 border-emerald-500/30">
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 12, delay: 0.2 }}
                  className="w-24 h-24 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.4)]"
                >
                  <Send className="w-12 h-12 text-white" />
                </motion.div>
              </div>
              <h3 className="text-4xl md:text-5xl font-black italic tracking-tight text-foreground mb-6 uppercase">
                {locale === 'ko' ? '발송 완료' : 'Transmission Complete'}
              </h3>
              <p className="text-2xl text-secondary mb-12 font-medium">
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
        <span className="text-sm font-black text-foreground uppercase tracking-widest">Encrypted Destiny Gift Protocol</span>
      </div>
    </main>
  );
}
