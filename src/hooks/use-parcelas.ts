import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getParcelas } from '@/service/parcelas/getParcelas';

export function useParcelas() {
  return useQuery({
    queryKey: queryKeys.parcelas.list(),
    queryFn: getParcelas,
    staleTime: 1000 * 60 * 2,
  });
}
