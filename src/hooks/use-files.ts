/**
 * useFiles — file list for a project.
 */
import { useState, useEffect, useCallback } from 'react';
import type { ProjectFile } from '@/types';

export function useFiles(_projectId: string | undefined) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    if (!_projectId) return;
    setLoading(true);
    // TODO: fetch files from backend
    setTimeout(() => { setFiles([]); setLoading(false); }, 300);
  }, [_projectId]);

  useEffect(() => {
    if (!_projectId) { setLoading(false); return; }
    const timer = setTimeout(() => { setFiles([]); setLoading(false); }, 300);
    return () => clearTimeout(timer);
  }, [_projectId]);

  const addOptimistic = (file: ProjectFile) => setFiles((prev) => [file, ...prev]);
  const removeOptimistic = (fileId: string) => setFiles((prev) => prev.filter((f) => f.id !== fileId));

  return { files, loading, reload, addOptimistic, removeOptimistic };
}
