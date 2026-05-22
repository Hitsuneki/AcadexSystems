import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import { db } from '@/config/firebase';
import { PROJECT_FILES_BUCKET } from '@/config/supabase';
import type { ProjectFile } from '@/types';
import { deleteStorageFile, uploadProjectFile } from './storage.service';
import { logActivity } from './activity.service';
import { inferFileType, mapProjectFile } from './mappers';

export async function uploadFile(
  projectId: string,
  userId: string,
  fileUri: string,
  fileName: string,
  mimeType = 'application/octet-stream',
  fileSize = 0,
): Promise<string> {
  const fileType = inferFileType(fileName, mimeType);
  const fileRef = await addDoc(collection(db, 'files'), {
    projectId,
    uploadedBy: userId,
    fileName,
    fileType,
    storageUrl: '',
    storagePath: '',
    fileSize,
    status: 'uploading',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  try {
    await updateDoc(fileRef, { id: fileRef.id });
    const { publicUrl, storagePath } = await uploadProjectFile(
      projectId,
      userId,
      fileUri,
      fileName,
      mimeType,
    );
    await updateDoc(fileRef, {
      storageUrl: publicUrl,
      storagePath,
      status: 'available',
      updatedAt: serverTimestamp(),
    });
    await logActivity(projectId, userId, 'file_uploaded', 'file', fileRef.id);
    return fileRef.id;
  } catch (error: any) {
    await updateDoc(fileRef, {
      status: 'failed',
      updatedAt: serverTimestamp(),
    });
    throw new Error(`File upload failed: ${error.message}`);
  }
}

export async function deleteFile(
  fileId: string,
  storagePath: string,
  _userId: string,
  _projectId: string,
): Promise<void> {
  try {
    await deleteStorageFile(PROJECT_FILES_BUCKET, storagePath);
    await updateDoc(doc(db, 'files', fileId), {
      status: 'deleted',
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

export function listenToProjectFiles(
  projectId: string,
  callback: (files: ProjectFile[]) => void,
): () => void {
  const q = query(collection(db, 'files'), where('projectId', '==', projectId));
  return onSnapshot(
    q,
    (snapshot) => {
      callback(
        snapshot.docs
          .map((item) => mapProjectFile(item.id, item.data()))
          .filter((file) => file.status !== 'deleted'),
      );
    },
    (error) => {
      throw new Error(`Failed to listen to files: ${error.message}`);
    },
  );
}
