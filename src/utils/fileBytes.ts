import * as FileSystem from 'expo-file-system/legacy';

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i += 1) {
    lookup[chars.charCodeAt(i)] = i;
  }

  const normalized = base64.replace(/[^A-Za-z0-9+/]/g, '');
  const bufferLength = normalized.length * 0.75 - (normalized.endsWith('==') ? 2 : normalized.endsWith('=') ? 1 : 0);
  const bytes = new Uint8Array(bufferLength);

  let p = 0;
  for (let i = 0; i < normalized.length; i += 4) {
    const encoded1 = lookup[normalized.charCodeAt(i)];
    const encoded2 = lookup[normalized.charCodeAt(i + 1)];
    const encoded3 = lookup[normalized.charCodeAt(i + 2)];
    const encoded4 = lookup[normalized.charCodeAt(i + 3)];

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    if (p < bufferLength) bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    if (p < bufferLength) bytes[p++] = ((encoded3 & 3) << 6) | encoded4;
  }

  return bytes.buffer;
}

/** Read a local or remote URI into bytes for Supabase Storage uploads. */
export async function readUriAsArrayBuffer(fileUri: string): Promise<ArrayBuffer> {
  if (fileUri.startsWith('http://') || fileUri.startsWith('https://')) {
    const response = await fetch(fileUri);
    if (!response.ok) {
      throw new Error(`Failed to read file: ${response.statusText}`);
    }
    return response.arrayBuffer();
  }

  try {
    const response = await fetch(fileUri);
    if (response.ok) {
      return response.arrayBuffer();
    }
  } catch {
    // Fall through to FileSystem for file:// and content:// URIs
  }

  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: 'base64',
  });

  return base64ToArrayBuffer(base64);
}
