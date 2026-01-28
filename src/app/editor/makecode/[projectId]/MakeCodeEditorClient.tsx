"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import { EditorHeader } from "@/components/editors/makecode/EditorHeader";
import { EditorToolbar } from "@/components/editors/makecode/EditorToolbar";
import { DEFAULT_MAKECODE_PROJECT } from "@/lib/makecode/makeCodeAssets";
import type { SaveStatusType } from "@/components/ui/SaveStatus";
import type { MakeCodeProject } from "@/types/makecode";
import type { MakeCodeEditorRef } from "@/components/editors/MakeCodeEditor";
import { MakeCodeEditor } from "@/components/editors/MakeCodeEditor";

interface Props {
  projectId: string;
  initialProject: MakeCodeProject | null;
}

export function MakeCodeEditorClient({ projectId, initialProject }: Props) {
  const editorRef = useRef<MakeCodeEditorRef>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatusType>("saved");

  const resolvedProject = useMemo<MakeCodeProject>(() => {
    if (initialProject) return initialProject;
    return {
      ...DEFAULT_MAKECODE_PROJECT,
      header: { ...DEFAULT_MAKECODE_PROJECT.header, id: projectId },
    };
  }, [initialProject, projectId]);

  const handleChange = useCallback(async (project: MakeCodeProject) => {
    setSaveStatus("saving");
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ makecodeProject: project }),
      });
      if (!response.ok) throw new Error("Failed to save project");
      setSaveStatus("saved");
    } catch (error) {
      console.error("[MakeCode] Save error:", error);
      setSaveStatus("unsaved");
    }
  }, [projectId]);

  const handleError = useCallback((error: Error) => {
    console.error("[MakeCode]", error);
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <EditorHeader projectId={projectId} saveStatus={saveStatus} />
      <EditorToolbar editorRef={editorRef} />

      <main className="flex-1 overflow-hidden">
        <MakeCodeEditor
          ref={editorRef}
          initialProject={resolvedProject}
          onChange={handleChange}
          onError={handleError}
        />
      </main>
    </div>
  );
}
