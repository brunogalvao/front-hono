import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import { uploadAvatarImage } from '@/service/uploadAvatarImage';

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.user.profile(),
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
      if (file) {
        avatarUrl = await uploadAvatarImage(file, userId);
      }
      const { error } = await supabase.auth.updateUser({
        data: { displayName, phone, avatar_url: avatarUrl },
      });
      if (error) throw error;
      return { avatarUrl };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
}
