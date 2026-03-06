'use client';
import { motion } from 'framer-motion';
import { Zap, Sun, CloudRain, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getDayPillar, getHourPillar } from '@/core/calendar/ganji';

// Element interaction rules: when current transit conflicts with user's day stem element
const ELEMENT_MAP: Record<string, { ko: string; color: string; enemy: string }> = {
    '갑': { ko: '목(木)', color: 'emerald', enemy: '금(金)' },
    '을': { ko: '목(木)', color: 'emerald', enemy: '금(金)' },
    '병': { ko: '화(火)', color: 'rose', enemy: '수(水)' },
    '정': { ko: '화(火)', color: 'rose', enemy: '수(水)' },
    '무': { ko: '토(土)', color: 'amber', enemy: '목(木)' },
    '기': { ko: '토(土)', color: 'amber', enemy: '목(木)' },
    '경': { ko: '금(金)', color: 'slate', enemy: '화(火)' },
    '신': { ko: '금(金)', color: 'slate', enemy: '화(火)' },
    '임': { ko: '수(水)', color: 'indigo', enemy: '토(土)' },
    '계': { ko: '수(水)', color: 'indigo', enemy: '토(土)' },
};

interface TransitAlert {
    vibe: 'good' | 'caution' | 'neutral';
    title: string;
    desc: string;
    Icon: typeof Zap;
    colorClass: string;
}

function computeTransitAlert(now: Date, userDayStem?: string): TransitAlert {
    const dayGanji = getDayPillar(now);
    const hourGanji = getHourPillar(now, dayGanji.stemIndex);

    const dayStemMeta = ELEMENT_MAP[dayGanji.stem];
    const hourStemMeta = ELEMENT_MAP[hourGanji.stem];

    // Check if hour element conflicts with day element
    const hourEnemyOfDay = dayStemMeta && hourStemMeta && dayStemMeta.enemy === hourStemMeta.ko;
    // Check if user's birth day element matches current beneficial element
    const userMeta = userDayStem ? ELEMENT_MAP[userDayStem] : null;
    const userBenefited = userMeta && hourStemMeta && userMeta.ko === hourStemMeta.ko;

    if (userBenefited) {
        return {
            vibe: 'good',
            title: `${hourGanji.fullName}시 — 당신의 기운과 공명`,
            desc: `현재 ${hourStemMeta.ko} 기운이 강해져 당신의 천간 ${userDayStem}(${userMeta.ko})과 조화를 이룹니다. 중요한 결정에 좋은 시각입니다.`,
            Icon: Sun,
            colorClass: 'emerald',
        };
    }

    if (hourEnemyOfDay) {
        return {
            vibe: 'caution',
            title: `${hourGanji.fullName}시 — 기운 충돌 주의`,
            desc: `현재 ${hourStemMeta.ko} 기운이 오늘 일주 ${dayGanji.fullName}(${dayStemMeta.ko})을 압박하고 있습니다. 중요한 결정은 잠시 보류하세요.`,
            Icon: Zap,
            colorClass: 'amber',
        };
    }

    return {
        vibe: 'neutral',
        title: `오늘의 일주 ${dayGanji.fullName} · 현재 ${hourGanji.fullName}시`,
        desc: `오늘 ${dayStemMeta?.ko ?? ''}의 기운이 흐르고 있습니다. ${dayGanji.fullName}의 에너지를 활용해 집중력 있는 하루를 만들어 보세요.`,
        Icon: CloudRain,
        colorClass: 'indigo',
    };
}

interface Props {
    userDayStem?: string; // e.g. '갑', '을' — from user's birth chart
}

export default function TransitTicker({ userDayStem }: Props) {
    const [now, setNow] = useState<Date | null>(null);

    // Hydration-safe: only compute on client
    useEffect(() => {
        setNow(new Date());
        const timer = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(timer);
    }, []);

    if (!now) return null;

    const alert = computeTransitAlert(now, userDayStem);
    const vibeColor = {
        good: 'from-emerald-500/10',
        caution: 'from-amber-500/10',
        neutral: 'from-indigo-500/10',
    }[alert.vibe];
    const borderColor = {
        good: 'border-emerald-500/20',
        caution: 'border-amber-500/20',
        neutral: 'border-indigo-500/20',
    }[alert.vibe];
    const iconColor = {
        good: 'text-emerald-400',
        caution: 'text-amber-400',
        neutral: 'text-indigo-400',
    }[alert.vibe];
    const bgIcon = {
        good: 'bg-emerald-500/20 border-emerald-500/30',
        caution: 'bg-amber-500/20 border-amber-500/30',
        neutral: 'bg-indigo-500/20 border-indigo-500/30',
    }[alert.vibe];
    const labelColor = {
        good: 'text-emerald-300',
        caution: 'text-amber-300',
        neutral: 'text-indigo-300',
    }[alert.vibe];

    const Icon = alert.Icon;

    return (
        <div className="w-full">
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-slate-900/60 backdrop-blur-3xl border ${borderColor} rounded-3xl p-4 flex items-center gap-4 shadow-2xl relative overflow-hidden group cursor-pointer`}
            >
                <div className={`absolute inset-0 bg-gradient-to-r ${vibeColor} to-transparent opacity-60`} />

                <div className={`w-10 h-10 rounded-2xl ${bgIcon} border flex items-center justify-center shrink-0 relative z-10`}>
                    <Icon className={`w-5 h-5 ${iconColor} ${alert.vibe === 'caution' ? 'animate-pulse' : ''}`} />
                </div>

                <div className="flex-1 relative z-10">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-black ${labelColor} uppercase tracking-widest`}>Real-time Transit</span>
                        <div className="w-1 h-1 rounded-full bg-slate-600" />
                        <span className="text-[10px] font-bold text-slate-500">
                            {now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-200 leading-tight">{alert.title}</span>
                        <span className="text-[11px] text-slate-400 leading-tight hidden md:block mt-0.5">{alert.desc}</span>
                    </div>
                </div>

                <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all relative z-10">
                    <Info className="w-4 h-4 text-slate-500" />
                </div>
            </motion.div>
        </div>
    );
}
