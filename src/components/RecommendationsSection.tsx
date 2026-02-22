"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { FoodItem } from "@/data/foodRecommendations";
import type { ProductItem } from "@/data/productRecommendations";

type RecommendationsSectionProps = {
  foods: FoodItem[];
  products: ProductItem[];
  animalName: string;
  className?: string;
};

export function RecommendationsSection({
  foods,
  products,
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
                    {item.category} · {item.reason}
                  </p>
                </div>
              </li>
            ))
          )}
        </ul>
      </motion.div>
    </section>
  );
}
