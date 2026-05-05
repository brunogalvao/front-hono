import i18n from '@/lib/i18n';

// Moeda BRL — locale segue o idioma ativo da interface
export const formatToBRL = (value: number | string): string => {
  const number = typeof value === 'string' ? Number(value) : value;
  if (isNaN(number)) return i18n.t('common:currency.invalidValue');

  const locale = i18n.language === 'en' ? 'en-US' : 'pt-BR';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'BRL',
  }).format(number);
};

// Moeda USD — sempre exibe em formato americano
export const formatToUSD = (value: number | string): string => {
  const number = typeof value === 'string' ? Number(value) : value;
  if (isNaN(number)) return i18n.t('common:currency.invalidValue');

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(number);
};

// Formatação de número sem símbolo de moeda
export const formatNumber = (value: number | string): string => {
  const number = typeof value === 'string' ? Number(value) : value;
  if (isNaN(number)) return i18n.t('common:currency.invalidValue');

  const locale = i18n.language === 'en' ? 'en-US' : 'pt-BR';
  return new Intl.NumberFormat(locale).format(number);
};
