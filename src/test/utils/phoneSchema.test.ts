import { describe, it, expect } from 'vitest';
import { phoneSchema } from '@/model/phone.model';

describe('phoneSchema', () => {
  it('aceita formato válido (SP)', () => {
    expect(phoneSchema.safeParse('(11) 99999-9999').success).toBe(true);
  });

  it('aceita formato válido (RJ)', () => {
    expect(phoneSchema.safeParse('(21) 98765-4321').success).toBe(true);
  });

  it('aceita todos os DDDs válidos', () => {
    expect(phoneSchema.safeParse('(85) 91234-5678').success).toBe(true);
  });

  it('rejeita sem parênteses', () => {
    expect(phoneSchema.safeParse('11 99999-9999').success).toBe(false);
  });

  it('rejeita sem espaço após o DDD', () => {
    expect(phoneSchema.safeParse('(11)99999-9999').success).toBe(false);
  });

  it('rejeita sem hífen', () => {
    expect(phoneSchema.safeParse('(11) 999999999').success).toBe(false);
  });

  it('rejeita telefone fixo (8 dígitos)', () => {
    expect(phoneSchema.safeParse('(11) 9999-9999').success).toBe(false);
  });

  it('rejeita string vazia', () => {
    expect(phoneSchema.safeParse('').success).toBe(false);
  });

  it('rejeita com letras', () => {
    expect(phoneSchema.safeParse('(11) 9999a-9999').success).toBe(false);
  });

  it('rejeita com caracteres extras', () => {
    expect(phoneSchema.safeParse('(11) 99999-99999').success).toBe(false);
  });

  it('mensagem de erro correta', () => {
    const result = phoneSchema.safeParse('invalido');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Telefone deve estar no formato (99) 99999-9999',
      );
    }
  });
});
