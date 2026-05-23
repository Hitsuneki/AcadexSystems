/** Stable unique id for Firestore sub-documents and React keys. */
export function uniqueId(prefix = 'id'): string {
  const rand = Math.random().toString(36).slice(2, 11);
  return `${prefix}-${Date.now()}-${rand}`;
}
