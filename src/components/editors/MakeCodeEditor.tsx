'use client';

import { useState, useRef, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react';
import { buildMakeCodeUrl } from '@/lib/makecode/makeCodeAssets';
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
  /** The project to load in the editor */
  initialProject: MakeCodeProject;
  /** Called when the editor is fully loaded and ready */
  onReady?: () => void;
  /** Called when the project changes (user edits) */
  onChange?: (project: MakeCodeProject) => void;
  /** Called when an error occurs */
  onError?: (error: Error) => void;
}

type LoadingState = 'initializing' | 'editor-loading' | 'project-loading' | 'ready' | 'error';

export const MakeCodeEditor = forwardRef<MakeCodeEditorRef, MakeCodeEditorProps>(({
  initialProject,
  onReady,
  onChange,
  onError,
}, ref) => {
  const [loadingState, setLoadingState] = useState<LoadingState>('initializing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [listenerReady, setListenerReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleProjectLoaded = useCallback(() => {
    setLoadingState('ready');
    onReady?.();
  }, [onReady]);

  const handleProjectLoadError = useCallback((error: string) => {
    setLoadingState('error');
    setErrorMessage(error);
    onError?.(new Error(error));
  }, [onError]);

  const { commands, reset } = useMakeCodeMessages({
    iframeRef,
    initialProject,
    onEditorReady: useCallback(() => setLoadingState('project-loading'), []),
    onProjectLoaded: handleProjectLoaded,
    onProjectLoadError: handleProjectLoadError,
    onSave: onChange,
  });

  useImperativeHandle(ref, () => commands, [commands]);

  // Delay iframe loading until message listener is set up to avoid race condition
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setListenerReady(true);
      setLoadingState('editor-loading');
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  const iframeUrl = buildMakeCodeUrl({
    controllerId: 'microbit-replica',
    embed: true,
    hideHeader: true,
  });

  const handleRetry = useCallback(() => {
    reset();
    setLoadingState('initializing');
    setErrorMessage(null);
    setListenerReady(false);
    requestAnimationFrame(() => {
      setListenerReady(true);
      setLoadingState('editor-loading');
    });
  }, [reset]);

  const getLoadingMessage = () => {
    switch (loadingState) {
      case 'initializing':
        return 'Initializing...';
      case 'editor-loading':
        return 'Loading MakeCode editor...';
      case 'project-loading':
        return 'Loading project...';
      default:
        return '';
    }
  };

  const isLoading = loadingState !== 'ready' && loadingState !== 'error';

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 z-20">
          <LoadingSpinner message={getLoadingMessage()} />
        </div>
      )}

      {loadingState === 'error' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-100">
          <div className="text-center p-6 max-w-md">
            <div className="text-red-500 text-4xl mb-4">!</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to load project
            </h3>
            <p className="text-gray-600 mb-4">
              {errorMessage || 'An unexpected error occurred while loading your project.'}
            </p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={listenerReady ? iframeUrl : undefined}
        className="w-full h-full border-0"
        allow="usb; autoplay; camera; microphone;"
      />
    </div>
  );
});

MakeCodeEditor.displayName = 'MakeCodeEditor';
