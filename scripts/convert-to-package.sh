#!/bin/bash

# MakeCode Editor Package Conversion Script
# Converts this Next.js app's reusable components into a standalone package

set -e

# Configuration
PACKAGE_NAME="@juicemind/makecode-ui"
PACKAGE_DIR="makecode-ui"
SOURCE_DIR="$(pwd)/src"

echo "🚀 Starting package conversion for: $PACKAGE_NAME"
echo "================================================"

# Step 1: Create package directory structure
echo ""
echo "📁 Step 1: Creating package directory structure..."

rm -rf "$PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR/src/components"
mkdir -p "$PACKAGE_DIR/src/hooks"
mkdir -p "$PACKAGE_DIR/src/lib"
mkdir -p "$PACKAGE_DIR/src/types"

echo "   Created: $PACKAGE_DIR/"

# Step 2: Copy source files
echo ""
echo "📋 Step 2: Copying source files..."

# Types
cp "$SOURCE_DIR/types/makecode.ts" "$PACKAGE_DIR/src/types/"
echo "   ✓ types/makecode.ts"

# Hooks
cp "$SOURCE_DIR/hooks/useMakeCodeMessages.ts" "$PACKAGE_DIR/src/hooks/"
echo "   ✓ hooks/useMakeCodeMessages.ts"

# Core MakeCode Editor component
cp "$SOURCE_DIR/components/editors/MakeCodeEditor.tsx" "$PACKAGE_DIR/src/components/"
echo "   ✓ components/MakeCodeEditor.tsx"

# MakeCode sub-components
cp "$SOURCE_DIR/components/editors/makecode/LoadingSpinner.tsx" "$PACKAGE_DIR/src/components/"
cp "$SOURCE_DIR/components/editors/makecode/EditorToolbar.tsx" "$PACKAGE_DIR/src/components/"
echo "   ✓ components/LoadingSpinner.tsx"
echo "   ✓ components/EditorToolbar.tsx"

# UI components
cp "$SOURCE_DIR/components/ui/SaveStatus.tsx" "$PACKAGE_DIR/src/components/"
cp "$SOURCE_DIR/components/ui/Icons.tsx" "$PACKAGE_DIR/src/components/"
echo "   ✓ components/SaveStatus.tsx"
echo "   ✓ components/Icons.tsx"

# Utilities
cp "$SOURCE_DIR/lib/makecode/makeCodeAssets.ts" "$PACKAGE_DIR/src/lib/"
cp "$SOURCE_DIR/lib/utils.ts" "$PACKAGE_DIR/src/lib/"
echo "   ✓ lib/makeCodeAssets.ts"
echo "   ✓ lib/utils.ts"

# Step 3: Create package-compatible components with CSS classes (no Tailwind)
echo ""
echo "📋 Step 3: Creating package-compatible components (plain CSS)..."

# EditorHeader.tsx (inline styles)
cat > "$PACKAGE_DIR/src/components/EditorHeader.tsx" << 'EOF'
import type { ComponentType, ReactNode, CSSProperties } from 'react';
import { ArrowLeftIcon } from './Icons';
import { SaveStatus, type SaveStatusType } from './SaveStatus';

export interface EditorHeaderProps {
  /** Project identifier to display */
  projectId?: string;
  /** Current save status */
  saveStatus: SaveStatusType;
  /** Custom title (defaults to "MakeCode Editor") */
  title?: string;
  /** Callback when back button is clicked */
  onBack?: () => void;
  /** URL for back link (used with LinkComponent) */
  backHref?: string;
  /** Custom Link component (e.g., Next.js Link) */
  LinkComponent?: ComponentType<{ href: string; style?: CSSProperties; children: ReactNode }>;
  /** Additional styles */
  style?: CSSProperties;
}

const styles: Record<string, CSSProperties> = {
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    padding: '0.5rem 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#4b5563',
    textDecoration: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    font: 'inherit',
  },
  divider: {
    height: '1.5rem',
    width: '1px',
    backgroundColor: '#d1d5db',
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#111827',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  projectId: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#f3f4f6',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    color: '#6b7280',
    fontFamily: 'ui-monospace, monospace',
  },
  icon: {
    width: '1.25rem',
    height: '1.25rem',
  },
};

