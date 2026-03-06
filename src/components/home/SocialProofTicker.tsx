import { motion } from 'framer-motion';

const USERS = [
    { name: '김*민', action: '평생 사주 확인 완료', time: '방금 전' },
    { name: '이*경', action: '궁합 연산 성공', time: '1분 전' },
    { name: 'Park*', action: 'PRO 패키지 구독', time: '3분 전' },
    { name: '최*환', action: '꿈해몽 정밀 분석', time: '5분 전' },
];

export default function SocialProofTicker() {
    return (
        <div className="w-full h-8 overflow-hidden relative bg-white/[0.01] border-y border-white/5 backdrop-blur-sm">
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-950 to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-950 to-transparent z-10" />

            <motion.div
                animate={{ x: [0, -1000] }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="flex items-center gap-12 whitespace-nowrap px-8 h-full"
            >
                {[...USERS, ...USERS, ...USERS].map((u, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-300 italic tracking-tighter">
                            {u.name}님이 <span className="text-indigo-400">{u.action}</span>
                        </span>
                        <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">{u.time}</span>
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
