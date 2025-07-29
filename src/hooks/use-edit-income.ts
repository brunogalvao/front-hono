import { useMutation, useQueryClient } from '@tanstack/react-query';
import { editIncome } from '@/service/income/editIncome';
import { queryKeys } from '@/lib/query-keys';
import type { IncomeItem } from '@/model/incomes.model';

export function useEditIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editIncome,
    onSuccess: () => {
      // Invalidar cache de rendimentos
      queryClient.invalidateQueries({
        queryKey: queryKeys.incomes.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.incomes.byMonth(),
      });

      // Invalidar cache da IA para recalcular análise
      queryClient.invalidateQueries({
        queryKey: queryKeys.ia.all,
      });

      // Invalidar totais
      queryClient.invalidateQueries({
        queryKey: queryKeys.totals.all,
      });
    },
  });
}
