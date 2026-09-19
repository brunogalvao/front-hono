import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@/components/theme-provider';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import { initializeMonitoring } from '@/lib/monitoring';

import App from './App.tsx';
import './index.css';

void initializeMonitoring();

createRoot(document.getElementById('root')!).render(
  <I18nextProvider i18n={i18n}>
    <ThemeProvider defaultTheme="dark" storageKey="finance-theme">
      <StrictMode>
        <App />
      </StrictMode>
    </ThemeProvider>
  </I18nextProvider>
);
