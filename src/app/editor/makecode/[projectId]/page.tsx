'use client';

import { use } from 'react';
import Link from 'next/link';
import { MakeCodeEditorClient } from './MakeCodeEditorClient';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function EditorPage({ params }: PageProps) {
  const { projectId } = use(params);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="hidden sm:inline">Back to Projects</span>
          </Link>

          <div className="h-6 w-px bg-gray-300" />

          <span className="text-lg font-semibold text-gray-900">
            MakeCode Editor
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Project ID badge */}
          <div className="hidden sm:block px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-500 font-mono">
            ID: {projectId.slice(0, 8)}...
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="flex-1 overflow-hidden">
        <MakeCodeEditorClient projectId={projectId} />
      </main>
    </div>
  );
}
