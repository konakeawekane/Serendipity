import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { LIMITS } from '@/domain/validation';
import { safeLibraryFilename, serializeLibrary } from '@/features/import-export/schema';
import type { Library } from '@/types/domain';

export async function pickLibraryFile(): Promise<{ name: string; text: string } | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/json', 'text/plain'],
    copyToCacheDirectory: Platform.OS !== 'web',
    base64: Platform.OS === 'web',
    multiple: false,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset) throw new Error('No file was selected.');
  if (asset.size !== undefined && asset.size > LIMITS.importBytes) throw new Error('File must be 1 MB or smaller.');
  const text = Platform.OS === 'web'
    ? await readWebAsset(asset)
    : await readNativeFile(asset.uri);
  return { name: asset.name, text };
}

export async function shareLibraryFile(library: Library) {
  const contents = serializeLibrary(library);
  const filename = safeLibraryFilename(library.name);
  if (Platform.OS === 'web') {
    downloadWebFile(filename, contents);
    return;
  }

  if (!(await Sharing.isAvailableAsync())) throw new Error('File sharing is not available on this device.');
  const { File, Paths } = await import('expo-file-system');
  const file = new File(Paths.cache, filename);
  file.create({ overwrite: true, intermediates: true });
  await file.write(contents);
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json' });
}

async function readNativeFile(uri: string) {
  const { File } = await import('expo-file-system');
  return new File(uri).text();
}

async function readWebAsset(asset: DocumentPicker.DocumentPickerAsset) {
  if (asset.file) return asset.file.text();
  if (asset.base64) return decodeBase64(asset.base64);
  if (asset.uri.startsWith('data:')) return (await fetch(asset.uri)).text();
  throw new Error('The selected file could not be read in this browser.');
}

function decodeBase64(value: string) {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function downloadWebFile(filename: string, contents: string) {
  if (typeof document === 'undefined') throw new Error('File downloads are not available in this browser.');
  const url = URL.createObjectURL(new Blob([contents], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
