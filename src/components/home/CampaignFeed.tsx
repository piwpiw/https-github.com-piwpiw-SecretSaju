"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

type CampaignItem = {
  id: string;
  title: string;
  source: string;
  category: string;
  description: string;
  reward: string;
  link: string;
  imageUrl?: string;
};

export default function CampaignFeed() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const response = await fetch("/api/campaigns?limit=6");
        if (!response.ok) {
          throw new Error("failed_to_load");
        }
        const data = (await response.json()) as { campaigns?: CampaignItem[] };
        setCampaigns(data.campaigns ?? []);
      } catch (_e) {
        setError("실시간 캠페인 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <section className="w-full mt-4">
        <div className="space-y-3">
          <div className="h-5 w-44 bg-white/10 rounded animate-pulse" />
          <div className="h-4 w-64 bg-white/10 rounded animate-pulse" />
          <div className="h-20 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
        </div>
      </section>
    );
  }

  if (error) return null;
  if (!campaigns.length) return null;

  return (
    <section className="w-full">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-black tracking-[0.16em] uppercase text-slate-100">실시간 이벤트</h3>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">추천 확인</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {campaigns.slice(0, 4).map((camp) => (
          <a
            key={camp.id}
            href={camp.link || "#"}
            target={camp.link ? "_blank" : undefined}
            rel={camp.link ? "noreferrer noopener" : undefined}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-300">
                  {camp.source}
                  {camp.category ? ` · ${camp.category}` : ""}
                </p>
                <h4 className="mt-2 text-sm font-black leading-snug text-white">
                  {camp.title}
                </h4>
                {camp.description ? <p className="mt-1 text-xs text-slate-300 line-clamp-2">{camp.description}</p> : null}
                {camp.reward ? <p className="mt-2 text-[11px] font-semibold text-amber-200">보상: {camp.reward}</p> : null}
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
