import Link from 'next/link';
import { ArrowLeftIcon } from '@/components/ui/Icons';
import { SaveStatus, type SaveStatusType } from '@/components/ui/SaveStatus';

interface EditorHeaderProps {
  projectId: string;
  saveStatus: SaveStatusType;
}

export function EditorHeader({ projectId, saveStatus }: EditorHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon />
          <span className="hidden sm:inline">Back</span>
        </Link>

        <div className="h-6 w-px bg-gray-300" />

        <span className="text-lg font-semibold text-gray-900">
          MakeCode Editor
        </span>
      </div>

      <div className="flex items-center gap-3">
        <SaveStatus status={saveStatus} />

        <div className="hidden md:block px-2 py-1 bg-gray-100 rounded text-xs text-gray-500 font-mono">
          {projectId.slice(0, 8)}...
        </div>
      </div>
    </header>
  );
}
