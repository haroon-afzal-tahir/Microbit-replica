import { nanoid } from 'nanoid';

export function generateProjectId(): string {
  return nanoid(12); // 12-character unique ID
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
