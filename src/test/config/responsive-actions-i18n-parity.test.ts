import { describe, expect, it } from 'vitest';
import ptTransactions from '@/locales/pt-BR/transactions.json';
import enTransactions from '@/locales/en/transactions.json';
import ptInstallments from '@/locales/pt-BR/installments.json';
import enInstallments from '@/locales/en/installments.json';
import ptRecurring from '@/locales/pt-BR/recurring.json';
import enRecurring from '@/locales/en/recurring.json';
import ptPermissions from '@/locales/pt-BR/permissions.json';
import enPermissions from '@/locales/en/permissions.json';
import ptIncome from '@/locales/pt-BR/income.json';
import enIncome from '@/locales/en/income.json';
import ptHistory from '@/locales/pt-BR/history.json';
import enHistory from '@/locales/en/history.json';

function flatten(value: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, nested]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return nested && typeof nested === 'object' && !Array.isArray(nested)
      ? flatten(nested as Record<string, unknown>, path)
      : [path];
  });
}

describe('responsive action i18n parity', () => {
  it.each([
    ['transactions', ptTransactions, enTransactions],
    ['installments', ptInstallments, enInstallments],
    ['recurring', ptRecurring, enRecurring],
    ['permissions', ptPermissions, enPermissions],
    ['income', ptIncome, enIncome],
    ['history', ptHistory, enHistory],
  ])('keeps exact pt-BR/en parity for %s', (_name, pt, en) => {
    expect(flatten(pt).sort()).toEqual(flatten(en).sort());
  });

  it('provides localized matrix scrolling guidance', () => {
    expect(ptPermissions.matrix).toHaveProperty('scrollHint');
    expect(enPermissions.matrix).toHaveProperty('scrollHint');
  });
});
