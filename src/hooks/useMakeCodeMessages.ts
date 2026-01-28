import { useCallback, useEffect, useRef } from 'react';
import type { MakeCodeProject } from '@/types/makecode';

const MAKECODE_ORIGIN = 'https://makecode.microbit.org';

export interface UseMakeCodeMessagesOptions {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  initialProject: MakeCodeProject;
  onEditorReady?: () => void;
  onProjectLoaded?: () => void;
  onProjectLoadError?: (error: string) => void;
  onSave?: (project: MakeCodeProject) => void;
}

export function useMakeCodeMessages({
  iframeRef,
  initialProject,
  onEditorReady,
  onProjectLoaded,
  onProjectLoadError,
  onSave,
}: UseMakeCodeMessagesOptions) {
  const currentProjectRef = useRef<MakeCodeProject>(initialProject);
  const hasImportedRef = useRef(false);
  const savingEnabledRef = useRef(false);
  const importMessageIdRef = useRef<string | null>(null);

  const postMessage = useCallback((message: Record<string, unknown>) => {
    iframeRef.current?.contentWindow?.postMessage(message, MAKECODE_ORIGIN);
  }, [iframeRef]);

  // Editor control commands
  const commands = {
    switchToBlocks: () => postMessage({ type: 'pxteditor', action: 'switchblocks' }),
    switchToJavaScript: () => postMessage({ type: 'pxteditor', action: 'switchjavascript' }),
    switchToPython: () => postMessage({ type: 'pxteditor', action: 'switchpython' }),
    compile: () => postMessage({ type: 'pxteditor', action: 'compile', options: { native: true } }),
    openSettings: () => postMessage({ type: 'pxteditor', action: 'opensettings' }),
    openExtensions: () => postMessage({ type: 'pxteditor', action: 'addpackage' }),
    pairDevice: () => postMessage({ type: 'pxteditor', action: 'pair' }),
    print: () => postMessage({ type: 'pxteditor', action: 'print' }),
    setHighContrast: (on: boolean) => postMessage({ type: 'pxteditor', action: 'sethighcontrast', on }),
    setGreenScreen: (on: boolean) => postMessage({ type: 'pxteditor', action: 'setgreenscreen', on }),
  };

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== MAKECODE_ORIGIN) return;

      const msg = event.data;
      if (!msg || typeof msg !== 'object') return;

      // Debug: log all MakeCode messages (remove in production)
      if (process.env.NODE_ENV === 'development') {
        console.log('[MakeCode]', msg.type, msg.action || msg.id, msg);
      }

      // MakeCode asks for workspace data
      if (msg.type === 'pxthost' && msg.action === 'workspacesync') {
        postMessage({
          type: 'pxthost',
          id: msg.id,
          action: 'workspacesync',
          success: true,
          editor: true,
          projects: [],
        });
      }

      // Editor content loaded - import project
      if (msg.type === 'pxthost' && msg.action === 'editorcontentloaded') {
        postMessage({
          type: 'pxteditor',
          action: 'setsimulatorfullscreen',
          enabled: false,
        });

        // Only handle initial load, not view switches (JS/Python/Blocks)
        if (!hasImportedRef.current && currentProjectRef.current) {
          onEditorReady?.();
          hasImportedRef.current = true;
          const messageId = `import-${Date.now()}`;
          importMessageIdRef.current = messageId;

          postMessage({
            type: 'pxteditor',
            action: 'importproject',
            id: messageId,
            project: currentProjectRef.current,
            response: true,
          });
        }
      }

      // Handle import project response
      if (msg.type === 'pxteditor' && msg.id === importMessageIdRef.current) {
        importMessageIdRef.current = null;
        if (msg.success) {
          savingEnabledRef.current = true;
          onProjectLoaded?.();
        } else {
          const errorMsg = typeof msg.error === 'string'
            ? msg.error
            : msg.error?.message || 'Failed to import project';
          onProjectLoadError?.(errorMsg);
        }
      }

      // Workspace saved (user made changes)
      if (msg.type === 'pxthost' && msg.action === 'workspacesave') {
        const project = msg.project as MakeCodeProject;
        if (savingEnabledRef.current) {
          currentProjectRef.current = project;
          onSave?.(project);
        }
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [postMessage, onEditorReady, onProjectLoaded, onProjectLoadError, onSave]);

  const reset = useCallback(() => {
    hasImportedRef.current = false;
    savingEnabledRef.current = false;
    importMessageIdRef.current = null;
  }, []);

  return { commands, currentProjectRef, reset };
}
