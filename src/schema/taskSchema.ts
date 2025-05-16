import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  price: z.number().min(1, "Preço obrigatório"),
  done: z.boolean(),
});
