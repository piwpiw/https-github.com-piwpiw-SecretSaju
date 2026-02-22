import fs from 'fs';
import path from 'path';
import Link from 'next/link';

interface DocLink {
    title: string;
    slug: string;
    category: string;
}

export default function WikiPage() {
    // 주요 문서 목록
    const docs: DocLink[] = [
        // Leadership
        { title: 'CEO Dashboard', slug: 'ceo-dashboard', category: 'Leadership' },
        { title: 'CTO Technical Strategy', slug: 'cto-technical-strategy', category: 'Leadership' },
        { title: 'Executive Summary (IR)', slug: 'executive-summary', category: 'Leadership' },

        // Engineering
        { title: 'Developer Onboarding', slug: 'developer-onboarding', category: 'Engineering' },
        { title: 'Coding Standards', slug: 'coding-standards', category: 'Engineering' },
        { title: 'Architecture Overview', slug: 'architecture-overview', category: 'Engineering' },
        { title: 'Git Workflow', slug: 'git-workflow', category: 'Engineering' },
        { title: 'API Reference', slug: 'api-reference', category: 'Engineering' },

        // Product & Design
        { title: 'PM Guide', slug: 'pm-guide', category: 'Product' },
        { title: 'Product Roadmap', slug: 'roadmap', category: 'Product' },
        { title: 'Design System', slug: 'design-system', category: 'Product' },

        // Operations
        { title: 'CS Guide', slug: 'cs-guide', category: 'Operations' },
        { title: 'QA Test Scenarios', slug: 'qa-test-scenarios', category: 'Operations' },

        // Overview
        { title: 'Project Overview', slug: 'project-overview', category: 'Overview' },
        { title: 'Tech Stack', slug: 'tech-stack', category: 'Overview' },
        { title: 'Glossary', slug: 'glossary', category: 'Overview' },
    ];

    // 카테고리별 그룹화
    const groupedDocs = docs.reduce((acc, doc) => {
        if (!acc[doc.category]) {
            acc[doc.category] = [];
        }
        acc[doc.category].push(doc);
        return acc;
    }, {} as Record<string, DocLink[]>);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        📚 Secret Saju Documentation
                    </h1>
                    <p className="text-lg text-gray-600">
                        Complete knowledge base for all team members and stakeholders
                    </p>
                </div>

                {/* Quick Links by Role */}
                <div className="mb-12 p-6 bg-purple-50 rounded-lg border border-purple-200">
                    <h2 className="text-xl font-semibold mb-4 text-purple-900">🎯 Quick Start by Role</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <h3 className="font-medium text-purple-800 mb-2">Leadership</h3>
                            <ul className="space-y-1">
                                <li><Link href="/wiki/ceo-dashboard" className="text-purple-600 hover:text-purple-800 hover:underline">CEO Dashboard</Link></li>
                                <li><Link href="/wiki/cto-technical-strategy" className="text-purple-600 hover:text-purple-800 hover:underline">CTO Strategy</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-medium text-purple-800 mb-2">Engineering</h3>
                            <ul className="space-y-1">
                                <li><Link href="/wiki/developer-onboarding" className="text-purple-600 hover:text-purple-800 hover:underline">Developer Onboarding</Link></li>
                                <li><Link href="/wiki/api-reference" className="text-purple-600 hover:text-purple-800 hover:underline">API Reference</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-medium text-purple-800 mb-2">Product</h3>
                            <ul className="space-y-1">
                                <li><Link href="/wiki/pm-guide" className="text-purple-600 hover:text-purple-800 hover:underline">PM Guide</Link></li>
                                <li><Link href="/wiki/roadmap" className="text-purple-600 hover:text-purple-800 hover:underline">Roadmap</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* All Documents by Category */}
                <div className="space-y-8">
                    {Object.entries(groupedDocs).map(([category, categoryDocs]) => (
                        <div key={category} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-900">{category}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {categoryDocs.map((doc) => (
                                    <Link
                                        key={doc.slug}
                                        href={`/wiki/${doc.slug}`}
                                        className="p-4 border border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all group"
                                    >
                                        <h3 className="font-medium text-gray-900 group-hover:text-purple-600">
                                            {doc.title}
                                        </h3>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-gray-500 text-sm">
                    <p>📝 Documentation updated: 2026-01-31</p>
                    <p className="mt-2">
                        <Link href="/" className="text-purple-600 hover:underline">
                            ← Back to Main App
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
