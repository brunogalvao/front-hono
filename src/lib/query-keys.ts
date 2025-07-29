// Query Keys Factory - Centraliza todas as query keys da aplicação
export const queryKeys = {
  // Tasks
  tasks: {
    all: ['tasks'] as const,
    lists: () => [...queryKeys.tasks.all, 'list'] as const,
    list: (filters: { month: number; year: number }) =>
      [...queryKeys.tasks.lists(), filters] as const,
    details: () => [...queryKeys.tasks.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.tasks.details(), id] as const,
  },

  // Incomes
  incomes: {
    all: ['incomes'] as const,
    lists: () => [...queryKeys.incomes.all, 'list'] as const,
    list: () => [...queryKeys.incomes.lists()] as const,
    byMonth: () => [...queryKeys.incomes.all, 'by-month'] as const,
    details: () => [...queryKeys.incomes.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.incomes.details(), id] as const,
  },

  // Totals
  totals: {
    all: ['totals'] as const,
    items: () => [...queryKeys.totals.all, 'items'] as const,
    price: () => [...queryKeys.totals.all, 'price'] as const,
    paid: () => [...queryKeys.totals.all, 'paid'] as const,
    incomes: () => [...queryKeys.totals.all, 'incomes'] as const,
  },

  // Dollar Rate
  dollarRate: {
    all: ['dollar-rate'] as const,
  },

  // Auth
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
    listener: () => [...queryKeys.auth.all, 'listener'] as const,
  },

  // Expense Types
  expenseTypes: {
    all: ['expense-types'] as const,
    lists: () => [...queryKeys.expenseTypes.all, 'list'] as const,
  },

  // User
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
  },

  // IA
  ia: {
    all: ['ia'] as const,
  },
} as const;

// Tipos para type safety
export type QueryKeys = typeof queryKeys;
