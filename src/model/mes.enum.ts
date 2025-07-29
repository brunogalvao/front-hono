export const MESES = {
  1: 'Janeiro',
  2: 'Fevereiro',
  3: 'Março',
  4: 'Abril',
  5: 'Maio',
  6: 'Junho',
  7: 'Julho',
  8: 'Agosto',
  9: 'Setembro',
  10: 'Outubro',
  11: 'Novembro',
  12: 'Dezembro',
} as const;

export type MesNumero = keyof typeof MESES;

export const MESES_LISTA = Object.entries(MESES).map(([value, label]) => ({
  label,
  value,
}));

export function getNomeMes(numero: number): string {
  return MESES[numero as MesNumero] ?? 'Mês inválido';
}
