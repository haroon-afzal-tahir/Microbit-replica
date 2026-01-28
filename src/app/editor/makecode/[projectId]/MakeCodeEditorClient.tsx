"use client";

import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { LoadingSpinner } from "@/components/editors/makecode/LoadingSpinner";
import type { MakeCodeEditorRef } from "@/components/editors/MakeCodeEditor";

const MakeCodeEditor = dynamic(
  () =>
    import("@/components/editors/MakeCodeEditor").then(
      (mod) => mod.MakeCodeEditor,
    ),
  {
    ssr: false,
    loading: () => <LoadingSpinner message="Loading MakeCode editor..." />,
  },
);

interface Props {
  projectId: string;
}

type SaveStatus = "saving" | "saved" | "unsaved";
type EditorMode = "blocks" | "javascript" | "python";

export function MakeCodeEditorClient({ projectId }: Props) {
  const editorRef = useRef<MakeCodeEditorRef>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [editorMode, setEditorMode] = useState<EditorMode>("blocks");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [greenScreen, setGreenScreen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitchToBlocks = () => {
    editorRef.current?.switchToBlocks();
    setEditorMode("blocks");
  };

  const handleSwitchToJS = () => {
    editorRef.current?.switchToJavaScript();
    setEditorMode("javascript");
  };

  const handleSwitchToPython = () => {
    editorRef.current?.switchToPython();
    setEditorMode("python");
  };

  const handleDownload = () => {
    editorRef.current?.compile();
  };

  const handleOpenSettings = () => {
    editorRef.current?.openSettings();
    setSettingsOpen(false);
  };

  const handleOpenExtensions = () => {
    editorRef.current?.openExtensions();
    setSettingsOpen(false);
  };

  const handlePairDevice = () => {
    editorRef.current?.pairDevice();
    setSettingsOpen(false);
  };

  const handlePrint = () => {
    editorRef.current?.print();
    setSettingsOpen(false);
  };

  const handleGreenScreen = () => {
    const newValue = !greenScreen;
    setGreenScreen(newValue);
    editorRef.current?.setGreenScreen(newValue);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Unified Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shrink-0">
        {/* Left section: Back + Title */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </Link>

          <div className="h-6 w-px bg-gray-300" />

          <span className="text-lg font-semibold text-gray-900">
            MakeCode Editor
          </span>
        </div>

        {/* Center section: Blocks/JS/Python toggle */}
        {/* 
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={handleSwitchToBlocks}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              editorMode === 'blocks'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Blocks
          </button>
          <button
            onClick={handleSwitchToJS}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              editorMode === 'javascript'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            JavaScript
          </button>
          <button
            onClick={handleSwitchToPython}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              editorMode === 'python'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Python
          </button>
        </div>
        */}
        <div className="flex items-center gap-3">
          {/* <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download
          </button>

          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Settings"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>

            {settingsOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={handleOpenSettings}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Project Settings
                </button>

                <button
                  onClick={handleOpenExtensions}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Extensions
                </button>

                <button
                  onClick={handlePairDevice}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Connect Device
                </button>

                <button
                  onClick={handlePrint}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print...
                </button>

                <div className="border-t border-gray-200 my-1" />

                <button
                  onClick={handleGreenScreen}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                >
                  <div className={`w-4 h-4 border rounded flex items-center justify-center ${greenScreen ? 'bg-blue-600 border-blue-600' : 'border-gray-400'}`}>
                    {greenScreen && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  Green Screen
                </button>

                <div className="border-t border-gray-200 my-1" />

                <a
                  href="https://makecode.microbit.org/about"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  About...
                </a>
              </div>
            )}
          </div>  */}

          {/* Save status */}
          <div className="flex items-center gap-1.5 text-sm">
            {saveStatus === "saving" ? (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-gray-500">Saving...</span>
              </>
            ) : saveStatus === "unsaved" ? (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span className="text-yellow-600">Unsaved</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-green-600">Saved</span>
              </>
            )}
          </div>

          {/* Project ID badge */}
          <div className="hidden md:block px-2 py-1 bg-gray-100 rounded text-xs text-gray-500 font-mono">
            {projectId.slice(0, 8)}...
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="flex-1 overflow-hidden">
        <MakeCodeEditor
          ref={editorRef}
          projectId={projectId}
          onError={(error) => console.error("[MakeCode]", error)}
          onSaveStatusChange={setSaveStatus}
        />
      </main>
    </div>
  );
}
