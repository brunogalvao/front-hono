import '@testing-library/jest-dom';
import i18n from '@/lib/i18n';

beforeAll(async () => {
  await i18n.changeLanguage('pt-BR');
});
