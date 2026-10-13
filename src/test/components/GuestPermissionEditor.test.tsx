import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GuestPermissionEditor } from '@/components/workspace/GuestPermissionEditor';

const permissionHooks = vi.hoisted(() => ({
  upsert: { mutateAsync: vi.fn(), isPending: false },
  resetAll: { mutateAsync: vi.fn(), isPending: false },
}));

vi.mock('@/hooks/useMemberPermissions', () => ({
  useMemberPermissions: () => ({
    data: [],
    isLoading: false,
    upsert: permissionHooks.upsert,
    resetAll: permissionHooks.resetAll,
  }),
}));

vi.mock('@/hooks/useRolePermissions', () => ({
  useRolePermissions: () => ({
    data: [
      {
        id: 'role-permission-1',
        workspace_id: 'workspace-1',
        role: 'visualizador',
        resource: 'transactions',
        can_read: true,
        can_create: false,
        can_update: false,
        can_delete: false,
      },
    ],
    isLoading: false,
  }),
}));

describe('GuestPermissionEditor', () => {
  beforeEach(() => vi.clearAllMocks());

  it('exibe a permissão herdada e a preserva ao criar o primeiro override', async () => {
    permissionHooks.upsert.mutateAsync.mockResolvedValue(undefined);

    render(
      <GuestPermissionEditor
        workspaceId="workspace-1"
        userId="invited-user"
        currentUserId="owner-user"
        role="visualizador"
      />
    );

    expect(
      screen.getByRole('checkbox', {
        name: 'Ler em Transações para Visualizador',
      })
    ).toBeChecked();

    await userEvent.click(
      screen.getByRole('checkbox', {
        name: 'Criar em Transações para Visualizador',
      })
    );

    expect(permissionHooks.upsert.mutateAsync).toHaveBeenCalledWith({
      workspace_id: 'workspace-1',
      user_id: 'invited-user',
      resource: 'transactions',
      can_read: true,
      can_create: true,
      can_update: false,
      can_delete: false,
      updated_by: 'owner-user',
    });
  });
});
