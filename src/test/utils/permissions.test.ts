import { describe, it, expect } from 'vitest';
import {
  canWrite,
  canManageMembers,
  canManageCategories,
  isSuperuser,
} from '@/lib/permissions';

describe('canWrite', () => {
  it('permite administrador', () => expect(canWrite('administrador')).toBe(true));
  it('permite operador', () => expect(canWrite('operador')).toBe(true));
  it('bloqueia visualizador', () => expect(canWrite('visualizador')).toBe(false));
  it('bloqueia null', () => expect(canWrite(null)).toBe(false));
  it('bloqueia undefined', () => expect(canWrite(undefined)).toBe(false));
});

describe('canManageMembers', () => {
  it('permite administrador', () => expect(canManageMembers('administrador')).toBe(true));
  it('bloqueia operador', () => expect(canManageMembers('operador')).toBe(false));
  it('bloqueia visualizador', () => expect(canManageMembers('visualizador')).toBe(false));
  it('bloqueia null', () => expect(canManageMembers(null)).toBe(false));
  it('bloqueia undefined', () => expect(canManageMembers(undefined)).toBe(false));
});

describe('canManageCategories', () => {
  it('permite administrador', () => expect(canManageCategories('administrador')).toBe(true));
  it('bloqueia operador', () => expect(canManageCategories('operador')).toBe(false));
  it('bloqueia visualizador', () => expect(canManageCategories('visualizador')).toBe(false));
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
