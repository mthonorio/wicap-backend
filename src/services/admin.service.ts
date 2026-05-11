import { prisma } from "../config/database";
import { InvoiceStatus } from "@prisma/client";
import { condominiumRepository } from "../repositories/condominium.repository";

export const adminService = {
  async getStats() {
    const [
      totalCondominiums,
      totalManagers,
      totalResidents,
      totalInvoices,
      pendingInvoices,
      overdueInvoices,
      paidInvoices,
    ] = await Promise.all([
      prisma.condominium.count(),
      prisma.manager.count(),
      prisma.resident.count(),
      prisma.invoice.count(),
      prisma.invoice.count({ where: { status: InvoiceStatus.PENDING } }),
      prisma.invoice.count({ where: { status: InvoiceStatus.OVERDUE } }),
      prisma.invoice.count({ where: { status: InvoiceStatus.PAID } }),
    ]);

    const revenueAgg = await prisma.invoice.aggregate({
      where: { status: InvoiceStatus.PAID },
      _sum: { amountTotal: true },
    });

    const debtAgg = await prisma.invoice.aggregate({
      where: {
        status: {
          in: [InvoiceStatus.PENDING, InvoiceStatus.OVERDUE],
        },
      },
      _sum: { amountTotal: true },
    });

    return {
      totalCondominiums,
      totalManagers,
      totalResidents,
      totalInvoices,
      pendingInvoices,
      overdueInvoices,
      paidInvoices,
      totalRevenue: revenueAgg._sum.amountTotal || 0,
      totalDebt: debtAgg._sum.amountTotal || 0,
    };
  },

  async getManagersList() {
    return prisma.manager.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, createdAt: true },
        },
        _count: { select: { condominiums: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getResidentsCount() {
    return prisma.resident.count();
  },

  async getEncargos() {
    return prisma.billingFeeReport.findMany({
      include: {
        billingCase: {
          select: {
            id: true,
            debtorName: true,
            amountTotal: true,
          },
        },
      },
      orderBy: { referenceDate: "desc" },
    });
  },

  async getCondominiums(managerId?: string) {
    return condominiumRepository.findMany(managerId);
  },
};
