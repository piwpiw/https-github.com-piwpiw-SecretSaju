import { Activity, Database, Server, Settings, Zap } from "lucide-react";

const SYSTEM_HEALTH = [
  { name: "시크릿사주 엔진", status: "operational", ping: "12ms", icon: <Zap className="w-5 h-5" /> },
  { name: "PostgreSQL DB", status: "operational", ping: "45ms", icon: <Database className="w-5 h-5" /> },
  { name: "Payment Gateway", status: "degraded", ping: "150ms", icon: <Activity className="w-5 h-5" /> },
  { name: "Resend Email API", status: "operational", ping: "80ms", icon: <Server className="w-5 h-5" /> },
];

async function fetchSystemHealth() {
  // 운영 시나리오에서는 실서비스 상태 API로 교체
  await new Promise(resolve => setTimeout(resolve, 800));

  return SYSTEM_HEALTH;
}

export default async function AdminDashboardPage() {
  const healthData = await fetchSystemHealth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-6 sm:p-12 font-mono">
        <div className="max-w-5xl mx-auto flex items-center justify-between mb-12 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Settings className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase">시크릿사주 // 코어</h1>
          <p className="text-xs text-slate-500 mt-1">관리자 인증 허브 [v4.0.1]</p>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <span className="text-emerald-400 font-bold text-sm">모든_시스템_정상</span>
          </div>
            <span className="text-xs text-slate-600">지역: ap-northeast-2</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {healthData.map((node) => (
          <div
            key={node.name}
            className={`p-5 rounded-2xl border ${
              node.status === 'operational'
                ? 'bg-emerald-950/20 border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                : 'bg-amber-950/20 border-amber-500/20 hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]'
            } backdrop-blur-md transition-all duration-300 group`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`p-2 rounded-lg ${
                  node.status === 'operational' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                }`}
              >
                {node.icon}
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full border ${
                  node.status === 'operational'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                }`}
              >
                {node.status.toUpperCase()}
              </span>
            </div>

            <h3 className="text-sm font-bold text-white mb-1 group-hover:text-slate-200 transition-colors">
              {node.name}
            </h3>
            <div className="flex items-center justify-between text-xs mt-4">
              <span className="text-slate-500">Latency</span>
              <span className="font-bold text-slate-300">{node.ping}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-5xl mx-auto mt-12">
        <h2 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest border-s-2 border-indigo-500 pl-3">최근 무결성 로그</h2>
        <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
          <table className="w-full text-left text-sm text-slate-400">
            <caption className="sr-only">System health event history list</caption>
            <thead className="bg-white/5 text-xs uppercase text-slate-500 border-b border-white/5">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">시간</th>
                <th scope="col" className="px-6 py-4 font-medium">등급</th>
                <th scope="col" className="px-6 py-4 font-medium">메시지/코드</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-mono text-xs">2026-02-26 09:55:12</td>
                <td className="px-6 py-4"><span className="text-sky-400 text-xs px-2 py-1 bg-sky-500/10 rounded border border-sky-500/20">정보</span></td>
                <td className="px-6 py-4">PWA 매니페스트 주입이 완료되었습니다.</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-mono text-xs">2026-02-26 09:42:05</td>
                <td className="px-6 py-4"><span className="text-amber-400 text-xs px-2 py-1 bg-amber-500/10 rounded border border-amber-500/20">경고</span></td>
                <td className="px-6 py-4">토스 결제 위젯 타임아웃(150ms). 대체 처리 실행.</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-mono text-xs">2026-02-26 09:10:33</td>
                <td className="px-6 py-4"><span className="text-emerald-400 text-xs px-2 py-1 bg-emerald-500/10 rounded border border-emerald-500/20">성공</span></td>
                <td className="px-6 py-4">보석 최적화 시스템이 배포되었습니다.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


