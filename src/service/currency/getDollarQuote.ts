import { z } from 'zod';
import { fetchWithAuth } from '@/lib/fetch-api';

const dollarRateQuoteSchema = z.object({
  status: z.literal('available'),
  rate: z.number().positive(),
  source: z.enum(['exchange-rate-api', 'awesome-api']),
  sourceLabel: z.string().min(1),
  sourceUrl: z.string().url(),
  marketUpdatedAt: z.string().datetime().nullable(),
  fetchedAt: z.string().datetime(),
});

export type DollarRateQuote = z.infer<typeof dollarRateQuoteSchema>;

export async function getDollarQuote(): Promise<DollarRateQuote> {
  const raw = await fetchWithAuth<unknown>('/api/currency/usd-brl');
  return dollarRateQuoteSchema.parse(raw);
}
