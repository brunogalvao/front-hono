import { supabase } from '@/lib/supabase';

export const AVATAR_BUCKET = 'avatars';
export const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024;
export const MAX_AVATAR_SOURCE_FILE_SIZE = 10 * 1024 * 1024;
export const AVATAR_OUTPUT_SIZE = 512;
export const AVATAR_JPEG_QUALITY = 0.85;
export const ALLOWED_AVATAR_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;
export type AvatarMimeType = (typeof ALLOWED_AVATAR_MIME_TYPES)[number];
export type AvatarErrorCode =
  | 'avatar_invalid_type'
  | 'avatar_source_too_large'
  | 'avatar_output_too_large'
  | 'avatar_upload_failed'
  | 'avatar_profile_update_failed'
  | 'avatar_persistence_not_confirmed'
  | 'avatar_processing_failed';

export class AvatarError extends Error {
  readonly code: AvatarErrorCode;
  readonly originalError?: unknown;

  constructor(code: AvatarErrorCode, originalError?: unknown) {
    super(code);
    this.name = 'AvatarError';
    this.code = code;
    this.originalError = originalError;
  }
}

export interface AvatarUploadResult {
  path: string;
  publicUrl: string;
}

export function isAllowedAvatarMimeType(
  mimeType: string
): mimeType is AvatarMimeType {
  return ALLOWED_AVATAR_MIME_TYPES.includes(mimeType as AvatarMimeType);
}

export function validateAvatarSourceFile(file: File) {
  if (!isAllowedAvatarMimeType(file.type)) {
    throw new AvatarError('avatar_invalid_type');
  }

  if (file.size > MAX_AVATAR_SOURCE_FILE_SIZE) {
    throw new AvatarError('avatar_source_too_large');
  }
}

export function validateAvatarFile(file: File) {
  if (!isAllowedAvatarMimeType(file.type)) {
    throw new AvatarError('avatar_invalid_type');
  }

  if (file.size > MAX_AVATAR_FILE_SIZE) {
    throw new AvatarError('avatar_output_too_large');
  }
}

function createAvatarPath(userId: string, mimeType: string) {
  const extensionByMimeType: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };
  return `${userId}/${crypto.randomUUID()}.${extensionByMimeType[mimeType]}`;
}

export function getOwnedAvatarPath(avatarUrl: string, userId: string) {
  if (!avatarUrl) return null;

  try {
    const marker = `/storage/v1/object/public/${AVATAR_BUCKET}/`;
    const path = decodeURIComponent(
      new URL(avatarUrl).pathname.split(marker)[1] ?? ''
    );
    return path.startsWith(`${userId}/`) ? path : null;
  } catch {
    return null;
  }
}

export const removeAvatarImage = async (path: string) => {
  const { error } = await supabase.storage.from(AVATAR_BUCKET).remove([path]);
  if (error) throw error;
};

export const uploadAvatarImage = async (
  file: File,
  userId: string
): Promise<AvatarUploadResult> => {
  validateAvatarFile(file);
  const path = createAvatarPath(userId, file.type);

  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, {
      upsert: false,
      cacheControl: '3600',
      contentType: file.type,
    });

  if (error) {
    throw new AvatarError('avatar_upload_failed', error);
  }

  const publicUrl = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path)
    .data.publicUrl;

  return { path, publicUrl };
};
