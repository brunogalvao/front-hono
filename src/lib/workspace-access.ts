import type { PermissionResource } from '@/lib/permissions';

export type WorkspaceRoutePath =
  | '/admin/dashboard'
  | '/admin/transactions'
  | '/admin/recurring'
  | '/admin/installments'
  | '/admin/advisor'
  | '/admin/settings'
  | '/admin/settings/members';

interface WorkspaceRouteRequirement {
  path: WorkspaceRoutePath;
  resource: PermissionResource;
}

const WORKSPACE_ROUTE_REQUIREMENTS: readonly WorkspaceRouteRequirement[] = [
  { path: '/admin/settings/members', resource: 'members' },
  { path: '/admin/transactions', resource: 'transactions' },
  { path: '/admin/installments', resource: 'installments' },
  { path: '/admin/recurring', resource: 'recurring' },
  { path: '/admin/settings', resource: 'settings' },
  { path: '/admin/dashboard', resource: 'transactions' },
  { path: '/admin/advisor', resource: 'transactions' },
];

const WORKSPACE_ROUTE_PRIORITY: readonly WorkspaceRouteRequirement[] = [
  { path: '/admin/dashboard', resource: 'transactions' },
  { path: '/admin/transactions', resource: 'transactions' },
  { path: '/admin/recurring', resource: 'recurring' },
  { path: '/admin/installments', resource: 'installments' },
  { path: '/admin/settings', resource: 'settings' },
  { path: '/admin/settings/members', resource: 'members' },
];

export function getWorkspaceRouteRequirement(
  pathname: string
): PermissionResource | null {
  return (
    WORKSPACE_ROUTE_REQUIREMENTS.find(
      ({ path }) => pathname === path || pathname.startsWith(`${path}/`)
    )?.resource ?? null
  );
}

export function getFirstAccessibleWorkspaceRoute(
  canRead: (resource: PermissionResource) => boolean
): WorkspaceRoutePath | '/admin/profile' {
  return (
    WORKSPACE_ROUTE_PRIORITY.find(({ resource }) => canRead(resource))?.path ??
    '/admin/profile'
  );
}
