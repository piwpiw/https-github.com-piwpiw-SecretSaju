"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Rocket, Briefcase, Workflow, Send, ShieldCheck, Mail, Globe } from "lucide-react";
import { cn } from "@/lib/app/utils";
import LuxuryToast from "@/components/ui/LuxuryToast";

export default function PartnershipPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("정보를 불러왔습니다.");
  const [formError, setFormError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState("");
  const [bgReady, setBgReady] = useState(false);
  const [bgEnabled, setBgEnabled] = useState(true);

  const [form, setForm] = useState({
    company: "",
    name: "",
    email: "",
    type: "api",
    description: "",
  });

  const isSubmitReady =
    form.company.trim() !== "" &&
    form.name.trim() !== "" &&
    form.email.trim() !== "" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.description.trim() !== "";

  useEffect(() => {
    const raf = requestAnimationFrame(() => setBgReady(true));
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      const updateBg = () => setBgEnabled(!mq.matches);
      updateBg();
      if (typeof mq.addEventListener === "function") {
        mq.addEventListener("change", updateBg);
        return () => {
          cancelAnimationFrame(raf);
          mq.removeEventListener("change", updateBg);
        };
      }
      mq.addListener(updateBg);
      return () => {
        cancelAnimationFrame(raf);
        mq.removeListener(updateBg);
      };
    }
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!isSubmitReady) {
      setFormError("모든 필수 항목을 입력하고 올바른 이메일을 입력해 주세요.");
      return;
    }

    setLoading(true);
    setFormError("");
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setSubmittedAt(new Date().toLocaleString("ko-KR"));
      setToastMessage("제안이 제출되었습니다.");
      setToastVisible(true);
      setForm({
        company: "",
        name: "",
        email: "",
        type: "api",
        description: "",
      });
      setTimeout(() => {
        setToastVisible(false);
        setSubmitted(false);
        setSubmittedAt("");
      }, 3200);
    }, 1500);
  };

  const partnershipTypes = [
    { value: "api", label: "API 연동" },
    { value: "collab", label: "협력 제안" },
    { value: "data", label: "데이터 제휴" },
    { value: "other", label: "기타 협업" },
  ];

  return (
    <main className="min-h-screen bg-[#050505] text-slate-200 pb-32 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-black to-slate-950 opacity-90 pointer-events-none" />
      {bgReady && bgEnabled && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,_#1e1b4b_0%,_transparent_50%)] opacity-60 pointer-events-none" />
      )}

      <LuxuryToast isVisible={toastVisible} message={toastMessage} />

      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <header className="flex items-center gap-4 mb-20">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[9px] font-black uppercase tracking-[0.3em] border border-indigo-500/20 italic mb-1.5">
              <Rocket className="w-3 h-3" /> 운명 제휴
            </div>
            <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-white">파트너십</h1>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8">
          <div className="space-y-10">
            <div className="space-y-4">
              <h2 className="text-4xl font-black italic leading-none tracking-tighter text-white">
                무한한 시너지
              </h2>
              <p className="text-sm font-bold text-slate-500 italic opacity-80 leading-relaxed pl-1">
                시크릿사주의 운세 데이터와 서비스를 결합해, 공동 가치를 만듭니다.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: ShieldCheck, title: "API 연동", desc: "고성능 AI 점성/사주 분석", color: "text-emerald-400" },
                { icon: Briefcase, title: "브랜드 협업", desc: "이벤트 및 팝업 연동", color: "text-amber-400" },
                { icon: Workflow, title: "데이터 연계", desc: "맞춤형 콘텐츠 제공", color: "text-indigo-400" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 p-5 rounded-3xl bg-slate-900/40 border border-white/5 hover:bg-slate-900/60 transition-colors"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                    <item.icon className={cn("w-5 h-5", item.color)} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white italic tracking-tighter">{item.title}</h3>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 items-center pl-2 opacity-50">
              <Mail className="w-4 h-4" />
              <span className="text-xs font-bold font-mono tracking-widest">partnership@secretsaju.com</span>
            </div>
          </div>

          <div className="p-8 sm:p-10 bg-gradient-to-br from-slate-900/60 to-indigo-950/20 rounded-[3rem] border border-white/10 shadow-[0_0_40px_rgba(79,70,229,0.1)] relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <p className="mb-2 text-xs text-slate-400 uppercase tracking-[0.25em]">
                작성 상태: {isSubmitReady ? "완료" : "미작성"}
              </p>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 tracking-[0.2em] italic flex items-center gap-2">
                  <Globe className="w-3 h-3 text-indigo-400" /> 기업/기관
                </label>
                <input
                  type="text"
                  required
                  aria-required="true"
                  aria-label="회사명"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700"
                  placeholder="회사명"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 tracking-[0.2em] italic">이름</label>
                  <input
                    type="text"
                    required
                    aria-required="true"
                    aria-label="담당자 이름"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
                    placeholder="성함"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 tracking-[0.2em] italic">이메일</label>
                  <input
                    type="email"
                    required
                    aria-required="true"
                    aria-label="이메일"
                    aria-invalid={!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && form.email.length > 0}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700 font-mono"
                    placeholder="이메일 주소"
                  />
                  {!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && form.email.length > 0 ? (
                    <p className="text-xs text-rose-300 mt-1">이메일 형식을 맞춰주세요.</p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 tracking-[0.2em] italic">협업 유형</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {partnershipTypes.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setForm({ ...form, type: item.value })}
                      className={cn(
                        "py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                        form.type === item.value
                          ? "bg-indigo-600/20 border-indigo-400/50 text-indigo-300"
                          : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 tracking-[0.2em] italic">제안 내용</label>
                <textarea
                  required
                  aria-required="true"
                  aria-label="제안 내용"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500/50 transition-all resize-none h-32 placeholder:text-slate-700"
                  placeholder="협업 제안을 간단히 입력해 주세요."
                />
              </div>

              {formError ? <p className="text-xs text-rose-300">{formError}</p> : null}

              <button
                type="submit"
                disabled={loading || !isSubmitReady}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black italic uppercase tracking-[0.2em] text-sm text-white border border-indigo-400/50 shadow-[0_0_30px_rgba(79,70,229,0.2)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    제출 중...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" /> 제안 제출
                  </>
                )}
              </button>

              {submitted ? (
                <div className="rounded-xl border border-emerald-400/50 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-100">
                  <p>성공적으로 제출했습니다. 다음 단계 안내를 곧 보내드릴게요.</p>
                  <p className="text-[11px] mt-1 text-emerald-200/80">접수일시: {submittedAt}</p>
                </div>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
