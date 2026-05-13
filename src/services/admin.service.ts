import { prisma } from "../config/database";
import { InvoiceStatus } from "@prisma/client";
import { condominiumRepository } from "../repositories/condominium.repository";
import { ResidentReportItem, ResidentReportStatus } from "../types/resident";

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

  async getResidents() {
    const residents = await prisma.resident.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        apartment: {
          select: {
            number: true,
            condominium: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const residentIds = residents.map((resident) => resident.id);

    const invoiceTotals = residentIds.length
      ? await prisma.invoice.groupBy({
          by: ["residentId", "status"],
          where: {
            residentId: {
              in: residentIds,
            },
          },
          _sum: {
            amountTotal: true,
          },
        })
      : [];

    const invoiceMap = new Map<
      string,
      { paid: number; overdue: number; pending: number }
    >();

    for (const invoice of invoiceTotals) {
      const current = invoiceMap.get(invoice.residentId) ?? {
        paid: 0,
        overdue: 0,
        pending: 0,
      };
      const amount = Number(invoice._sum.amountTotal || 0);

      if (invoice.status === InvoiceStatus.PAID) {
        invoiceMap.set(invoice.residentId, {
          ...current,
          paid: current.paid + amount,
        });
      }

      if (invoice.status === InvoiceStatus.PENDING) {
        invoiceMap.set(invoice.residentId, {
          ...current,
          pending: current.pending + amount,
        });
      }

      if (invoice.status === InvoiceStatus.OVERDUE) {
        invoiceMap.set(invoice.residentId, {
          ...current,
          overdue: current.overdue + amount,
        });
      }
    }

    const reportResidents: ResidentReportItem[] = residents.map((resident) => {
      const totals = invoiceMap.get(resident.id) ?? {
        paid: 0,
        overdue: 0,
        pending: 0,
      };

      const totalDebt = totals.pending + totals.overdue;
      const status: ResidentReportStatus =
        totals.overdue > 0
          ? "OVERDUE"
          : totalDebt > 0
            ? "PENDING"
            : "UP_TO_DATE";

      return {
        id: resident.id,
        user: {
          name: resident.user.name,
          email: resident.user.email,
        },
        apartment: {
          number: resident.apartment.number,
          condominium: {
            id: resident.apartment.condominium.id,
            name: resident.apartment.condominium.name,
          },
        },
        totalDebt,
        totalPaid: totals.paid,
        overdue: totals.overdue,
        hasDebt: totalDebt > 0,
        status,
      };
    });

    const totals = reportResidents.reduce(
      (accumulator, resident) => {
        accumulator.totalDebt += resident.totalDebt;
        accumulator.totalPaid += resident.totalPaid;
        accumulator.totalOverdue += resident.overdue;
        if (resident.hasDebt) {
          accumulator.residentsWithDebt += 1;
        }
        return accumulator;
      },
      {
        totalResidents: reportResidents.length,
        totalDebt: 0,
        totalOverdue: 0,
        totalPaid: 0,
        residentsWithDebt: 0,
      },
    );

    return {
      residents: reportResidents,
      totals,
    };
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
