import { Suspense } from "react";
import { Activity, Database, Server, Settings, Zap } from "lucide-react";

/**
 * [gem-architect] 서버 컴포넌트 진입점. 
 * 무거운 상태 관리를 배제하고 RSC 기반으로 시스템 헬스를 Fetch (Mock)하여 클라에 Props로 전달.
 */
async function fetchSystemHealth() {
  // 실제 운영 시엔 DB Connection 체크 및 외부 API Ping 테스트가 들어감.
  await new Promise(resolve => setTimeout(resolve, 800)); // 모의 지연

  return [
    { name: "DACRE Engine (Saju)", status: "operational", ping: "12ms", icon: <Zap className="w-5 h-5" /> },
    { name: "PostgreSQL DB", status: "operational", ping: "45ms", icon: <Database className="w-5 h-5" /> },
    { name: "Payment Gateway", status: "degraded", ping: "150ms", icon: <Activity className="w-5 h-5" /> },
    { name: "Resend Email API", status: "operational", ping: "80ms", icon: <Server className="w-5 h-5" /> },
  ];
}

export default async function AdminDashboardPage() {
  const healthData = await fetchSystemHealth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-6 sm:p-12 font-mono">
      {/* Header */}
      <div className="max-w-5xl mx-auto flex items-center justify-between mb-12 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Settings className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-widest uppercase">Secret_Paws // Core</h1>
            <p className="text-xs text-slate-500 mt-1">Admin Verification Hub [v4.0.0]</p>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-bold text-sm">ALL_SYSTEMS_NOMINAL</span>
          </div>
          <span className="text-xs text-slate-600">Region: ap-northeast-2</span>
        </div>
      </div>

      {/* Main Grid: [gem-frontend] Cyberpunk-Minimalism */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {healthData.map((node, i) => (
          <div
            key={node.name}
            className={`p-5 rounded-2xl border ${node.status === 'operational'
                ? 'bg-emerald-950/20 border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                : 'bg-amber-950/20 border-amber-500/20 hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]'
              } backdrop-blur-md transition-all duration-300 group`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2 rounded-lg ${node.status === 'operational' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                {node.icon}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full border ${node.status === 'operational'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                }`}>
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

      {/* Sub Section: Error Matrix */}
      <div className="max-w-5xl mx-auto mt-12">
        <h2 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest border-s-2 border-indigo-500 pl-3">Recent Integrity Logs</h2>
        <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-white/5 text-xs uppercase text-slate-500 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">Event Level</th>
                <th className="px-6 py-4 font-medium">Message/Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-mono text-xs">2026-02-26 09:55:12</td>
                <td className="px-6 py-4"><span className="text-sky-400 text-xs px-2 py-1 bg-sky-500/10 rounded border border-sky-500/20">INFO</span></td>
                <td className="px-6 py-4">PWA Manifest injected successfully.</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-mono text-xs">2026-02-26 09:42:05</td>
                <td className="px-6 py-4"><span className="text-amber-400 text-xs px-2 py-1 bg-amber-500/10 rounded border border-amber-500/20">WARN</span></td>
                <td className="px-6 py-4">Toss Payments Widget timeout (150ms). Fallback triggered.</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-mono text-xs">2026-02-26 09:10:33</td>
                <td className="px-6 py-4"><span className="text-emerald-400 text-xs px-2 py-1 bg-emerald-500/10 rounded border border-emerald-500/20">SUCCESS</span></td>
                <td className="px-6 py-4">Gems Optimization System (gem-frontend) deployed.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
