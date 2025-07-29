import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteIncome } from '@/service/income/deleteIncome';
import { queryKeys } from '@/lib/query-keys';

export function useDeleteIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIncome,
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
