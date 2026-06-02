import { supabase } from '@/lib/supabase';
import { fetchWithAuth } from '@/lib/fetch-api';
import type { UserProfile } from '@/model/user.model';

// ✅ GET USER com displayName corretamente
export const getUser = async (): Promise<UserProfile> => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw error ?? new Error('Usuário não encontrado');

  const { email, user_metadata } = data.user;

  return {
    email: email || '',
    phone: user_metadata?.phone || '',
    name: user_metadata?.name || user_metadata?.displayName || '',
    avatar_url: user_metadata?.avatar_url || '',
    displayName: user_metadata?.displayName || '',
  };
};

// ✅ PATCH para atualizar user no back-end
export const updateUser = async (
  data: UserProfile
): Promise<{ success: boolean; user: UserProfile }> => {
  type UpdateResult = {
    success: boolean;
    user: { email?: string; user_metadata?: { name?: string; displayName?: string; phone?: string; avatar_url?: string } };
  };

  const result = await fetchWithAuth<UpdateResult>('/api/user', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

  return {
    success: result.success,
    user: {
      email: result.user.email || '',
      name: result.user.user_metadata?.name || result.user.user_metadata?.displayName || '',
      displayName: result.user.user_metadata?.displayName || '',
      phone: result.user.user_metadata?.phone || '',
      avatar_url: result.user.user_metadata?.avatar_url || '',
    },
  };
};
