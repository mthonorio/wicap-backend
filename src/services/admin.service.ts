import { prisma } from "../config/database";
import { InvoiceStatus } from "@prisma/client";
import { condominiumRepository } from "../repositories/condominium.repository";
import { invoiceRepository } from "../repositories/invoice.repository";
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
    try {
      const invoices = await invoiceRepository.findWithRelations();

      if (!invoices || invoices.length === 0) {
        return {
          items: [],
          managers: [],
          condominiums: [],
          summary: {
            totalCount: 0,
            totalOriginal: 0,
            totalJuros: 0,
            totalMulta: 0,
            totalCorrecao: 0,
            totalEncargos: 0,
            totalAmount: 0,
            paidCount: 0,
            paidAmount: 0,
            overdueCount: 0,
            overdueAmount: 0,
            pendingCount: 0,
            pendingAmount: 0,
            cancelledCount: 0,
            cancelledAmount: 0,
          },
          statusBreakdown: [],
        };
      }

      const items = invoices
        .filter((inv) => {
          if (!inv.resident?.user || !inv.resident?.apartment?.condominium) {
            console.warn(
              `⚠️  [getEncargos] Skipping invoice ${inv.id} - missing relationships`,
            );
            return false;
          }
          return true;
        })
        .map((inv) => {
          try {
            return {
              id: inv.id,
              number: inv.number ?? null,
              type: inv.type ?? null,
              competence: inv.competence ?? null,
              description: inv.description ?? null,
              amountOriginal: Number(inv.amountOriginal ?? 0),
              amountJuros: Number(inv.amountJuros ?? 0),
              amountMulta: Number(inv.amountMulta ?? 0),
              amountCorrecao: Number(inv.amountCorrecao ?? 0),
              amountTotal: Number(inv.amountTotal ?? 0),
              dueDate: inv.dueDate
                ? inv.dueDate.toISOString()
                : new Date().toISOString(),
              paidAt: inv.paidAt ? inv.paidAt.toISOString() : null,
              daysLate: inv.daysLate ?? 0,
              status: inv.status,
              resident: {
                user: {
                  name: inv.resident.user.name || "N/A",
                  email: inv.resident.user.email || "N/A",
                },
                apartment: {
                  number: inv.resident.apartment.number || "N/A",
                  condominium: {
                    id: inv.resident.apartment.condominium.id || "N/A",
                    name: inv.resident.apartment.condominium.name || "N/A",
                  },
                },
              },
            };
          } catch (itemError) {
            console.error(
              `❌ [getEncargos] Erro ao processar invoice ${inv.id}:`,
              itemError,
            );
            throw itemError;
          }
        });

      const managersRaw = await prisma.manager.findMany({
        include: { user: { select: { id: true, name: true, email: true } } },
      });
      const managers = managersRaw.map((m) => ({
        id: m.id,
        user: { name: m.user.name, email: m.user.email },
      }));
      const condominiums = await prisma.condominium.findMany({
        select: { id: true, name: true },
      });
      const summary = items.reduce(
        (acc, it) => {
          acc.totalCount += 1;
          acc.totalOriginal += Number(it.amountOriginal || 0);
          acc.totalJuros += Number(it.amountJuros || 0);
          acc.totalMulta += Number(it.amountMulta || 0);
          acc.totalCorrecao += Number(it.amountCorrecao || 0);
          acc.totalEncargos += Number(it.amountTotal || 0);

          switch (it.status) {
            case "PAID":
              acc.paidCount += 1;
              acc.paidAmount += Number(it.amountTotal || 0);
              break;
            case "OVERDUE":
              acc.overdueCount += 1;
              acc.overdueAmount += Number(it.amountTotal || 0);
              break;
            case "PENDING":
              acc.pendingCount += 1;
              acc.pendingAmount += Number(it.amountTotal || 0);
              break;
            case "CANCELLED":
              acc.cancelledCount += 1;
              acc.cancelledAmount += Number(it.amountTotal || 0);
              break;
          }

          return acc;
        },
        {
          totalCount: 0,
          totalOriginal: 0,
          totalJuros: 0,
          totalMulta: 0,
          totalCorrecao: 0,
          totalEncargos: 0,
          totalAmount: 0,
          paidCount: 0,
          paidAmount: 0,
          overdueCount: 0,
          overdueAmount: 0,
          pendingCount: 0,
          pendingAmount: 0,
          cancelledCount: 0,
          cancelledAmount: 0,
        },
      );
      summary.totalAmount = summary.totalEncargos;
      const statusAgg = await prisma.invoice.groupBy({
        by: ["status"],
        _count: { _all: true },
        _sum: { amountTotal: true },
      });

      const statusBreakdown = statusAgg.map((s) => ({
        status: s.status,
        count: s._count._all || 0,
        amount: Number(s._sum.amountTotal || 0),
      }));
      return {
        items,
        managers,
        condominiums,
        summary,
        statusBreakdown,
      };
    } catch (error) {
      console.error("❌ [getEncargos] Erro fatal:", error);
      throw error;
    }
  },

  async getCondominiums(managerId?: string) {
    return condominiumRepository.findMany(managerId);
  },
};
