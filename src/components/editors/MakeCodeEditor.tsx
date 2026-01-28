'use client';

import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { buildMakeCodeUrl, DEFAULT_MAKECODE_PROJECT } from '@/lib/makecode/makeCodeAssets';
import { LoadingSpinner } from './makecode/LoadingSpinner';
import type { MakeCodeProject } from '@/types/makecode';

// Re-export types for consumers
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
  onError?: (error: Error) => void;
  onSave?: () => void;
  onSaveStatusChange?: (status: 'saving' | 'saved' | 'unsaved') => void;
}

export const MakeCodeEditor = forwardRef<MakeCodeEditorRef, MakeCodeEditorProps>(({
  projectId,
  onError,
  onSave,
  onSaveStatusChange,
}, ref) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const currentProjectRef = useRef<MakeCodeProject | null>(null);

  const origin = 'https://makecode.microbit.org';

  // Expose commands to parent via ref
  useImperativeHandle(ref, () => ({
    switchToBlocks: () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'pxteditor',
          action: 'switchblocks',
        }, origin);
      }
    },
    switchToJavaScript: () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'pxteditor',
          action: 'switchjavascript',
        }, origin);
      }
    },
    switchToPython: () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'pxteditor',
          action: 'switchpython',
        }, origin);
      }
    },
    compile: () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'pxteditor',
          action: 'compile',
          options: { native: true },
        }, origin);
      }
    },
    openSettings: () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'pxteditor',
          action: 'opensettings',
        }, origin);
      }
    },
    openExtensions: () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'pxteditor',
          action: 'addpackage',
        }, origin);
      }
    },
    pairDevice: () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'pxteditor',
          action: 'pair',
        }, origin);
      }
    },
    print: () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'pxteditor',
          action: 'print',
        }, origin);
      }
    },
    setHighContrast: (on: boolean) => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'pxteditor',
          action: 'sethighcontrast',
          on,
        }, origin);
      }
    },
    setGreenScreen: (on: boolean) => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'pxteditor',
          action: 'setgreenscreen',
          on,
        }, origin);
      }
    },
  }), []);

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
            const savedProject = data.makecodeProject as MakeCodeProject;
            console.log('[MakeCode] LOADED project details:', {
              hasBlocks: !!savedProject.text?.['main.blocks'],
              blocksLength: savedProject.text?.['main.blocks']?.length,
              tsCode: savedProject.text?.['main.ts']?.substring(0, 100),
            });
            currentProjectRef.current = savedProject;
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
    console.log('[MakeCode] SAVING to DB:', {
      projectId,
      hasBlocks: !!project.text?.['main.blocks'],
      blocksLength: project.text?.['main.blocks']?.length,
      tsCode: project.text?.['main.ts']?.substring(0, 100),
    });
    onSaveStatusChange?.('saving');
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          makecodeProject: project,
        }),
      });
      const result = await response.json();
      console.log('[MakeCode] Save response:', response.status, result);
      onSaveStatusChange?.('saved');
      onSave?.();
    } catch (error) {
      console.error('[MakeCode] Failed to save project:', error);
      onSaveStatusChange?.('unsaved');
      onError?.(error as Error);
    }
  }, [projectId, onError, onSave, onSaveStatusChange]);

  // Handle messages from MakeCode iframe
  useEffect(() => {
    let hasImported = false;
    let savingEnabled = false;  // Don't save until we've imported our project

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

        // Try to hide the editor toolbar
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({
            type: 'pxteditor',
            action: 'setsimulatorfullscreen',
            enabled: false,
          }, origin);
        }

        // Import initial project
        if (!hasImported && currentProjectRef.current && iframeRef.current?.contentWindow) {
          hasImported = true;
          const projectToImport = currentProjectRef.current;
          console.log('[MakeCode] IMPORTING project:', {
            hasBlocks: !!projectToImport.text?.['main.blocks'],
            blocksLength: projectToImport.text?.['main.blocks']?.length,
            tsCode: projectToImport.text?.['main.ts']?.substring(0, 100),
            fullProject: projectToImport,
          });
          iframeRef.current.contentWindow.postMessage({
            type: 'pxteditor',
            action: 'importproject',
            project: projectToImport,
            response: false,
          }, origin);

          // Enable saving after a delay to let the import complete
          setTimeout(() => {
            savingEnabled = true;
            console.log('[MakeCode] Saving now enabled');
          }, 1000);
        }
      }

      // Workspace saved (user made changes)
      if (msg.type === 'pxthost' && msg.action === 'workspacesave') {
        const project = msg.project as MakeCodeProject;
        console.log('[MakeCode] workspacesave received:', {
          hasBlocks: !!project.text?.['main.blocks'],
          blocksLength: project.text?.['main.blocks']?.length,
          tsCode: project.text?.['main.ts']?.substring(0, 100),
          savingEnabled,
        });

        // Only update ref and save if we've already imported our project
        // (prevents overwriting loaded data with MakeCode's empty default)
        if (savingEnabled) {
          currentProjectRef.current = project;
          saveProject(project);
        } else {
          console.log('[MakeCode] Ignoring save - import not complete yet');
        }
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [saveProject]);

  // Build iframe URL with hidden header
  const iframeUrl = buildMakeCodeUrl({
    controllerId: 'microbit-replica',
    embed: true,
    hideHeader: true,
  });

  if (isLoading) {
    return <LoadingSpinner message="Loading project..." />;
  }

  return (
    <div className="relative w-full h-full">
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
});

MakeCodeEditor.displayName = 'MakeCodeEditor';
