import { motion } from 'framer-motion';

type KeywordChipsProps = {
  tags?: string[];
};

export default function KeywordChips({ tags = [] }: KeywordChipsProps) {
  const defaultTags = ["의리", "균형", "성실한 실행", "전환기 대응", "장기 전략"];
  const displayTags = tags.length > 0 ? tags : defaultTags;
  const colors = ['indigo', 'fuchsia', 'amber', 'emerald', 'rose', 'sky'];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5">
      {displayTags.map((tag, i) => (
        <motion.div
          key={`${tag}-${i}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ scale: 1.05 }}
          className="px-4 py-1.5 rounded-full border border-white/5 bg-white/5 backdrop-blur-md text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2 group cursor-default shadow-lg shadow-black/20"
        >
          <div
            className="w-1 h-4 rounded-full transition-colors"
            style={{ backgroundColor: `var(--${colors[i % colors.length]}-500)` }}
          />
          <span className="text-slate-100">{tag.startsWith('#') ? tag : `#${tag}`}</span>
        </motion.div>
      ))}
    </div>
  );
}
