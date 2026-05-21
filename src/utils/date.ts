import { format, formatDistanceToNow, isBefore, isToday, isTomorrow } from 'date-fns';

export function formatDate(dateString: string): string {
  return format(new Date(dateString), 'MMM d, yyyy');
}

export function formatShortDate(dateString: string): string {
  return format(new Date(dateString), 'MMM d');
}

export function formatDatetime(dateString: string): string {
  return format(new Date(dateString), 'MMM d, yyyy h:mm a');
}

export function formatTimeAgo(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

export function formatMeetingDate(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) return `Today, ${format(date, 'h:mm a')}`;
  if (isTomorrow(date)) return `Tomorrow, ${format(date, 'h:mm a')}`;
  return format(date, 'EEE, MMM d · h:mm a');
}

export function isOverdue(dateString: string): boolean {
  return isBefore(new Date(dateString), new Date());
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
