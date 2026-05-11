import { z } from "zod";

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  take: z.coerce
    .number()
    .int()
    .positive()
    .default(50)
    .pipe(z.number().max(1000)),
});

export const dateRangeSchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export const amountRangeSchema = z.object({
  minAmount: z.coerce.number().nonnegative().optional(),
  maxAmount: z.coerce.number().nonnegative().optional(),
});

export type PaginationParams = z.infer<typeof paginationSchema>;
