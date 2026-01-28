'use client';

import type { MakeCodeEditorRef } from '@/components/editors/MakeCodeEditor';

interface EditorToolbarProps {
  editorRef: React.RefObject<MakeCodeEditorRef | null>;
}

export function EditorToolbar({ editorRef }: EditorToolbarProps) {
  const handleDownload = () => {
    editorRef.current?.compile();
  };

  const handlePairDevice = () => {
    editorRef.current?.pairDevice();
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
        title="Download .hex file to your computer"
      >
        <DownloadIcon />
        Download
      </button>

      <button
        onClick={handlePairDevice}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
        title="Connect to a physical micro:bit via USB"
      >
        <UsbIcon />
        Connect micro:bit
      </button>

      <div className="ml-auto text-xs text-gray-500">
        Connect your micro:bit via USB, then click &quot;Connect micro:bit&quot; to flash code directly
      </div>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

function UsbIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  );
}
