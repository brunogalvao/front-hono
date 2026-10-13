import { useEffect } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import Loading from '@/components/Loading';
import { usePermissions } from '@/hooks/usePermissions';
import { useWorkspace } from '@/context/WorkspaceContext';
import {
  getFirstAccessibleWorkspaceRoute,
  getWorkspaceRouteRequirement,
} from '@/lib/workspace-access';

export function WorkspaceRouteGuard({
  children,
  isWorkspaceLoading = false,
}: {
  children: React.ReactNode;
  isWorkspaceLoading?: boolean;
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { activeWorkspace } = useWorkspace();
  const { can, isLoading } = usePermissions();
  const requiredResource = getWorkspaceRouteRequirement(pathname);
  const hasAccess = requiredResource ? can(requiredResource, 'read') : true;
  const shouldRedirect =
    requiredResource !== null &&
    !isWorkspaceLoading &&
    !isLoading &&
    (!activeWorkspace || !hasAccess);

  useEffect(() => {
    if (!shouldRedirect) return;

    const fallback = activeWorkspace
      ? getFirstAccessibleWorkspaceRoute((resource) => can(resource, 'read'))
      : '/admin/profile';

    void navigate({ to: fallback, replace: true });
  }, [activeWorkspace, can, navigate, shouldRedirect]);

  if (
    requiredResource &&
    (isWorkspaceLoading || isLoading || !activeWorkspace || !hasAccess)
  ) {
    return <Loading type="card" />;
  }

  return children;
}
