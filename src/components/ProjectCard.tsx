'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { formatDate } from '@/lib/utils';
import { deleteProject } from '@/app/actions';
import { TrashIcon, CalendarIcon, SpinnerIcon } from '@/components/ui/Icons';

interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm('Are you sure you want to delete this project?')) {
      startTransition(() => {
        deleteProject(project.id);
      });
    }
  };

  return (
    <Link href={`/editor/makecode/${project.id}`} className="block group">
      <div
        className={`border border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition-all duration-200 bg-white ${isPending ? 'opacity-50' : ''}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600">
              {project.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Last modified: {formatDate(project.updatedAt)}
            </p>
          </div>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Delete project"
          >
            {isPending ? (
              <SpinnerIcon className="w-5 h-5 animate-spin" />
            ) : (
              <TrashIcon />
            )}
          </button>
        </div>
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <CalendarIcon className="w-4 h-4 mr-1" />
          Created: {formatDate(project.createdAt)}
        </div>
      </div>
    </Link>
  );
}
