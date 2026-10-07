import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '@supabase/supabase-js';
import { queryKeys } from '@/lib/query-keys';

const {
  mockGetOwnedAvatarPath,
  mockGetUser,
  mockNavigate,
  mockOnAuthStateChange,
  mockRemoveAvatarImage,
  mockSetProfile,
  mockUpdateUser,
  mockUploadAvatarImage,
} = vi.hoisted(() => ({
  mockGetOwnedAvatarPath: vi.fn(),
  mockGetUser: vi.fn(),
  mockNavigate: vi.fn(),
  mockOnAuthStateChange: vi.fn(),
  mockRemoveAvatarImage: vi.fn(),
  mockSetProfile: vi.fn(),
  mockUpdateUser: vi.fn(),
  mockUploadAvatarImage: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  getAuthenticatedUser: vi.fn(),
  supabase: {
    auth: {
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
      updateUser: mockUpdateUser,
    },
  },
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@/context/UserContext', () => ({
  useUser: () => ({ profile: null, setProfile: mockSetProfile }),
}));

vi.mock('@/service/uploadAvatarImage', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/service/uploadAvatarImage')>();
  return {
    ...actual,
    getOwnedAvatarPath: mockGetOwnedAvatarPath,
    removeAvatarImage: mockRemoveAvatarImage,
    uploadAvatarImage: mockUploadAvatarImage,
  };
});

import { useCurrentUser, useUpdateUserProfile } from '@/hooks/use-user-profile';
import { useSessionGuard } from '@/hooks/useSessionGuard';

const oldAvatar =
  'https://project.supabase.co/storage/v1/object/public/avatars/user-123/old.jpg';
const newAvatar =
  'https://project.supabase.co/storage/v1/object/public/avatars/user-123/new.jpg';

function createUser(avatarUrl: string): User {
  return {
    id: 'user-123',
    app_metadata: { provider: 'email' },
    user_metadata: {
      displayName: 'Bruno',
      phone: '(11) 99999-9999',
      avatar_url: avatarUrl,
    },
    aud: 'authenticated',
    created_at: '2026-01-01T00:00:00.000Z',
    email: 'bruno@example.com',
  } as User;
}

function createWrapper(queryClient: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('user profile avatar persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mockUploadAvatarImage.mockResolvedValue({
      path: 'user-123/new.jpg',
      publicUrl: newAvatar,
    });
    mockGetOwnedAvatarPath.mockReturnValue('user-123/old.jpg');
    mockRemoveAvatarImage.mockResolvedValue(undefined);
  });

  it('confirms Auth persistence, updates the shared cache, then removes the old object', async () => {
    const persistedUser = createUser(newAvatar);
    mockUpdateUser.mockResolvedValue({
      data: { user: persistedUser },
      error: null,
    });
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const { result } = renderHook(() => useUpdateUserProfile(), {
      wrapper: createWrapper(queryClient),
    });
    const file = new File(['new avatar'], 'avatar.jpg', {
      type: 'image/jpeg',
    });

    await act(() =>
      result.current.mutateAsync({
        userId: 'user-123',
        file,
        displayName: 'Bruno',
        phone: '(11) 99999-9999',
        currentAvatarUrl: oldAvatar,
      })
    );

    expect(mockUpdateUser).toHaveBeenCalledWith({
      data: {
        displayName: 'Bruno',
        phone: '(11) 99999-9999',
        avatar_url: newAvatar,
      },
    });
    expect(queryClient.getQueryData(queryKeys.user.profile)).toBe(
      persistedUser
    );
    expect(mockRemoveAvatarImage).toHaveBeenCalledWith('user-123/old.jpg');
    expect(mockUpdateUser.mock.invocationCallOrder[0]).toBeLessThan(
      mockRemoveAvatarImage.mock.invocationCallOrder[0]
    );
  });

  it('rolls back the new object when Auth does not confirm the new URL', async () => {
    mockUpdateUser.mockResolvedValue({
      data: { user: createUser(oldAvatar) },
      error: null,
    });
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const { result } = renderHook(() => useUpdateUserProfile(), {
      wrapper: createWrapper(queryClient),
    });

    await expect(
      act(() =>
        result.current.mutateAsync({
          userId: 'user-123',
          file: new File(['new avatar'], 'avatar.jpg', {
            type: 'image/jpeg',
          }),
          displayName: 'Bruno',
          phone: '',
          currentAvatarUrl: oldAvatar,
        })
      )
    ).rejects.toThrow('avatar_persistence_not_confirmed');

    expect(mockRemoveAvatarImage).toHaveBeenCalledWith('user-123/new.jpg');
    expect(queryClient.getQueryData(queryKeys.user.profile)).toBeUndefined();
  });

  it('reloads the server-confirmed avatar in a fresh login query', async () => {
    const persistedUser = createUser(newAvatar);
    mockGetUser.mockResolvedValue({
      data: { user: persistedUser },
      error: null,
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    queryClient.setQueryData(queryKeys.user.profile, createUser(oldAvatar));
    queryClient.removeQueries({ queryKey: queryKeys.user.all });

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGetUser).toHaveBeenCalledOnce();
    expect(result.current.data?.user_metadata.avatar_url).toBe(newAvatar);
  });

  it('clears the previous account cache on logout before the next login', async () => {
    let authStateCallback:
      | ((event: string, session: unknown) => void)
      | undefined;
    mockOnAuthStateChange.mockImplementation(
      (callback: (event: string, session: unknown) => void) => {
        authStateCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    queryClient.setQueryData(queryKeys.user.profile, createUser(oldAvatar));
    const guard = renderHook(() => useSessionGuard(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => authStateCallback?.('SIGNED_OUT', null));

    expect(queryClient.getQueryData(queryKeys.user.profile)).toBeUndefined();
    expect(mockSetProfile).toHaveBeenCalledWith(null);
    guard.unmount();

    const persistedUser = createUser(newAvatar);
    mockGetUser.mockResolvedValue({
      data: { user: persistedUser },
      error: null,
    });
    const nextLogin = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(nextLogin.result.current.isSuccess).toBe(true));
    expect(nextLogin.result.current.data?.user_metadata.avatar_url).toBe(
      newAvatar
    );
  });
});
