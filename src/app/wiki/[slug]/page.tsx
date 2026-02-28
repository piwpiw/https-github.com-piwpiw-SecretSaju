import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Book, ChevronRight, Share2, Terminal } from 'lucide-react';

// Slug to file path mapping
const slugToPath: Record<string, string> = {
  'ceo-dashboard': 'docs/01-team/c-level/ceo-dashboard.md',
  'cto-technical-strategy': 'docs/01-team/c-level/cto-technical-strategy.md',
  'executive-summary': 'docs/05-external/investors/executive-summary.md',
  'developer-onboarding': 'docs/01-team/engineering/onboarding.md',
  'coding-standards': 'docs/01-team/engineering/coding-standards.md',
  'architecture-overview': 'docs/02-technical/architecture/overview.md',
  'git-workflow': 'docs/01-team/engineering/git-workflow.md',
  'api-reference': 'docs/02-technical/api/README.md',
  'pm-guide': 'docs/01-team/product/pm-guide.md',
  'roadmap': 'docs/00-overview/roadmap.md',
  'design-system': 'docs/01-team/product/design-system.md',
  'cs-guide': 'docs/01-team/operations/cs-guide.md',
  'qa-test-scenarios': 'docs/01-team/qa/test-scenarios.md',
  'project-overview': 'docs/00-overview/README.md',
  'tech-stack': 'docs/00-overview/tech-stack.md',
  'glossary': 'docs/00-overview/glossary.md',
};

export function generateStaticParams() {
  return Object.keys(slugToPath).map((slug) => ({
    slug,
  }));
}

export default async function DocPage({
  params
}: {
  params: { slug: string }
}) {
  const filePath = slugToPath[params.slug];

  if (!filePath) {
    notFound();
  }

  const fullPath = path.join(process.cwd(), filePath);

  let content: string;
  try {
    content = fs.readFileSync(fullPath, 'utf8');
  } catch (error) {
    notFound();
  }

  // Extract title from first # heading
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : params.slug;

  return (
    <main className="min-h-screen text-white relative overflow-hidden pb-32">

      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-12">
          <Link
            href="/wiki"
            className="flex items-center gap-3 text-slate-500 hover:text-white transition-all group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">뒤로</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
              문서
            </div>
            <button className="p-2 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition">
              <Share2 className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Content Header */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <Book className="w-6 h-6 text-cyan-400" />
            <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/30 to-transparent" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--text-foreground)' }}>{title}</h1>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>문서: {params.slug}</span>
            <span className="opacity-20">|</span>
            <span>사주 사전</span>
          </div>
        </div>

        {/* content Section */}
        <div className="premium-card p-1 sm:p-1 relative group bg-white/[0.01] border-white/5 mb-12">
          <div className="premium-card-border" />
          <div className="p-8 sm:p-12 relative z-10">
            <div className="flex items-center gap-3 mb-8 opacity-40">
              <Terminal className="w-4 h-4" />
              <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>문서 로드 완료</span>
            </div>
            <article className="prose prose-invert prose-slate max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-slate-400 font-mono leading-relaxed bg-black/40 p-8 rounded-2xl border border-white/5 shadow-2xl">
                {content}
              </pre>
            </article>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/wiki"
            className="flex-[1] py-4 rounded-xl text-sm font-medium flex items-center justify-center gap-3" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-foreground)', border: '1px solid var(--border-color)' }}
          >
            <ArrowLeft className="w-5 h-5" /> 사전으로
          </Link>
          <Link
            href="/"
            className="flex-[2] py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center gap-3"
          >
            홈으로 <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Legal Disclaimer Footer */}
        <div className="mt-20 text-center opacity-30">
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>본 문서는 시크릿사주의 자산이며 무단 복제를 금지합니다.</p>
        </div>
      </div>
    </main>
  );
}
