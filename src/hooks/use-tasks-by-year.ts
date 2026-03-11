import { useQuery } from '@tanstack/react-query';
import { getTasksByYear } from '@/service/task/getTasksByYear';
import { queryKeys } from '@/lib/query-keys';

export function useTasksByYear(year: number) {
  return useQuery({
    queryKey: [...queryKeys.tasks.all, 'by-year', year],
    queryFn: () => getTasksByYear(year),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });
}
