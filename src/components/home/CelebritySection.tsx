'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import { CelebrityCard } from '@/components/home/CelebrityCard'
import type { Celebrity } from '@/data/celebrities'

interface CelebritySectionProps {
    pillarCode: string
}

export function CelebritySection({ pillarCode }: CelebritySectionProps) {
    const [celebrities, setCelebrities] = useState<Celebrity[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchCelebrities() {
            try {
                setLoading(true)
                setError(null)

                const response = await fetch(`/api/celebrity/${pillarCode}`)

                if (!response.ok) {
                    if (response.status === 404) {
                        // No celebrities yet - gracefully handle
                        setCelebrities([])
                        return
                    }
                    throw new Error('Failed to fetch celebrities')
                }

                const data = await response.json()
                setCelebrities(data.celebrities || [])
            } catch (err) {
                console.error('Error fetching celebrities:', err)
                setError('유명인 데이터를 불러올 수 없습니다')
            } finally {
                setLoading(false)
            }
        }

        if (pillarCode) {
            fetchCelebrities()
        }
    }, [pillarCode])

    // Don't render if no celebrities (graceful degradation)
    if (!loading && celebrities.length === 0) {
        return null
    }

    if (error) {
        return null // Silently fail for better UX
    }

    return (
        <section className="py-16 px-4 bg-gradient-to-b from-background to-surface/50">
            <div className="max-w-4xl mx-auto">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-sm text-secondary">Social Proof</span>
                    </div>

                    <h2 className="font-display text-3xl md:text-4xl text-foreground mb-3">
                        🎭 나와 <span className="text-primary">같은 사주</span>를 가진 유명인
                    </h2>

                    <p className="text-zinc-400 max-w-lg mx-auto">
                        당신과 같은 일주를 가진 사람들은<br />
                        이미 세상을 바꾸고 있습니다
                    </p>
                </motion.div>

                {/* Loading State */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2].map(i => (
                            <div key={i} className="glass rounded-2xl p-6 animate-pulse">
                                <div className="h-6 bg-white/10 rounded w-1/2 mb-4"></div>
                                <div className="h-4 bg-white/10 rounded w-3/4 mb-3"></div>
                                <div className="h-20 bg-white/10 rounded mb-3"></div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Celebrity Cards Grid */}
                {!loading && celebrities.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {celebrities.map((celebrity, index) => (
                            <CelebrityCard
                                key={celebrity.name}
                                celebrity={celebrity}
                                index={index}
                            />
                        ))}
                    </div>
                )}

                {/* Fun Fact */}
                <motion.div
                    className="mt-8 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <p className="text-sm text-zinc-600">
                        💡 Tip: 사주는 타고난 <span className="text-primary">재능</span>과 <span className="text-primary">성향</span>을 알려줍니다
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
