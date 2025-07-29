import { z } from 'zod';

export const phoneSchema = z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, {
  message: 'Telefone deve estar no formato (99) 99999-9999',
});
