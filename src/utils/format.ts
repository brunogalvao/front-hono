export const formatToBRL = (value: number | string) => {
  const number = typeof value === 'string' ? Number(value) : value;
  if (isNaN(number)) return 'Valor inválido';

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(number);
};

export const formatToUSD = (value: number | string) => {
  const number = typeof value === 'string' ? Number(value) : value;
  if (isNaN(number)) return 'Valor inválido';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(number);
};
