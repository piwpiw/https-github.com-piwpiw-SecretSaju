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
                        {/* 이 티커는 bg-slate-950 위에 있고 그 배경은 테마를 따르지 않는다.
                            그래서 테마 토큰(text-muted)을 쓰면 가독성 테마에서
                            #374151 이 되어 1.96:1 로 오히려 안 보인다.
                            고정 배경에는 고정 밝은 색을 쓴다 (slate-400, 7.87:1). */}
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{u.time}</span>
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
