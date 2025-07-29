import { useQuery } from '@tanstack/react-query';
import { getIncomesByMonth } from '@/service/income/getIncomeByMonth';
import { queryKeys } from '@/lib/query-keys';

export function useIncomesByMonth(reloadTrigger?: number) {
  return useQuery({
    queryKey: [...queryKeys.incomes.byMonth(), reloadTrigger],
    queryFn: getIncomesByMonth,
    staleTime: 1000 * 60 * 2, // 2 minutos
    gcTime: 1000 * 60 * 5, // 5 minutos
  });
}
