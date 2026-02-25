import { Lock } from "lucide-react";

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-background pt-24 pb-20 px-4">
            <div className="max-w-3xl mx-auto glass rounded-3xl p-8 border border-white/10">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
                    <Lock className="w-8 h-8 text-emerald-400" />
                    <h1 className="text-3xl font-bold text-white">개인정보처리방침</h1>
                </div>

                <div className="space-y-6 text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    <p>사주라떼(이하 &apos;회사&apos;)는 회원의 개인정보 보호를 매우 중요하게 생각합니다.</p>

                    <h3 className="text-white font-bold text-base mt-4">1. 수집하는 개인정보 항목</h3>
                    <p>
                        - 필수항목: 생년월일, 태어난 시간, 성별, 소셜 로그인 계정 정보(이메일, 닉네임)
                        - 선택항목: 프로필 사진
                    </p>

                    <h3 className="text-white font-bold text-base mt-4">2. 수집 목적</h3>
                    <p>
                        - 맞춤형 명리학 운세, 사주 분석 데이터 제공
                        - 회원 식별 및 CS 대처, 결제 내역 확인
                        - 신규 서비스 개발 및 마케팅(동의 시)
                    </p>

                    <h3 className="text-white font-bold text-base mt-4">3. 보관 및 파기</h3>
                    <p>
                        회원이 탈퇴하거나 정보 처리에 대한 동의를 철회할 경우 해당 데이터는 복구 불가능한 방법으로 지체 없이 즉각 파기됩니다.
                        단, 전자상거래법 등 관계 법령에 의해 보존할 필요가 있는 결제 데이터는 법정 기간 동안 별도 저장 후 파기합니다.
                    </p>
                </div>
            </div>
        </main>
    );
}
