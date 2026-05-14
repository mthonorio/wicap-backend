import { invoiceRepository } from "../repositories/invoice.repository";
import { InvoiceStatus, Role } from "@prisma/client";

export const invoiceService = {
  async getAll(filters: {
    status?: InvoiceStatus;
    condominiumId?: string;
    managerId?: string;
    role: Role;
    userId: string;
    take?: number;
    cursor?: string;
  }) {
    return invoiceRepository.findMany(filters);
  },

  async createInvoice(data: {
    amountTotal: number;
    amountOriginal: number;
    dueDate: string;
    residentId: string;
    condominiumId: string;
    managerId: string;
    status?: InvoiceStatus;
  }) {
    return invoiceRepository.create(data);
  },

  async updateStatus(invoiceId: string, status: InvoiceStatus) {
    return invoiceRepository.updateStatus(invoiceId, status);
  },
};
