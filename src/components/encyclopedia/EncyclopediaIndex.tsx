import { motion } from 'framer-motion';

const INDEX_ITEMS = [
    { label: 'ㄱ', target: 'k' },
    { label: 'ㄴ', target: 'n' },
    { label: 'ㄷ', target: 'd' },
    { label: 'ㄹ', target: 'r' },
    { label: 'ㅁ', target: 'm' },
    { label: 'ㅂ', target: 'b' },
    { label: 'ㅅ', target: 's' },
    { label: 'ㅇ', target: 'o' },
    { label: 'ㅈ', target: 'j' },
    { label: 'ㅊ', target: 'c' },
];

export default function EncyclopediaIndex() {
    return (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-50">
            <div className="h-20 w-px bg-white/5 mx-auto mb-4" />
            {INDEX_ITEMS.map((item) => (
                <motion.button
                    key={item.label}
                    whileHover={{ scale: 1.4, x: -4 }}
                    onClick={() => {
                        const el = document.getElementById(`index-${item.label}`);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="w-6 h-6 flex items-center justify-center text-[10px] font-black text-slate-600 hover:text-indigo-400 transition-colors uppercase italic"
                >
                    {item.label}
                </motion.button>
            ))}
            <div className="h-20 w-px bg-white/5 mx-auto mt-4" />
        </div>
    );
}
