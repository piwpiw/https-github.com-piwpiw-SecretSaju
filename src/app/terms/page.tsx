import { FileText } from "lucide-react";

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-background pt-24 pb-20 px-4">
            <div className="max-w-3xl mx-auto glass rounded-3xl p-8 border border-white/10">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
                    <FileText className="w-8 h-8 text-blue-400" />
                    <h1 className="text-3xl font-bold text-white">서비스 이용약관</h1>
                </div>

                <div className="space-y-6 text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    <h3 className="text-white font-bold text-base mt-4">제 1 조 (목적)</h3>
                    <p>본 약관은 회사가 제공하는 사주라떼(Secret Saju) 서비스 이용과 관련하여 회사와 사용자의 권리, 의무, 책임 사항을 규정합니다.</p>

                    <h3 className="text-white font-bold text-base mt-4">제 2 조 (계정 밀 유료 캐시)</h3>
                    <p>
                        - 유저는 카카오, 네이버, 구글 등 소셜 로그인을 통해 회원이 될 수 있습니다.
                        - 유료 재화(젤리 캐시)는 결제된 시점으로부터 5년간 유효하며, 미사용 시 소멸됩니다.
                        - 유료 재화의 환불 규정은 당사의 상세 취소/환불 기준을 따릅니다.
                    </p>

                    <h3 className="text-white font-bold text-base mt-4">제 3 조 (회원의 의무)</h3>
                    <p>
                        회원은 타인의 생년월일 등 개인정보를 도용하여 서비스를 이용할 수 없으며, 이로 인해 발생하는 불이익 및 법적 책임은 전적으로 회원 본인에게 있습니다.
                    </p>

                    <p className="text-xs text-slate-500 mt-10">시행일자: 2026년 2월 1일</p>
                </div>
            </div>
        </main>
    );
}
