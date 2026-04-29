import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getParcelas } from '@/service/parcelas/getParcelas';
import { editParcela, type EditParcelaPayload } from '@/service/parcelas/editParcela';
import { deleteParcela } from '@/service/parcelas/deleteParcela';

export function useParcelas() {
  return useQuery({
    queryKey: queryKeys.parcelas.list(),
    queryFn: getParcelas,
    staleTime: 1000 * 60 * 2,
  });
}

export function useEditParcela() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      parcela_group_id,
      payload,
    }: {
      parcela_group_id: string;
      payload: EditParcelaPayload;
    }) => editParcela(parcela_group_id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.parcelas.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

export function useDeleteParcela() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (parcela_group_id: string) => deleteParcela(parcela_group_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.parcelas.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}
