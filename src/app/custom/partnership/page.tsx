"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Rocket, Briefcase, Workflow, Sparkles, Send, ShieldCheck, Mail, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import LuxuryToast from "@/components/ui/LuxuryToast";

export default function PartnershipPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState("Information loaded.");
    const [bgReady, setBgReady] = useState(false);
    const [bgEnabled, setBgEnabled] = useState(true);

    const [form, setForm] = useState({
        company: "",
        name: "",
        email: "",
        type: "api",
        description: ""
    });

    const isSubmitReady = form.company.trim() !== "" &&
        form.name.trim() !== "" &&
        form.email.trim() !== "" &&
        form.description.trim() !== "";

    useEffect(() => {
        const raf = requestAnimationFrame(() => setBgReady(true));
        if (typeof window !== 'undefined') {
            const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
            const updateBg = () => setBgEnabled(!mq.matches);
            updateBg();
            if (typeof mq.addEventListener === 'function') {
                mq.addEventListener('change', updateBg);
                return () => {
                    cancelAnimationFrame(raf);
                    mq.removeEventListener('change', updateBg);
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
            setToastMessage("Please fill in all the required fields.");
            setToastVisible(true);
            setTimeout(() => setToastVisible(false), 2000);
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setToastMessage("Proposal submitted successfully.");
            setToastVisible(true);
            setForm({
                company: "",
                name: "",
                email: "",
                type: "api",
                description: ""
            });
            setTimeout(() => setToastVisible(false), 3000);
        }, 1500);
    };

    return (
        <main className="min-h-screen bg-[#050505] text-slate-200 pb-32 relative overflow-hidden font-sans">
            {/* Ambient Backgrounds */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-black to-slate-950 opacity-90 pointer-events-none" />
            {bgReady && bgEnabled && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,_#1e1b4b_0%,_transparent_50%)] opacity-60 pointer-events-none" />
            )}
            
            <LuxuryToast isVisible={toastVisible} message={toastMessage} />

            <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
                <header className="flex items-center gap-4 mb-20">
                    <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group shrink-0">
                        <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[9px] font-black uppercase tracking-[0.3em] border border-indigo-500/20 italic mb-1.5">
                            <Rocket className="w-3 h-3" /> Destiny Alliance
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter uppercase text-white">Partnership</h1>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8">
                    {/* Information Section */}
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black italic text-white uppercase leading-none tracking-tighter">
                                Infinite Synergy
                            </h2>
                            <p className="text-sm font-bold text-slate-500 italic opacity-80 leading-relaxed uppercase tracking-widest pl-1">
                                Combine Secret Saju&apos;s data with your services.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { icon: ShieldCheck, title: "API Integration", desc: "Advanced AI Divination", color: "text-emerald-400" },
                                { icon: Briefcase, title: "Brand Collaboration", desc: "Events & Popups", color: "text-amber-400" },
                                { icon: Workflow, title: "Data Provision", desc: "Custom Content", color: "text-indigo-400" }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-4 p-5 rounded-3xl bg-slate-900/40 border border-white/5 hover:bg-slate-900/60 transition-colors">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                                        <item.icon className={cn("w-5 h-5", item.color)} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-white italic tracking-tighter uppercase">{item.title}</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4 items-center pl-2 opacity-50">
                            <Mail className="w-4 h-4" />
                            <span className="text-xs font-bold font-mono tracking-widest">partnership@secretsaju.com</span>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="p-8 sm:p-10 bg-gradient-to-br from-slate-900/60 to-indigo-950/20 rounded-[3rem] border border-white/10 shadow-[0_0_40px_rgba(79,70,229,0.1)] relative overflow-hidden backdrop-blur-md">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] italic flex items-center gap-2">
                                    <Globe className="w-3 h-3 text-indigo-400" /> Company / Org
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.company}
                                    onChange={e => setForm({ ...form, company: e.target.value })}
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700"
                                    placeholder="Company Name"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] italic">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] italic">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700 font-mono"
                                        placeholder="work@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] italic">Type of Partnership</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {["api", "collab", "data", "other"].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setForm({ ...form, type })}
                                            className={cn(
                                                "py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                                                form.type === type
                                                    ? "bg-indigo-600/20 border-indigo-400/50 text-indigo-300"
                                                    : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 hover:text-white"
                                            )}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] italic">Description</label>
                                <textarea
                                    required
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500/50 transition-all resize-none h-32 placeholder:text-slate-700"
                                    placeholder="Describe your proposal briefly."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !isSubmitReady}
                                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black italic uppercase tracking-[0.2em] text-sm text-white border border-indigo-400/50 shadow-[0_0_30px_rgba(79,70,229,0.2)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" /> Submit Proposal
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}
