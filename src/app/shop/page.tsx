"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, CircleUserRound, MessageSquareText, ShoppingCart } from "lucide-react";

function ProductCard({ title, price }: { title: string; price: string }) {
  return (
    <div className="w-[31%] min-w-[31%]">
      <div className="aspect-[0.9] rounded-lg bg-gradient-to-br from-[#F4E2D8] to-[#F8F0EA] border border-black/5" />
      <p className="mt-2 text-[11px] leading-tight h-8 overflow-hidden">{title}</p>
      <p className="mt-1 text-sm font-bold">{price}</p>
      <p className="text-[11px] text-black/50">★ 4.8 (19)</p>
    </div>
  );
}

export default function ShopPage() {
  const router = useRouter();

  return (
    <main className="min-h-[100dvh] bg-[#ECECEC] text-[#111]">
      <div className="mx-auto w-full max-w-md bg-[#F4F4F4] min-h-[100dvh] border-x border-black/5">
        <header className="h-14 px-4 flex items-center border-b border-black/5 bg-white/70">
          <button onClick={() => router.back()} className="p-1 mr-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <p className="font-bold">점신몰</p>
        </header>

        <section className="px-8 pt-10 text-center">
          <h1 className="text-4xl font-black leading-tight">
            2026 행운을 더해줄
            <br />
            행운 아이템 집합소!
          </h1>
          <p className="mt-4 text-base text-[#7A8395] leading-relaxed">
            점신몰에서 당신의 일상에 특별한 에너지를
            <br />
            더해줄 아이템을 구매해 보세요!
          </p>
        </section>

        <section className="px-5 mt-8">
          <div className="rounded-[34px] bg-white p-4 border border-black/5 shadow-[0_20px_35px_rgba(0,0,0,0.04)]">
            <div className="h-8 flex items-center justify-between text-[11px] text-black/50 px-1">
              <p>서울 · 흐림 · 3°C</p>
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4" />
                <CircleUserRound className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <p className="text-3xl font-bold">점신몰</p>
              <div className="flex items-center gap-3">
                <MessageSquareText className="w-4 h-4" />
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4 flex justify-between gap-2">
              <ProductCard title="[청사유연구봉부] 푸른뱀의 기운을 담은 참전운 부적" price="14,900원" />
              <ProductCard title="[재회부] 헤어진 사람과 다시 관계를 회복하는 부적" price="14,900원" />
              <ProductCard title="[재물부] 재물이 모이고 돈이 붙는 재운 부적" price="14,900원" />
            </div>

            <div className="mt-6 h-2 bg-[#F2EFFA] rounded-full" />

            <div className="mt-5">
              <p className="text-3xl font-bold">실시간 BEST</p>
              <div className="mt-4 space-y-3">
                {[1, 2, 3].map((rank) => (
                  <div key={rank} className="flex gap-3 rounded-xl border border-black/5 p-2">
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#A7D8FF] to-[#E8F4FF] relative">
                      <span className="absolute -top-2 -left-2 w-5 h-5 rounded-md bg-[#36C5E5] text-white text-[10px] flex items-center justify-center font-bold">
                        {rank}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[12px] leading-snug">[만사형통부] 모든 일이 뜻하는 대로 이루어지길 기원</p>
                      <p className="text-xl font-bold mt-1">14,900원</p>
                      <p className="text-[11px] text-black/50">★ 4.8 (191)</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-7 pt-14 text-center">
          <h2 className="text-5xl font-black leading-tight">
            행운이 부족할 땐?
            <br />
            점신에서 채워요!
          </h2>
          <p className="mt-5 text-[25px] text-[#8B95A7]">지금 설치하고 더 많은 행운을 만나보세요!</p>

          <div className="mt-10 mx-auto w-[260px] h-[260px] rounded-[56px] bg-white border border-black/5 shadow-[0_30px_60px_rgba(0,0,0,0.05)] relative flex items-center justify-center">
            <div className="text-7xl font-black">점신</div>
            <div className="absolute -top-3 left-8 w-14 h-14 rounded-2xl bg-[#F1EA43]" />
            <div className="absolute right-8 bottom-10 w-12 h-12 rounded-full bg-white/80 border border-black/10" />
          </div>
        </section>

        <section className="px-5 pt-12 pb-28">
          <div className="flex gap-3">
            <button className="flex-1 h-14 rounded-2xl bg-[#F1EA43] text-xl font-bold">지금 설치하기</button>
            <button className="w-28 h-14 rounded-2xl bg-[#5B8EF6] text-white font-bold">제휴 문의</button>
          </div>

          <div className="flex justify-end mt-4">
            <button className="h-10 px-5 rounded-full bg-black text-white text-base font-semibold">App 설치</button>
          </div>
        </section>

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-16 bg-white border-t border-black/10 grid grid-cols-5 text-[11px]">
          {["점신", "2026년 운세", "타로", "상담", "점신몰"].map((label) => (
            <div key={label} className="flex items-center justify-center font-semibold">
              {label}
            </div>
          ))}
        </nav>
      </div>
    </main>
  );
}
