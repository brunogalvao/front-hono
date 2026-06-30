import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getIA } from '@/service/ia/getIA';
import { queryKeys } from '@/lib/query-keys';

export function useIA() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.ia.all,
    queryFn: () => getIA(),
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });

  const refetchIA = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.ia.all });

  return {
    ...query,
    refetchIA,
  };
}
