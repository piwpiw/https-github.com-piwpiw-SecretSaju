import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "신년운세 | 멍냥의 이중생활",
  description: "2026 신년운세. 연도를 고르고 생년월일을 입력하면 일주 기반 신년운세를 볼 수 있어요.",
};

export default function FortuneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
