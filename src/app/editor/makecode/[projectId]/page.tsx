import { getProject } from '@/app/actions';
import { MakeCodeEditorClient } from './MakeCodeEditorClient';
import type { MakeCodeProject } from '@/types/makecode';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function EditorPage({ params }: PageProps) {
  const { projectId } = await params;
  const project = await getProject(projectId);

  // Project may not exist yet (new project) - that's okay, we'll create on first save
  const initialProject = project?.makecodeProject as MakeCodeProject | null;

  return (
    <MakeCodeEditorClient
      projectId={projectId}
      initialProject={initialProject}
    />
  );
}
