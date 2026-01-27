// MakeCode Project Format (what we store in DB)
export interface MakeCodeProject {
  header: {
    id: string;
    name: string;
    target: string;           // "microbit"
    targetVersion: string;
    meta?: Record<string, unknown>;
  };
  text: {
    'main.ts'?: string;       // TypeScript source
    'main.blocks'?: string;   // Blockly XML
    'main.py'?: string;       // Python source
    'pxt.json': string;       // Package config (JSON string)
    [key: string]: string | undefined;
  };
}

// Editor component props
export interface MakeCodeEditorProps {
  projectId: string;
  onError?: (error: Error) => void;
  onSave?: () => void;
}
