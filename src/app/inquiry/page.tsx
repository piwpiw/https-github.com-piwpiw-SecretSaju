"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare, AlertTriangle, RefreshCw, CheckCircle2 } from "lucide-react";

type Category = "error" | "feedback" | "request" | "refund";

type Step = "form" | "done";

const CATEGORY = {
  error: "오류 제보",
  feedback: "서비스 제안",
  request: "기타 문의",
  refund: "환불/결제",
};

export default function InquiryPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [category, setCategory] = useState<Category>("feedback");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [touched, setTouched] = useState({
    subject: false,
    message: false,
  });

  const isSubjectValid = subject.trim().length > 0 && subject.trim().length <= 80;
  const isMessageValid = message.trim().length >= 10;
  const isEmailValid = email.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isSubmitReady = isSubjectValid && isMessageValid && isEmailValid;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isSubmitReady) {
      setFieldError("카테고리/제목/문의 내용을 다시 확인해 주세요.");
      setTouched({
        subject: true,
        message: true,
      });
      return;
    }

    setIsSubmitting(true);
    setError("");
    setFieldError("");

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          subject,
          message,
          email,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "문의 제출에 실패했습니다.");
      }
      setStep("done");
    } catch (err: any) {
      setError(err.message || "문의 제출 중 문제가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden pb-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.14),transparent_50%)]" />
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <button onClick={() => router.back()} className="mb-8 inline-flex items-center gap-2 text-slate-300 hover:text-white">
          <ArrowLeft className="w-5 h-5" /> 뒤로
        </button>

        {step === "form" ? (
          <form onSubmit={submit} className="bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 md:p-12 space-y-6">
            <h1 className="text-4xl font-black italic">문의하기</h1>
            <p className="text-slate-300">요청 성격에 맞는 항목을 고른 뒤 문의를 남겨 주세요.</p>

            <fieldset className="grid grid-cols-2 gap-3" aria-describedby="category-help">
              <button type="button" onClick={() => setCategory("feedback")} className={`px-4 py-3 rounded-full border ${category === "feedback" ? "border-blue-300 bg-blue-500/20" : "border-white/10"}`}> 
                <MessageSquare className="inline w-4 h-4 mr-2" /> 서비스 제안
              </button>
              <button type="button" onClick={() => setCategory("error")} className={`px-4 py-3 rounded-full border ${category === "error" ? "border-rose-300 bg-rose-500/20" : "border-white/10"}`}>
                <AlertTriangle className="inline w-4 h-4 mr-2" /> 오류 제보
              </button>
              <button type="button" onClick={() => setCategory("request")} className={`px-4 py-3 rounded-full border ${category === "request" ? "border-emerald-300 bg-emerald-500/20" : "border-white/10"}`}>
                <MessageSquare className="inline w-4 h-4 mr-2" /> 기타 문의
              </button>
              <button type="button" onClick={() => setCategory("refund")} className={`px-4 py-3 rounded-full border ${category === "refund" ? "border-violet-300 bg-violet-500/20" : "border-white/10"}`}>
                <RefreshCw className="inline w-4 h-4 mr-2" /> 환불/결제
              </button>
            </fieldset>
            <p id="category-help" className="text-xs text-slate-400 -mt-2">
              원하는 상담 유형을 선택하면 담당 라우팅이 달라집니다.
            </p>

            <div>
              <label className="block text-sm text-slate-300 mb-2" htmlFor="inquiry-subject">제목</label>
              <input
                id="inquiry-subject"
                maxLength={80}
                aria-required="true"
                aria-invalid={!isSubjectValid && touched.subject}
                aria-describedby={!isSubjectValid && touched.subject ? "subject-feedback" : undefined}
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setTouched((prev) => ({ ...prev, subject: true }));
                }}
                className="w-full px-4 py-4 rounded-2xl bg-slate-950 border border-white/10"
                required
              />
              {!isSubjectValid && touched.subject ? (
                <p id="subject-feedback" className="mt-2 text-xs text-rose-300">
                  제목은 1~80자로 입력해 주세요.
                </p>
              ) : null}
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2" htmlFor="inquiry-message">문의 내용</label>
              <textarea
                id="inquiry-message"
                aria-required="true"
                aria-invalid={!isMessageValid && touched.message}
                aria-describedby={!isMessageValid && touched.message ? "message-feedback" : undefined}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setTouched((prev) => ({ ...prev, message: true }));
                }}
                rows={6}
                className="w-full px-4 py-4 rounded-2xl bg-slate-950 border border-white/10"
                required
              />
              {!isMessageValid && touched.message ? (
                <p id="message-feedback" className="mt-2 text-xs text-rose-300">
                  문의 내용은 최소 10자 이상 입력해 주세요.
                </p>
              ) : null}
              <p className="text-xs text-slate-500 mt-2">현재 글자 수: {message.length}</p>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2" htmlFor="inquiry-email">이메일 (선택)</label>
              <input
                id="inquiry-email"
                type="email"
                aria-invalid={email.length > 0 && !isEmailValid}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="답변 받을 이메일"
                className="w-full px-4 py-4 rounded-2xl bg-slate-950 border border-white/10"
              />
              {email.length > 0 && !isEmailValid ? (
                <p className="mt-2 text-xs text-rose-300">
                  올바른 이메일 형식을 입력해 주세요.
                </p>
              ) : null}
            </div>

            {fieldError ? <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-100 text-sm">{fieldError}</div> : null}
            {error ? <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/50 text-rose-100 text-sm">{error}</div> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              aria-label="문의 제출"
              className="w-full py-4 rounded-full bg-blue-500 text-white font-black uppercase tracking-[0.2em] disabled:opacity-60"
            >
              {isSubmitting ? "전송 중..." : "문의 보내기"}
            </button>

            <p className="text-sm text-slate-400">전송된 내용은 1~2 영업일 내 처리됩니다.</p>
          </form>
        ) : (
          <section className="bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-12 text-center">
            <CheckCircle2 className="mx-auto w-14 h-14 text-emerald-300" />
            <h2 className="mt-4 text-3xl font-black">접수 완료</h2>
            <p className="mt-3 text-slate-300">감사합니다. 빠르게 답변 드리겠습니다.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <button onClick={() => { setStep("form"); setMessage(""); setSubject(""); setError(""); }} className="py-4 rounded-full border border-white/10 bg-slate-800">새 문의 작성</button>
              <button onClick={() => router.push("/")} className="py-4 rounded-full bg-blue-500 text-white font-black">메인으로</button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
