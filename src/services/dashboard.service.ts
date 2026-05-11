import { prisma } from "../config/database";
import { InvoiceStatus } from "@prisma/client";

export const dashboardService = {
  async getManagerDashboard(userId: string) {
    const manager = await prisma.manager.findUnique({
      where: { userId },
    });

    if (!manager) {
      return null;
    }

    // Get condominiums (leve)
    const condominiums = await prisma.condominium.findMany({
      where: { managerId: manager.id },
      select: {
        id: true,
        name: true,
      },
    });

    const condominiumIds = condominiums.map((c: any) => c.id);

    // Get aggregations (rápidas)
    const [invoiceAgg, residentCount] = await Promise.all([
      prisma.invoice.groupBy({
        by: ["status"],
        where: {
          resident: {
            apartment: {
              condominiumId: { in: condominiumIds },
            },
          },
        },
        _sum: {
          amountTotal: true,
        },
      }),

      prisma.resident.count({
        where: {
          apartment: {
            condominiumId: { in: condominiumIds },
          },
        },
      }),
    ]);

    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdue = 0;
    let totalDebt = 0;

    for (const item of invoiceAgg) {
      const value = Number(item._sum.amountTotal || 0);

      if (item.status === InvoiceStatus.PAID) {
        totalPaid += value;
      }

      if (item.status === InvoiceStatus.PENDING) {
        totalPending += value;
        totalDebt += value;
      }

      if (item.status === InvoiceStatus.OVERDUE) {
        totalOverdue += value;
        totalDebt += value;
      }
    }

    return {
      condominiums,
      condominiumCount: condominiums.length,
      residentCount,
      totalPaid,
      totalPending,
      totalOverdue,
      totalDebt,
    };
  },

  async getResidentDashboard(userId: string) {
    const resident = await prisma.resident.findUnique({
      where: { userId },
      include: {
        apartment: {
          select: {
            number: true,
            condominium: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!resident) {
      return null;
    }

    const invoices = await prisma.invoice.groupBy({
      by: ["status"],
      where: { residentId: resident.id },
      _sum: {
        amountTotal: true,
      },
      _count: true,
    });

    let totalAmount = 0;
    let totalPending = 0;
    let totalPaid = 0;
    let totalOverdue = 0;

    for (const item of invoices) {
      const value = Number(item._sum.amountTotal || 0);

      if (item.status === InvoiceStatus.PAID) {
        totalPaid += value;
      }

      if (item.status === InvoiceStatus.PENDING) {
        totalPending += value;
      }

      if (item.status === InvoiceStatus.OVERDUE) {
        totalOverdue += value;
      }

      totalAmount += value;
    }

    return {
      resident: {
        apartment: resident.apartment.number,
        condominium: resident.apartment.condominium.name,
      },
      totalAmount,
      totalPending,
      totalPaid,
      totalOverdue,
    };
  },
};
