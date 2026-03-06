import { motion, AnimatePresence } from 'framer-motion';
import { Music, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const AMBIENT_URL = 'https://assets.mixkit.co/music/preview/mixkit-ethereal-fairy-bells-1052.mp3'; // Placeholder cosmic sound

export default function AmbientSoundPortal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio(AMBIENT_URL);
        audioRef.current.loop = true;
        return () => {
            audioRef.current?.pause();
            audioRef.current = null;
        };
    }, []);

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current?.pause();
        } else {
            audioRef.current?.play().catch(() => {
                console.log("Audio play blocked by browser policy");
            });
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="fixed bottom-24 right-6 z-[100] flex flex-col items-end gap-3">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: 20 }}
                        className="p-4 rounded-[2rem] bg-slate-900/80 backdrop-blur-3xl border border-white/10 shadow-2xl flex items-center gap-4"
                    >
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest italic leading-none mb-1">Ambient Mode</span>
                            <span className="text-xs font-bold text-slate-200">Cosmic White Noise</span>
                        </div>
                        <button
                            onClick={togglePlay}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-900/40' : 'bg-white/5 text-slate-400'}`}
                        >
                            {isPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 rounded-3xl bg-indigo-600 border border-white/10 flex items-center justify-center shadow-2xl hover:scale-105 transition-all group"
            >
                <Music className={`w-6 h-6 text-white ${isPlaying ? 'animate-pulse' : ''}`} />
                <div className="absolute -top-1 -right-1">
                    <Sparkles className="w-4 h-4 text-indigo-300 animate-bounce" />
                </div>
            </button>
        </div>
    );
}
