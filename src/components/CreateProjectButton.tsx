'use client';

import { useTransition } from 'react';
import { createProject } from '@/app/actions';
import { PlusIcon, SpinnerIcon } from '@/components/ui/Icons';

export function CreateProjectButton() {
  const [isPending, startTransition] = useTransition();

  const handleCreateProject = () => {
    startTransition(() => {
      createProject();
    });
  };

  return (
    <button
      onClick={handleCreateProject}
      disabled={isPending}
      className="inline-flex items-center justify-center gap-2 px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isPending ? (
        <>
          <SpinnerIcon className="w-5 h-5 animate-spin" />
          Creating...
        </>
      ) : (
        <>
          <PlusIcon />
          Create New Project
        </>
      )}
    </button>
  );
}
