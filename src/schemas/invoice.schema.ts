import { z } from "zod";

export const invoiceStatusSchema = z.enum([
  "PENDING",
  "PAID",
  "OVERDUE",
  "CANCELLED",
]);

export const updateInvoiceSchema = z.object({
  status: invoiceStatusSchema,
});

export type UpdateInvoiceRequest = z.infer<typeof updateInvoiceSchema>;

export const invoiceFilterSchema = z.object({
  status: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELLED"]).optional(),
  managerId: z.string().optional(),
  condominiumId: z.string().optional(),
  cursor: z.string().optional(),
  take: z.coerce
    .number()
    .int()
    .positive()
    .default(50)
    .pipe(z.number().max(1000)),
});

export type InvoiceFilterParams = z.infer<typeof invoiceFilterSchema>;
