import type { GroupAccess } from '@/model/group.model';

export type { GroupAccess };

export const defaultGroupAccess: GroupAccess = {
  access_expenses: true,
  access_incomes: true,
  access_installments: true,
  access_advisor: true,
};
