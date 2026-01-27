'use client';

import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/editors/makecode/LoadingSpinner';

const MakeCodeEditor = dynamic(
  () => import('@/components/editors/MakeCodeEditor').then(mod => mod.MakeCodeEditor),
  {
    ssr: false,
    loading: () => <LoadingSpinner message="Loading MakeCode editor..." />,
  }
);

interface Props {
  projectId: string;
}

export function MakeCodeEditorClient({ projectId }: Props) {
  return (
    <div className="w-full h-full">
      <MakeCodeEditor
        projectId={projectId}
        onError={(error) => console.error('[MakeCode]', error)}
      />
    </div>
  );
}
