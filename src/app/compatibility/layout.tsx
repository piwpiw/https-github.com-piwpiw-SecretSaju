import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "궁합 | 멍냥의 이중생활",
  description: "우리 궁합은 몇 점? 두 사람의 생년월일로 일주 기반 궁합을 확인하세요.",
};

export default function CompatibilityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
