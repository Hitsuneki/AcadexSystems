/**
 * Storage service — stub.
 */
import type { ProjectFile, FileType } from '@/types';

function getFileType(fileName: string): FileType {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? 'txt';
  const map: Record<string, FileType> = {
    pdf: 'pdf', docx: 'docx', doc: 'docx',
    pptx: 'pptx', ppt: 'pptx',
    jpg: 'jpg', jpeg: 'jpg', png: 'png',
    txt: 'txt',
  };
  return map[ext] ?? 'txt';
}

export async function uploadFile(
  _projectId: string,
  _uid: string,
  localUri: string,
  fileName: string,
  fileSize: number,
): Promise<ProjectFile> {
  await new Promise((r) => setTimeout(r, 1200));
  return {
    id: `file-${Date.now()}`,
    projectId: _projectId,
    fileName,
    fileType: getFileType(fileName),
    fileSize,
    storageUrl: localUri,
    uploadedBy: _uid,
    uploadedAt: new Date().toISOString(),
  };
}

export async function deleteFile(_fileId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 300));
}
