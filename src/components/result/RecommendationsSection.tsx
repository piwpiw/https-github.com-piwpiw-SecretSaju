"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/app/utils";
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
    <section className={cn("w-full max-w-xl mx-auto py-8 px-3 space-y-5", className)}>
      <motion.div
        className="rounded-2xl glass p-4"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h3 className="font-display text-base text-foreground mb-1">{animalName} 추천 음식</h3>
        <p className="text-zinc-500 text-xs mb-3">오늘의 오행 밸런스를 맞추는 음식 3가지를 추천합니다.</p>
        <ul className="space-y-2">
          {foods.length === 0 ? (
            <li className="rounded-xl bg-white/5 px-3 py-2.5 text-sm text-zinc-500">추천 음식이 없습니다.</li>
          ) : (
            foods.map((item, i) => (
              <li key={`${item.name}-${i}`} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
                <span className="text-xl">{item.emoji}</span>
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-zinc-400">{item.reason}</p>
                </div>
              </li>
            ))
          )}
        </ul>
      </motion.div>

      <motion.div
        className="rounded-2xl glass p-4"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h3 className="font-display text-base text-foreground mb-1">{animalName} 추천 아이템</h3>
        <p className="text-zinc-500 text-xs mb-3">오늘의 사주 성향에 맞는 상품을 큐레이팅했습니다.</p>
        <ul className="space-y-2">
          {products.length === 0 ? (
            <li className="rounded-xl bg-white/5 px-3 py-2.5 text-sm text-zinc-500">추천 상품이 없습니다.</li>
          ) : (
            products.map((item, i) => (
              <li
                key={`${item.name}-${i}`}
                className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5"
              >
                <span className="text-xl">{item.emoji}</span>
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-zinc-400">
                    {item.category ? `${item.category} | ` : ""}
                    {item.reason}
                  </p>
                </div>
              </li>
            ))
          )}
        </ul>
      </motion.div>

      {campaigns && campaigns.length > 0 && (
        <motion.div
          className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-4"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🎁</span>
            <h3 className="font-display text-base text-foreground">사주 연계 이벤트</h3>
          </div>
          <p className="text-amber-500/80 text-xs mb-3">실시간으로 선별된 진행 중인 이벤트입니다.</p>
          <ul className="space-y-2">
            {campaigns.map((camp: any, i: number) => (
              <li
                key={`${camp.title}-${i}`}
                className="flex flex-col gap-1.5 rounded-xl bg-black/20 px-3 py-3 border border-white/5 hover:border-amber-500/30 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 mb-2">
                      {camp.source} {camp.category ? `· ${camp.category}` : ""}
                    </span>
                    <h4 className="font-medium text-foreground text-sm line-clamp-1">{camp.title}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{camp.description}</p>
                  </div>
                </div>
                {camp.reward_info && (
                  <div className="mt-1 text-xs font-semibold text-amber-300 bg-amber-500/10 inline-block px-2 py-1 rounded">
                    보상: {camp.reward_info}
                  </div>
                )}
                {camp.landing_url && (
                  <a
                    href={camp.landing_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-xs font-medium text-center bg-white/10 hover:bg-white/20 text-white rounded-lg py-2 transition-colors"
                  >
                    링크 보기
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
