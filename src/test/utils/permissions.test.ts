import { describe, it, expect } from 'vitest';
import {
  canWrite,
  canManageMembers,
  canManageCategories,
  isSuperuser,
  resolvePermissionMatrix,
} from '@/lib/permissions';

describe('canWrite', () => {
  it('permite administrador', () =>
    expect(canWrite('administrador')).toBe(true));
  it('permite operador', () => expect(canWrite('operador')).toBe(true));
  it('bloqueia visualizador', () =>
    expect(canWrite('visualizador')).toBe(false));
  it('bloqueia null', () => expect(canWrite(null)).toBe(false));
  it('bloqueia undefined', () => expect(canWrite(undefined)).toBe(false));
});

describe('canManageMembers', () => {
  it('permite administrador', () =>
    expect(canManageMembers('administrador')).toBe(true));
  it('bloqueia operador', () =>
    expect(canManageMembers('operador')).toBe(false));
  it('bloqueia visualizador', () =>
    expect(canManageMembers('visualizador')).toBe(false));
  it('bloqueia null', () => expect(canManageMembers(null)).toBe(false));
  it('bloqueia undefined', () =>
    expect(canManageMembers(undefined)).toBe(false));
});

describe('canManageCategories', () => {
  it('permite administrador', () =>
    expect(canManageCategories('administrador')).toBe(true));
  it('bloqueia operador', () =>
    expect(canManageCategories('operador')).toBe(false));
  it('bloqueia visualizador', () =>
    expect(canManageCategories('visualizador')).toBe(false));
  it('bloqueia null', () => expect(canManageCategories(null)).toBe(false));
});

describe('isSuperuser', () => {
  it('retorna true quando IDs coincidem', () => {
    expect(isSuperuser('user-abc', 'user-abc')).toBe(true);
  });

  it('retorna false quando IDs são diferentes', () => {
    expect(isSuperuser('user-abc', 'user-xyz')).toBe(false);
  });
});

describe('resolvePermissionMatrix', () => {
  const role = [
    {
      resource: 'transactions',
      can_read: true,
      can_create: true,
      can_update: true,
      can_delete: false,
    },
  ];

  it('nega recursos sem linha de papel ou override', () => {
    const matrix = resolvePermissionMatrix([], []);
    expect(matrix.settings.can_read).toBe(false);
  });

  it('usa a linha do papel como fallback', () => {
    const matrix = resolvePermissionMatrix(role, []);
    expect(matrix.transactions.can_create).toBe(true);
  });

  it('faz override individual prevalecer inclusive para negar', () => {
    const matrix = resolvePermissionMatrix(role, [
      {
        resource: 'transactions',
        can_read: true,
        can_create: false,
        can_update: false,
        can_delete: false,
      },
    ]);
    expect(matrix.transactions.can_create).toBe(false);
  });

  it('permite tudo para superusuário sem depender da matriz', () => {
    const matrix = resolvePermissionMatrix([], [], true);
    expect(
      Object.values(matrix).every((permission) =>
        Object.values(permission).every(Boolean)
      )
    ).toBe(true);
  });
});
