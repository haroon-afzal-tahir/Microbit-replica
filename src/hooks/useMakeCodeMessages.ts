import { useCallback, useEffect, useRef } from 'react';
import type { MakeCodeProject } from '@/types/makecode';

const MAKECODE_ORIGIN = 'https://makecode.microbit.org';

export interface UseMakeCodeMessagesOptions {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  initialProject: MakeCodeProject;
  onReady?: () => void;
  onSave?: (project: MakeCodeProject) => void;
}

export function useMakeCodeMessages({
  iframeRef,
  initialProject,
  onReady,
  onSave,
}: UseMakeCodeMessagesOptions) {
  const currentProjectRef = useRef<MakeCodeProject>(initialProject);
  const hasImportedRef = useRef(false);
  const savingEnabledRef = useRef(false);

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
        onReady?.();

        postMessage({
          type: 'pxteditor',
          action: 'setsimulatorfullscreen',
          enabled: false,
        });

        if (!hasImportedRef.current && currentProjectRef.current) {
          hasImportedRef.current = true;
          postMessage({
            type: 'pxteditor',
            action: 'importproject',
            project: currentProjectRef.current,
            response: false,
          });

          setTimeout(() => {
            savingEnabledRef.current = true;
          }, 1000);
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
  }, [postMessage, onReady, onSave]);

  return { commands, currentProjectRef };
}
