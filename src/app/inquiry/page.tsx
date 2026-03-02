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

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

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

            <div className="grid grid-cols-2 gap-3">
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
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">제목</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-4 rounded-2xl bg-slate-950 border border-white/10"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">문의 내용</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full px-4 py-4 rounded-2xl bg-slate-950 border border-white/10"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">이메일 (선택)</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="답변 받을 이메일"
                className="w-full px-4 py-4 rounded-2xl bg-slate-950 border border-white/10"
              />
            </div>

            {error ? <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/50 text-rose-100 text-sm">{error}</div> : null}

            <button
              type="submit"
              disabled={isSubmitting}
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