export function EditorHeader({
  projectId,
  saveStatus,
  title = 'MakeCode Editor',
  onBack,
  backHref = '/',
  LinkComponent,
  style,
}: EditorHeaderProps) {
  const backButtonContent = (
    <>
      <ArrowLeftIcon style={styles.icon} />
      <span>Back</span>
    </>
  );

  return (
    <header style={{ ...styles.header, ...style }}>
      <div style={styles.left}>
        {LinkComponent ? (
          <LinkComponent href={backHref} style={styles.backLink}>
            {backButtonContent}
          </LinkComponent>
        ) : onBack ? (
          <button onClick={onBack} style={styles.backLink}>
            {backButtonContent}
          </button>
        ) : (
          <a href={backHref} style={styles.backLink}>
            {backButtonContent}
          </a>
        )}

        <div style={styles.divider} />

        <span style={styles.title}>
          {title}
        </span>
      </div>

      <div style={styles.right}>
        <SaveStatus status={saveStatus} />

        {projectId && (
          <div style={styles.projectId}>
            {projectId.slice(0, 8)}...
          </div>
        )}
      </div>
    </header>
  );
}
EOF
echo "   ✓ EditorHeader.tsx"

# LoadingSpinner.tsx (inline styles)
cat > "$PACKAGE_DIR/src/components/LoadingSpinner.tsx" << 'EOF'
import type { CSSProperties } from 'react';

interface LoadingSpinnerProps {
  /** Loading message to display */
  message?: string;
}

const styles: Record<string, CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#f9fafb',
  },
  content: {
    textAlign: 'center',
  },
  spinner: {
    width: '3rem',
    height: '3rem',
    border: '4px solid #3b82f6',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    margin: '0 auto',
    animation: 'mce-spin 1s linear infinite',
  },
  message: {
    marginTop: '1rem',
    color: '#4b5563',
  },
};

// Inject keyframes for spinner animation
const spinnerKeyframes = `
@keyframes mce-spin {
  to { transform: rotate(360deg); }
}
`;

/**
 * Loading spinner component with customizable message
 */
export function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div style={styles.container}>
      <style>{spinnerKeyframes}</style>
      <div style={styles.content}>
        <div style={styles.spinner} />
        <p style={styles.message}>{message}</p>
      </div>
    </div>
  );
}
EOF
echo "   ✓ LoadingSpinner.tsx"

# SaveStatus.tsx (inline styles)
cat > "$PACKAGE_DIR/src/components/SaveStatus.tsx" << 'EOF'
import type { CSSProperties } from 'react';

export type SaveStatusType = 'saving' | 'saved' | 'unsaved';

interface SaveStatusProps {
  /** Current save status */
  status: SaveStatusType;
}

const baseStyles: Record<string, CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.875rem',
  },
  dot: {
    width: '0.5rem',
    height: '0.5rem',
    borderRadius: '50%',
  },
};

const pulseKeyframes = `
@keyframes mce-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
`;

/**
 * Visual indicator for save state (saving/saved/unsaved)
 */
