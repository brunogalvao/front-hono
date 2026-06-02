import { fetchWithAuth } from '@/lib/fetch-api';

export const totalItems = async (): Promise<number> => {
  const data = await fetchWithAuth<{ total: number }>('/api/tasks/total');
  return data.total;
};

export const totalPrice = async (): Promise<number> => {
  const data = await fetchWithAuth<{ totalPrice: number }>('/api/tasks/total-price');
  return data.totalPrice;
};

export const totalPaid = async (): Promise<number> => {
  const data = await fetchWithAuth<{ total_paid: number }>('/api/tasks/total-paid');
  return data.total_paid;
};
