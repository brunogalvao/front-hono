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

const ptLocales = import.meta.glob<Record<string, unknown>>(
  '../../locales/pt-BR/*.json',
  { eager: true, import: 'default' }
);
const enLocales = import.meta.glob<Record<string, unknown>>(
  '../../locales/en/*.json',
  { eager: true, import: 'default' }
);

function namespaceFromPath(path: string): string {
  return (
    path
      .split('/')
      .at(-1)
      ?.replace(/\.json$/, '') ?? path
  );
}

function byNamespace(locales: Record<string, Record<string, unknown>>) {
  return Object.fromEntries(
    Object.entries(locales).map(([path, value]) => [
      namespaceFromPath(path),
      value,
    ])
  );
}

const ptByNamespace = byNamespace(ptLocales);
const enByNamespace = byNamespace(enLocales);

function flatten(value: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, nested]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return nested && typeof nested === 'object' && !Array.isArray(nested)
      ? flatten(nested as Record<string, unknown>, path)
      : [path];
  });
}

function flattenValues(
  value: Record<string, unknown>,
  prefix = ''
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(value).flatMap(([key, nested]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      return nested && typeof nested === 'object' && !Array.isArray(nested)
        ? Object.entries(flattenValues(nested as Record<string, unknown>, path))
        : [[path, nested]];
    })
  );
}

function placeholders(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  return [...value.matchAll(/{{\s*([^},\s]+)[^}]*}}/g)]
    .map((match) => match[1])
    .sort();
}

describe('responsive action i18n parity', () => {
  it('keeps every namespace and key aligned between pt-BR and en', () => {
    expect(Object.keys(ptByNamespace).sort()).toEqual(
      Object.keys(enByNamespace).sort()
    );

    for (const namespace of Object.keys(ptByNamespace)) {
      const pt = flattenValues(ptByNamespace[namespace]);
      const en = flattenValues(enByNamespace[namespace]);

      expect(Object.keys(pt).sort(), namespace).toEqual(Object.keys(en).sort());
      for (const key of Object.keys(pt)) {
        expect(placeholders(pt[key]), `${namespace}:${key}`).toEqual(
          placeholders(en[key])
        );
      }
    }
  });

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
