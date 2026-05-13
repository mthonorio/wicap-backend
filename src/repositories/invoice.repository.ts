import { prisma } from "../config/database";
import { InvoiceStatus, Role } from "@prisma/client";

export const invoiceRepository = {
  async findMany(filters: {
    status?: InvoiceStatus;
    condominiumId?: string;
    managerId?: string;
    residentId?: string;
    role: Role;
    userId: string;
    take?: number;
    cursor?: string;
  }) {
    const {
      status,
      condominiumId,
      managerId,
      residentId,
      role,
      userId,
      take = 50,
      cursor,
    } = filters;

    const where: any = {};

    if (status && Object.values(InvoiceStatus).includes(status)) {
      where.status = status;
    }

    // ROLE BASED FILTER
    if (role === Role.RESIDENT) {
      const resident = await prisma.resident.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!resident) return { data: [], nextCursor: null };
      where.residentId = resident.id;
    }

    if (role === Role.MANAGER) {
      const managerFromDb = await prisma.manager.findUnique({
        where: { userId },
        select: { id: true },
      });

      where.managerId = managerId || managerFromDb?.id;

      if (condominiumId) {
        where.condominiumId = condominiumId;
      }
    }

    if (role === Role.SUPER_ADMIN) {
      if (managerId) {
        where.managerId = managerId;
      }
      if (condominiumId) {
        where.condominiumId = condominiumId;
      }
    }

    const invoices = await prisma.invoice.findMany({
      where,
      take,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      orderBy: { id: "asc" },
      select: {
        id: true,
        amountTotal: true,
        dueDate: true,
        status: true,
        daysLate: true,
        resident: {
          select: {
            user: {
              select: { name: true },
            },
            apartment: {
              select: {
                number: true,
                condominium: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    return {
      data: invoices,
      nextCursor: invoices.length ? invoices[invoices.length - 1].id : null,
    };
  },

  async findById(id: string) {
    return prisma.invoice.findUnique({
      where: { id },
    });
  },

  async updateStatus(id: string, status: InvoiceStatus) {
    return prisma.invoice.update({
      where: { id },
      data: { status },
    });
  },

  async findWithRelations() {
    return prisma.invoice.findMany({
      include: {
        resident: {
          include: {
            user: { select: { name: true, email: true } },
            apartment: {
              include: {
                condominium: {
                  select: { id: true, name: true },
                },
              },
              select: { number: true },
            },
          },
        },
      },
      orderBy: { dueDate: "desc" },
    });
  },

  async groupByStatus() {
    return prisma.invoice.groupBy({
      by: ["status"],
      _count: { _all: true },
      _sum: { amountTotal: true },
    });
  },
};
