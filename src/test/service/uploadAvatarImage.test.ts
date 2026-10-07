import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockFrom, mockGetPublicUrl, mockRemove, mockUpload } = vi.hoisted(
  () => {
    const mockUpload = vi.fn();
    const mockRemove = vi.fn();
    const mockGetPublicUrl = vi.fn();
    const mockFrom = vi.fn(() => ({
      upload: mockUpload,
      remove: mockRemove,
      getPublicUrl: mockGetPublicUrl,
    }));

    return { mockFrom, mockGetPublicUrl, mockRemove, mockUpload };
  }
);

vi.mock('@/lib/supabase', () => ({
  supabase: { storage: { from: mockFrom } },
}));

import {
  getOwnedAvatarPath,
  removeAvatarImage,
  uploadAvatarImage,
  validateAvatarFile,
  validateAvatarSourceFile,
} from '@/service/uploadAvatarImage';

describe('uploadAvatarImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpload.mockResolvedValue({ error: null });
    mockRemove.mockResolvedValue({ error: null });
    mockGetPublicUrl.mockImplementation((path: string) => ({
      data: {
        publicUrl: `https://project.supabase.co/storage/v1/object/public/avatars/${path}`,
      },
    }));
  });

  it('uploads to a unique user-owned path without overwriting cached objects', async () => {
    const file = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });

    const result = await uploadAvatarImage(file, 'user-123');

    expect(result.path).toMatch(/^user-123\/[\w-]+\.jpg$/);
    expect(mockFrom).toHaveBeenCalledWith('avatars');
    expect(mockUpload).toHaveBeenCalledWith(result.path, file, {
      upsert: false,
      cacheControl: '3600',
      contentType: 'image/jpeg',
    });
    expect(result.publicUrl).toContain(`/avatars/${result.path}`);
  });

  it('only extracts paths that belong to the authenticated user', () => {
    const ownUrl =
      'https://project.supabase.co/storage/v1/object/public/avatars/user-123/photo.jpg';
    const otherUrl =
      'https://project.supabase.co/storage/v1/object/public/avatars/user-456/photo.jpg';

    expect(getOwnedAvatarPath(ownUrl, 'user-123')).toBe('user-123/photo.jpg');
    expect(getOwnedAvatarPath(otherUrl, 'user-123')).toBeNull();
    expect(getOwnedAvatarPath('invalid-url', 'user-123')).toBeNull();
  });

  it('rejects unsupported formats and oversized output before upload', () => {
    expect(() =>
      validateAvatarFile(
        new File(['avatar'], 'avatar.gif', { type: 'image/gif' })
      )
    ).toThrow('avatar_invalid_type');

    const oversized = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'a.jpg', {
      type: 'image/jpeg',
    });
    expect(() => validateAvatarFile(oversized)).toThrow(
      'avatar_output_too_large'
    );
  });

  it('distinguishes an oversized source from an oversized optimized output', () => {
    const oversizedSource = new File(
      [new Uint8Array(10 * 1024 * 1024 + 1)],
      'source.jpg',
      { type: 'image/jpeg' }
    );

    expect(() => validateAvatarSourceFile(oversizedSource)).toThrow(
      'avatar_source_too_large'
    );
  });

  it('maps Supabase upload failures to a stable UI-safe error code', async () => {
    const storageError = new Error('technical storage detail');
    mockUpload.mockResolvedValue({ error: storageError });

    await expect(
      uploadAvatarImage(
        new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' }),
        'user-123'
      )
    ).rejects.toMatchObject({
      code: 'avatar_upload_failed',
      originalError: storageError,
    });
  });

  it('removes a stored avatar by its resolved path', async () => {
    await removeAvatarImage('user-123/old.jpg');
    expect(mockRemove).toHaveBeenCalledWith(['user-123/old.jpg']);
  });
});
