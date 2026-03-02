"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { FoodItem } from "@/data/foodRecommendations";
import type { ProductItem } from "@/data/productRecommendations";

type RecommendationsSectionProps = {
  foods: FoodItem[];
  products: ProductItem[];
  campaigns?: any;
  animalName: string;
  className?: string;
};

export function RecommendationsSection({
  foods,
  products,
  campaigns,
  animalName,
  className,
}: RecommendationsSectionProps) {
  return (
    <section className={cn("w-full max-w-md mx-auto py-12 px-4 space-y-10", className)}>
      {/* 추천 음식 */}
      <motion.div
        className="rounded-2xl glass p-6"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h3 className="font-display text-lg text-foreground mb-1">
          🍽️ {animalName} 타입에게 추천 음식
        </h3>
        <p className="text-zinc-500 text-sm mb-4">오늘 먹어보면 좋아요</p>
        <ul className="space-y-3">
          {foods.length === 0 ? (
            <li className="rounded-xl bg-white/5 px-4 py-3 text-sm text-zinc-500">
              추천 준비 중이에요.
            </li>
          ) : (
            foods.map((item, i) => (
              <li
                key={`${item.name}-${i}`}
                className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3"
              >
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-zinc-400">{item.reason}</p>
                </div>
              </li>
            ))
          )}
        </ul>
      </motion.div>

      {/* 추천 제품 */}
      <motion.div
        className="rounded-2xl glass p-6"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h3 className="font-display text-lg text-foreground mb-1">
          🛒 {animalName} 타입에게 추천 제품
        </h3>
        <p className="text-zinc-500 text-sm mb-4">이 타입에게 잘 맞는 아이템</p>
        <ul className="space-y-3">
          {products.length === 0 ? (
            <li className="rounded-xl bg-white/5 px-4 py-3 text-sm text-zinc-500">
              추천 준비 중이에요.
            </li>
          ) : (
            products.map((item, i) => (
              <li
                key={`${item.name}-${i}`}
                className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3"
              >
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-zinc-400">
                    {item.category && `${item.category} ·`} {item.reason}
                  </p>
                </div>
              </li>
            ))
          )}
        </ul>
      </motion.div>

      {/* 이벤트/캠페인 추천 */}
      {campaigns && campaigns.length > 0 && (
        <motion.div
          className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-6"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">✨</span>
            <h3 className="font-display text-lg text-foreground">
              맞춤 라이프스타일 혜택
            </h3>
          </div>
          <p className="text-amber-500/80 text-sm mb-4">현재 참여 가능한 특별한 혜택을 확인하세요</p>
          <ul className="space-y-3">
            {campaigns.map((camp: any, i: number) => (
              <li
                key={`${camp.title}-${i}`}
                className="flex flex-col gap-2 rounded-xl bg-black/20 px-4 py-4 border border-white/5 hover:border-amber-500/30 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 mb-2">
                      {camp.source} {camp.category ? `· ${camp.category}` : ''}
                    </span>
                    <h4 className="font-medium text-foreground text-sm line-clamp-1">{camp.title}</h4>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{camp.description}</p>
                  </div>
                </div>
                {camp.reward_info && (
                  <div className="mt-2 text-xs font-semibold text-amber-300 bg-amber-500/10 inline-block px-2 py-1 rounded">
                    🎁 {camp.reward_info}
                  </div>
                )}
                {camp.landing_url && (
                  <a href={camp.landing_url} target="_blank" rel="noopener noreferrer" className="mt-2 text-xs font-medium text-center bg-white/10 hover:bg-white/20 text-white rounded-lg py-2 transition-colors">
                    혜택 확인하기
                  </a>
                )}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </section>
  );
}
