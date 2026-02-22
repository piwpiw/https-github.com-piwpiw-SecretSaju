"use client";

/**
 * 관리자 모드: 전체 검증 체크리스트
 * 20명 동시 개발/검증 시 한 화면에서 DACRE·API·페이지·예외 일괄 검증
 */

import { useState, useEffect } from "react";
import Link from "next/link";

type CheckItem = {
  id: string;
  label: string;
  status: "pending" | "ok" | "fail";
  detail?: string;
};

const FIXED_BIRTH = { year: 2000, month: 1, day: 1 }; // 2000-01-01 → 기준일 근처

export default function AdminPage() {
  const [checks, setChecks] = useState<CheckItem[]>([]);
  const [running, setRunning] = useState(false);

  const runVerification = async () => {
    setRunning(true);
    const results: CheckItem[] = [];

    // 1. DACRE: 고정 생년월일 → 일주/코드/나이대
    try {
      const { getDayPillarIndex, getPillarCode, getPillarNameKo, PILLAR_CODES } = await import("@/lib/saju");
      const d = new Date(FIXED_BIRTH.year, FIXED_BIRTH.month - 1, FIXED_BIRTH.day);
      const idx = getDayPillarIndex(d);
      const code = getPillarCode(idx);
      const nameKo = getPillarNameKo(idx);
      const codeValid = PILLAR_CODES.includes(code) && idx >= 0 && idx < 60;
      results.push({
        id: "dacre-fixed-birth",
        label: "DACRE: 고정 생년(2000-01-01) 일주/코드",
        status: codeValid ? "ok" : "fail",
        detail: codeValid ? `${nameKo} (${code}) idx=${idx}` : `idx=${idx} code=${code}`,
      });
    } catch (e) {
      results.push({ id: "dacre-fixed-birth", label: "DACRE: 고정 생년 일주", status: "fail", detail: String(e) });
    }

    // 2. 추천: 동일 코드 → 음식 3종·제품 3종
    try {
      const { getFoodRecommendationsByCode } = await import("@/data/foodRecommendations");
      const { getProductRecommendationsByCode } = await import("@/data/productRecommendations");
      const foods = getFoodRecommendationsByCode("GAP_JA", "20s");
      const products = getProductRecommendationsByCode("GAP_JA");
      const ok = foods.length >= 1 && products.length >= 1;
      results.push({
        id: "rec-food-product",
        label: "추천: GAP_JA → 음식·제품 각 1개 이상",
        status: ok ? "ok" : "fail",
        detail: ok ? `음식 ${foods.length}개, 제품 ${products.length}개` : "",
      });
    } catch (e) {
      results.push({ id: "rec-food-product", label: "추천: 음식·제품", status: "fail", detail: String(e) });
    }

    // 3. API recommendations
    try {
      const r = await fetch("/api/recommendations?code=GAP_JA&ageGroup=20s");
      const data = r.ok ? await r.json() : null;
      const ok = r.status === 200 && data?.foods?.length >= 1 && data?.products?.length >= 1;
      results.push({
        id: "api-recommendations",
        label: "API GET /api/recommendations 200 + 스키마",
        status: ok ? "ok" : "fail",
        detail: r.status.toString(),
      });
    } catch (e) {
      results.push({ id: "api-recommendations", label: "API recommendations", status: "fail", detail: String(e) });
    }

    // 4. API daily-fortune
    try {
      const r = await fetch("/api/daily-fortune");
      const data = r.ok ? await r.json() : null;
      const ok = r.status === 200 && data?.message != null;
      results.push({
        id: "api-daily-fortune",
        label: "API GET /api/daily-fortune 200 + message",
        status: ok ? "ok" : "fail",
        detail: r.status.toString(),
      });
    } catch (e) {
      results.push({ id: "api-daily-fortune", label: "API daily-fortune", status: "fail", detail: String(e) });
    }

    // 5. API payment/verify 스텁
    try {
      const r = await fetch("/api/payment/verify", { method: "POST", body: JSON.stringify({}) });
      const data = r.ok ? await r.json() : null;
      const ok = r.status === 200 && data && typeof data.success !== "undefined";
      results.push({
        id: "api-payment-verify",
        label: "API POST /api/payment/verify 스텁 응답",
        status: ok ? "ok" : "fail",
        detail: r.status.toString(),
      });
    } catch (e) {
      results.push({ id: "api-payment-verify", label: "API payment/verify", status: "fail", detail: String(e) });
    }

    // 6. 잘못된 code → 400
    try {
      const r = await fetch("/api/recommendations?code=INVALID");
      results.push({
        id: "api-invalid-code",
        label: "API 잘못된 code → 400",
        status: r.status === 400 ? "ok" : "fail",
        detail: r.status.toString(),
      });
    } catch (e) {
      results.push({ id: "api-invalid-code", label: "API invalid code", status: "fail", detail: String(e) });
    }

    setChecks(results);
    setRunning(false);
  };

  useEffect(() => {
    runVerification();
  }, []);

  const okCount = checks.filter((c) => c.status === "ok").length;
  const failCount = checks.filter((c) => c.status === "fail").length;

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-2xl text-foreground mb-2">관리자 · 전체 검증</h1>
        <p className="text-zinc-400 text-sm mb-6">
          DACRE, API, 추천, 결제 스텁, 예외(400) 일괄 검증. 20명 교차 검증용.
        </p>
        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={runVerification}
            disabled={running}
            className="rounded-xl bg-primary px-4 py-2 text-white font-medium disabled:opacity-50"
          >
            {running ? "검증 중..." : "다시 검증"}
          </button>
          <Link href="/" className="rounded-xl bg-surface px-4 py-2 text-foreground">
            홈
          </Link>
        </div>
        <div className="mb-4 text-sm text-zinc-400">
          통과: {okCount} / 실패: {failCount} / 전체: {checks.length}
        </div>
        <ul className="space-y-2">
          {checks.map((c) => (
            <li
              key={c.id}
              className={`rounded-lg px-4 py-3 flex items-center justify-between ${
                c.status === "ok" ? "bg-green-500/10 text-green-300" : c.status === "fail" ? "bg-red-500/10 text-red-300" : "bg-white/5 text-zinc-400"
              }`}
            >
              <span>{c.label}</span>
              <span className="text-xs">{c.status === "ok" ? "✓" : c.status === "fail" ? "✗" : "—"} {c.detail ?? ""}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8 p-4 rounded-xl glass text-sm text-zinc-400">
          <p className="font-medium text-foreground mb-2">사용자 모드 검증 (E2E)</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>메인 → 생년월일 입력 → 결과 카드 + 추천 음식/제품</li>
            <li>공유 버튼 → 카드 뒷면 해금</li>
            <li>새벽 2시 본능 → 300원 CTA → 결제 모달</li>
            <li>잘못된 날짜(2월 30일) → 유효성 메시지</li>
            <li>오늘의 개소리 배너 노출</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
