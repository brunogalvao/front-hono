import i18n from '@/lib/i18n';

export type MesNumero = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// Mantido para compatibilidade com componentes que precisam de referência estática
export const MESES_KEYS: Record<MesNumero, string> = {
  1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6',
  7: '7', 8: '8', 9: '9', 10: '10', 11: '11', 12: '12',
};

export function getNomeMes(numero: number): string {
  return i18n.t(`common:months.${numero}`, { defaultValue: i18n.t('common:months.invalid') });
}

export function getAbrevMes(numero: number): string {
  return i18n.t(`common:monthsAbbr.${numero}`, { defaultValue: '???' });
}

// Lista para seletores — gerada dinamicamente para reagir ao idioma ativo
export function getMesesLista() {
  return Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: getNomeMes(i + 1),
  }));
}

// Compatibilidade retroativa — array estático (usado em charts, não precisa ser reativo)
export const MESES_ABREV = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
] as const;

// MESES_LISTA estático mantido para compatibilidade — componentes reativos devem usar getMesesLista()
export const MESES_LISTA = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: getNomeMes(i + 1),
}));
