import { useEffect, useState } from 'react';

import { listenToProjectFiles } from '@/services/file.service';
import type { ProjectFile } from '@/types';

export function useFiles(projectId: string | undefined) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(Boolean(projectId));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!projectId) {
      setFiles([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError(null);
    const unsubscribe = listenToProjectFiles(projectId, (nextFiles) => {
      setFiles(nextFiles);
      setLoading(false);
    });

    return unsubscribe;
  }, [projectId]);

  const addOptimistic = (file: ProjectFile) => setFiles((prev) => [file, ...prev]);
  const removeOptimistic = (fileId: string) => setFiles((prev) => prev.filter((file) => file.id !== fileId));
  const reload = () => undefined;

  return { files, loading, error, reload, addOptimistic, removeOptimistic };
}
