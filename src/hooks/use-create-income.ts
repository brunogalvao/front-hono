import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createIncome } from '@/service/income/createIncome';
import { queryKeys } from '@/lib/query-keys';

export function useCreateIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIncome,
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
