import { z } from "zod";

export const createCondominiumSchema = z.object({
  name: z.string().min(2, "Nome do condomínio é obrigatório"),
  address: z.string().min(5, "Endereço é obrigatório"),
  cnpj: z.string().optional(),
  zipCode: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export type CreateCondominiumRequest = z.infer<typeof createCondominiumSchema>;

export const createApartmentSchema = z.object({
  number: z.string().min(1, "Número do apartamento é obrigatório"),
  block: z.string().optional(),
  areaM2: z.coerce.number().positive().optional(),
  fractionPct: z.coerce.number().positive().optional(),
  condominiumId: z.string().min(1, "ID do condomínio é obrigatório"),
});

export type CreateApartmentRequest = z.infer<typeof createApartmentSchema>;
