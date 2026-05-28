import { describe, it, expect } from 'vitest';
import {
  canWrite,
  canManageMembers,
  canManageCategories,
  canEditTransaction,
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

describe('canEditTransaction', () => {
  it('administrador edita qualquer transação', () => {
    expect(canEditTransaction('administrador', 'user-1', 'user-2')).toBe(true);
  });

  it('operador edita suas próprias transações', () => {
    expect(canEditTransaction('operador', 'user-1', 'user-1')).toBe(true);
  });

  it('operador não edita transações de outros', () => {
    expect(canEditTransaction('operador', 'user-1', 'user-2')).toBe(false);
  });

  it('visualizador não edita nenhuma transação', () => {
    expect(canEditTransaction('visualizador', 'user-1', 'user-1')).toBe(false);
  });

  it('null não edita', () => {
    expect(canEditTransaction(null, 'user-1', 'user-1')).toBe(false);
  });

  it('undefined não edita', () => {
    expect(canEditTransaction(undefined, 'user-1', 'user-1')).toBe(false);
  });
});

describe('isSuperuser', () => {
  it('retorna true quando IDs coincidem', () => {
    expect(isSuperuser('user-abc', 'user-abc')).toBe(true);
  });

  it('retorna false quando IDs são diferentes', () => {
    expect(isSuperuser('user-abc', 'user-xyz')).toBe(false);
  });
});
