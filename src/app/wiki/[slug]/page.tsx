import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArrowLeft, Book, ChevronRight, Share2 } from "lucide-react";

const slugToPath: Record<string, string> = {
  "ceo-dashboard": "docs/01-team/c-level/ceo-dashboard.md",
  "cto-technical-strategy": "docs/01-team/c-level/cto-technical-strategy.md",
  "executive-summary": "docs/05-external/investors/executive-summary.md",
  "developer-onboarding": "docs/01-team/engineering/onboarding.md",
  "coding-standards": "docs/01-team/engineering/coding-standards.md",
  "architecture-overview": "docs/02-technical/architecture/overview.md",
  "git-workflow": "docs/01-team/engineering/git-workflow.md",
  "api-reference": "docs/02-technical/api/README.md",
  "pm-guide": "docs/01-team/product/pm-guide.md",
  "roadmap": "docs/00-overview/roadmap.md",
  "design-system": "docs/01-team/product/design-system.md",
  "cs-guide": "docs/01-team/operations/cs-guide.md",
  "qa-test-scenarios": "docs/01-team/qa/test-scenarios.md",
  "project-overview": "docs/00-overview/README.md",
  "tech-stack": "docs/00-overview/tech-stack.md",
  "glossary": "docs/00-overview/glossary.md",
};

export function generateStaticParams() {
  return Object.keys(slugToPath).map((slug) => ({
    slug,
  }));
}

export default async function DocPage({
  params,
}: {
  params: { slug: string };
}) {
  const filePath = slugToPath[params.slug];

  if (!filePath) {
    notFound();
  }

  const fullPath = path.join(process.cwd(), filePath);

  let content: string;
  try {
    content = fs.readFileSync(fullPath, "utf8");
  } catch {
    notFound();
  }

  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : params.slug;

  return (
    <main className="relative min-h-screen overflow-hidden pb-32 text-white">
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-12">
        <div className="mb-12 flex items-center justify-between">
          <Link
            href="/wiki"
            className="group flex items-center gap-3 text-slate-500 transition-all hover:text-white"
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium">뒤로</span>
          </Link>
          <div className="flex items-center gap-4">
            <div
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{
                backgroundColor: "var(--surface)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-color)",
              }}
            >
              문서
            </div>
            <button className="rounded-xl border border-white/5 bg-white/5 p-2 transition hover:bg-white/10">
              <Share2 className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="mb-16">
          <div className="mb-6 flex items-center gap-4">
            <Book className="h-6 w-6 text-cyan-400" />
            <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/30 to-transparent" />
          </div>
          <h1
            className="mb-3 text-3xl font-bold md:text-4xl"
            style={{ color: "var(--text-foreground)" }}
          >
            {title}
          </h1>
          <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-secondary)" }}>
            <span>문서: {params.slug}</span>
            <span className="opacity-20">|</span>
            <span>사주 사전</span>
          </div>
        </div>

        <div className="premium-card group relative mb-12 border-white/5 bg-white/[0.01] p-1 sm:p-1">
          <div className="premium-card-border" />
          <div className="relative z-10 p-8 sm:p-12">
            <article
              className="prose prose-invert prose-slate max-w-none
                prose-headings:font-bold prose-headings:text-white
                prose-h1:text-2xl prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2 prose-h2:text-xl
                prose-p:leading-relaxed prose-p:text-slate-300
                prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-white
                prose-code:rounded prose-code:bg-white/10 prose-code:px-1 prose-code:text-cyan-300
                prose-pre:border prose-pre:border-white/10 prose-pre:bg-black/40
                prose-table:text-sm prose-th:text-slate-300 prose-td:text-slate-400
                prose-li:text-slate-300
                prose-blockquote:border-cyan-400/50 prose-blockquote:text-slate-400"
            >
              <MDXRemote source={content} />
            </article>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/wiki"
            className="flex flex-[1] items-center justify-center gap-3 rounded-xl py-4 text-sm font-medium"
            style={{
              backgroundColor: "var(--surface)",
              color: "var(--text-foreground)",
              border: "1px solid var(--border-color)",
            }}
          >
            <ArrowLeft className="h-5 w-5" /> 사전으로
          </Link>
          <Link
            href="/"
            className="flex flex-[2] items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-4 text-sm font-bold text-white"
          >
            홈으로 <ChevronRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="mt-20 text-center opacity-30">
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            본 문서는 시크릿사주의 자산이며 무단 복제를 금지합니다.
          </p>
        </div>
      </div>
    </main>
  );
}
