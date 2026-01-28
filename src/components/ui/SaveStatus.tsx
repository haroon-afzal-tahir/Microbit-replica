export type SaveStatusType = 'saving' | 'saved' | 'unsaved';

interface SaveStatusProps {
  status: SaveStatusType;
}

export function SaveStatus({ status }: SaveStatusProps) {
  if (status === 'saving') {
    return (
      <div className="flex items-center gap-1.5 text-sm">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
        <span className="text-gray-500">Saving...</span>
      </div>
    );
  }

  if (status === 'unsaved') {
    return (
      <div className="flex items-center gap-1.5 text-sm">
        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
        <span className="text-yellow-600">Unsaved</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <div className="w-2 h-2 bg-green-500 rounded-full" />
      <span className="text-green-600">Saved</span>
    </div>
  );
}
