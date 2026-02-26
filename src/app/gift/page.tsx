"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles, Send, Mail } from "lucide-react";

/**
 * [gem-frontend] Glassmorphism & Micro-interaction 적용
 * [gem-architect] 상태 분리 및 서버 연동 스코프 명확화
 */
export default function GiftPage() {
  const [formData, setFormData] = useState({ name: "", birthDate: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Call /api/gift/send
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

      if (!res.ok) throw new Error('API Error');
      setSuccess(true);
    } catch (error) {
      console.error(error);
      alert('발송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8 relative"
      >
        <div className="absolute -inset-4 bg-purple-500/20 blur-3xl -z-10 rounded-full" />
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 mb-4 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
          <Gift className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-black bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
          익명 사주 선물하기
        </h1>
        <p className="text-slate-400 mt-2 text-sm flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          친구의 생일로 진짜 본능을 폭로하세요
        </p>
      </motion.div>

      {/* Form Container (Glassmorphism) */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
        className="w-full max-w-sm bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <AnimatePresence mode="wait">
          {!success ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSubmit}
              className="space-y-5 relative z-10"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 ml-1">받는 사람 이름 (또는 닉네임)</label>
                <input
                  required
                  type="text"
                  placeholder="예: 홍길동"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 ml-1">받는 사람 생년월일</label>
                <input
                  required
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all [color-scheme:dark]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 ml-1 whitespace-nowrap overflow-hidden text-ellipsis">결과지를 받을 이메일 (친구가 모르게 전달)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    required
                    type="email"
                    placeholder="friend@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(219,39,119,0.4)] transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none group"
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    <span>결과지 익명 발송 (300 젤리)</span>
                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-10 text-center relative z-10 flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15, delay: 0.2 }}
                  className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <Send className="w-6 h-6 text-white translate-x-0.5 -translate-y-0.5" />
                </motion.div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">발송 완료!</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                성공적으로 사주 분석을 완료하고<br />
                지정하신 이메일로 결과를 전송했습니다.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors px-6 py-2 rounded-full border border-purple-500/30 hover:bg-purple-500/10"
              >
                다른 친구에게 또 보내기
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
