'use client';

import Link from 'next/link';
import { HeartHandshake, ArrowRight, Sparkles, ArrowLeft } from 'lucide-react';

export default function RelationshipPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <section className="w-full max-w-xl rounded-4xl bg-surface border border-border-color p-8 shadow-2xl text-left">
        <div className="text-left">
          <HeartHandshake className="w-12 h-12 text-primary" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-black text-foreground mt-4 mb-3">연애·관계 메뉴</h1>
        <p className="text-sm sm:text-base text-secondary mb-6 leading-relaxed">
          현재 관계 분석은 사주 데이터 등록/목록( /my-saju/list )을 기반으로 동작해야 합니다.
          등록된 프로필이 없으면 먼저 생성하고, 생성 후 바로 분석 플로우로 이어집니다.
        </p>

        <div className="space-y-3 text-sm text-left rounded-2xl bg-black/5 border border-white/10 p-5 mb-8">
          <p className="font-black text-foreground">서비스 동작 가이드</p>
          <ul className="list-disc ml-5 space-y-2 text-secondary">
            <li>프로필 선택: /my-saju/list에서 대상 선택</li>
            <li>관계 유형 정하기: 본인/연인/친구/배우자/가족 중 선택</li>
            <li>궁합 분석: /compatibility로 이동해 점수와 상세 해석 확인</li>
          </ul>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/my-saju/list"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-4 bg-primary text-white font-black rounded-2xl hover:scale-105 transition-all"
            aria-label="내 프로필 목록으로 이동"
          >
            내 프로필 목록
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/compatibility"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-4 border border-border-color text-secondary font-black rounded-2xl hover:text-foreground transition-all"
            aria-label="궁합 분석으로 이동"
          >
            궁합 분석 시작
            <Sparkles className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-xs text-slate-400 flex items-center gap-2">
          <ArrowLeft className="w-3 h-3" />
          <span>관계 분석 관련 페이지는 추후 상세 시나리오(메시지 교차검증, 이벤트 플로우)로 고도화 예정</span>
        </div>
      </section>
    </main>
  );
}
