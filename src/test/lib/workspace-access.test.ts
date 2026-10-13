import { describe, expect, it } from 'vitest';
import {
  getFirstAccessibleWorkspaceRoute,
  getWorkspaceRouteRequirement,
} from '@/lib/workspace-access';

describe('workspace access routing', () => {
  it('mapeia páginas financeiras para a permissão de leitura correta', () => {
    expect(getWorkspaceRouteRequirement('/admin/dashboard')).toBe(
      'transactions'
    );
    expect(getWorkspaceRouteRequirement('/admin/transactions')).toBe(
      'transactions'
    );
    expect(getWorkspaceRouteRequirement('/admin/recurring')).toBe('recurring');
    expect(getWorkspaceRouteRequirement('/admin/installments')).toBe(
      'installments'
    );
    expect(getWorkspaceRouteRequirement('/admin/settings/members')).toBe(
      'members'
    );
  });

  it('mantém páginas pessoais fora da matriz do workspace', () => {
    expect(getWorkspaceRouteRequirement('/admin/profile')).toBeNull();
    expect(getWorkspaceRouteRequirement('/admin/account')).toBeNull();
  });

  it('escolhe a primeira página que o convidado pode ler', () => {
    expect(
      getFirstAccessibleWorkspaceRoute((resource) => resource === 'recurring')
    ).toBe('/admin/recurring');
  });

  it('usa o perfil quando o usuário não tem acesso a páginas do workspace', () => {
    expect(getFirstAccessibleWorkspaceRoute(() => false)).toBe(
      '/admin/profile'
    );
  });
});
