'use client';

import { use } from 'react';
import { MakeCodeEditorClient } from './MakeCodeEditorClient';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function EditorPage({ params }: PageProps) {
  const { projectId } = use(params);

  return <MakeCodeEditorClient projectId={projectId} />;
}