export function SaveStatus({ status }: SaveStatusProps) {
  if (status === 'saving') {
    return (
      <div style={baseStyles.container}>
        <style>{pulseKeyframes}</style>
        <div style={{ ...baseStyles.dot, backgroundColor: '#eab308', animation: 'mce-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
        <span style={{ color: '#6b7280' }}>Saving...</span>
      </div>
    );
  }

  if (status === 'unsaved') {
    return (
      <div style={baseStyles.container}>
        <div style={{ ...baseStyles.dot, backgroundColor: '#eab308' }} />
        <span style={{ color: '#ca8a04' }}>Unsaved</span>
      </div>
    );
  }

  return (
    <div style={baseStyles.container}>
      <div style={{ ...baseStyles.dot, backgroundColor: '#22c55e' }} />
      <span style={{ color: '#16a34a' }}>Saved</span>
    </div>
  );
}
EOF
echo "   ✓ SaveStatus.tsx"

# EditorToolbar.tsx (inline styles)
cat > "$PACKAGE_DIR/src/components/EditorToolbar.tsx" << 'EOF'
import type { RefObject, CSSProperties } from 'react';
import type { MakeCodeEditorRef } from './MakeCodeEditor';

interface EditorToolbarProps {
  /** Reference to the MakeCodeEditor component */
  editorRef: RefObject<MakeCodeEditorRef | null>;
}

const styles: Record<string, CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    color: '#ffffff',
  },
  downloadButton: {
    backgroundColor: '#9333ea',
  },
  connectButton: {
    backgroundColor: '#16a34a',
  },
  hint: {
    marginLeft: 'auto',
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  icon: {
    width: '1rem',
    height: '1rem',
  },
};

/**
 * Toolbar with download and device connection buttons
 */
export function EditorToolbar({ editorRef }: EditorToolbarProps) {
  return (
    <div style={styles.container}>
      <button
        onClick={() => editorRef.current?.compile()}
        style={{ ...styles.button, ...styles.downloadButton }}
      >
        <DownloadIcon />
        Download
      </button>

      <button
        onClick={() => editorRef.current?.pairDevice()}
        style={{ ...styles.button, ...styles.connectButton }}
      >
        <UsbIcon />
        Connect Device
      </button>

      <div style={styles.hint}>
        Press Ctrl+Shift+D to download
      </div>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function UsbIcon() {
  return (
    <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18v-6m0 0V6m0 6h6m-6 0H6" />
    </svg>
  );
}
EOF
echo "   ✓ EditorToolbar.tsx"

# Icons.tsx (inline styles)
cat > "$PACKAGE_DIR/src/components/Icons.tsx" << 'EOF'
import type { CSSProperties } from 'react';

interface IconProps {
  /** Inline styles for the icon */
  style?: CSSProperties;
}

const defaultStyle: CSSProperties = { width: '1.25rem', height: '1.25rem' };

/** Arrow left icon for back navigation */
export function ArrowLeftIcon({ style }: IconProps) {
  return (
    <svg style={{ ...defaultStyle, ...style }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

/** Code/brackets icon */
export function CodeIcon({ style }: IconProps) {
  return (
    <svg style={{ ...defaultStyle, ...style }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}

/** Plus icon for adding items */
export function PlusIcon({ style }: IconProps) {
  return (
    <svg style={{ ...defaultStyle, ...style }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

/** Trash icon for delete actions */
export function TrashIcon({ style }: IconProps) {
  return (
    <svg style={{ ...defaultStyle, ...style }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

/** Calendar icon for dates */
export function CalendarIcon({ style }: IconProps) {
  return (
    <svg style={{ ...defaultStyle, ...style }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

/** Document with plus icon for new documents */
export function DocumentPlusIcon({ style }: IconProps) {
  return (
    <svg style={{ ...defaultStyle, ...style }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

/** Exclamation/warning icon */
export function ExclamationIcon({ style }: IconProps) {
  return (
    <svg style={{ ...defaultStyle, ...style }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

/** Animated spinner icon for loading states */
export function SpinnerIcon({ style }: IconProps) {
  return (
    <svg style={{ ...defaultStyle, ...style }} fill="none" viewBox="0 0 24 24">
      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
EOF
echo "   ✓ Icons.tsx"

# MakeCodeEditor.tsx (with inline styles - no CSS file needed)
cat > "$PACKAGE_DIR/src/components/MakeCodeEditor.tsx" << 'EOF'
import { useState, useRef, useCallback, forwardRef, useImperativeHandle, useEffect, type CSSProperties } from 'react';
import { buildMakeCodeUrl } from '../lib/makeCodeAssets';
import { LoadingSpinner } from './LoadingSpinner';
import { useMakeCodeMessages } from '../hooks/useMakeCodeMessages';
import type { MakeCodeProject } from '../types/makecode';

export type { MakeCodeProject };

export interface MakeCodeEditorRef {
  /** Switch to blocks view */
  switchToBlocks: () => void;
  /** Switch to JavaScript view */
  switchToJavaScript: () => void;
  /** Switch to Python view */
  switchToPython: () => void;
  /** Compile and download .hex file */
  compile: () => void;
  /** Open editor settings */
  openSettings: () => void;
  /** Open extensions/packages dialog */
  openExtensions: () => void;
  /** Open device pairing dialog */
  pairDevice: () => void;
  /** Print the current project */
  print: () => void;
  /** Toggle high contrast mode */
  setHighContrast: (on: boolean) => void;
  /** Toggle green screen mode */
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

// Inline styles for self-contained component (no CSS file needed)
const styles: Record<string, CSSProperties> = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 20,
  },
  errorOverlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  errorContent: {
    textAlign: 'center',
    padding: '1.5rem',
    maxWidth: '28rem',
  },
  errorIcon: {
    color: '#ef4444',
    fontSize: '2.25rem',
    marginBottom: '1rem',
  },
  errorTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#111827',
    margin: '0 0 0.5rem 0',
  },
  errorMessage: {
    color: '#4b5563',
    margin: '0 0 1rem 0',
  },
  retryButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 0,
  },
};

/**
 * MakeCode Editor component for embedding micro:bit editor
 *
 * @example
 * ```tsx
 * <MakeCodeEditor
 *   initialProject={project}
 *   onChange={handleChange}
 *   onReady={() => console.log('Ready!')}
 * />
 * ```
 */
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
    controllerId: 'makecode-ui',
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
    <div style={styles.container}>
      {isLoading && (
        <div style={styles.overlay}>
          <LoadingSpinner message={getLoadingMessage()} />
        </div>
      )}

      {loadingState === 'error' && (
        <div style={styles.errorOverlay}>
          <div style={styles.errorContent}>
            <div style={styles.errorIcon}>!</div>
            <h3 style={styles.errorTitle}>
              Failed to load project
            </h3>
            <p style={styles.errorMessage}>
              {errorMessage || 'An unexpected error occurred while loading your project.'}
            </p>
            <button
              onClick={handleRetry}
              style={styles.retryButton}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={listenerReady ? iframeUrl : undefined}
        style={styles.iframe}
        allow="usb; autoplay; camera; microphone;"
      />
    </div>
  );
});

MakeCodeEditor.displayName = 'MakeCodeEditor';
EOF
echo "   ✓ MakeCodeEditor.tsx"

# Step 4: Remove 'use client' directives
echo ""
echo "🔧 Step 4: Removing 'use client' directives..."

find "$PACKAGE_DIR/src" -name "*.tsx" -o -name "*.ts" | while read file; do
  if grep -q "'use client'" "$file" 2>/dev/null || grep -q '"use client"' "$file" 2>/dev/null; then
    # macOS compatible sed
    sed -i '' "s/'use client';//g" "$file" 2>/dev/null || sed -i "s/'use client';//g" "$file"
    sed -i '' 's/"use client";//g' "$file" 2>/dev/null || sed -i 's/"use client";//g' "$file"
    sed -i '' "s/^'use client'$//g" "$file" 2>/dev/null || sed -i "s/^'use client'$//g" "$file"
    sed -i '' 's/^"use client"$//g' "$file" 2>/dev/null || sed -i 's/^"use client"$//g' "$file"
    echo "   ✓ Cleaned: $(basename "$file")"
  fi
done

# Step 5: Update import paths from @/ aliases to relative paths
echo ""
echo "🔧 Step 5: Updating import paths..."

# MakeCodeEditor.tsx
sed -i '' "s|from '@/lib/makecode/makeCodeAssets'|from '../lib/makeCodeAssets'|g" "$PACKAGE_DIR/src/components/MakeCodeEditor.tsx" 2>/dev/null || \
sed -i "s|from '@/lib/makecode/makeCodeAssets'|from '../lib/makeCodeAssets'|g" "$PACKAGE_DIR/src/components/MakeCodeEditor.tsx"

sed -i '' "s|from './makecode/LoadingSpinner'|from './LoadingSpinner'|g" "$PACKAGE_DIR/src/components/MakeCodeEditor.tsx" 2>/dev/null || \
sed -i "s|from './makecode/LoadingSpinner'|from './LoadingSpinner'|g" "$PACKAGE_DIR/src/components/MakeCodeEditor.tsx"

sed -i '' "s|from '@/hooks/useMakeCodeMessages'|from '../hooks/useMakeCodeMessages'|g" "$PACKAGE_DIR/src/components/MakeCodeEditor.tsx" 2>/dev/null || \
sed -i "s|from '@/hooks/useMakeCodeMessages'|from '../hooks/useMakeCodeMessages'|g" "$PACKAGE_DIR/src/components/MakeCodeEditor.tsx"

sed -i '' "s|from '@/types/makecode'|from '../types/makecode'|g" "$PACKAGE_DIR/src/components/MakeCodeEditor.tsx" 2>/dev/null || \
sed -i "s|from '@/types/makecode'|from '../types/makecode'|g" "$PACKAGE_DIR/src/components/MakeCodeEditor.tsx"

# useMakeCodeMessages.ts
sed -i '' "s|from '@/types/makecode'|from '../types/makecode'|g" "$PACKAGE_DIR/src/hooks/useMakeCodeMessages.ts" 2>/dev/null || \
sed -i "s|from '@/types/makecode'|from '../types/makecode'|g" "$PACKAGE_DIR/src/hooks/useMakeCodeMessages.ts"

# makeCodeAssets.ts
sed -i '' "s|from '@/types/makecode'|from '../types/makecode'|g" "$PACKAGE_DIR/src/lib/makeCodeAssets.ts" 2>/dev/null || \
sed -i "s|from '@/types/makecode'|from '../types/makecode'|g" "$PACKAGE_DIR/src/lib/makeCodeAssets.ts"

# EditorToolbar.tsx
sed -i '' "s|from '@/components/editors/MakeCodeEditor'|from './MakeCodeEditor'|g" "$PACKAGE_DIR/src/components/EditorToolbar.tsx" 2>/dev/null || \
sed -i "s|from '@/components/editors/MakeCodeEditor'|from './MakeCodeEditor'|g" "$PACKAGE_DIR/src/components/EditorToolbar.tsx"

echo "   ✓ Updated all import paths"

# Step 6: Remove debug console.log from production code
echo ""
echo "🔧 Step 6: Removing debug console.log statements..."

# Remove the development-only debug logging block
sed -i '' '/\/\/ Debug: log all MakeCode messages/,/^[[:space:]]*}$/d' "$PACKAGE_DIR/src/hooks/useMakeCodeMessages.ts" 2>/dev/null || \
sed -i '/\/\/ Debug: log all MakeCode messages/,/^[[:space:]]*}$/d' "$PACKAGE_DIR/src/hooks/useMakeCodeMessages.ts"

echo "   ✓ Removed debug logging"

# Step 7: Create package.json
echo ""
echo "📦 Step 7: Creating package.json..."

cat > "$PACKAGE_DIR/package.json" << 'EOF'
{
  "name": "@juicemind/makecode-ui",
  "version": "1.0.0",
  "description": "MakeCode micro:bit editor component for React applications",
  "private": false,
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./src/index.ts",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": [
    "dist",
    "src"
  ],
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "clean": "rm -rf dist",
    "prepublishOnly": "pnpm build",
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  },
  "dependencies": {
    "nanoid": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.0.0"
  },
  "keywords": [
    "makecode",
    "microbit",
    "micro:bit",
    "editor",
    "react",
    "component",
    "blocks",
    "programming"
  ],
  "author": "Juicemind",
  "license": "MIT"
}
EOF

echo "   ✓ Created package.json"

# Step 8: Create tsconfig.json
echo ""
echo "📦 Step 8: Creating tsconfig.json..."

cat > "$PACKAGE_DIR/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

echo "   ✓ Created tsconfig.json"

# Step 9: Create tsup.config.ts
echo ""
echo "📦 Step 9: Creating tsup.config.ts..."

cat > "$PACKAGE_DIR/tsup.config.ts" << 'EOF'
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"],
  treeshake: true,
});
EOF

echo "   ✓ Created tsup.config.ts"

# Step 10: Create main index.ts barrel export
echo ""
echo "📦 Step 10: Creating index.ts barrel export..."

cat > "$PACKAGE_DIR/src/index.ts" << 'EOF'
// Types
export type { MakeCodeProject } from './types/makecode';

// Hooks
export {
  useMakeCodeMessages,
  type UseMakeCodeMessagesOptions,
} from './hooks/useMakeCodeMessages';

// Core Editor Component
export {
  MakeCodeEditor,
  type MakeCodeEditorRef,
  type MakeCodeEditorProps,
} from './components/MakeCodeEditor';

// Sub-components
export { EditorToolbar } from './components/EditorToolbar';
export { EditorHeader, type EditorHeaderProps } from './components/EditorHeader';
export { LoadingSpinner } from './components/LoadingSpinner';
export { SaveStatus, type SaveStatusType } from './components/SaveStatus';

// Icons
export {
  ArrowLeftIcon,
  CodeIcon,
  PlusIcon,
  TrashIcon,
  CalendarIcon,
  DocumentPlusIcon,
  ExclamationIcon,
  SpinnerIcon,
} from './components/Icons';

// Utilities
export {
  DEFAULT_MAKECODE_PROJECT,
  buildMakeCodeUrl,
  generateProjectId,
} from './lib/makeCodeAssets';

export { formatDate } from './lib/utils';
EOF

echo "   ✓ Created index.ts"

# Step 11: Create README.md
echo ""
echo "📄 Step 11: Creating README.md..."

cat > "$PACKAGE_DIR/README.md" << 'EOF'
# @juicemind/makecode-ui

A React component library for embedding Microsoft MakeCode micro:bit editor in your applications.

## Installation

```bash
npm install @juicemind/makecode-ui
# or
pnpm add @juicemind/makecode-ui
```

## Quick Start

```tsx
import { useRef, useState } from 'react';
import {
  MakeCodeEditor,
  DEFAULT_MAKECODE_PROJECT,
  type MakeCodeProject,
  type MakeCodeEditorRef
} from '@juicemind/makecode-ui';

function App() {
  const editorRef = useRef<MakeCodeEditorRef>(null);
  const [project] = useState<MakeCodeProject>(DEFAULT_MAKECODE_PROJECT);

  const handleChange = (updatedProject: MakeCodeProject) => {
    // Save to your backend
    console.log('Project changed:', updatedProject);
  };

  return (
    <div style={{ height: '100vh' }}>
      <MakeCodeEditor
        ref={editorRef}
        initialProject={project}
        onChange={handleChange}
        onReady={() => console.log('Editor ready!')}
        onError={(error) => console.error('Error:', error)}
      />
    </div>
  );
}
```

## Components

### MakeCodeEditor

The main editor component that embeds the MakeCode iframe.

```tsx
<MakeCodeEditor
  initialProject={project}      // Required: MakeCodeProject to load
  onReady={() => {}}            // Called when editor is fully loaded
  onChange={(project) => {}}    // Called on project changes
  onError={(error) => {}}       // Called on errors
  ref={editorRef}               // Access editor methods
/>
```

**Ref Methods:**
- `switchToBlocks()` - Switch to blocks view
- `switchToJavaScript()` - Switch to JavaScript view
- `switchToPython()` - Switch to Python view
- `compile()` - Compile and download .hex file
- `pairDevice()` - Open device pairing dialog

### EditorHeader

Header bar with back navigation and save status.

```tsx
// With Next.js Link
import Link from 'next/link';
<EditorHeader
  LinkComponent={Link}
  backHref="/"
  saveStatus="saved"
/>

// With callback
<EditorHeader
  onBack={() => router.back()}
  saveStatus="saving"
/>

// With standard anchor
<EditorHeader
  backHref="/dashboard"
  saveStatus="unsaved"
/>
```

### EditorToolbar

Control buttons for download and device connection.

```tsx
<EditorToolbar editorRef={editorRef} />
```

## Hooks

### useMakeCodeMessages

Low-level hook for direct iframe communication.

```tsx
const { commands, currentProjectRef, reset } = useMakeCodeMessages({
  iframeRef,
  initialProject,
  onEditorReady: () => {},
  onProjectLoaded: () => {},
  onProjectLoadError: (error) => {},
  onSave: (project) => {},
});
```

## Utilities

- `DEFAULT_MAKECODE_PROJECT` - Empty project template
- `buildMakeCodeUrl(options)` - Build MakeCode editor URL
- `generateProjectId()` - Generate unique project ID

## Styling

All components use inline styles - no CSS imports required! Just install and use.

## Requirements

- React 18+

## License

MIT
EOF

echo "   ✓ Created README.md"

# Step 12: Final summary
echo ""
echo "================================================"
echo "✅ Package conversion complete!"
echo "================================================"
echo ""
echo "📁 Package created at: ./$PACKAGE_DIR/"
echo ""
echo "📦 Package structure:"
find "$PACKAGE_DIR" -type f | sort | sed 's|^|   |'
echo ""
echo "🚀 Next steps:"
echo "   1. cd $PACKAGE_DIR"
echo "   2. pnpm install"
echo "   3. pnpm build"
echo "   4. pnpm publish (or copy to your monorepo)"
echo ""
