import { ShieldAlert } from "lucide-react";

export default function LegalPage() {
    return (
        <main className="min-h-screen bg-background pt-24 pb-20 px-4">
            <div className="max-w-3xl mx-auto glass rounded-3xl p-8 border border-white/10">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
                    <ShieldAlert className="w-8 h-8 text-orange-400" />
                    <h1 className="text-3xl font-bold text-white">법적 고지</h1>
                </div>

                <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
                    <p>
                        <strong>1. 서비스의 목적</strong><br />
                        본 서비스(Secret Saju, 990 사주마미, 사주라떼)가 제공하는 명리학 기반 운세 및 성향 분석 결과는 통계적, 철학적 해석에 입각한 엔터테인먼트 콘텐츠입니다.<br />
                        이 결과표는 100% 미래를 예측하거나 확정하는 것이 아닙니다.
                    </p>
                    <p>
                        <strong>2. 법적/의학적 조언 대체 불가</strong><br />
                        서비스에서 제공하는 건강, 재물, 직업 등에 관련된 정보는 법적, 의학적, 재무적, 심리적 전문 조언 및 상담을 절대 대체할 수 없습니다.<br />
                        사용자가 본 서비스의 결과만을 신뢰하여 내린 결정이나 행동으로 인해 발생한 직·간접적인 손해, 손실에 대해 당사는 어떠한 법적 책임도 지지 않습니다.
                    </p>
                    <p>
                        <strong>3. 지적재산권</strong><br />
                        서비스에 포함된 문구, 디자인, 일러스트(동물 아키타입), 알고리즘 등은 당사의 지적재산권으로 보호됩니다. 무단 도용 및 상업적 사용을 禁합니다.
                    </p>
                </div>
            </div>
        </main>
    );
}
