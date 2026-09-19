import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import { isSuperuser } from '@/lib/permissions';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useTranslation } from 'react-i18next';

function useCurrentUserId() {
  return useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user?.id ?? null;
    },
  });
}

export function useSuperAdminGuard() {
  const { t } = useTranslation('nav');
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const { data: currentUserId, isLoading: isLoadingUser } = useCurrentUserId();

  // Stay loading until both userId and workspace are resolved
  const isLoading = isLoadingUser || !activeWorkspace;

  const isAllowed =
    !!activeWorkspace &&
    !!currentUserId &&
    isSuperuser(activeWorkspace.superuser_id, currentUserId);

  useEffect(() => {
    if (isLoading) return;
    if (!isAllowed) {
      toast.error(t('superAdminOnly'));
      navigate({ to: '/admin/dashboard' });
    }
  }, [isLoading, isAllowed, navigate, t]);

  return { isAllowed, isLoading };
}
