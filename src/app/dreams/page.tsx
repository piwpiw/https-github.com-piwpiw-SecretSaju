"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Moon, Loader2, Sparkles, BookOpen, Search, Hash, User, Zap } from "lucide-react";
import JellyBalance from "@/components/shop/JellyBalance";
import { useWallet } from "@/components/WalletProvider";
import { useProfiles } from "@/components/ProfileProvider";
import LuxuryToast from "@/components/ui/LuxuryToast";
import { cn } from "@/lib/utils";

export default function DreamsPage() {
    const router = useRouter();
    const { consumeChuru, churu } = useWallet();
    const { profiles, activeProfile, setActiveProfileById } = useProfiles();

    const [dream, setDream] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [toastMsg, setToastMsg] = useState("");
    const [showToast, setShowToast] = useState(false);

    const handleAnalyze = (e: React.FormEvent) => {
        e.preventDefault();

        if (dream.length < 2) {
            setToastMsg("검색어를 2자 이상 입력해주세요.");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            return;
        }

        if (churu < 20) {
            setToastMsg("꿈 해몽에는 20 젤리가 필요합니다.");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            return;
        }

        consumeChuru(20);
        const hashString = (str: string) => {
            let hash = 0;
            for (let i = 0; i < str.length; i++) hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
            return Math.abs(hash);
        };

        const hash = hashString(dream + (activeProfile?.id || ""));
        const seed = Math.abs(hash) % 5;
        const subSeed = Math.abs((hash >> 2)) % 3;

        const CLASSIFICATIONS = [
            { category: "길몽 (吉夢)", desc: "강력한 행운과 재물운이 눈앞에 다가왔음을 암시합니다.", score: 95 },
            { category: "비몽 (秘夢)", desc: "무의식 속에 숨겨진 억압된 욕망과 감정이 발현된 상태입니다.", score: 72 },
            { category: "영몽 (靈夢)", desc: "직관력이 최고조에 달했으며, 조상이나 우주의 강력한 연결 메시지를 담고 있습니다.", score: 88 },
            { category: "창조몽 (創造夢)", desc: "새로운 아이디어나 혁신적인 프로젝트의 탄생을 예고하는 강력한 창조 에너지입니다.", score: 91 },
            { category: "경몽 (驚夢)", desc: "현재의 스트레스나 극도의 긴장감이 깊이 투영된 방어 기제입니다. 즉각적인 재충전이 허락됩니다.", score: 65 }
        ];

        const ADV_ITEMS = [
            ["푸른빛 광석류, 물방울 무늬", "자정 ~ 새벽 2시", "동전, 진회색 머플러", "오후 3시 ~ 5시"],
            ["은빛 반지, 고서적", "오전 7시 ~ 9시", "붉은 장미, 만년필", "정오 ~ 오후 1시"],
            ["모래시계, 나무 펜던트", "오후 8시 ~ 10시", "금장 악세사리, 하얀 손상자", "새벽 5시 ~ 7시"]
        ];

        const resultType = CLASSIFICATIONS[seed];
        const itemSet = ADV_ITEMS[subSeed];

        setResult({
            category: resultType.category,
            title: `${activeProfile?.name || "사용자"}님을 위한 무의식 스캔 완료`,
            description: `키워드 '${dream}'에 대한 무의식 심층 해독 결과입니다.\n\n이 시퀀스 파동은 ${resultType.desc}\n\n현재 '${activeProfile?.name || "사용자"}'님이 가장 집중해야 할 곳은 이성적 판단 너머의 직관적 울림입니다. 향후 72시간 이내에 마주하는 우연한 만남이나 데이터에 주목하세요. 엉켜있던 알고리즘이 예상외의 루트에서 풀릴 가능성이 매우 높습니다.`,
            luckyItem: (Math.abs(hash) % 2 === 0) ? itemSet[0] : itemSet[2],
            luckyTime: (Math.abs(hash) % 2 === 0) ? itemSet[1] : itemSet[3],
            score: resultType.score - (Math.abs(hash) % 5)
        });
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-200 relative overflow-hidden pb-40 font-sans">
            <LuxuryToast message={toastMsg} isVisible={showToast} />

            {/* Mystic Atmosphere */}
            <div className="absolute inset-x-0 top-0 h-[80dvh] bg-gradient-to-b from-indigo-900/40 via-purple-900/10 to-transparent pointer-events-none" />
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
                <div className="flex items-center justify-between mb-16">
                    <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                        <ArrowLeft className="w-5 h-5 text-slate-400" />
                    </button>
                    <JellyBalance />
                </div>

                {!result && !loading && (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center">
                        <div className="relative inline-block mb-10">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
                            <div className="w-28 h-28 rounded-[2.5rem] bg-slate-900 border border-indigo-500/30 text-indigo-400 flex items-center justify-center relative z-10 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
                                <Moon className="w-14 h-14" />
                            </div>
                        </div>

                        <div className="space-y-4 mb-12">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                                <Zap className="w-3 h-3" /> Dream Synchronicity
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-black italic tracking-tighter uppercase text-white">
                                어떤 꿈을 <span className="text-indigo-500">꾸셨나요?</span>
                            </h1>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest italic animate-pulse">
                                Decode the symbols of your subconscious.
                            </p>
                        </div>

                        {/* Profile Selection for Dream Analysis */}
                        <div className="mb-10 flex justify-center gap-3">
                            {profiles.slice(0, 4).map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setActiveProfileById(p.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all text-sm font-black italic uppercase",
                                        activeProfile?.id === p.id
                                            ? "bg-indigo-600/20 border-indigo-500 text-white shadow-lg"
                                            : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 opacity-60"
                                    )}
                                >
                                    <User className="w-3.5 h-3.5" />
                                    <span>{p.name}</span>
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleAnalyze} className="relative group text-left max-w-xl mx-auto mb-16">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                            <div className="relative bg-slate-900 border border-white/10 rounded-3xl shadow-2xl flex items-center p-2 pl-6">
                                <Search className="w-6 h-6 text-slate-500 mr-3 shrink-0" />
                                <input
                                    type="text"
                                    value={dream}
                                    onChange={(e) => setDream(e.target.value)}
                                    placeholder="예: 돼지, 호랑이, 싸우는 꿈"
                                    className="w-full bg-transparent border-none text-white placeholder-slate-600 focus:outline-none focus:ring-0 text-lg sm:text-xl py-4 h-auto"
                                />
                                <button type="submit" className="shrink-0 px-6 sm:px-10 py-5 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white rounded-2xl font-black uppercase italic tracking-widest text-xs shadow-[0_0_30px_rgba(244,63,94,0.3)] hover:shadow-[0_0_50px_rgba(244,63,94,0.5)] transition-all ml-2 whitespace-nowrap active:scale-95 group">
                                    <Sparkles className="w-4 h-4 inline-block mr-2 group-hover:rotate-180 transition-transform duration-700" /> 해몽 시퀀스 가동 (20 Jelly)
                                </button>
                            </div>
                        </form>

                        <div className="flex flex-col gap-4 max-w-2xl mx-auto">
                            {[
                                {
                                    category: "동물", color: "text-emerald-400", tags: [
                                        { keyword: "돼지", desc: "재물운" }, { keyword: "뱀", desc: "지혜·변화" },
                                        { keyword: "호랑이", desc: "권위·용기" }, { keyword: "용", desc: "대길·상승" },
                                        { keyword: "소", desc: "근면·안정" }, { keyword: "말", desc: "속도·여행" },
                                    ]
                                },
                                {
                                    category: "자연", color: "text-blue-400", tags: [
                                        { keyword: "물", desc: "재물·흐름" }, { keyword: "불", desc: "열정·변화" },
                                        { keyword: "바다", desc: "무의식·풍요" }, { keyword: "산", desc: "안정·극복" },
                                        { keyword: "하늘", desc: "상승·희망" }, { keyword: "별", desc: "행운·인연" },
                                    ]
                                },
                                {
                                    category: "상황", color: "text-rose-400", tags: [
                                        { keyword: "싸움", desc: "갈등·극복" }, { keyword: "결혼식", desc: "경사·결합" },
                                        { keyword: "장례식", desc: "끝·새 시작" }, { keyword: "비행", desc: "성공·자유" },
                                        { keyword: "시험", desc: "도전·평가" }, { keyword: "열쇠", desc: "해결·기회" },
                                    ]
                                },
                                {
                                    category: "사물", color: "text-amber-400", tags: [
                                        { keyword: "금", desc: "재물·명예" }, { keyword: "집", desc: "안정·가족" },
                                        { keyword: "책", desc: "학업·지식" }, { keyword: "꽃", desc: "사랑·번영" },
                                        { keyword: "칼", desc: "결단·위기" }, { keyword: "거울", desc: "자아·진실" },
                                    ]
                                },
                            ].map((group) => (
                                <div key={group.category}>
                                    <div className={`text-[9px] font-black uppercase tracking-widest mb-2 ${group.color}`}>{group.category}</div>
                                    <div className="flex flex-wrap gap-2">
                                        {group.tags.map((tag, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setDream(tag.keyword)}
                                                className={cn(
                                                    "flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/60 hover:bg-slate-800 border border-white/5 rounded-full text-xs text-slate-400 hover:text-white transition-all group",
                                                    dream === tag.keyword && "border-indigo-500/40 bg-indigo-500/10 text-indigo-300"
                                                )}
                                            >
                                                <Hash className="w-2.5 h-2.5 text-indigo-500 group-hover:text-indigo-400" />
                                                <span className="font-bold">{tag.keyword}</span>
                                                <span className="text-[9px] text-slate-600 hidden sm:inline-block ml-0.5">({tag.desc})</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-40">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
                            <Loader2 className="w-28 h-28 text-indigo-500 animate-spin" strokeWidth={1} />
                            <Moon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-indigo-300 animate-pulse" />
                        </div>
                        <h3 className="mt-12 text-2xl font-black uppercase italic tracking-[0.2em] text-indigo-200 animate-pulse">Scanning the Void...</h3>
                        <p className="mt-2 text-xs text-slate-500 font-bold uppercase tracking-[0.3em]">Decoding Subconscious Data</p>
                    </motion.div>
                )}

                {result && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto">
                        <div className="bg-slate-900/60 backdrop-blur-2xl border border-indigo-500/20 rounded-[4rem] p-10 sm:p-14 relative overflow-hidden shadow-2xl text-center">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] -mr-40 -mt-40" />

                            <div className="relative z-10 mb-12">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-300 font-black mb-10 tracking-[0.3em] text-[10px] uppercase">
                                    <Sparkles className="w-3.5 h-3.5" /> {result.category}
                                </div>
                                <h1 className="text-3xl sm:text-4xl font-black mb-8 text-white tracking-tighter uppercase italic leading-tight">
                                    {result.title}
                                </h1>
                                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 pb-2">
                                    {result.score}점
                                </div>
                                <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Subconscious Clarity Index</div>
                            </div>

                            <div className="relative z-10 text-left bg-black/40 border border-white/5 p-8 rounded-[2.5rem] mb-10">
                                <BookOpen className="w-6 h-6 text-indigo-400 mb-6 opacity-30" />
                                <p className="text-lg text-slate-300 leading-relaxed font-bold italic whitespace-pre-wrap">
                                    &ldquo;{result.description}&rdquo;
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 relative z-10 mb-8">
                                <div className="bg-white/5 border border-white/5 p-6 rounded-3xl text-left overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                                        <Sparkles className="w-12 h-12" />
                                    </div>
                                    <div className="text-[10px] text-indigo-500 font-black mb-2 uppercase tracking-widest italic">Lucky Node</div>
                                    <div className="text-slate-100 font-black text-lg truncate">{result.luckyItem}</div>
                                </div>
                                <div className="bg-white/5 border border-white/5 p-6 rounded-3xl text-left overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                                        <Zap className="w-12 h-12" />
                                    </div>
                                    <div className="text-[10px] text-purple-500 font-black mb-2 uppercase tracking-widest italic">Optimal Window</div>
                                    <div className="text-slate-100 font-black text-lg truncate">{result.luckyTime}</div>
                                </div>
                            </div>

                            {/* 심층 해석 3단 패널 */}
                            <div className="space-y-4 relative z-10">
                                {[
                                    { title: "원형 상징 (Archetype)", icon: "🔮", color: "text-indigo-400", border: "border-indigo-500/20", bg: "bg-indigo-500/5", text: `'${dream}' 꿈은 집단 무의식 속에서 ${result.category}와 깊이 연결됩니다. 칼 융의 원형 이론에 따르면 이는 내면의 변환 과정을 상징하며, 억압된 욕망이나 미완성된 과제를 표면화하려는 심리적 신호입니다.` },
                                    { title: "정서 해석 (Emotional)", icon: "💜", color: "text-purple-400", border: "border-purple-500/20", bg: "bg-purple-500/5", text: `꿈의 감정적 색채가 ${result.score > 75 ? "매우 긍정적" : result.score > 55 ? "중립적" : "다소 불안"}입니다. 이 꿈을 꾼 날의 감정 상태와 연계하여 현재 스트레스 지수를 점검해 보세요. 꿈 속의 감정이 현실에서 억압된 부분을 드러냅니다.` },
                                    { title: "행동 지침 (Action)", icon: "⚡", color: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/5", text: `오늘 ${result.luckyItem}을 몸에 지니고 ${result.luckyTime}에 중요한 결정을 내리세요. 꿈이 보내는 신호를 현실 행동으로 연결할 때 최대의 에너지를 활용할 수 있습니다.` },
                                ].map((panel, i) => (
                                    <motion.div
                                        key={panel.title}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 + i * 0.1 }}
                                        className={`flex gap-4 p-5 rounded-3xl border ${panel.border} ${panel.bg} text-left`}
                                    >
                                        <span className="text-2xl shrink-0 mt-1">{panel.icon}</span>
                                        <div>
                                            <div className={`text-[9px] font-black uppercase tracking-widest mb-1.5 ${panel.color}`}>{panel.title}</div>
                                            <p className="text-xs text-slate-400 font-medium leading-relaxed">{panel.text}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="text-center mt-12">
                            <button
                                onClick={() => { setResult(null); setDream(""); }}
                                className="px-12 py-5 bg-transparent border-2 border-white/5 rounded-2xl text-slate-500 hover:text-white hover:border-indigo-500/30 transition-all font-black uppercase italic tracking-widest text-xs"
                            >
                                Scan Another Dream
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </main>
    );
}
