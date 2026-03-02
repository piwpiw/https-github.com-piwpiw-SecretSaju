'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import LuxuryToast from '@/components/ui/LuxuryToast';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMsg, setToastMsg] = useState('');

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 3000);
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) {
            return;
        }
        setLoading(true);

        // Simple Admin Check
        setTimeout(() => {
            if (username === 'admin' && password === 'admin') {
                localStorage.setItem('secret_paws_mock_admin', 'true');
                // Set a mock user session in local storage as well if needed
                localStorage.setItem('secret_paws_wallet', JSON.stringify({ churu: 999999, nyang: 999999 }));

                showToast('愿由ъ옄 沅뚰븳?쇰줈 ?묒냽?⑸땲??');
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1000);
            } else {
                showToast('?꾩씠???먮뒗 鍮꾨?踰덊샇媛 ?쇱튂?섏? ?딆뒿?덈떎.');
                setLoading(false);
            }
        }, 800);
    };

    return (
        <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent_70%)]" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27380%27 height=%27380%27 viewBox=%270 0 380 380%27%3E%3Cdefs%3E%3ClinearGradient id=%27g%27 x1=%270%27 y1=%270%27 x2=%271%27 y2=%271%27%3E%3Cstop offset=%270%25%27 stop-color=%27%230b1020%27/%3E%3Cstop offset=%27100%25%27 stop-color=%27%23101a33%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect x=%270%27 y=%270%27 width=%27380%27 height=%27380%27 fill=%27url(%23g)%27/%3E%3Ccircle cx=%2780%27 cy=%27120%27 r=%2712%27 fill=%27%23ffffff%27 fill-opacity=%270.08%27/%3E%3Ccircle cx=%27200%27 cy=%27320%27 r=%276%27 fill=%27%23ffffff%27 fill-opacity=%270.06%27/%3E%3Ccircle cx=%27320%27 cy=%27180%27 r=%278%27 fill=%27%23ffffff%27 fill-opacity=%270.07%27/%3E%3C/svg%3E')] opacity-20" />

            <LuxuryToast isVisible={toastVisible} message={toastMsg} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-10 shadow-2xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -mr-32 -mt-32" />

                    <div className="text-center space-y-4 mb-10">
                        <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 flex items-center justify-center mx-auto mb-6">
                            <Shield className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">System Access</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">?곗뒪?곕땲 留ㅽ듃由?뒪 愿由ъ옄 ?꾩슜</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label
                                className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4"
                                htmlFor="admin-identifier"
                            >
                                Identifier
                            </label>
                            <div className="relative">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    id="admin-identifier"
                                    aria-label="Admin ID 입력"
                                    autoComplete="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Admin ID"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label
                                className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4"
                                htmlFor="admin-security-code"
                            >
                                Security Code
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="password"
                                    id="admin-security-code"
                                    aria-label="Admin security code 입력"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            aria-label="관리자 로그인 실행"
                            className={cn(
                                "w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl font-black text-white italic tracking-widest uppercase text-xs flex items-center justify-center gap-3 transition-all hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] active:scale-95",
                                loading && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Authorize <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-white/5 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">Quantum Secure Protocol v2.0</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </main>
    );
}

