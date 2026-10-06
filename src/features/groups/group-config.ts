import { z } from 'zod';
import type { GroupAccess } from '@/service/groups/groupAccess';

export type AccessKey = keyof GroupAccess;

export const ACCESS_OPTIONS: Array<{
  key: AccessKey;
  labelKey:
    | 'access.expenses'
    | 'access.income'
    | 'access.installments'
    | 'access.advisor';
  descriptionKey:
    | 'access.expensesDescription'
    | 'access.incomeDescription'
    | 'access.installmentsDescription'
    | 'access.advisorDescription';
  icon: string;
}> = [
  {
    key: 'access_expenses',
    labelKey: 'access.expenses',
    descriptionKey: 'access.expensesDescription',
    icon: '💸',
  },
  {
    key: 'access_incomes',
    labelKey: 'access.income',
    descriptionKey: 'access.incomeDescription',
    icon: '💰',
  },
  {
    key: 'access_installments',
    labelKey: 'access.installments',
    descriptionKey: 'access.installmentsDescription',
    icon: '🛒',
  },
  {
    key: 'access_advisor',
    labelKey: 'access.advisor',
    descriptionKey: 'access.advisorDescription',
    icon: '🤖',
  },
];

export interface GroupValidationMessages {
  nameRequired: string;
  emailInvalid: string;
  phoneInvalid: string;
  groupNameRequired: string;
}

export const buildInviteSchema = (messages: GroupValidationMessages) =>
  z.object({
    name: z.string().min(1, messages.nameRequired),
    email: z.string().email(messages.emailInvalid),
    phone: z
      .string()
      .regex(/^\(\d{2}\) \d{5}-\d{4}$/, messages.phoneInvalid)
      .optional()
      .or(z.literal('')),
    access_expenses: z.boolean(),
    access_incomes: z.boolean(),
    access_installments: z.boolean(),
    access_advisor: z.boolean(),
  });

export const buildCreateGroupSchema = (messages: GroupValidationMessages) =>
  z.object({
    name: z.string().min(1, messages.groupNameRequired),
    type: z.enum(['personal', 'shared']),
  });

export const SUPER_ADMIN_EMAIL = 'bruno_galvao@outlook.com';

export function formatGroupDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { timeZone: 'UTC' }).format(
    new Date(date)
  );
}
