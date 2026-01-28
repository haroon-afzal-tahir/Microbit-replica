'use client';

import { useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { buildMakeCodeUrl, DEFAULT_MAKECODE_PROJECT } from '@/lib/makecode/makeCodeAssets';
import { LoadingSpinner } from './makecode/LoadingSpinner';
import { useMakeCodeMessages } from '@/hooks/useMakeCodeMessages';
import type { MakeCodeProject } from '@/types/makecode';

export type { MakeCodeProject };

export interface MakeCodeEditorRef {
  switchToBlocks: () => void;
  switchToJavaScript: () => void;
  switchToPython: () => void;
  compile: () => void;
  openSettings: () => void;
  openExtensions: () => void;
  pairDevice: () => void;
  print: () => void;
  setHighContrast: (on: boolean) => void;
  setGreenScreen: (on: boolean) => void;
}

export interface MakeCodeEditorProps {
  projectId: string;
  initialProject: MakeCodeProject | null;
  onError?: (error: Error) => void;
  onSave?: () => void;
  onSaveStatusChange?: (status: 'saving' | 'saved' | 'unsaved') => void;
}

export const MakeCodeEditor = forwardRef<MakeCodeEditorRef, MakeCodeEditorProps>(({
  projectId,
  initialProject,
  onError,
  onSave,
  onSaveStatusChange,
}, ref) => {
  const [isReady, setIsReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const resolvedProject = initialProject ?? {
    ...DEFAULT_MAKECODE_PROJECT,
    header: { ...DEFAULT_MAKECODE_PROJECT.header, id: projectId },
  };

  const saveProject = useCallback(async (project: MakeCodeProject) => {
    onSaveStatusChange?.('saving');
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ makecodeProject: project }),
      });
      await response.json();
      onSaveStatusChange?.('saved');
      onSave?.();
    } catch (error) {
      onSaveStatusChange?.('unsaved');
      onError?.(error as Error);
    }
  }, [projectId, onError, onSave, onSaveStatusChange]);

  const { commands } = useMakeCodeMessages({
    iframeRef,
    initialProject: resolvedProject,
    onReady: () => setIsReady(true),
    onSave: saveProject,
  });

  useImperativeHandle(ref, () => commands, [commands]);

  const iframeUrl = buildMakeCodeUrl({
    controllerId: 'microbit-replica',
    embed: true,
    hideHeader: true,
  });

  return (
    <div className="relative w-full h-full">
      {!isReady && (
        <div className="absolute inset-0 z-20">
          <LoadingSpinner message="Loading MakeCode editor..." />
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={iframeUrl}
        className="w-full h-full border-0"
        allow="usb; autoplay; camera; microphone;"
      />
    </div>
  );
});

MakeCodeEditor.displayName = 'MakeCodeEditor';
