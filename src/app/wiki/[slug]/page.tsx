import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6 text-sm text-gray-600">
          <Link href="/wiki" className="hover:text-purple-600">
            📚 Documentation
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{title}</span>
        </div>

        {/* Content */}
        <article className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 prose prose-lg max-w-none">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
            {content}
          </pre>
        </article>

        {/* Footer Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <Link
            href="/wiki"
            className="text-purple-600 hover:text-purple-800 hover:underline"
          >
            ← Back to Documentation
          </Link>
          <Link
            href="/"
            className="text-purple-600 hover:text-purple-800 hover:underline"
          >
            Main App →
          </Link>
        </div>

        {/* Edit on GitHub (future) */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Found a typo? <span className="text-purple-600 cursor-not-allowed">Edit on GitHub</span></p>
        </div>
      </div>
    </div>
  );
}
