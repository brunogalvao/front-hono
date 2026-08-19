export const queryKeys = {
  tasks: {
    all: ['tasks'] as const,
    lists: ['tasks', 'list'] as const,
    list: (filters: { month: number; year: number }) =>
      ['tasks', 'list', filters] as const,
    details: ['tasks', 'detail'] as const,
    detail: (id: string) => ['tasks', 'detail', id] as const,
    countByMonth: (year: number) => ['tasks', 'count-by-month', year] as const,
    byYear: (year: number) => ['tasks', 'by-year', year] as const,
  },

  incomes: {
    all: ['incomes'] as const,
    lists: ['incomes', 'list'] as const,
    list: ['incomes', 'list'] as const,
    byMonth: ['incomes', 'by-month'] as const,
    details: ['incomes', 'detail'] as const,
    detail: (id: string) => ['incomes', 'detail', id] as const,
  },

  totals: {
    all: ['totals'] as const,
    items: ['totals', 'items'] as const,
    price: ['totals', 'price'] as const,
    paid: ['totals', 'paid'] as const,
    incomes: ['totals', 'incomes'] as const,
  },

  dollarRate: {
    all: ['dollar-rate'] as const,
  },

  auth: {
    all: ['auth'] as const,
    session: ['auth', 'session'] as const,
    listener: ['auth', 'listener'] as const,
  },

  expenseTypes: {
    all: ['expense-types'] as const,
    lists: ['expense-types', 'list'] as const,
  },

  user: {
    all: ['user'] as const,
    profile: ['user', 'profile'] as const,
  },

  ia: {
    all: ['ia'] as const,
  },

  notifications: {
    all: ['notifications'] as const,
    pending: (month: number, year: number) =>
      ['notifications', 'pending', month, year] as const,
  },

  parcelas: {
    all: ['parcelas'] as const,
    list: ['parcelas', 'list'] as const,
  },

  groups: {
    all: ['groups'] as const,
    members: (groupId: string) => ['groups', 'members', groupId] as const,
    invites: (groupId: string) => ['groups', 'invites', groupId] as const,
  },

  invites: {
    byToken: (token: string) => ['invites', token] as const,
  },

  workspaces: {
    all: ['workspaces'] as const,
    list: ['workspaces', 'list'] as const,
    members: (workspaceId: string) =>
      ['workspaces', workspaceId, 'members'] as const,
    pendingInvites: (workspaceId: string) =>
      ['workspaces', workspaceId, 'pending-invites'] as const,
  },

  transactions: {
    all: ['transactions'] as const,
    list: (workspaceId: string, month: number, year: number) =>
      ['transactions', workspaceId, month, year] as const,
    byCategory: (workspaceId: string, month: number, year: number) =>
      ['transactions', workspaceId, month, year, 'by-category'] as const,
  },

  recurring: {
    all: ['recurring'] as const,
    list: (workspaceId: string) => ['recurring', workspaceId] as const,
  },

  installments: {
    all: ['installments'] as const,
    list: (workspaceId: string) => ['installments', workspaceId] as const,
  },

  dashboard: {
    all: ['dashboard'] as const,
    workspace: (workspaceId: string, month: number, year: number) =>
      ['dashboard', workspaceId, 'workspace', month, year] as const,
    individual: (workspaceId: string, month: number, year: number) =>
      ['dashboard', workspaceId, 'individual', month, year] as const,
  },

  insights: {
    all: ['insights'] as const,
    workspace: (workspaceId: string, month: number, year: number) =>
      ['insights', workspaceId, 'workspace', month, year] as const,
    individual: (workspaceId: string, month: number, year: number) =>
      ['insights', workspaceId, 'individual', month, year] as const,
  },

  categories: {
    all: ['categories'] as const,
    list: (workspaceId: string) => ['categories', workspaceId] as const,
  },

  appUsers: {
    all: ['app-users'] as const,
    byWorkspace: (workspaceId: string) => ['app-users', workspaceId] as const,
    page: (workspaceId: string, page: number, pageSize: number) =>
      ['app-users', workspaceId, 'page', { page, pageSize }] as const,
  },

  permissions: {
    all: ['permissions'] as const,
    roleMatrix: (workspaceId: string) =>
      ['permissions', 'role-matrix', workspaceId] as const,
    memberOverrides: (workspaceId: string, userId: string) =>
      ['permissions', 'member-overrides', workspaceId, userId] as const,
    current: (workspaceId: string, userId: string) =>
      ['permissions', 'current', workspaceId, userId] as const,
  },
} as const;

export type QueryKeys = typeof queryKeys;
