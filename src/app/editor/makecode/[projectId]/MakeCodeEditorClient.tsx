"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/editors/makecode/LoadingSpinner";
import { EditorHeader } from "@/components/editors/makecode/EditorHeader";
import type { SaveStatusType } from "@/components/ui/SaveStatus";
import type { MakeCodeProject } from "@/types/makecode";

const MakeCodeEditor = dynamic(
  () =>
    import("@/components/editors/MakeCodeEditor").then(
      (mod) => mod.MakeCodeEditor
    ),
  {
    ssr: false,
    loading: () => <LoadingSpinner message="Loading MakeCode editor..." />,
  }
);

interface Props {
  projectId: string;
  initialProject: MakeCodeProject | null;
}

export function MakeCodeEditorClient({ projectId, initialProject }: Props) {
  const [saveStatus, setSaveStatus] = useState<SaveStatusType>("saved");

  return (
    <div className="h-screen flex flex-col">
      <EditorHeader projectId={projectId} saveStatus={saveStatus} />

      <main className="flex-1 overflow-hidden">
        <MakeCodeEditor
          projectId={projectId}
          initialProject={initialProject}
          onError={(error) => console.error("[MakeCode]", error)}
          onSaveStatusChange={setSaveStatus}
        />
      </main>
    </div>
  );
}
