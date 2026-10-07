import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import {
  AvatarError,
  getOwnedAvatarPath,
  removeAvatarImage,
  uploadAvatarImage,
} from '@/service/uploadAvatarImage';

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.user.profile,
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      file,
      displayName,
      phone,
      currentAvatarUrl,
    }: {
      userId: string;
      file: File | null;
      displayName: string;
      phone: string;
      currentAvatarUrl: string;
    }) => {
      let avatarUrl = currentAvatarUrl;
      let uploadedPath: string | null = null;
      if (file) {
        try {
          const uploadedAvatar = await uploadAvatarImage(file, userId);
          avatarUrl = uploadedAvatar.publicUrl;
          uploadedPath = uploadedAvatar.path;
        } catch (error) {
          if (error instanceof AvatarError) throw error;
          throw new AvatarError('avatar_upload_failed', error);
        }
      }

      try {
        const { data, error } = await supabase.auth.updateUser({
          data: { displayName, phone, avatar_url: avatarUrl },
        });
        if (error) {
          throw new AvatarError(
            file
              ? 'avatar_persistence_not_confirmed'
              : 'avatar_profile_update_failed',
            error
          );
        }
        if (!data.user || data.user.user_metadata?.avatar_url !== avatarUrl) {
          throw new AvatarError('avatar_persistence_not_confirmed');
        }

        const previousAvatarPath = getOwnedAvatarPath(currentAvatarUrl, userId);
        if (
          uploadedPath &&
          previousAvatarPath &&
          previousAvatarPath !== uploadedPath
        ) {
          await removeAvatarImage(previousAvatarPath).catch(() => undefined);
        }

        return { avatarUrl, user: data.user };
      } catch (error) {
        if (uploadedPath) {
          await removeAvatarImage(uploadedPath).catch(() => undefined);
        }
        throw error;
      }
    },
    onSuccess: ({ user }) => {
      queryClient.setQueryData(queryKeys.user.profile, user);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.user.all,
        refetchType: 'inactive',
      });
    },
  });
}

export function useCompleteProfileOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      fullName,
    }: {
      userId: string;
      fullName: string;
    }) => {
      const normalizedName = fullName.trim();
      if (!normalizedName) throw new Error('full_name_required');
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: normalizedName,
          onboarding_status: 'complete',
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
}
