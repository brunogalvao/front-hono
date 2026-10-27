import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getDollarQuote } from '@/service/currency/getDollarQuote';

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const THIRTY_MINUTES_MS = 30 * 60 * 1000;

export function useDollarRate() {
  return useQuery({
    queryKey: queryKeys.dollarRate.all,
    queryFn: getDollarQuote,
    staleTime: FIVE_MINUTES_MS,
    gcTime: THIRTY_MINUTES_MS,
    refetchInterval: FIVE_MINUTES_MS,
    refetchOnWindowFocus: true,
  });
}
