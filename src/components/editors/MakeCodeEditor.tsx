'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { buildMakeCodeUrl, DEFAULT_MAKECODE_PROJECT } from '@/lib/makecode/makeCodeAssets';
import { LoadingSpinner } from './makecode/LoadingSpinner';
import type { MakeCodeProject, MakeCodeEditorProps } from '@/types/makecode';

export function MakeCodeEditor({
  projectId,
  onError,
  onSave,
}: MakeCodeEditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const currentProjectRef = useRef<MakeCodeProject | null>(null);

  const origin = 'https://makecode.microbit.org';

  // Load project from database
  useEffect(() => {
    async function loadProject() {
      console.log('[MakeCode] Loading project from DB:', projectId);
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('[MakeCode] Loaded from DB:', data);
          if (data.makecodeProject) {
            console.log('[MakeCode] Using saved project data');
            currentProjectRef.current = data.makecodeProject as MakeCodeProject;
          } else {
            console.log('[MakeCode] No saved data, using default project');
            currentProjectRef.current = {
              ...DEFAULT_MAKECODE_PROJECT,
              header: { ...DEFAULT_MAKECODE_PROJECT.header, id: projectId },
            };
          }
        } else if (response.status === 404) {
          // New project - will be created on first save
          console.log('[MakeCode] Project not found (404), using default project');
          currentProjectRef.current = {
            ...DEFAULT_MAKECODE_PROJECT,
            header: { ...DEFAULT_MAKECODE_PROJECT.header, id: projectId },
          };
        }
      } catch (error) {
        console.error('[MakeCode] Failed to load project:', error);
        onError?.(error as Error);
        currentProjectRef.current = {
          ...DEFAULT_MAKECODE_PROJECT,
          header: { ...DEFAULT_MAKECODE_PROJECT.header, id: projectId },
        };
      } finally {
        setIsLoading(false);
      }
    }
    loadProject();
  }, [projectId, onError]);

  // Save project to database
  const saveProject = useCallback(async (project: MakeCodeProject) => {
    setSaving(true);
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          makecodeProject: project,
        }),
      });
      setHasUnsavedChanges(false);
      onSave?.();
    } catch (error) {
      console.error('[MakeCode] Failed to save project:', error);
      onError?.(error as Error);
    } finally {
      setSaving(false);
    }
  }, [projectId, onError, onSave]);

  // Handle messages from MakeCode iframe
  useEffect(() => {
    let hasImported = false;

    function handleMessage(event: MessageEvent) {
      if (event.origin !== origin) return;

      const msg = event.data;
      if (!msg || typeof msg !== 'object') return;

      console.log('[MakeCode] Message:', msg.type, msg.action, msg);

      // MakeCode asks for workspace data - respond with the request ID
      if (msg.type === 'pxthost' && msg.action === 'workspacesync') {
        if (iframeRef.current?.contentWindow) {
          // Respond with the same ID from the request
          iframeRef.current.contentWindow.postMessage({
            type: 'pxthost',
            id: msg.id,  // Must include the request ID
            action: 'workspacesync',
            success: true,
            editor: true,
            projects: [],  // Empty workspace
          }, origin);
          console.log('[MakeCode] Sent workspacesync response with id:', msg.id);
        }
      }

      // Editor content loaded - now we can import project
      if (msg.type === 'pxthost' && msg.action === 'editorcontentloaded') {
        setIsReady(true);

        // Import initial project
        if (!hasImported && currentProjectRef.current && iframeRef.current?.contentWindow) {
          hasImported = true;
          console.log('[MakeCode] Importing project into editor:', currentProjectRef.current);
          iframeRef.current.contentWindow.postMessage({
            type: 'pxteditor',
            action: 'importproject',
            project: currentProjectRef.current,
            response: false,
          }, origin);
        }
      }

      // Workspace saved (user made changes)
      if (msg.type === 'pxthost' && msg.action === 'workspacesave') {
        const project = msg.project as MakeCodeProject;
        currentProjectRef.current = project;
        setHasUnsavedChanges(true);

        // Auto-save
        saveProject(project);
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [saveProject]);

  // Build iframe URL
  const iframeUrl = buildMakeCodeUrl({
    controllerId: 'microbit-replica',
    embed: true,
  });

  if (isLoading) {
    return <LoadingSpinner message="Loading project..." />;
  }

  return (
    <div className="relative w-full h-full">
      {/* Save Status Indicator */}
      <div className="absolute top-3 right-3 z-10">
        {isSaving ? (
          <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded shadow">Saving...</span>
        ) : hasUnsavedChanges ? (
          <span className="text-sm text-yellow-600 bg-white px-2 py-1 rounded shadow">Unsaved changes</span>
        ) : (
          <span className="text-sm text-green-600 bg-white px-2 py-1 rounded shadow">Saved</span>
        )}
      </div>

      {/* Loading overlay until MakeCode is ready */}
      {!isReady && (
        <div className="absolute inset-0 z-20">
          <LoadingSpinner message="Loading MakeCode editor..." />
        </div>
      )}

      {/* MakeCode iframe */}
      <iframe
        ref={iframeRef}
        src={iframeUrl}
        className="w-full h-full border-0"
        allow="usb; autoplay; camera; microphone;"
      />
    </div>
  );
}
