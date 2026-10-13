import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getDollarQuote } from '@/service/currency/getDollarQuote';

const ONE_HOUR_MS = 60 * 60 * 1000;

export function useDollarRate() {
  return useQuery({
    queryKey: queryKeys.dollarRate.all,
    queryFn: getDollarQuote,
    staleTime: ONE_HOUR_MS,
    gcTime: ONE_HOUR_MS * 2,
    refetchOnWindowFocus: false,
  });
}
