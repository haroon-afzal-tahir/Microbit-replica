"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/editors/makecode/LoadingSpinner";
import { EditorHeader } from "@/components/editors/makecode/EditorHeader";
import { EditorToolbar } from "@/components/editors/makecode/EditorToolbar";
import type { SaveStatusType } from "@/components/ui/SaveStatus";
import type { MakeCodeProject } from "@/types/makecode";
import type { MakeCodeEditorRef } from "@/components/editors/MakeCodeEditor";

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
  const editorRef = useRef<MakeCodeEditorRef>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatusType>("saved");

  return (
    <div className="h-screen flex flex-col">
      <EditorHeader projectId={projectId} saveStatus={saveStatus} />
      <EditorToolbar editorRef={editorRef} />

      <main className="flex-1 overflow-hidden">
        <MakeCodeEditor
          ref={editorRef}
          projectId={projectId}
          initialProject={initialProject}
          onError={(error) => console.error("[MakeCode]", error)}
          onSaveStatusChange={setSaveStatus}
        />
      </main>
    </div>
  );
}
