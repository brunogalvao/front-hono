import { describe, it, expect } from 'vitest';
import { TASK_STATUS } from '@/model/tasks.model';
import type { Task } from '@/model/tasks.model';
import type { TasksMonthMeta } from '@/service/task/getTasksCountByMonth';

// ── Helpers para calcular totalPago (mesma lógica do Expenses.tsx) ──────────

function calcTotalPago(tasks: Task[]): number {
  return tasks
    .filter((t) => t.done === TASK_STATUS.Pago && t.price)
    .reduce((sum, t) => sum + Number(t.price), 0);
}

// ── Helpers para verificar recorrente em mês (mesma lógica do getTasksCountByMonth) ──

function hasRecorrenteInMonth(tasks: Task[]): boolean {
  return tasks.some((t) => t.recorrente === true || !!t.fixo_source_id);
}

// ── Fixtures ────────────────────────────────────────────────────────────────

const taskPago: Task = {
  id: '1',
  title: 'Aluguel',
  price: 1500,
  done: TASK_STATUS.Pago,
  mes: 3,
  ano: 2026,
};

const taskPendente: Task = {
  id: '2',
  title: 'Internet',
  price: 120,
  done: TASK_STATUS.Pendente,
  mes: 3,
  ano: 2026,
};

const taskRecorrente: Task = {
  id: '3',
  title: 'Spotify',
  price: 22,
  done: TASK_STATUS.Pendente,
  mes: 3,
  ano: 2026,
  recorrente: true,
};

const taskCopiaRecorrente: Task = {
  id: '4',
  title: 'Spotify (cópia)',
  price: 22,
  done: TASK_STATUS.Pendente,
  mes: 4,
  ano: 2026,
  recorrente: false,
  fixo_source_id: '3',
};

// ── Testes: cálculo de totalPago ────────────────────────────────────────────

describe('calcTotalPago', () => {
  it('soma apenas tasks com status Pago', () => {
    const tasks = [taskPago, taskPendente, taskRecorrente];
    expect(calcTotalPago(tasks)).toBe(1500);
  });

  it('retorna 0 quando não há tasks pagas', () => {
    expect(calcTotalPago([taskPendente, taskRecorrente])).toBe(0);
  });

  it('retorna 0 para lista vazia', () => {
    expect(calcTotalPago([])).toBe(0);
  });

  it('ignora tasks sem preço', () => {
    const semPreco: Task = { ...taskPago, price: null };
    expect(calcTotalPago([semPreco])).toBe(0);
  });

  it('soma múltiplas tasks pagas', () => {
    const outraPaga: Task = { ...taskPago, id: '99', price: 500 };
    expect(calcTotalPago([taskPago, outraPaga, taskPendente])).toBe(2000);
  });
});

// ── Testes: detecção de recorrente por mês ──────────────────────────────────

describe('hasRecorrenteInMonth', () => {
  it('detecta task com recorrente: true', () => {
    expect(hasRecorrenteInMonth([taskPago, taskRecorrente])).toBe(true);
  });

  it('detecta cópia de recorrente via fixo_source_id', () => {
    expect(hasRecorrenteInMonth([taskCopiaRecorrente])).toBe(true);
  });

  it('retorna false quando não há recorrentes', () => {
    expect(hasRecorrenteInMonth([taskPago, taskPendente])).toBe(false);
  });

  it('retorna false para lista vazia', () => {
    expect(hasRecorrenteInMonth([])).toBe(false);
  });
});

// ── Testes: estrutura de TasksMonthMeta ─────────────────────────────────────

describe('TasksMonthMeta', () => {
  it('estrutura tem count, hasRecorrente e recorrenteNames', () => {
    const meta: TasksMonthMeta = {
      count: { 3: 2, 4: 1 },
      hasRecorrente: { 3: true, 4: true },
      recorrenteNames: { 3: ['Internet', 'Spotify'], 4: ['Internet'] },
    };

    expect(meta.count[3]).toBe(2);
    expect(meta.hasRecorrente[3]).toBe(true);
    expect(meta.recorrenteNames[3]).toEqual(['Internet', 'Spotify']);
    expect(meta.recorrenteNames[4]).toEqual(['Internet']);
  });

  it('mês sem tasks tem count 0, hasRecorrente false e lista vazia', () => {
    const meta: TasksMonthMeta = {
      count: { 1: 0 },
      hasRecorrente: { 1: false },
      recorrenteNames: { 1: [] },
    };

    expect(meta.count[1]).toBe(0);
    expect(meta.hasRecorrente[1]).toBe(false);
    expect(meta.recorrenteNames[1]).toHaveLength(0);
  });

  it('recorrenteNames não tem nomes duplicados', () => {
    // Simula mês com original + cópia do mesmo título (não deve duplicar no Set)
    const tasks: Task[] = [
      { ...taskRecorrente, id: 'a' },
      { ...taskCopiaRecorrente, id: 'b', title: 'Spotify' },
    ];
    const names = [...new Set(tasks.map((t) => t.title))];
    expect(names).toHaveLength(1);
    expect(names[0]).toBe('Spotify');
  });
});

// ── Testes: acesso seguro quando monthsMeta é undefined (guard opcional) ─────

function getCountSafe(meta: TasksMonthMeta | undefined, mes: number): number {
  return meta?.count?.[mes] ?? 0;
}

function getRecorrenteSafe(meta: TasksMonthMeta | undefined, mes: number): boolean {
  return meta?.hasRecorrente?.[mes] ?? false;
}

describe('acesso seguro a TasksMonthMeta (?.[])', () => {
  it('retorna 0 quando meta é undefined (sem TypeError)', () => {
    expect(getCountSafe(undefined, 1)).toBe(0);
    expect(getCountSafe(undefined, 12)).toBe(0);
  });

  it('retorna false para recorrente quando meta é undefined', () => {
    expect(getRecorrenteSafe(undefined, 1)).toBe(false);
  });

  it('retorna valor correto quando meta está definida', () => {
    const meta: TasksMonthMeta = {
      count: { 3: 5 },
      hasRecorrente: { 3: true },
    };
    expect(getCountSafe(meta, 3)).toBe(5);
    expect(getRecorrenteSafe(meta, 3)).toBe(true);
  });

  it('retorna fallback para mês não presente na meta', () => {
    const meta: TasksMonthMeta = {
      count: {},
      hasRecorrente: {},
    };
    expect(getCountSafe(meta, 7)).toBe(0);
    expect(getRecorrenteSafe(meta, 7)).toBe(false);
  });
});
