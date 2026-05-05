import type common from '@/locales/pt-BR/common.json';
import type nav from '@/locales/pt-BR/nav.json';
import type auth from '@/locales/pt-BR/auth.json';
import type dashboard from '@/locales/pt-BR/dashboard.json';
import type expenses from '@/locales/pt-BR/expenses.json';
import type income from '@/locales/pt-BR/income.json';
import type advisor from '@/locales/pt-BR/advisor.json';
import type groups from '@/locales/pt-BR/groups.json';
import type profile from '@/locales/pt-BR/profile.json';
import type installments from '@/locales/pt-BR/installments.json';
import type history from '@/locales/pt-BR/history.json';
import type home from '@/locales/pt-BR/home.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      nav: typeof nav;
      auth: typeof auth;
      dashboard: typeof dashboard;
      expenses: typeof expenses;
      income: typeof income;
      advisor: typeof advisor;
      groups: typeof groups;
      profile: typeof profile;
      installments: typeof installments;
      history: typeof history;
      home: typeof home;
    };
  }
}
