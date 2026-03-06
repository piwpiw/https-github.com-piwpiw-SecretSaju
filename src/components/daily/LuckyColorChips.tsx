import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function LuckyColorChips() {
    const colors = [
        { name: "신비한 남색", hex: "#6366f1" },
        { name: "태양의 호박", hex: "#fbbf24" },
        { name: "진홍 로즈", hex: "#f43f5e" }
    ];

    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = (hex: string) => {
        navigator.clipboard.writeText(hex);
        setCopied(hex);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">오늘의 행운 색상</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {colors.map((c) => (
                    <div
                        key={c.hex}
                        onClick={() => handleCopy(c.hex)}
                        className="premium-card p-3 flex items-center gap-4 cursor-pointer hover:border-white/20 transition-all group"
                    >
                        <div
                            className="w-10 h-10 rounded-xl shadow-lg group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: c.hex }}
                        />
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-white uppercase">{c.name}</p>
                            <p className="text-[9px] text-slate-500 font-mono">{c.hex}</p>
                        </div>
                        {copied === c.hex ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-400 transition-colors" />}
                    </div>
                ))}
            </div>
        </div>
    );
}
