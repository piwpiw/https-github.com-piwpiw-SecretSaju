'use client'

import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import type { Celebrity } from '@/data/celebrities'

interface CelebrityCardProps {
    celebrity: Celebrity
    index?: number
}

export function CelebrityCard({ celebrity, index = 0 }: CelebrityCardProps) {
    const categoryEmojis = {
        '기업가': '💼',
        '연예인': '🎬',
        '정치인': '⚖️',
        '스포츠': '⚽',
        '예술가': '🎨',
        '학자': '📚'
    }

    return (
        <motion.div
            className="glass rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{
                y: -5,
                boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)'
            }}
        >
            {/* Celebrity Name & Category */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-display text-xl text-foreground font-bold">
                        {celebrity.name}
                    </h3>
                    <p className="text-secondary text-sm flex items-center gap-1">
                        <span>{categoryEmojis[celebrity.category] || '✨'}</span>
                        {celebrity.category}
                    </p>
                </div>

                {celebrity.image_url && (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/30">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={celebrity.image_url}
                            alt={celebrity.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
            </div>

            {/* Achievement */}
            <div className="mb-3">
                <p className="text-zinc-400 text-sm">
                    {celebrity.achievement}
                </p>
            </div>

            {/* Personality Match */}
            <div className="glass-subtle rounded-xl p-3 mb-4">
                <p className="text-zinc-300 text-sm leading-relaxed">
                    &quot;{celebrity.personality_match}&quot;
                </p>
            </div>

            {/* Quote (if available) */}
            {celebrity.quote && (
                <div className="mb-3 pl-3 border-l-2 border-primary/50">
                    <p className="text-sm italic text-zinc-400">
                        {celebrity.quote}
                    </p>
                </div>
            )}

            {/* Wiki Link */}
            {celebrity.wiki_link && (
                <a
                    href={celebrity.wiki_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary text-sm hover:underline mt-2"
                >
                    <span>더 알아보기</span>
                    <ExternalLink className="w-3 h-3" />
                </a>
            )}

            {/* Birthdate (subtle) */}
            <div className="mt-3 pt-3 border-t border-white/5">
                <p className="text-xs text-zinc-600">
                    생년월일: {celebrity.birthdate}
                </p>
            </div>
        </motion.div>
    )
}
