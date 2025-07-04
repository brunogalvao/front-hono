import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  price: z.preprocess(
    (val) => (typeof val === "string" ? Number(val) : val),
    z
      .number({ invalid_type_error: "Preço obrigatório" })
      .min(1, "Adicionar o preço no item."),
  ),
  type: z.string().min(1, "Tipo de gasto obrigatório"),
  done: z.enum(["Pago", "Fixo", "Pendente"]),
});
