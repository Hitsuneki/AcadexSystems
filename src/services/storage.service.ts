/**
 * Supabase Storage — avatars and project files only (no Firebase Storage).
 */
import {
  supabase,
  AVATARS_BUCKET,
  PROJECT_FILES_BUCKET,
} from '@/config/supabase';
import type { ProjectFile } from '@/types';
import { readUriAsArrayBuffer } from '@/utils/fileBytes';
import { inferFileType } from './mappers';

export type StorageBucket = typeof AVATARS_BUCKET | typeof PROJECT_FILES_BUCKET;

function getPublicUrlFromPath(bucket: StorageBucket, storagePath: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  if (!data?.publicUrl) {
    throw new Error('Failed to resolve public URL for uploaded file');
  }
  return data.publicUrl;
}

function avatarExtension(mimeType: string): string {
  if (mimeType.includes('png')) return 'png';
  if (mimeType.includes('webp')) return 'webp';
  if (mimeType.includes('gif')) return 'gif';
  return 'jpg';
}

export async function uploadAvatar(
  userId: string,
  fileUri: string,
  mimeType = 'image/jpeg',
): Promise<string> {
  const ext = avatarExtension(mimeType);
  const storagePath = `${userId}/${Date.now()}-avatar.${ext}`;
  const body = await readUriAsArrayBuffer(fileUri);

  const { error } = await supabase.storage.from(AVATARS_BUCKET).upload(storagePath, body, {
    contentType: mimeType,
    upsert: true,
  });

  if (error) {
    throw new Error(
      `Avatar upload failed: ${error.message}. Ensure the "${AVATARS_BUCKET}" bucket exists and allows uploads.`,
    );
  }

  return getPublicUrlFromPath(AVATARS_BUCKET, storagePath);
}

export async function uploadProjectFile(
  projectId: string,
  userId: string,
  fileUri: string,
  fileName: string,
  mimeType: string,
): Promise<{ publicUrl: string; storagePath: string }> {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${projectId}/${userId}-${Date.now()}-${safeName}`;
  const body = await readUriAsArrayBuffer(fileUri);

  const { error } = await supabase.storage.from(PROJECT_FILES_BUCKET).upload(storagePath, body, {
    contentType: mimeType,
    upsert: false,
  });

  if (error) {
    throw new Error(`Project file upload failed: ${error.message}`);
  }

  return {
    publicUrl: getPublicUrlFromPath(PROJECT_FILES_BUCKET, storagePath),
    storagePath,
  };
}

export async function deleteStorageFile(
  bucket: StorageBucket,
  storagePath: string,
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([storagePath]);
  if (error) {
    throw new Error(`Storage delete failed: ${error.message}`);
  }
}

export function getPublicUrl(bucket: StorageBucket, storagePath: string): string {
  return getPublicUrlFromPath(bucket, storagePath);
}

export async function uploadFile(
  projectId: string,
  userId: string,
  fileUri: string,
  fileName: string,
  fileSize = 0,
  mimeType = 'application/octet-stream',
): Promise<ProjectFile> {
  const { uploadFile: uploadFirestoreFile } = await import('./file.service');
  const fileId = await uploadFirestoreFile(projectId, userId, fileUri, fileName, mimeType, fileSize);
  return {
    id: fileId,
    projectId,
    uploadedBy: userId,
    fileName,
    fileType: inferFileType(fileName, mimeType),
    storageUrl: '',
    storagePath: '',
    fileSize,
    status: 'uploading',
    uploadedAt: new Date().toISOString(),
  } as ProjectFile;
}

export async function uploadFileToStorageOnly(
  projectId: string,
  userId: string,
  fileUri: string,
  fileName: string,
  fileSize = 0,
  mimeType = 'application/octet-stream',
): Promise<ProjectFile> {
  const { publicUrl, storagePath } = await uploadProjectFile(
    projectId,
    userId,
    fileUri,
    fileName,
    mimeType,
  );

  return {
    id: storagePath,
    projectId,
    uploadedBy: userId,
    fileName,
    fileType: inferFileType(fileName, mimeType),
    storageUrl: publicUrl,
    storagePath,
    fileSize,
    status: 'available',
    uploadedAt: new Date().toISOString(),
  } as ProjectFile;
}
