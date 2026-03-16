import { describe, it, expect } from 'vitest';
import { getInitials } from '@/utils/getInitials';

describe('getInitials', () => {
  it('retorna iniciais de nome completo', () => {
    expect(getInitials('Bruno Galvão')).toBe('BG');
  });

  it('retorna só a primeira letra para nome único', () => {
    expect(getInitials('Bruno')).toBe('B');
  });

  it('usa email quando não há nome', () => {
    expect(getInitials(null, 'bruno@email.com')).toBe('BR');
  });

  it('retorna ?? quando não há nome nem email', () => {
    expect(getInitials(null, null)).toBe('??');
  });

  it('ignora espaços extras', () => {
    expect(getInitials('  Ana  Lima  ')).toBe('AL');
  });

  it('retorna iniciais em maiúsculas', () => {
    expect(getInitials('carlos mendes')).toBe('CM');
  });
});
