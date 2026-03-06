import { motion } from 'framer-motion';

type Pillar = {
  kan: string;
  ji: string;
  name: string;
  color: string;
};

export default function PillarVisualizer({ pillars }: { pillars: Pillar[] }) {
  const displayPillars =
    pillars.length === 4
      ? pillars
      : [
          { kan: '甲', ji: '子', name: '년주', color: 'text-emerald-500' },
          { kan: '乙', ji: '丑', name: '월주', color: 'text-amber-500' },
          { kan: '丙', ji: '寅', name: '일주', color: 'text-rose-500' },
          { kan: '丁', ji: '卯', name: '시주', color: 'text-indigo-500' },
        ];

  return (
    <div className="flex justify-center gap-4 md:gap-8 py-10 px-4 bg-slate-900/40 rounded-[3rem] border border-white/5 relative overflow-hidden backdrop-blur-xl">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pinstripe-dark.png')] opacity-[0.03]" />

      {displayPillars.map((p, i) => (
        <motion.div
          key={`${p.name}-${i}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.15 }}
          className="flex flex-col items-center gap-4 group relative z-10"
        >
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{p.name}</span>
          <div className="flex flex-col items-center p-4 rounded-2xl bg-white/[0.02] border border-white/10 group-hover:border-white/20 transition-all shadow-2xl">
            <span className={`text-4xl md:text-5xl font-serif font-black ${p.color} leading-none mb-2`}>{p.kan}</span>
            <span className={`text-4xl md:text-5xl font-serif font-black ${p.color} leading-none`}>{p.ji}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
