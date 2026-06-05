import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ptBRCommon from '@/locales/pt-BR/common.json';
import ptBRNav from '@/locales/pt-BR/nav.json';
import ptBRAuth from '@/locales/pt-BR/auth.json';
import ptBRDashboard from '@/locales/pt-BR/dashboard.json';
import ptBRExpenses from '@/locales/pt-BR/expenses.json';
import ptBRIncome from '@/locales/pt-BR/income.json';
import ptBRAdvisor from '@/locales/pt-BR/advisor.json';
import ptBRGroups from '@/locales/pt-BR/groups.json';
import ptBRProfile from '@/locales/pt-BR/profile.json';
import ptBRInstallments from '@/locales/pt-BR/installments.json';
import ptBRHistory from '@/locales/pt-BR/history.json';
import ptBRHome from '@/locales/pt-BR/home.json';
import ptBRInsights from '@/locales/pt-BR/insights.json';
import ptBRTransactions from '@/locales/pt-BR/transactions.json';
import ptBRRecurring from '@/locales/pt-BR/recurring.json';
import ptBRWorkspace from '@/locales/pt-BR/workspace.json';

import enCommon from '@/locales/en/common.json';
import enNav from '@/locales/en/nav.json';
import enAuth from '@/locales/en/auth.json';
import enDashboard from '@/locales/en/dashboard.json';
import enExpenses from '@/locales/en/expenses.json';
import enIncome from '@/locales/en/income.json';
import enAdvisor from '@/locales/en/advisor.json';
import enGroups from '@/locales/en/groups.json';
import enProfile from '@/locales/en/profile.json';
import enInstallments from '@/locales/en/installments.json';
import enHistory from '@/locales/en/history.json';
import enHome from '@/locales/en/home.json';
import enInsights from '@/locales/en/insights.json';
import enTransactions from '@/locales/en/transactions.json';
import enRecurring from '@/locales/en/recurring.json';
import enWorkspace from '@/locales/en/workspace.json';

export const defaultNS = 'common';
export const supportedLngs = ['pt-BR', 'en'] as const;
export type SupportedLanguage = (typeof supportedLngs)[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': {
        common: ptBRCommon,
        nav: ptBRNav,
        auth: ptBRAuth,
        dashboard: ptBRDashboard,
        expenses: ptBRExpenses,
        income: ptBRIncome,
        advisor: ptBRAdvisor,
        groups: ptBRGroups,
        profile: ptBRProfile,
        installments: ptBRInstallments,
        history: ptBRHistory,
        home: ptBRHome,
        insights: ptBRInsights,
        transactions: ptBRTransactions,
        recurring: ptBRRecurring,
        workspace: ptBRWorkspace,
      },
      en: {
        common: enCommon,
        nav: enNav,
        auth: enAuth,
        dashboard: enDashboard,
        expenses: enExpenses,
        income: enIncome,
        advisor: enAdvisor,
        groups: enGroups,
        profile: enProfile,
        installments: enInstallments,
        history: enHistory,
        home: enHome,
        insights: enInsights,
        transactions: enTransactions,
        recurring: enRecurring,
        workspace: enWorkspace,
      },
    },
    defaultNS,
    fallbackLng: 'pt-BR',
    supportedLngs,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'finance-language',
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
