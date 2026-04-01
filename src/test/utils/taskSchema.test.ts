import { describe, it, expect } from 'vitest';
import { taskSchema } from '@/schema/taskSchema';
import { TASK_STATUS, TASK_STATUS_LIST } from '@/model/tasks.model';

const baseTask = {
  title: 'Aluguel',
  price: 1500,
  type: 'Moradia',
  done: 'Pendente' as const,
  mes: 3,
  ano: 2026,
};

describe('taskSchema', () => {
  it('valida task mensal (recorrente: false por padrão)', () => {
    const result = taskSchema.safeParse(baseTask);
    expect(result.success).toBe(true);
    expect(result.data?.recorrente).toBe(false);
  });

  it('valida task recorrente (recorrente: true)', () => {
    const result = taskSchema.safeParse({ ...baseTask, recorrente: true });
    expect(result.success).toBe(true);
    expect(result.data?.recorrente).toBe(true);
  });

  it('valida task com status Pago', () => {
    const result = taskSchema.safeParse({ ...baseTask, done: 'Pago' });
    expect(result.success).toBe(true);
  });

  it('valida task com status Fixo (recorrente)', () => {
    const result = taskSchema.safeParse({ ...baseTask, done: 'Fixo' });
    expect(result.success).toBe(true);
  });

  it('rejeita título vazio', () => {
    const result = taskSchema.safeParse({ ...baseTask, title: '' });
    expect(result.success).toBe(false);
  });

  it('rejeita preço zero', () => {
    const result = taskSchema.safeParse({ ...baseTask, price: 0 });
    expect(result.success).toBe(false);
  });

  it('rejeita mês inválido', () => {
    expect(taskSchema.safeParse({ ...baseTask, mes: 0 }).success).toBe(false);
    expect(taskSchema.safeParse({ ...baseTask, mes: 13 }).success).toBe(false);
  });

  it('rejeita ano inválido', () => {
    const result = taskSchema.safeParse({ ...baseTask, ano: 1999 });
    expect(result.success).toBe(false);
  });
});

describe('TASK_STATUS model', () => {
  it('contém Pago e Pendente', () => {
    expect(TASK_STATUS.Pago).toBe('Pago');
    expect(TASK_STATUS.Pendente).toBe('Pendente');
  });

  it('contém Fixo (status de despesa recorrente)', () => {
    expect(TASK_STATUS.Fixo).toBe('Fixo');
  });

  it('TASK_STATUS_LIST possui Pago, Pendente e Fixo', () => {
    const values = TASK_STATUS_LIST.map((s) => s.value);
    expect(values).toContain('Pago');
    expect(values).toContain('Pendente');
    expect(values).toContain('Fixo');
    expect(values).toHaveLength(3);
  });
});
